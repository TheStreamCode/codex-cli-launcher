const FALLBACK_CLI_COMMAND = 'codex';
const FALLBACK_TERMINAL_NAME = 'Codex CLI';
const MAX_CAPTURED_SHELL_OUTPUT = 32 * 1024;

type DisposableLike = { dispose(): void };
type WorkspaceFolderLike<T> = { uri: T };
type WorkspaceLike<T> = {
  workspaceFolders?: readonly WorkspaceFolderLike<T>[];
  getWorkspaceFolder(uri: T): WorkspaceFolderLike<T> | undefined;
};
type ActiveEditorLike<T> = { document: { uri: T } };
type ConfigurationInspectionLike<T> = {
  defaultValue?: T;
  globalValue?: T;
};

const CODEX_EXECUTABLES = new Set(['codex']);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripPowerShellCallOperator(command: string): string {
  const normalized = command.trim();
  const nextCharacter = normalized[1];

  if (
    normalized[0] === '&'
    && (nextCharacter === '"' || nextCharacter === "'" || /\s/.test(nextCharacter ?? ''))
  ) {
    return normalized.slice(1).trimStart();
  }

  return normalized;
}

function getExecutableBaseName(command: string): string {
  const executable = extractExecutable(command);
  const fileName = executable.split(/[\\/]/).pop() ?? executable;

  return fileName.replace(/\.(?:exe|cmd|bat|ps1)$/i, '').toLowerCase();
}

/** Returns whether the configured executable is Codex CLI. */
export function isCodexCommand(command: string): boolean {
  return CODEX_EXECUTABLES.has(getExecutableBaseName(command));
}

/** Appends shell output while retaining only the most recent bounded window. */
export function appendBoundedOutput(
  currentOutput: string,
  chunk: string,
  maxLength = MAX_CAPTURED_SHELL_OUTPUT,
): string {
  if (maxLength <= 0) {
    return '';
  }

  if (chunk.length >= maxLength) {
    return chunk.slice(-maxLength);
  }

  const retainedCurrentLength = maxLength - chunk.length;
  return `${currentOutput.slice(-retainedCurrentLength)}${chunk}`;
}

function buildCommandNotFoundPatterns(command: string): RegExp[] {
  const executableName = getExecutableBaseName(command);

  if (!executableName) {
    return [];
  }

  const escapedName = escapeRegExp(executableName);

  return [
    new RegExp(`(?:^|\\s)${escapedName}:\\s+command not found`, 'i'),
    new RegExp(`(?:^|\\s)${escapedName}:\\s+not found`, 'i'),
    new RegExp(`command not found:\\s*${escapedName}`, 'i'),
    new RegExp(`unknown command:?\\s*${escapedName}`, 'i'),
    new RegExp(`['"]?${escapedName}['"]?.*is not recognized`, 'i'),
    new RegExp(`\\b${escapedName}\\b.*not recognized as a name of a cmdlet`, 'i'),
    new RegExp(`\\b${escapedName}\\b.*cannot find the file`, 'i'),
    new RegExp(`no such file or directory:\\s*${escapedName}(?:\\s|$)`, 'i'),
  ];
}

/** Returns a trimmed CLI command with a safe fallback. */
export function normalizeCliCommand(value: string | undefined, fallback = FALLBACK_CLI_COMMAND): string {
  return (value ?? fallback).trim();
}

/** Resolves launch command from user-level configuration only, ignoring workspace-controlled values. */
export function resolveCliCommandSetting(
  inspection: ConfigurationInspectionLike<string> | undefined,
  fallback = FALLBACK_CLI_COMMAND,
): string {
  const value = inspection?.globalValue !== undefined
    ? inspection.globalValue
    : inspection?.defaultValue ?? fallback;

  return normalizeCliCommand(value, fallback);
}

/** Returns the configured terminal base name without any numeric suffix. */
export function normalizeTerminalName(value: string | undefined, fallback = FALLBACK_TERMINAL_NAME): string {
  return (value ?? fallback).trim() || fallback;
}

