import * as vscode from 'vscode';
import {
  FALLBACK_TERMINAL_NAME,
  type LaunchSession,
  appendBoundedOutput,
  buildExtensionSettingsQuery,
  buildTerminalName,
  createLaunchSession,
  endAllLaunchSessions,
  endLaunchSessionsForTerminal,
  isCodexCommand,
  normalizeTerminalName,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldOfferCodexInstallDocs,
} from './command-utils.js';

const SETTINGS_NAMESPACE = 'codexCliLauncher';
const CODEX_DOCS_URL = 'https://learn.chatgpt.com/docs/codex/cli';
const SHELL_INTEGRATION_TIMEOUT_MS = 3000;

let terminalSequence = 1;
const launchSessions = new Set<LaunchSession<vscode.Terminal>>();

function collectShellExecutionOutput(execution: vscode.TerminalShellExecution): Promise<string> {
  return (async () => {
    let output = '';

    try {
      for await (const chunk of execution.read()) {
        output = appendBoundedOutput(output, chunk);
      }
    } catch {
      return output;
    }

    return output;
  })();
}

async function openExtensionSettings(context: vscode.ExtensionContext): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.openSettings', buildExtensionSettingsQuery(context.extension.id));
}

async function openCodexInstallInstructions(): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(CODEX_DOCS_URL));
}

function executeCommandWithOptionalShellIntegration(
  session: LaunchSession<vscode.Terminal>,
  command: string,
  onShellExecutionEnd?: (event: vscode.TerminalShellExecutionEndEvent, output: string) => void | Promise<void>,
): void {
  const terminal = session.terminal;
  let executionStarted = false;
  let shellIntegrationListener: vscode.Disposable | undefined;
  let fallbackHandle: ReturnType<typeof setTimeout> | undefined;

  const stopWaitingForShellIntegration = () => {
    shellIntegrationListener?.dispose();
    shellIntegrationListener = undefined;

    if (fallbackHandle !== undefined) {
      clearTimeout(fallbackHandle);
      fallbackHandle = undefined;
    }
  };

  const startExecution = (shellIntegration: vscode.TerminalShellIntegration) => {
    if (executionStarted) {
      return;
    }

    executionStarted = true;
    stopWaitingForShellIntegration();

    if (!onShellExecutionEnd) {
      shellIntegration.executeCommand(command);
      session.end();
      return;
    }

    let execution: vscode.TerminalShellExecution | undefined;
    let outputPromise: Promise<string> | undefined;

    const executionListener = vscode.window.onDidEndTerminalShellExecution(async (endEvent) => {
      if (endEvent.terminal !== terminal || (execution && endEvent.execution !== execution)) {
        return;
      }

      session.end();
      const output = outputPromise ? await outputPromise : '';
      await onShellExecutionEnd(endEvent, output);
    });

    session.add(executionListener);
    execution = shellIntegration.executeCommand(command);
    outputPromise = collectShellExecutionOutput(execution);
  };

  session.add({ dispose: stopWaitingForShellIntegration });

  if (terminal.shellIntegration) {
    startExecution(terminal.shellIntegration);
    return;
  }

  shellIntegrationListener = vscode.window.onDidChangeTerminalShellIntegration((event) => {
    if (event.terminal !== terminal) {
      return;
    }

    startExecution(event.shellIntegration);
  });

  fallbackHandle = setTimeout(() => {
    fallbackHandle = undefined;

    if (terminal.shellIntegration) {
      startExecution(terminal.shellIntegration);
      return;
    }

    executionStarted = true;
    stopWaitingForShellIntegration();
    terminal.sendText(command, true);
    session.end();
  }, SHELL_INTEGRATION_TIMEOUT_MS);
}

async function handleMissingCodex(): Promise<void> {
  const selection = await vscode.window.showWarningMessage(
    'Codex CLI was not found. See the official installation documentation.',
    'Open Official Codex CLI Docs',
  );

  if (selection === 'Open Official Codex CLI Docs') {
    await openCodexInstallInstructions();
  }
}

function watchForMissingCodex(session: LaunchSession<vscode.Terminal>, cliCommand: string): void {
  const onShellExecutionEnd = isCodexCommand(cliCommand)
    ? async (endEvent: vscode.TerminalShellExecutionEndEvent, output: string) => {
        if (shouldOfferCodexInstallDocs(cliCommand, endEvent.exitCode, output)) {
          await handleMissingCodex();
        }
      }
    : undefined;

  executeCommandWithOptionalShellIntegration(session, cliCommand, onShellExecutionEnd);
}

export function activate(context: vscode.ExtensionContext): void {
  const openCliCommand = vscode.commands.registerCommand('codexCliLauncher.openCli', async () => {
    if (!vscode.workspace.isTrusted) {
      const selection = await vscode.window.showWarningMessage(
        'Codex CLI Launcher runs terminal commands in the current workspace. Trust this workspace before launching Codex CLI.',
        'Manage Workspace Trust',
        'Open Settings',
      );

      if (selection === 'Manage Workspace Trust') {
        await vscode.commands.executeCommand('workbench.trust.manage');
      } else if (selection === 'Open Settings') {
        await openExtensionSettings(context);
      }

      return;
    }

    const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
    const cliCommand = resolveCliCommandSetting(configuration.inspect<string>('cliCommand'), 'codex');
    const configuredTerminalName = configuration.get<string>('terminalName', FALLBACK_TERMINAL_NAME);
    const terminalBaseName = normalizeTerminalName(configuredTerminalName, FALLBACK_TERMINAL_NAME);
    const terminalName = buildTerminalName(configuredTerminalName, terminalSequence, FALLBACK_TERMINAL_NAME);

    if (!cliCommand) {
      void vscode.window.showErrorMessage('Set "codexCliLauncher.cliCommand" to the command that starts Codex CLI.');
      return;
    }

    terminalSequence += 1;
    const cwd = resolveTerminalCwd(vscode.window.activeTextEditor, vscode.workspace);

    const terminal = vscode.window.createTerminal({
      name: terminalName,
      location: { viewColumn: vscode.ViewColumn.Beside },
      cwd,
    });
    terminal.show();
    watchForMissingCodex(createLaunchSession(terminal, launchSessions), cliCommand);
    void vscode.window.setStatusBarMessage(`Started ${terminalBaseName}`, 2500);
  });

  const openSettingsCommand = vscode.commands.registerCommand('codexCliLauncher.openSettings', async () => {
    await openExtensionSettings(context);
  });

  const terminalCloseListener = vscode.window.onDidCloseTerminal((closedTerminal) => {
    endLaunchSessionsForTerminal(launchSessions, closedTerminal);
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand, terminalCloseListener);
}

export function deactivate(): void {
  endAllLaunchSessions(launchSessions);
}
