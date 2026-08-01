# Architecture

Codex CLI Launcher is intentionally a small extension with two production modules.

## Launch flow

1. VS Code activates the extension when a contributed command is invoked.
2. `extension.ts` checks workspace trust and reads machine-scoped user configuration.
3. `command-utils.ts` resolves the terminal name, command, and working directory.
4. The extension creates a side terminal and executes the command through terminal shell integration when available, falling back to `sendText` after a short wait.
5. For Codex executables only, the extension inspects a bounded window of shell output. If the executable is missing, it offers the official documentation link.

## Launch lifecycle

Each launch owns a disposal scope created by `createLaunchSession`. The scope holds the shell-integration listener, the fallback timer, and the shell-execution listener for that launch only.

A scope ends when its command finishes, when the fallback path sends the command without shell integration, or when its terminal closes. `deactivate` drains any scope that is still open.

Only `activate` registers on `context.subscriptions`: the two commands and the terminal-close listener. VS Code releases that array on deactivation only, so per-launch resources must never be added to it.

## Trust boundaries

- Workspace files are untrusted input. They must not control `cliCommand` or bypass the workspace-trust gate.
- The configured CLI command is trusted user intent and is sent to the integrated shell. The launcher does not parse arguments into a child process.
- Terminal output can contain sensitive data. It is never logged or transmitted, is never read for custom commands, and is bounded while checking for a missing Codex executable.
- Network access is limited to opening the official Codex CLI documentation at the user's request. The extension does not make background requests.

## Packaging

TypeScript compiles to `out/`. The VSIX contains compiled JavaScript, runtime artwork, package metadata, the README, and legal/security documents. Source files, tests, workflows, development documentation, agent instructions, source maps, lockfiles, and local build artifacts are excluded.
