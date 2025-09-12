# Release Process for Cyberpunk Agent

This document outlines the release process for the Cyberpunk Agent FoundryVTT module.

## Overview

The release process is automated using GitHub Actions and follows semantic versioning. When you create a git tag, GitHub Actions automatically:

1. Updates `module.json` with the correct version and URLs
2. Creates a release package (zip file)
3. Publishes the release on GitHub
4. Makes the module available for installation via the manifest URL

## Quick Release

For a patch release (most common):

```bash
yarn release
```

For minor or major releases:

```bash
yarn release:minor
yarn release:major
```

## Manual Release Process

If you prefer to handle releases manually:

### 1. Prepare the Release

Ensure you're on the correct branch (usually `develop` or `main`):

```bash
git checkout develop
git pull origin develop
```

Check that all changes are committed:

```bash
git status
```

### 2. Update Version and Changelog

Update the version in both `module.json` and `package.json`:

```json
// module.json & package.json
{
  "version": "2.1.0"  // Update this
}
```

Update `CHANGELOG.md`:
- Move items from `[Unreleased]` to a new version section
- Add the release date

### 3. Create Release Commit and Tag

```bash
# Commit the version changes
git add module.json package.json CHANGELOG.md
git commit -m "Release v2.1.0"

# Create and push the tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin develop
git push origin v2.1.0
```

### 4. GitHub Actions Takes Over

Once the tag is pushed, GitHub Actions will:
- Automatically update the URLs in `module.json`
- Create the release package
- Publish the release on GitHub

## Git Workflow

### Branch Strategy

```
main        ──●──●──●────────●──  (stable releases)
              ╱     ╱        ╱
develop   ──●──●──●──●──●──●──   (development)
             ╱  ╱      ╱
feature   ──●──●      ╱         (feature branches)
```

### Recommended Workflow

1. **Development**: Work on `develop` branch or feature branches
2. **Testing**: Test thoroughly before release
3. **Release**: Create release from `develop` branch
4. **Merge to Main**: After successful release, merge `develop` to `main`

```bash
# After successful release
git checkout main
git pull origin main
git merge develop
git push origin main
```

## Version Types

### Patch Release (x.y.Z)
- Bug fixes
- Small improvements
- No breaking changes

```bash
yarn release        # 2.0.0 → 2.0.1
```

### Minor Release (x.Y.0)
- New features
- Enhancements
- Backward compatible

```bash
yarn release:minor  # 2.0.1 → 2.1.0
```

### Major Release (X.0.0)
- Breaking changes
- Major rewrites
- API changes

```bash
yarn release:major  # 2.1.0 → 3.0.0
```

## Release Checklist

### Before Release

- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with changes
- [ ] All tests passing (if applicable)
- [ ] Clean git status (no uncommitted changes)

### During Release

- [ ] Version bumped in `module.json` and `package.json`
- [ ] CHANGELOG.md updated with version and date
- [ ] Git commit created with proper message
- [ ] Git tag created and pushed
- [ ] GitHub Actions workflow completed successfully

### After Release

- [ ] Release appears on GitHub releases page
- [ ] Module.json manifest URL works
- [ ] Download ZIP works
- [ ] Test installation in FoundryVTT
- [ ] Update any external documentation
- [ ] Announce release (if applicable)

## Installation URLs

After release, users can install the module using:

**Manifest URL:**
```
https://github.com/dmberlin/cyberpunk-agent/releases/latest/download/module.json
```

**Direct Download:**
```
https://github.com/dmberlin/cyberpunk-agent/releases/latest/download/cyberpunk-agent.zip
```

## Troubleshooting

### Release Failed

If GitHub Actions fails:

1. Check the Actions tab on GitHub for error details
2. Common issues:
   - Invalid `module.json` syntax
   - Missing required files
   - Permission issues

### Wrong Version Released

If you need to fix a release:

1. Delete the tag locally and remotely:
   ```bash
   git tag -d v2.1.0
   git push origin :refs/tags/v2.1.0
   ```
2. Delete the GitHub release (if created)
3. Fix the issues and re-release

### Module Not Installing

Check:
- [ ] Manifest URL returns valid JSON
- [ ] Download URL returns valid ZIP file
- [ ] `module.json` has correct FoundryVTT compatibility version
- [ ] All required files are included in the ZIP

## Development vs Release URLs

### Development (Local)
```json
{
  "url": "",
  "manifest": "",
  "download": ""
}
```

### Release (Automatic via GitHub Actions)
```json
{
  "url": "https://github.com/dmberlin/cyberpunk-agent",
  "manifest": "https://github.com/dmberlin/cyberpunk-agent/releases/latest/download/module.json",
  "download": "https://github.com/dmberlin/cyberpunk-agent/releases/latest/download/cyberpunk-agent.zip"
}
```

The GitHub Actions workflow automatically updates these URLs during release.
