# Codex CLI Launcher

Launch OpenAI Codex CLI in a fresh side terminal from the VS Code editor toolbar

[![CI](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-codex-cli-launcher?label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher)

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Codex CLI Launcher icon">
</p>

Codex CLI Launcher is a small, unofficial VS Code extension for developers who already use Codex CLI and want a predictable one-click launcher inside the editor. It works on Windows, macOS, and Linux wherever `codex` is available to the integrated terminal.

> **Unofficial project.** This extension is not affiliated with, endorsed by, sponsored by, or approved by OpenAI. "OpenAI", "Codex", and related names are trademarks of their respective owners. See [`TRADEMARKS.md`](TRADEMARKS.md) for the full notice.

## Install

Install the extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher) or from [Open VSX](https://open-vsx.org/extension/mikesoft/vscode-codex-cli-launcher), or download the latest VSIX from [GitHub releases](https://github.com/TheStreamCode/codex-cli-launcher/releases/latest).

VS Code users can also install the Marketplace build from a terminal:

```bash
code --install-extension mikesoft.vscode-codex-cli-launcher
```

Codex CLI itself is a separate product. Install it from the [official Codex CLI documentation](https://learn.chatgpt.com/docs/codex/cli) and confirm that `codex` works in an integrated terminal.

## Quick start

1. Install Codex CLI and make sure `codex` runs in your integrated terminal.
2. Install this extension and open a file in a trusted workspace.
3. Click the launcher button in the editor title toolbar.

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

## Features

- One-click launcher in the editor title toolbar
- A fresh side terminal for every launch
- Active-editor workspace selection, with the first workspace folder as fallback
- Configurable launch command and terminal name
- Missing-command guidance that opens the official Codex CLI documentation
- Quoted Windows executable paths, including PowerShell's call operator
- Bounded shell-output capture used only to recognize a missing default `codex` command
- No installers, package-manager execution, telemetry, or background network calls

## Requirements

- VS Code `^1.103.0`
- Codex CLI available in the integrated terminal environment, or a working custom launch command in the extension settings

| Environment | Status |
| --- | --- |
| VS Code `^1.103.0` | Supported and covered by the minimum-version integration test |
| Windows | Supported and validated in CI |
| Linux | Supported and validated in CI |
| macOS | Supported; not currently included in the CI matrix |
| Other VS Code-compatible editors | May work when they provide the required VS Code APIs, but are not part of the supported test matrix |

## Configuration

| Setting | Purpose | Default |
| --- | --- | --- |
| `codexCliLauncher.cliCommand` | Command executed when the launcher button is clicked. Machine-scoped; workspace values are ignored. | `codex` |
| `codexCliLauncher.terminalName` | Base label used for created terminals. | `Codex CLI` |

Open the settings with **Codex CLI Launcher: Open Settings** from the Command Palette.

Default command:

```json
"codexCliLauncher.cliCommand": "codex"
```

Windows PowerShell executable path with spaces:

```json
"codexCliLauncher.cliCommand": "& \"C:\\Program Files\\OpenAI Codex\\codex.cmd\""
```

Windows Command Prompt executable path with spaces:

```json
"codexCliLauncher.cliCommand": "\"C:\\Program Files\\OpenAI Codex\\codex.cmd\""
```

## Privacy and security

The extension does not collect telemetry, analytics, or personal data. The configured command runs visibly in your local integrated terminal, and Codex CLI remains a separate product with its own authentication, network behavior, and terms.

- Launching is disabled until the workspace is trusted.
- The CLI command is machine-scoped and cannot be supplied by a repository.
- The extension does not download installers, create installation scripts, or run package-manager installation commands.
- Shell-output capture is bounded and used only to recognize a missing default `codex` command. Output from custom commands is not read.
- All extension artwork is packaged in the VSIX; no external images are loaded at runtime.

See [`SECURITY.md`](SECURITY.md) and the [architecture documentation](docs/architecture.md) for the maintained trust boundaries.

## Troubleshooting

### The terminal opens but `codex` is not recognized

Follow the [official Codex CLI documentation](https://learn.chatgpt.com/docs/codex/cli), then confirm that `codex` works in a regular integrated terminal. If your setup relies on shell initialization, restart VS Code after installation so new terminals inherit the updated environment.

### Nothing happens after clicking the button

Check `codexCliLauncher.cliCommand` and verify that the same command works in a regular terminal. Confirm that the workspace is trusted.

### Custom executable path on Windows

Quote executable paths that contain spaces. In PowerShell, use the call operator before the quoted path, for example `& "C:\Program Files\OpenAI Codex\codex.cmd"`. In Command Prompt, use the quoted path directly.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Codex starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Development

Requirements: Node.js 22 or newer and npm. The repository uses npm with the committed `package-lock.json`.

```bash
git clone https://github.com/TheStreamCode/codex-cli-launcher.git
cd codex-cli-launcher
npm ci
npm run check
npm run audit
```

`npm run check` compiles the extension, runs the unit and metadata tests, executes the VS Code Extension Host smoke test against the minimum supported release, and inspects the packaged file list. `npm run package` creates a local `.vsix` file. See the [architecture](docs/architecture.md) and [release checklist](docs/releasing.md) for maintainer details.

## Support

Open a [GitHub issue](https://github.com/TheStreamCode/codex-cli-launcher/issues) for bugs and feature requests, or read [`SUPPORT.md`](SUPPORT.md) for the information to include. Maintenance can be supported through [GitHub Sponsors](https://github.com/sponsors/TheStreamCode).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Pull requests must pass the required CI checks.

## License

MIT License — see [`LICENSE`](LICENSE).

---

Maintained by [Michael Gasperini (Mikesoft)](https://mikesoft.it).
If this project is useful to you, consider [sponsoring its maintenance](https://github.com/sponsors/TheStreamCode).
