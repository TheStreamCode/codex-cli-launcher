# Repository Instructions

## Project scope

Codex CLI Launcher is an unofficial VS Code extension. It creates a side terminal and launches a user-configured Codex CLI command. Keep the extension small, cross-platform, and explicit about its unofficial status.

## Architecture

- `src/extension.ts` owns VS Code API integration, terminal lifecycle, workspace-trust checks, settings, and user messages.
- `src/command-utils.ts` contains pure command, naming, output-buffer, and workspace-resolution helpers. Put testable logic here instead of embedding it in activation handlers.
- `test/*.test.js` contains unit, metadata, packaging, and security-invariant tests.
- `test/integration/` runs the extension in the minimum supported VS Code release by default.
- `out/`, `.vscode-test/`, and `*.vsix` are generated locally and must not be committed.

## Setup and verification

- Use Node.js 22 or newer and npm with the committed `package-lock.json`.
- Install reproducibly with `npm ci`.
- Run `npm run check` after source, manifest, workflow, documentation, or packaging changes.
- Run `npm run audit` after changing dependencies or the lockfile.
- Run `npm run package` for release-facing changes and inspect the packaged file list.

## Security invariants

- Never download or install Codex CLI, generate installer scripts, or invoke Node child-process APIs. A missing default CLI may only offer the official documentation link.
- Never execute a command sourced from workspace settings. `cliCommand` must remain machine-scoped and resolved from user-level configuration.
- Require a trusted workspace before creating a terminal or sending a command.
- Treat `cliCommand` as an intentional shell command, preserve quoted executable paths, and do not silently rewrite it.
- Keep shell-output capture bounded and limited to the missing-Codex detection path. Do not log terminal output or add telemetry.
- Do not add official OpenAI or Codex logos or imply endorsement.

## Change conventions

- Keep changes focused and add regression tests for behavior changes.
- Update `README.md` for user-visible behavior and `CHANGELOG.md` under `Unreleased` for notable changes.
- Keep the version synchronized across `package.json`, `package-lock.json`, `CITATION.cff`, and release-facing documentation when preparing a release.
- Pin GitHub Actions to full commit SHAs and grant only the permissions each workflow needs.
- Use concise conventional commit subjects. Do not publish, tag, push, or create a release unless the maintainer explicitly requests it.

## Code review rules

- Flag any path that can bypass workspace trust, accept repository-controlled commands, execute installers, or expose terminal output.
- Verify behavior on Windows and POSIX shells when command parsing or terminal execution changes.
- Treat packaged-file changes as release changes: confirm that sources, tests, agent instructions, and local artifacts stay out of the VSIX.
