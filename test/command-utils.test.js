const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FALLBACK_CLI_COMMAND,
  FALLBACK_TERMINAL_NAME,
  buildExtensionSettingsQuery,
  buildTerminalName,
  extractExecutable,
  normalizeCliCommand,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldPromptToInstallCodex,
} = require('../out/command-utils.js');

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

test('shouldPromptToInstallCodex detects PowerShell command-not-found output', () => {
  const output = "codex: The term 'codex' is not recognized as a name of a cmdlet, function, script file, or executable program.";

  assert.equal(shouldPromptToInstallCodex('codex', 1, output), true);
});

test('shouldPromptToInstallCodex detects POSIX command-not-found exit codes', () => {
  assert.equal(shouldPromptToInstallCodex('codex', 127, ''), true);
});

test('shouldPromptToInstallCodex ignores custom commands', () => {
  assert.equal(shouldPromptToInstallCodex('npx --yes @openai/codex', 1, 'command not found'), false);
});

test('shouldPromptToInstallCodex ignores unrelated runtime failures', () => {
  assert.equal(shouldPromptToInstallCodex('codex', 1, 'Error: authentication failed'), false);
});

test('shouldPromptToInstallCodex ignores generic not-found messages unrelated to the executable', () => {
  assert.equal(shouldPromptToInstallCodex('codex', 1, 'Error: model not found'), false);
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