/** Returns the terminal label with the numeric suffix used by the extension. */
export function buildTerminalName(value: string | undefined, sequence: number, fallback = FALLBACK_TERMINAL_NAME): string {
  const baseName = normalizeTerminalName(value, fallback);
  const suffix = sequence <= 1 ? '' : ` ${sequence}`;

  return `${baseName}${suffix}`;
}

/** Returns the settings search query for the current extension id. */
export function buildExtensionSettingsQuery(extensionId: string): string {
  return `@ext:${extensionId}`;
}

/** Extracts the executable token, including quoted paths invoked with PowerShell's call operator. */
export function extractExecutable(command: string): string {
  const normalized = stripPowerShellCallOperator(command);

  if (!normalized) {
    return '';
  }

  const firstCharacter = normalized[0];
  if (firstCharacter === '"' || firstCharacter === "'") {
    const closingQuoteIndex = normalized.indexOf(firstCharacter, 1);
    if (closingQuoteIndex > 0) {
      return normalized.slice(1, closingQuoteIndex);
    }
  }

  const whitespaceIndex = normalized.search(/\s/);
  return whitespaceIndex === -1 ? normalized : normalized.slice(0, whitespaceIndex);
}

/** Returns whether a missing executable should offer the official Codex installation documentation. */
export function shouldOfferCodexInstallDocs(command: string, exitCode: number | undefined, output: string): boolean {
  if (!isCodexCommand(command)) {
    return false;
  }

  if (exitCode === 127) {
    return true;
  }

  if (exitCode !== undefined && exitCode !== 1) {
    return false;
  }

  return buildCommandNotFoundPatterns(command).some((pattern) => pattern.test(output));
}

/** Disposal scope that owns every listener and timer created by a single launch. */
export type LaunchSession<TTerminal> = {
  readonly terminal: TTerminal;
  add(disposable: DisposableLike): void;
  end(): void;
};

/**
 * Creates a disposal scope for one launcher invocation and tracks it in the shared registry.
 * Launch-scoped listeners are released as soon as the launch finishes or its terminal closes,
 * instead of accumulating for the whole extension lifetime.
 */
export function createLaunchSession<TTerminal>(
  terminal: TTerminal,
  registry: Set<LaunchSession<TTerminal>>,
): LaunchSession<TTerminal> {
  const disposables = new Set<DisposableLike>();
  let ended = false;

  const session: LaunchSession<TTerminal> = {
    terminal,
    add(disposable) {
      if (ended) {
        disposable.dispose();
        return;
      }

      disposables.add(disposable);
    },
    end() {
      if (ended) {
        return;
      }

      ended = true;
      registry.delete(session);

      const pending = [...disposables];
      disposables.clear();

      for (const disposable of pending) {
        disposable.dispose();
      }
    },
  };

  registry.add(session);

  return session;
}

/** Ends every tracked session owned by the given terminal. */
export function endLaunchSessionsForTerminal<TTerminal>(
  registry: Set<LaunchSession<TTerminal>>,
  terminal: TTerminal,
): void {
  for (const session of [...registry]) {
    if (session.terminal === terminal) {
      session.end();
    }
  }
}

/** Ends every tracked session, releasing all launch-scoped listeners and timers. */
export function endAllLaunchSessions<TTerminal>(registry: Set<LaunchSession<TTerminal>>): void {
  for (const session of [...registry]) {
    session.end();
  }
}

/** Resolves the terminal cwd from the active editor or the first workspace folder. */
export function resolveTerminalCwd<T>(
  activeEditor: ActiveEditorLike<T> | undefined,
  workspace: WorkspaceLike<T>,
): T | undefined {
  const activeWorkspaceFolder = activeEditor ? workspace.getWorkspaceFolder(activeEditor.document.uri) : undefined;
  return activeWorkspaceFolder?.uri ?? workspace.workspaceFolders?.[0]?.uri;
}

export { FALLBACK_CLI_COMMAND, FALLBACK_TERMINAL_NAME, MAX_CAPTURED_SHELL_OUTPUT };
