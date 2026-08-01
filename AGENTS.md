# Repository Instructions

## Project scope

Codex CLI Launcher is an unofficial VS Code extension published to the Visual Studio Marketplace and Open VSX as `mikesoft.vscode-codex-cli-launcher`. It creates a side terminal and launches a user-configured Codex CLI command. Keep the extension small, cross-platform, and explicit about its unofficial status.

The repository is public and MIT licensed. Assume every change, comment, and commit message is world-readable.

## Stack and runtime

- TypeScript compiled with the repository-local `typescript` compiler to CommonJS-compatible `NodeNext` output under `out/`.
- `npm` with the committed `package-lock.json` is the only supported package manager. Do not introduce a second lockfile or package manager.
- Node.js 22 or newer. CI runs Node 22 on `windows-latest` and `ubuntu-latest`.
- Minimum supported editor is VS Code `^1.103.0`. `@types/vscode` is pinned to exactly `1.103.0` so the compiler cannot accept APIs that do not exist on the declared floor.
- There is no linter or formatter. `.editorconfig` (LF, UTF-8, two-space indent, final newline) plus `tsc` in `strict` mode with `noUnusedLocals` and `noUnusedParameters` are the only static checks.

## Architecture

- `src/extension.ts` owns VS Code API integration, terminal lifecycle, workspace-trust checks, settings, and user messages.
- `src/command-utils.ts` contains pure command, naming, output-buffer, launch-session, and workspace-resolution helpers. Put testable logic here instead of embedding it in activation handlers.
- `test/*.test.js` contains unit, metadata, packaging, lifecycle, and security-invariant tests. They run against compiled `out/`, so compile before running them directly.
- `test/integration/` runs the extension in the minimum supported VS Code release by default. Override with `VSCODE_TEST_VERSION`.
- `docs/` holds maintainer documentation and is excluded from the VSIX.
- `media/` holds the packaged Marketplace and toolbar artwork.

## Repository structure

```
.github/          workflows, issue forms, PR template, CODEOWNERS, funding
docs/             architecture and release documentation (not packaged)
media/            icon.png (Marketplace) and launcher-mark.svg (toolbar)
src/              extension.ts and command-utils.ts
test/             unit and metadata tests plus the VS Code integration suite
out/              generated compiler output (never edit, never commit)
```

## Commands

| Purpose | Command |
| --- | --- |
| Install | `npm ci` |
| Compile and type-check | `npm run compile` |
| Watch | `npm run watch` |
| Unit tests | `npm run test:unit` |
| Integration smoke test | `npm run test:integration` |
| All tests | `npm test` |
| Full validation (compile, tests, integration, packaged file list) | `npm run check` |
| Dependency audit | `npm run audit` |
| Build the VSIX | `npm run package` |

There is no dev server, no deploy step, and no publish script. Publishing is a manual maintainer action through `vsce` and `ovsx`; see `docs/releasing.md`.

## Launch lifecycle

Only `activate` may register on `context.subscriptions`: the two commands and the terminal-close listener. VS Code releases that array on deactivation only, so anything pushed per launch would accumulate for the whole session.

Every launch instead creates a disposal scope with `createLaunchSession`. Register launch-scoped listeners and timers on that scope. A scope ends when the command finishes, when the fallback `sendText` path runs, or when its terminal closes; `deactivate` drains whatever is left.

## Security invariants

- Never download or install Codex CLI, generate installer scripts, or invoke Node child-process APIs. A missing default CLI may only offer the official documentation link.
- Never execute a command sourced from workspace settings. `cliCommand` must remain machine-scoped and resolved from user-level configuration.
- Require a trusted workspace before creating a terminal or sending a command.
- Treat `cliCommand` as an intentional shell command, preserve quoted executable paths, and do not silently rewrite it.
- Keep shell-output capture bounded and limited to the missing-Codex detection path. Custom commands must not have their output read at all. Do not log terminal output or add telemetry.
- `src/extension.ts` must contain exactly one external URL, the official Codex CLI documentation link. Tests enforce this.
- Do not add official OpenAI or Codex logos or imply endorsement.

## Environment variables and secrets

The extension reads no environment variables at runtime. `VSCODE_TEST_VERSION` only selects the VS Code build used by the integration test.

Marketplace and Open VSX tokens (`VSCE_PAT`, `OVSX_PAT`) belong to the maintainer's local environment. Never commit them, never echo them, never add them to workflows, issue comments, or release notes. No repository secret is required by any workflow in this repository.

## Generated and protected files

- `out/`, `.vscode-test/`, and `*.vsix` are generated locally and must not be committed or edited.
- `package-lock.json` is maintained by npm. Change it only through npm commands.
- `media/icon.png` and `media/launcher-mark.svg` are hand-authored published artwork. Do not regenerate, redraw, recolor, resize, rename, or move them, and do not add a script that writes to `media/`. Optimizing byte size is acceptable only when the rendered result, dimensions, transparency, format, and paths are preserved exactly.

## Compatibility rules

- No breaking changes. Setting ids, command ids, the publisher, and the extension name are part of the installed user's configuration and must stay stable.
- Do not raise `engines.vscode` without a real API requirement, and keep `@types/vscode` equal to that floor.
- Verify behavior on both Windows and POSIX shells when command parsing or terminal execution changes.
- Keep the version synchronized across `package.json`, `package-lock.json`, `CITATION.cff`, `README.md`, `CHANGELOG.md`, and `test/metadata.test.js`.

## Change conventions

- Keep changes focused and add regression tests for behavior changes.
- Update `README.md` for user-visible behavior and `CHANGELOG.md` under `Unreleased` for notable changes.
- Pin GitHub Actions to full commit SHAs and grant only the permissions each workflow needs.
- Use concise conventional commit subjects.

## Validation criteria

Before proposing a change:

1. `npm ci`
2. `npm run check` after any source, manifest, workflow, documentation, or packaging change
3. `npm run audit` after any dependency or lockfile change
4. `npm run package` for release-facing changes, then inspect the file list and confirm that sources, tests, workflows, `AGENTS.md`, source maps, and local artifacts stay out of the VSIX

Do not disable, skip, or weaken a test to make validation pass.

## Code review rules

- Flag any path that can bypass workspace trust, accept repository-controlled commands, execute installers, or expose terminal output.
- Flag any disposable registered on `context.subscriptions` outside `activate`.
- Treat packaged-file changes as release changes.

## Instructions for AI agents

- `main` is protected: it requires a pull request, one approving review, passing `validate (ubuntu-latest)` and `validate (windows-latest)` checks, and linear history. Never push to `main` directly, never force push, never rewrite history, and never approve or merge your own pull request.
- Do not publish, tag, or create a release unless the maintainer explicitly requests it. The published Marketplace and Open VSX versions must always match the tag, `package.json`, and `CHANGELOG.md`.
- Do not delete files under `media/`, `docs/`, or `.github/` without an explicit request.
- Report what you actually ran and what actually happened. Do not claim a published release you did not perform.
