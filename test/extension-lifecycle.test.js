const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const extensionSource = fs.readFileSync(path.join(rootDir, 'src', 'extension.ts'), 'utf8');

function countOccurrences(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

test('only activation-scoped registrations reach context.subscriptions', () => {
  assert.equal(countOccurrences(extensionSource, /context\.subscriptions/g), 1);
  assert.match(
    extensionSource,
    /context\.subscriptions\.push\(openCliCommand, openSettingsCommand, terminalCloseListener\);/,
  );
});

test('every launch owns a disposal scope that is released when its terminal closes', () => {
  assert.match(extensionSource, /createLaunchSession\(terminal, launchSessions\)/);
  assert.match(extensionSource, /vscode\.window\.onDidCloseTerminal\(/);
  assert.match(extensionSource, /endLaunchSessionsForTerminal\(launchSessions, closedTerminal\)/);
  assert.match(extensionSource, /export function deactivate\(\): void \{\s*endAllLaunchSessions\(launchSessions\);/);
});

test('shell output is only collected on the missing-Codex detection path', () => {
  assert.equal(countOccurrences(extensionSource, /collectShellExecutionOutput\(/g), 2);
  assert.match(
    extensionSource,
    /if \(!onShellExecutionEnd\) \{\s*shellIntegration\.executeCommand\(command\);\s*session\.end\(\);\s*return;\s*\}/,
  );
});
