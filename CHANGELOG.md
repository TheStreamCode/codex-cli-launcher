# Changelog

## [Unreleased]

### Changed

- Upgraded TypeScript from `^6.0.0` to `^7.0.0` (resolved 7.0.2). No source or configuration changes were required.
- Raised the minimum required VS Code version to `^1.103.0` and aligned `@types/vscode` to match, so `vsce` validation passes against the declared engine floor.
- Enabled TypeScript 6 compatibility in `tsconfig.json` and stopped tracking compiled `out/` output in git.

### Security

- Resolved npm audit vulnerabilities in transitive dependencies (`form-data`, `js-yaml`, `tmp`, `undici`) via `npm audit fix`.

## 0.1.4

### Changed

- Raised the minimum required VS Code version to `^1.93.0`, the actual floor for the terminal shell integration APIs the launcher uses (previously declared `^1.86.0`, where those APIs are unavailable).

## 0.1.3

### Changed

- Unified the `LICENSE` copyright holder to **Michael Gasperini (Mikesoft)**. No functional changes.

## 0.1.2

### Changed

- Marketplace discoverability: added the **AI** and **Chat** categories, a more descriptive title and summary, and reordered keywords.
- Added Marketplace, Open VSX, and GitHub Sponsors badges, a `sponsor` link, and a pointer to **Super CLI** (the all-in-one launcher) to the README. No functional changes.

## 0.1.1

### Changed

- Refreshed the Marketplace icon and editor toolbar launcher artwork.
- Rebuilt the VSIX package with the updated visual assets.

## 0.1.0

### Added

- Added Codex CLI launcher command for the editor toolbar.
- Added side-terminal launch behavior with active-workspace working directory resolution.
- Added consent-based guided install flow for `npm install -g @openai/codex`.
- Added configurable command, terminal name, and guided install settings.
- Added legal, support, security, and trademark documentation.
