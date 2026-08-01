const path = require('node:path');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
  const extensionTestsPath = path.resolve(__dirname, 'suite');
  const version = process.env.VSCODE_TEST_VERSION ?? '1.103.0';

  try {
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions'],
      version,
    });
  } catch (error) {
    console.error('VS Code integration tests failed.');
    throw error;
  }
}

main();
