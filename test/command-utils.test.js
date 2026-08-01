const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FALLBACK_CLI_COMMAND,
  FALLBACK_TERMINAL_NAME,
  MAX_CAPTURED_SHELL_OUTPUT,
  appendBoundedOutput,
  buildExtensionSettingsQuery,
  buildTerminalName,
  createLaunchSession,
  endAllLaunchSessions,
  endLaunchSessionsForTerminal,
  extractExecutable,
  isCodexCommand,
  normalizeCliCommand,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldOfferCodexInstallDocs,
} = require('../out/command-utils.js');

function createDisposableSpy() {
  const state = { disposeCount: 0 };

  return {
    state,
    disposable: {
      dispose() {
        state.disposeCount += 1;
      },
    },
  };
}

test('defaults target Codex CLI', () => {
  assert.equal(FALLBACK_CLI_COMMAND, 'codex');
  assert.equal(FALLBACK_TERMINAL_NAME, 'Codex CLI');
});

test('normalizeCliCommand trims configured values', () => {
  assert.equal(normalizeCliCommand('  codex --login  '), 'codex --login');
});

test('normalizeCliCommand falls back when value is undefined', () => {
  assert.equal(normalizeCliCommand(undefined), 'codex');
});

test('normalizeCliCommand preserves the blank command path for validation', () => {
  assert.equal(normalizeCliCommand('   '), '');
});

test('resolveCliCommandSetting ignores workspace-controlled values', () => {
  assert.equal(
    resolveCliCommandSetting({
      defaultValue: 'codex',
      globalValue: 'codex --full-auto',
    }),
    'codex --full-auto',
  );
});

test('buildTerminalName appends the sequence after the first terminal', () => {
  assert.equal(buildTerminalName('Codex CLI', 1), 'Codex CLI');
  assert.equal(buildTerminalName('Codex CLI', 3), 'Codex CLI 3');
});

test('buildTerminalName falls back when the configured name is blank', () => {
  assert.equal(buildTerminalName('   ', 2), 'Codex CLI 2');
});

test('buildExtensionSettingsQuery targets the current extension id', () => {
  assert.equal(buildExtensionSettingsQuery('mikesoft.vscode-codex-cli-launcher'), '@ext:mikesoft.vscode-codex-cli-launcher');
});

test('extractExecutable returns the first token for simple commands', () => {
  assert.equal(extractExecutable('codex --login'), 'codex');
});

test('extractExecutable preserves quoted Windows paths with spaces', () => {
  assert.equal(
    extractExecutable('"C:\\Program Files\\OpenAI Codex\\codex.cmd" --login'),
    'C:\\Program Files\\OpenAI Codex\\codex.cmd',
  );
});

test('isCodexCommand recognizes direct and quoted Codex executables', () => {
  assert.equal(isCodexCommand('codex --login'), true);
  assert.equal(isCodexCommand('"C:\\Program Files\\OpenAI Codex\\codex.cmd" --login'), true);
  assert.equal(isCodexCommand('custom-codex'), false);
});

test('appendBoundedOutput retains only the latest output window', () => {
  assert.equal(appendBoundedOutput('1234', '5678', 6), '345678');
  assert.equal(appendBoundedOutput('ignored', 'abcdefgh', 4), 'efgh');
  assert.equal(appendBoundedOutput('existing', 'new', 0), '');
  assert.equal(MAX_CAPTURED_SHELL_OUTPUT, 32 * 1024);
});

test('shouldOfferCodexInstallDocs detects PowerShell command-not-found output', () => {
  const output = "codex: The term 'codex' is not recognized as a name of a cmdlet, function, script file, or executable program.";

  assert.equal(shouldOfferCodexInstallDocs('codex', 1, output), true);
});

test('shouldOfferCodexInstallDocs detects POSIX command-not-found exit codes', () => {
  assert.equal(shouldOfferCodexInstallDocs('codex', 127, ''), true);
});

test('shouldOfferCodexInstallDocs ignores custom commands', () => {
  assert.equal(shouldOfferCodexInstallDocs('custom-codex', 1, 'command not found'), false);
});

test('shouldOfferCodexInstallDocs ignores unrelated runtime failures', () => {
  assert.equal(shouldOfferCodexInstallDocs('codex', 1, 'Error: authentication failed'), false);
});

test('shouldOfferCodexInstallDocs ignores generic not-found messages unrelated to the executable', () => {
  assert.equal(shouldOfferCodexInstallDocs('codex', 1, 'Error: model not found'), false);
});

test('createLaunchSession releases launch-scoped disposables exactly once', () => {
  const registry = new Set();
  const first = createDisposableSpy();
  const second = createDisposableSpy();
  const session = createLaunchSession('terminal-a', registry);

  session.add(first.disposable);
  session.add(second.disposable);
  assert.equal(registry.size, 1);

  session.end();
  session.end();

  assert.equal(first.state.disposeCount, 1);
  assert.equal(second.state.disposeCount, 1);
  assert.equal(registry.size, 0);
});

test('createLaunchSession disposes late registrations instead of retaining them', () => {
  const registry = new Set();
  const late = createDisposableSpy();
  const session = createLaunchSession('terminal-a', registry);

  session.end();
  session.add(late.disposable);

  assert.equal(late.state.disposeCount, 1);
  assert.equal(registry.size, 0);
});

test('endLaunchSessionsForTerminal only ends sessions owned by the closed terminal', () => {
  const registry = new Set();
  const closed = createDisposableSpy();
  const kept = createDisposableSpy();

  createLaunchSession('terminal-a', registry).add(closed.disposable);
  createLaunchSession('terminal-b', registry).add(kept.disposable);

  endLaunchSessionsForTerminal(registry, 'terminal-a');

  assert.equal(closed.state.disposeCount, 1);
  assert.equal(kept.state.disposeCount, 0);
  assert.equal(registry.size, 1);
});

test('endAllLaunchSessions drains the registry so launches cannot accumulate', () => {
  const registry = new Set();
  const first = createDisposableSpy();
  const second = createDisposableSpy();

  createLaunchSession('terminal-a', registry).add(first.disposable);
  createLaunchSession('terminal-b', registry).add(second.disposable);

  endAllLaunchSessions(registry);

  assert.equal(first.state.disposeCount, 1);
  assert.equal(second.state.disposeCount, 1);
  assert.equal(registry.size, 0);
});

test('resolveTerminalCwd uses the active editor workspace when available', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder(uri) {
      return uri === 'file-b' ? { uri: 'workspace-b' } : undefined;
    },
  };

  const activeEditor = {
    document: {
      uri: 'file-b',
    },
  };

  assert.equal(resolveTerminalCwd(activeEditor, workspace), 'workspace-b');
});

test('resolveTerminalCwd falls back to the first workspace when no editor workspace matches', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder() {
      return undefined;
    },
  };

  assert.equal(resolveTerminalCwd(undefined, workspace), 'workspace-a');
});

test('resolveTerminalCwd returns undefined when no workspace is open', () => {
  const workspace = {
    workspaceFolders: undefined,
    getWorkspaceFolder() {
      return undefined;
    },
  };

  assert.equal(resolveTerminalCwd(undefined, workspace), undefined);
});
