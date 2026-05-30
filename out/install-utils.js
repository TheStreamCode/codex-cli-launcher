"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEX_INSTALL_COMMAND = void 0;
exports.buildCodexInstallPromptMessage = buildCodexInstallPromptMessage;
exports.buildQuotedCommandPath = buildQuotedCommandPath;
exports.buildCodexInstallPromptCommand = buildCodexInstallPromptCommand;
exports.buildCodexInstallPromptScript = buildCodexInstallPromptScript;
const CODEX_INSTALL_COMMAND = 'npm install -g @openai/codex';
exports.CODEX_INSTALL_COMMAND = CODEX_INSTALL_COMMAND;
function quoteJavaScriptString(value) {
    return JSON.stringify(value);
}
/** Returns the terminal-facing missing CLI message. */
function buildCodexInstallPromptMessage() {
    return 'Codex CLI was not found.';
}
/** Quotes a command path so it can be sent directly to an integrated terminal. */
function buildQuotedCommandPath(commandPath) {
    return `"${commandPath.replace(/"/g, '\\"')}"`;
}
/** Returns the short terminal command that runs the generated installer script. */
function buildCodexInstallPromptCommand(scriptPath) {
    return `node ${buildQuotedCommandPath(scriptPath)}`;
}
/** Returns the Node installer script executed inside a visible VS Code terminal after user consent. */
function buildCodexInstallPromptScript(installCommand = CODEX_INSTALL_COMMAND) {
    const message = quoteJavaScriptString(buildCodexInstallPromptMessage());
    const prompt = quoteJavaScriptString('Install Codex CLI now? (y/N): ');
    const command = quoteJavaScriptString(installCommand);
    return String.raw `const cp = require('node:child_process');
const readline = require('node:readline');

const installCommand = ${command};
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(${message});
rl.question(${prompt}, (answer) => {
  rl.close();
  const normalized = answer.trim().toLowerCase();
  if (normalized === 'y' || normalized === 'yes') {
    const child = cp.spawn(installCommand, [], { stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code === null ? 1 : code));
    child.on('error', () => process.exit(1));
    return;
  }

  process.exit(0);
});
`;
}
//# sourceMappingURL=install-utils.js.map