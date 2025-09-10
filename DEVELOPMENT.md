# Development Setup - Cyberpunk Agent

This guide helps you set up a development environment for testing the Cyberpunk Agent module locally in FoundryVTT.

## Quick Start

### Method 1: .env.development File (Recommended)

1. Copy the example environment file:
```bash
npm run setup:env
```

2. Edit `.env.development` with your FoundryVTT modules path:
```bash
# Windows example
FOUNDRY_MODULES_PATH=C:\Users\YourUser\AppData\Local\FoundryVTT\Data\modules

# macOS example  
FOUNDRY_MODULES_PATH=/Users/YourUser/Library/Application Support/FoundryVTT/Data/modules

# Linux example
FOUNDRY_MODULES_PATH=/home/YourUser/.local/share/FoundryVTT/Data/modules
```

3. Run the copy script:
```bash
npm run dev:copy
```

### Method 2: System Environment Variable

1. Set the `FOUNDRY_MODULES_PATH` environment variable:

**Windows (PowerShell):**
```powershell
$env:FOUNDRY_MODULES_PATH = "C:\Users\YourUser\AppData\Local\FoundryVTT\Data\modules"
```

**Windows (Command Prompt):**
```cmd
set FOUNDRY_MODULES_PATH=C:\Users\YourUser\AppData\Local\FoundryVTT\Data\modules
```

**macOS/Linux:**
```bash
export FOUNDRY_MODULES_PATH="$HOME/Library/Application Support/FoundryVTT/Data/modules"
```

2. Run the copy script:
```bash
npm run dev:copy
```

### Method 3: Local Configuration File

1. Create a local config file:
```bash
npm run dev:copy -- --setup
```

2. Edit `dev-config.json` with your FoundryVTT modules path:
```json
{
  "foundryModulesPath": "C:\\Users\\YourUser\\AppData\\Local\\FoundryVTT\\Data\\modules"
}
```

3. Run the copy script:
```bash
npm run dev:copy
```

### Method 3: Windows Batch File

1. Double-click `dev-copy.bat` or run:
```cmd
dev-copy.bat
```

This will automatically try to find your FoundryVTT installation.

## Common FoundryVTT Module Paths

### Windows
- `%LOCALAPPDATA%\FoundryVTT\Data\modules`
- `%APPDATA%\FoundryVTT\Data\modules`
- `C:\Users\[Username]\AppData\Local\FoundryVTT\Data\modules`

### macOS
- `~/Library/Application Support/FoundryVTT/Data/modules`

### Linux
- `~/.local/share/FoundryVTT/Data/modules`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup:env` | Copy .env.example to .env.development |
| `npm run dev:copy` | Copy module files to FoundryVTT (Node.js script) |
| `npm run dev:copy-alt` | Copy using PowerShell (Windows only) |
| `npm run dev:watch` | Watch for changes and auto-copy |
| `npm run dev` | Copy files and show success message |
| `npm test` | Copy files and run tests |

## Development Workflow

1. **Initial Setup**: Set up your FoundryVTT path using one of the methods above
2. **Make Changes**: Edit your module files
3. **Copy to FoundryVTT**: Run `npm run dev:copy`
4. **Test**: Refresh your FoundryVTT browser tab to see changes
5. **Auto-Watch** (Optional): Use `npm run dev:watch` for automatic copying

## Auto-Watch Mode

For continuous development, use the watch mode:

```bash
npm run dev:watch
```

This will automatically copy files to FoundryVTT whenever you make changes to:
- `scripts/` directory
- `__tests__/` directory  
- `lang/` directory
- `module.json`

## Troubleshooting

### "Could not find FoundryVTT modules path"

1. **Verify Path**: Make sure FoundryVTT is installed and the modules directory exists
2. **Check Environment Variable**: Ensure `FOUNDRY_MODULES_PATH` is set correctly
3. **Manual Setup**: Run `npm run dev:copy -- --setup` to create a config file
4. **Custom Path**: Edit `dev-config.json` with your specific path

### "Permission Denied" Errors

1. **Close FoundryVTT**: Make sure FoundryVTT is not running
2. **Admin Rights**: On Windows, try running as Administrator
3. **File Locks**: Check if any files are locked by other processes

### Files Not Updating in FoundryVTT

1. **Hard Refresh**: Use Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache**: Clear browser cache
3. **Restart FoundryVTT**: Close and reopen FoundryVTT
4. **Check Module**: Ensure the module is enabled in FoundryVTT

## Security Notes

- `dev-config.json` is git-ignored and safe for local paths
- Environment variables are not committed to the repository
- The batch file uses common paths and doesn't expose personal directories
- All local configuration files are excluded from version control

## Testing Your Changes

After copying files to FoundryVTT:

1. **Enable Module**: Go to "Manage Modules" and ensure "Cyberpunk Agent" is enabled
2. **Refresh Browser**: Press F5 or Ctrl+F5 to reload
3. **Check Console**: Open browser DevTools (F12) to see any errors
4. **Test Features**: Try the contact sorting feature by sending messages between contacts

## File Structure

The copy script includes these files/directories:
- `scripts/` - Module JavaScript files
- `styles/` - CSS stylesheets  
- `templates/` - HTML templates
- `lang/` - Language files
- `assets/` - Images and sounds
- `module.json` - Module manifest

And excludes:
- `node_modules/` - Dependencies
- `__tests__/` - Test files
- `package*.json` - NPM files
- `*.md` - Documentation
- Development configuration files
