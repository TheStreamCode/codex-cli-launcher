# Contributing

Thanks for your interest in improving Codex CLI Launcher.

## Before You Start

- Search existing issues and pull requests before opening a duplicate.
- Use a focused issue for behavior changes that need design discussion.
- Report vulnerabilities privately according to [SECURITY.md](SECURITY.md).

## Development Setup

Prerequisites are Node.js 22 or newer, npm, and a supported VS Code installation.

```bash
npm ci
npm run check
```

The integration smoke test downloads and runs the minimum supported VS Code version. Set `VSCODE_TEST_VERSION` when you intentionally need to verify another release.

Keep changes focused and covered by tests. Preserve the security invariants documented in [AGENTS.md](AGENTS.md) and the trust boundaries in [docs/architecture.md](docs/architecture.md).

Do not add official OpenAI or Codex logos, marks, screenshots, or branding assets unless you have documented permission to use them.

## Pull Requests

- Create a branch from the current `main` branch and use concise conventional commit subjects.
- Keep user-facing behavior documented in `README.md` and notable changes under `Unreleased` in `CHANGELOG.md`.
- Add or update tests for launcher behavior, package metadata, security invariants, and packaging.
- Run `npm run check`; run `npm run audit` when dependencies or the lockfile change.
- Do not commit `out/`, `.vscode-test/`, `*.vsix`, logs, credentials, or editor-specific state.
- Complete the pull request template and link the relevant issue when one exists.

Maintainers use squash merges after required reviews and CI checks pass.
