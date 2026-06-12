# Codex CLI Launcher

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-codex-cli-launcher?label=Marketplace&color=6366F1)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/mikesoft.vscode-codex-cli-launcher?color=0EA5E9)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher)
[![Open VSX](https://img.shields.io/open-vsx/v/mikesoft/vscode-codex-cli-launcher?label=Open%20VSX&color=a60ee5)](https://open-vsx.org/extension/mikesoft/vscode-codex-cli-launcher)
[![CI](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-TheStreamCode-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/TheStreamCode)

Codex CLI Launcher is an unofficial VS Code extension that opens OpenAI Codex CLI in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux where Codex CLI is available to the integrated terminal.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, sponsored by, or approved by OpenAI. "OpenAI", "Codex", and related names are trademarks of their respective owners.

> **✨ Want one launcher for every agent?** Try **[Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli)** — a single sidebar that launches Claude Code, Codex, Copilot, Cursor, Grok, Kilo, Antigravity, OpenCode, and more. Install this launcher for Codex alone, or Super CLI for the whole set.

## Features

- Adds a launcher button to the editor title area
- Uses local Marketplace and toolbar artwork packaged with the extension
- Opens a fresh terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs a configurable Codex CLI command
- Offers guided installation when the default `codex` command is not available
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.86.0`
- Codex CLI available in the integrated terminal environment, or a working custom launch command configured in settings

## Installation

1. Install the extension from the VS Code Marketplace.
2. Install Codex CLI globally:

```bash
npm install -g @openai/codex
```

3. Open any file in VS Code.
4. Click the launcher button in the editor title.

Any equivalent install or launch method that makes `codex` available in your terminal also works.

## Guided Installation

If the default `codex` command is missing, the extension shows a guided warning with options to install Codex CLI, open the Codex documentation, or open the extension settings.

Choosing **Install** opens a visible terminal and runs a generated prompt script. Installation only starts after explicit confirmation:

```text
Codex CLI was not found.
Install Codex CLI now? (y/N):
```

Answer `y` or `yes` to run:

```bash
npm install -g @openai/codex
```

Any other answer cancels installation. Restart VS Code if your shell needs a new environment to see globally installed npm commands.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

The launcher checks command availability when the terminal runs, so it behaves consistently with your normal integrated terminal environment.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `codexCliLauncher.cliCommand` | `codex` | Command executed when the launcher button is clicked. The command is sent directly to the integrated terminal. |
| `codexCliLauncher.terminalName` | `Codex CLI` | Base label used for the created terminal. |
| `codexCliLauncher.autoInstall` | `true` | Offer guided installation when the default `codex` command is missing. |

Use the Command Palette to open the extension settings:

- `Codex CLI Launcher: Open Settings`

Examples:

Default command:

```json
"codexCliLauncher.cliCommand": "codex"
```

Launch through `npx`:

```json
"codexCliLauncher.cliCommand": "npx --yes @openai/codex"
```

Windows executable path with spaces:

```json
"codexCliLauncher.cliCommand": "\"C:\\Users\\You\\AppData\\Roaming\\npm\\codex.cmd\""
```

## Troubleshooting

### The terminal opens but `codex` is not recognized

Install Codex CLI globally and confirm that `codex` works in a regular integrated terminal:

```bash
npm install -g @openai/codex
```

If your setup relies on shell initialization, restart VS Code after installation so new terminals inherit the updated environment.

### Nothing happens after clicking the button

Check `codexCliLauncher.cliCommand` and verify that the same command works in a regular terminal.

### Custom executable path on Windows

Quote executable paths that contain spaces. This is required for commands such as `"C:\Users\You\AppData\Roaming\npm\codex.cmd"`.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Codex starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Privacy

Codex CLI Launcher does not collect telemetry, analytics, or personal data.

All extension artwork is packaged locally in the VSIX. No external image assets are loaded at runtime.

## Development

Local verification and packaging:

```bash
npm install
npm run check
npm run test:integration
npm run package
```

`npm run package` creates the `.vsix` file in the workspace root.

The repository includes unit tests, metadata checks, VS Code integration smoke tests, and CI coverage for Windows and Linux.

## Support

Open a [GitHub issue](https://github.com/TheStreamCode/codex-cli-launcher/issues) for bugs and feature requests. For support details, see [SUPPORT.md](SUPPORT.md).

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## License

Released under the [MIT License](LICENSE).
