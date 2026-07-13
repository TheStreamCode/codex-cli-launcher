const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function readSourceTree(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? readSourceTree(entryPath) : [fs.readFileSync(entryPath, 'utf8')];
    })
    .join('\n');
}

test('a missing Codex CLI can only offer the official installation documentation', () => {
  const extensionSource = fs.readFileSync(path.join(rootDir, 'src', 'extension.ts'), 'utf8');
  const allSource = readSourceTree(path.join(rootDir, 'src'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

  assert.match(extensionSource, /const CODEX_DOCS_URL = 'https:\/\/developers\.openai\.com\/codex\/cli\/';/);
  assert.match(extensionSource, /vscode\.env\.openExternal\(vscode\.Uri\.parse\(CODEX_DOCS_URL\)\)/);
  assert.deepEqual(extensionSource.match(/https:\/\/[^'"\s]+/g), ['https://developers.openai.com/codex/cli/']);
  assert.doesNotMatch(allSource, /autoInstall|startGuidedInstall|writeCodexInstallPromptScript/);
  assert.doesNotMatch(allSource, /node:(?:fs|os|path|child_process)|\b(?:exec|execFile|spawn|fork)\s*\(/);
  assert.equal(packageJson.contributes.configuration.properties['codexCliLauncher.autoInstall'], undefined);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'install-utils.ts')), false);
});
