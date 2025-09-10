# Environment-Based Development Setup

## Overview

The Cyberpunk Agent project now uses a `.env.development` file for local development configuration, making it easier and more standard to manage development paths without exposing them in the public repository.

## Quick Setup

### 1. Create Environment File
```bash
npm run setup:env
```

### 2. Edit Your Path
Open `.env.development` and set your FoundryVTT modules path:
```bash
# Windows
FOUNDRY_MODULES_PATH=C:\Users\YourUser\AppData\Local\FoundryVTT\Data\modules

# macOS  
FOUNDRY_MODULES_PATH=/Users/YourUser/Library/Application Support/FoundryVTT/Data/modules

# Linux
FOUNDRY_MODULES_PATH=/home/YourUser/.local/share/FoundryVTT/Data/modules
```

### 3. Copy Files to FoundryVTT
```bash
npm run dev:copy
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FOUNDRY_MODULES_PATH` | Path to FoundryVTT modules directory | (required) |
| `FOUNDRY_DATA_PATH` | Path to FoundryVTT data directory | (optional) |
| `MODULE_NAME` | Custom module directory name | `cyberpunk-agent` |
| `DEV_VERBOSE` | Enable verbose logging | `false` |

## File Structure

```
cyberpunk-agent/
├── .env.example          # Template (tracked in git)
├── .env.development      # Your local config (git-ignored)
├── scripts/dev-copy.js   # Enhanced copy script
└── package.json          # Updated with setup:env script
```

## Benefits

- ✅ **Standard Practice**: Uses common .env pattern
- ✅ **Git Safe**: .env.development is git-ignored
- ✅ **Easy Setup**: One command to get started
- ✅ **Flexible**: Multiple configuration options
- ✅ **Cross-Platform**: Works on Windows, macOS, Linux
- ✅ **No Exposure**: Personal paths never committed

## Fallback Methods

The system still supports multiple configuration methods in order of priority:

1. **`.env.development` file** (recommended)
2. **System environment variables**
3. **`dev-config.json` file** (legacy)
4. **Auto-detection** of common FoundryVTT paths

## Migration from Old Setup

If you were using the old `dev-config.json` method:

1. Run `npm run setup:env`
2. Copy your path from `dev-config.json` to `.env.development`
3. Delete `dev-config.json` (optional)

## Security Notes

- `.env.development` is automatically git-ignored
- `.env.example` is tracked and safe for public repositories
- Environment variables are loaded only during development
- No personal information is exposed in the codebase
