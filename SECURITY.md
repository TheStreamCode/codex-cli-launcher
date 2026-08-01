# Security Policy

## Supported Versions

Security fixes are provided for the latest published release. Upgrade to the current Marketplace or Open VSX version before reporting an issue that may already be resolved.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.

Use [GitHub private vulnerability reporting](https://github.com/TheStreamCode/codex-cli-launcher/security/advisories/new). If that channel is unavailable, email security concerns to info@mikesoft.it.

Include the affected extension and VS Code versions, operating system, impact, reproduction steps, and any suggested mitigation. Do not include credentials, tokens, or unrelated personal data. You should receive an acknowledgement within 7 days and a status update within 14 days.

## Security Model

This extension launches user-configured terminal commands. Review workspace trust prompts and configuration changes before running commands in untrusted repositories.

The extension does not download or execute Codex CLI installers. If `codex` is unavailable, it can only offer to open the official Codex CLI installation documentation in your external browser. See [docs/architecture.md](docs/architecture.md) for the maintained trust boundaries.
