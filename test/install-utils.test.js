const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CODEX_INSTALL_COMMAND,
  buildCodexInstallPromptCommand,
  buildCodexInstallPromptMessage,
  buildCodexInstallPromptScript,
  buildQuotedCommandPath,
} = require('../out/install-utils.js');

test('CODEX_INSTALL_COMMAND uses the official npm package', () => {
  assert.equal(CODEX_INSTALL_COMMAND, 'npm install -g @openai/codex');
});

test('buildCodexInstallPromptMessage is concise and explicit', () => {
  assert.equal(buildCodexInstallPromptMessage(), 'Codex CLI was not found.');
});

test('buildCodexInstallPromptCommand runs a generated node script path safely', () => {
  const command = buildCodexInstallPromptCommand('C:\\Temp\\codex install prompt.js');

  assert.equal(command, 'node "C:\\Temp\\codex install prompt.js"');
  assert.doesNotMatch(command, /node -e/);
});

test('buildQuotedCommandPath quotes paths with spaces and escapes embedded quotes', () => {
  assert.equal(
    buildQuotedCommandPath('C:\\Users\\Ada Lovelace\\AppData\\Roaming\\npm\\codex.cmd'),
    '"C:\\Users\\Ada Lovelace\\AppData\\Roaming\\npm\\codex.cmd"',
  );
  assert.equal(buildQuotedCommandPath('/Users/ada/.npm-global/bin/codex'), '"/Users/ada/.npm-global/bin/codex"');
});

test('buildCodexInstallPromptScript installs Codex through npm after explicit confirmation', () => {
  const script = buildCodexInstallPromptScript();

  assert.match(script, /Codex CLI was not found\./);
  assert.match(script, /npm install -g @openai\/codex/);
  assert.match(script, /Install Codex CLI now\? \(y\/N\): /);
  assert.match(script, /normalized === 'y' \|\| normalized === 'yes'/);
  assert.match(script, /stdio: 'inherit'/);
});
