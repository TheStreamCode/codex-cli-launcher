"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const fs = __importStar(require("node:fs"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const command_utils_js_1 = require("./command-utils.js");
const install_utils_js_1 = require("./install-utils.js");
const SETTINGS_NAMESPACE = 'codexCliLauncher';
const CODEX_DOCS_URL = 'https://help.openai.com/en/articles/11096431';
let terminalSequence = 1;
function collectShellExecutionOutput(execution) {
    return (async () => {
        let output = '';
        try {
            for await (const chunk of execution.read()) {
                output += chunk;
            }
        }
        catch {
            return output;
        }
        return output;
    })();
}
function writeCodexInstallPromptScript() {
    const scriptPath = path.join(os.tmpdir(), `codex-cli-launcher-install-${process.pid}-${Date.now()}.js`);
    fs.writeFileSync(scriptPath, (0, install_utils_js_1.buildCodexInstallPromptScript)(), 'utf8');
    return scriptPath;
}
async function openExtensionSettings(context) {
    await vscode.commands.executeCommand('workbench.action.openSettings', (0, command_utils_js_1.buildExtensionSettingsQuery)(context.extension.id));
}
async function openCodexInstallInstructions() {
    await vscode.env.openExternal(vscode.Uri.parse(CODEX_DOCS_URL));
}
function executeCommandWithOptionalShellIntegration(terminal, command, context, onShellExecutionEnd) {
    let executionStarted = false;
    const startExecution = (shellIntegration) => {
        if (executionStarted) {
            return;
        }
        executionStarted = true;
        shellIntegrationListener.dispose();
        clearTimeout(fallbackHandle);
        let execution;
        let outputPromise;
        const executionListener = onShellExecutionEnd
            ? vscode.window.onDidEndTerminalShellExecution(async (endEvent) => {
                if (endEvent.terminal !== terminal || (execution && endEvent.execution !== execution)) {
                    return;
                }
                executionListener?.dispose();
                const output = outputPromise ? await outputPromise : '';
                await onShellExecutionEnd(endEvent, output);
            })
            : undefined;
        if (executionListener) {
            context.subscriptions.push(executionListener);
        }
        execution = shellIntegration.executeCommand(command);
        outputPromise = collectShellExecutionOutput(execution);
    };
    const shellIntegrationListener = vscode.window.onDidChangeTerminalShellIntegration((event) => {
        if (event.terminal !== terminal) {
            return;
        }
        startExecution(event.shellIntegration);
    });
    const fallbackHandle = setTimeout(() => {
        if (terminal.shellIntegration) {
            startExecution(terminal.shellIntegration);
            return;
        }
        executionStarted = true;
        shellIntegrationListener.dispose();
        terminal.sendText(command, true);
    }, 3000);
    if (terminal.shellIntegration) {
        startExecution(terminal.shellIntegration);
        return;
    }
    context.subscriptions.push(shellIntegrationListener, { dispose: () => clearTimeout(fallbackHandle) });
}
function startGuidedInstall(context) {
    const installTerminal = vscode.window.createTerminal({
        name: 'Install Codex CLI',
        location: vscode.TerminalLocation.Panel,
    });
    const installCommand = (0, install_utils_js_1.buildCodexInstallPromptCommand)(writeCodexInstallPromptScript());
    installTerminal.show();
    executeCommandWithOptionalShellIntegration(installTerminal, installCommand, context);
}
async function handleMissingCodex(context) {
    const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
    const autoInstall = configuration.get('autoInstall', true);
    if (!autoInstall) {
        const selection = await vscode.window.showWarningMessage(`${(0, install_utils_js_1.buildCodexInstallPromptMessage)()} Install it manually or enable guided install in settings.`, 'Open Settings', 'Open Codex Docs');
        if (selection === 'Open Settings') {
            await openExtensionSettings(context);
        }
        else if (selection === 'Open Codex Docs') {
            await openCodexInstallInstructions();
        }
        return;
    }
    const selection = await vscode.window.showWarningMessage(`${(0, install_utils_js_1.buildCodexInstallPromptMessage)()} Install it now with npm?`, { modal: true }, 'Install', 'Open Codex Docs', 'Open Settings');
    if (selection === 'Install') {
        startGuidedInstall(context);
    }
    else if (selection === 'Open Codex Docs') {
        await openCodexInstallInstructions();
    }
    else if (selection === 'Open Settings') {
        await openExtensionSettings(context);
    }
}
function watchForMissingCodex(terminal, cliCommand, context) {
    executeCommandWithOptionalShellIntegration(terminal, cliCommand, context, async (endEvent, output) => {
        if ((0, command_utils_js_1.shouldPromptToInstallCodex)(cliCommand, endEvent.exitCode, output)) {
            await handleMissingCodex(context);
        }
    });
}
function activate(context) {
    const openCliCommand = vscode.commands.registerCommand('codexCliLauncher.openCli', async () => {
        if (!vscode.workspace.isTrusted) {
            const selection = await vscode.window.showWarningMessage('Codex CLI Launcher runs terminal commands in the current workspace. Trust this workspace before launching Codex CLI.', 'Manage Workspace Trust', 'Open Settings');
            if (selection === 'Manage Workspace Trust') {
                await vscode.commands.executeCommand('workbench.trust.manage');
            }
            else if (selection === 'Open Settings') {
                await openExtensionSettings(context);
            }
            return;
        }
        const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
        const cliCommand = (0, command_utils_js_1.resolveCliCommandSetting)(configuration.inspect('cliCommand'), 'codex');
        const configuredTerminalName = configuration.get('terminalName', command_utils_js_1.FALLBACK_TERMINAL_NAME);
        const terminalBaseName = (0, command_utils_js_1.normalizeTerminalName)(configuredTerminalName, command_utils_js_1.FALLBACK_TERMINAL_NAME);
        const terminalName = (0, command_utils_js_1.buildTerminalName)(configuredTerminalName, terminalSequence, command_utils_js_1.FALLBACK_TERMINAL_NAME);
        if (!cliCommand) {
            void vscode.window.showErrorMessage('Set "codexCliLauncher.cliCommand" to the command that starts Codex CLI.');
            return;
        }
        terminalSequence += 1;
        const cwd = (0, command_utils_js_1.resolveTerminalCwd)(vscode.window.activeTextEditor, vscode.workspace);
        const terminal = vscode.window.createTerminal({
            name: terminalName,
            location: { viewColumn: vscode.ViewColumn.Beside },
            cwd,
        });
        terminal.show();
        watchForMissingCodex(terminal, cliCommand, context);
        void vscode.window.setStatusBarMessage(`Started ${terminalBaseName}`, 2500);
    });
    const openSettingsCommand = vscode.commands.registerCommand('codexCliLauncher.openSettings', async () => {
        await openExtensionSettings(context);
    });
    context.subscriptions.push(openCliCommand, openSettingsCommand);
}
function deactivate() {
}
//# sourceMappingURL=extension.js.map