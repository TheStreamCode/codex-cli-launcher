# Release checklist

Releases are maintainer-only and should start from a clean, up-to-date `main` branch.

## Prepare

1. Choose a semantic version and move relevant entries from `Unreleased` into that version in `CHANGELOG.md`.
2. Synchronize the version in `package.json` and `package-lock.json` with `npm version <x.y.z> --no-git-tag-version`, then update `CITATION.cff`, `README.md`, the version assertion in `test/metadata.test.js`, and any other release-facing documentation.
3. Run `npm ci`, `npm run check`, and `npm run audit`.
4. Run `npm run package` and inspect the VSIX file list. Confirm that source, tests, workflows, `AGENTS.md`, and local artifacts are absent.
5. Install the generated VSIX in a clean VS Code profile and smoke-test launching, settings, workspace trust, and the missing-CLI documentation prompt.

## Publish

1. Commit the release metadata and merge it through the protected branch workflow.
2. Update the local `main` branch to the merge commit, then rerun `npm ci`, `npm run check`, `npm run audit`, and `npm run package` from that clean commit.
3. Create a signed `vX.Y.Z` tag at the verified commit.
4. Publish that exact verified VSIX through the maintainer's Visual Studio Marketplace and Open VSX release channels, then attach the same artifact to a GitHub release with concise notes.
5. Confirm the Marketplace, Open VSX, README badges, GitHub release, and repository default branch all report the same version.

Never place marketplace tokens or credentials in the repository, issue comments, workflow output, or release notes.
