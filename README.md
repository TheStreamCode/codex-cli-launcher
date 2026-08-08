# Codex CLI Launcher

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-codex-cli-launcher?label=Marketplace&color=6366F1)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/mikesoft.vscode-codex-cli-launcher?color=0EA5E9)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher)
[![Open VSX](https://img.shields.io/open-vsx/v/mikesoft/vscode-codex-cli-launcher?label=Open%20VSX&color=a60ee5)](https://open-vsx.org/extension/mikesoft/vscode-codex-cli-launcher)
[![CI](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/codex-cli-launcher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Launch OpenAI Codex CLI in a fresh side terminal directly from the VS Code editor toolbar.

[**Install from Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher) · [**Install from Open VSX**](https://open-vsx.org/extension/mikesoft/vscode-codex-cli-launcher)

Codex CLI Launcher is a small, unofficial VS Code extension for developers who already use Codex CLI and want a predictable one-click launcher inside the editor. It works on Windows, macOS, and Linux wherever `codex` is available to the integrated terminal.

> **Unofficial project:** This extension is not affiliated with, endorsed by, sponsored by, or approved by OpenAI. "OpenAI", "Codex", and related names are trademarks of their respective owners.

## Features

- Launch Codex CLI from the editor title with one click
- Open a fresh side terminal for every launch instead of reusing existing sessions
- Start in the active editor's workspace, with a predictable fallback for multi-root windows
- Configure the launch command and terminal name without repository-controlled overrides
- Links to the official Codex CLI installation documentation when the default `codex` command is not available
- Supports quoted Windows executable paths, including PowerShell's call operator
- Does not collect telemetry, analytics, or personal data

## Quick Start

1. Install Codex CLI using the [official Codex CLI documentation](https://learn.chatgpt.com/docs/codex/cli).
2. Install Codex CLI Launcher from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-codex-cli-launcher) or [Open VSX](https://open-vsx.org/extension/mikesoft/vscode-codex-cli-launcher).
3. Open a file in a trusted workspace.
4. Click the launcher button in the editor title.

VS Code users can also install the extension from a terminal:

```bash
code --install-extension mikesoft.vscode-codex-cli-launcher
```

## Trust and Privacy

- The launcher is disabled until the workspace is trusted.
- The CLI command is machine-scoped and cannot be supplied by a repository.
- The extension never downloads Codex CLI, generates installer scripts, or runs package-manager installation commands.
- Shell-output capture is bounded and used only to recognize a missing default `codex` command. Output from custom commands is not read.
- No telemetry, analytics, or personal data is collected.
- All extension artwork is packaged in the VSIX; no external images are loaded at runtime.

See [SECURITY.md](SECURITY.md) and the [architecture documentation](docs/architecture.md) for the maintained trust boundaries.

## Compatibility

| Environment | Status |
| --- | --- |
| VS Code `^1.103.0` | Supported and covered by the minimum-version integration test |
| Windows | Supported and validated in CI |
| Linux | Supported and validated in CI |
| macOS | Supported; not currently included in the CI matrix |
| Other VS Code-compatible editors | May work when they provide the required VS Code APIs, but are not part of the supported test matrix |

## Requirements

- VS Code `^1.103.0`
- Codex CLI available in the integrated terminal environment, or a working custom launch command configured in settings

## Missing CLI

If the default `codex` command is missing, the extension offers to open the [official Codex CLI installation documentation](https://learn.chatgpt.com/docs/codex/cli) in your browser. The extension does not download installers, create installation scripts, or run package-manager installation commands.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

The launcher checks command availability when the terminal runs, so it behaves consistently with your normal integrated terminal environment.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `codexCliLauncher.cliCommand` | `codex` | Command executed when the launcher button is clicked. The command is sent directly to the integrated terminal. |
| `codexCliLauncher.terminalName` | `Codex CLI` | Base label used for the created terminal. |

Use the Command Palette to open the extension settings:

- `Codex CLI Launcher: Open Settings`

Examples:

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

## Troubleshooting

### The terminal opens but `codex` is not recognized

Follow the [official Codex CLI installation documentation](https://learn.chatgpt.com/docs/codex/cli), then confirm that `codex` works in a regular integrated terminal.

If your setup relies on shell initialization, restart VS Code after installation so new terminals inherit the updated environment.

### Nothing happens after clicking the button

Check `codexCliLauncher.cliCommand` and verify that the same command works in a regular terminal.

### Custom executable path on Windows

Quote executable paths that contain spaces. In PowerShell, use its call operator before the quoted path, for example `& "C:\Program Files\OpenAI Codex\codex.cmd"`. In Command Prompt, use the quoted path directly, for example `"C:\Program Files\OpenAI Codex\codex.cmd"`.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Codex starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Development

Local verification and packaging:

```bash
npm ci
npm run check
npm run audit
npm run package
```

`npm run package` creates the `.vsix` file in the workspace root.

The repository includes unit tests, metadata and security checks, a VS Code integration smoke test against the minimum supported VS Code release, and CI coverage for Windows and Linux. See the [architecture](docs/architecture.md), [contribution guide](CONTRIBUTING.md), and [release checklist](docs/releasing.md) for maintainer details.

## Security

Do not disclose vulnerabilities in public issues. Use [GitHub private vulnerability reporting](https://github.com/TheStreamCode/codex-cli-launcher/security/advisories/new) or follow the fallback contact process in [SECURITY.md](SECURITY.md).

## Support

Open a [GitHub issue](https://github.com/TheStreamCode/codex-cli-launcher/issues) for bugs and feature requests. For support details, see [SUPPORT.md](SUPPORT.md).

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## Related Project

Need one launcher for multiple coding agents? [Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli) provides a single sidebar for Codex, Claude Code, Copilot, Cursor, Grok, Kilo, Antigravity, OpenCode, and other agent CLIs.

## License

Released under the [MIT License](LICENSE).
