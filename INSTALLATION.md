# Installing Cyberpunk Agent

This guide shows how to install the Cyberpunk Agent module in FoundryVTT.

## Method 1: Install via Manifest URL (Recommended)

This is the easiest method and ensures you always get the latest version.

### Step 1: Open FoundryVTT Setup

1. Launch FoundryVTT
2. Go to the **Setup** screen (not inside a world)
3. Click on **Add-on Modules**

### Step 2: Install the Module

1. Click **Install Module**
2. In the **Manifest URL** field, paste:
   ```
   https://github.com/dmberlin/cyberpunk-agent/releases/latest/download/module.json
   ```
3. Click **Install**

### Step 3: Enable in Your World

1. Launch your Cyberpunk RED world
2. Go to **Settings** → **Manage Modules**
3. Find **Cyberpunk Agent** in the list
4. Check the box to enable it
5. Click **Save Module Settings**

## Method 2: Manual Installation

If the manifest method doesn't work, you can install manually.

### Step 1: Download the Module

1. Go to the [Releases page](https://github.com/dmberlin/cyberpunk-agent/releases)
2. Download the latest `cyberpunk-agent.zip` file

### Step 2: Extract to Modules Folder

1. Locate your FoundryVTT user data folder:
   - **Windows**: `%LOCALAPPDATA%\FoundryVTT\Data\modules\`
   - **macOS**: `~/Library/Application Support/FoundryVTT/Data/modules/`
   - **Linux**: `~/.local/share/FoundryVTT/Data/modules/`

2. Create a folder called `cyberpunk-agent` in the modules directory
3. Extract the contents of `cyberpunk-agent.zip` into this folder
4. The final path should be: `[FoundryVTT Data]/modules/cyberpunk-agent/module.json`

### Step 3: Restart and Enable

1. Restart FoundryVTT completely
2. Follow **Step 3** from Method 1 above

## Prerequisites

Before installing Cyberpunk Agent, make sure you have:

### Required
- **FoundryVTT v11** or higher
- **SocketLib module** - [Install from here](https://foundryvtt.com/packages/socketlib)

### Recommended
- **Cyberpunk RED Core system** - The module is designed for this system

## Installing SocketLib

Cyberpunk Agent requires SocketLib to function. Install it first:

1. In FoundryVTT Setup, go to **Add-on Modules**
2. Click **Install Module**
3. Search for "SocketLib" or use this manifest URL:
   ```
   https://github.com/manuelVo/foundryvtt-socketlib/releases/latest/download/module.json
   ```
4. Install and enable SocketLib in your world settings

## Verification

After installation, verify everything works:

### Check Module is Loaded
1. In your world, go to **Settings** → **Manage Modules**
2. Confirm both **SocketLib** and **Cyberpunk Agent** are enabled

### Test Basic Functionality
1. Select a token with an equipped Agent item
2. Look for the phone icon (📱) in the token controls
3. Click it to open the Agent interface

## Troubleshooting

### Module Not Appearing

**Problem**: Module doesn't appear in the modules list

**Solutions**:
- Verify the manifest URL is correct
- Check your internet connection
- Try the manual installation method
- Restart FoundryVTT completely

### Installation Failed

**Problem**: "Installation failed" error message

**Solutions**:
- Check the FoundryVTT console (F12) for detailed errors
- Verify you have the latest FoundryVTT version (v11+)
- Try installing SocketLib first
- Clear browser cache and try again

### Phone Icon Not Appearing

**Problem**: Can't see the phone icon in token controls

**Solutions**:
- Ensure your character has an "Agent" item equipped
- Check that both SocketLib and Cyberpunk Agent are enabled
- Refresh the page (F5)
- Check browser console for JavaScript errors

### Permission Errors

**Problem**: "Permission denied" or similar errors

**Solutions**:
- Ensure you're the GM or have appropriate permissions
- Check that the world is using the Cyberpunk RED system
- Verify SocketLib is working properly

## Updates

### Automatic Updates
If you installed via manifest URL, FoundryVTT will automatically notify you of updates. Simply click "Update" when prompted.

### Manual Updates
If you installed manually:
1. Download the latest release
2. Replace the files in your `modules/cyberpunk-agent/` folder
3. Restart FoundryVTT

## Uninstalling

To remove the module:

### Via FoundryVTT
1. Go to **Settings** → **Manage Modules**
2. Uncheck **Cyberpunk Agent**
3. Click **Save Module Settings**

### Complete Removal
To completely remove all files:
1. Disable the module first (above)
2. Delete the `modules/cyberpunk-agent/` folder
3. Restart FoundryVTT

## Support

If you encounter issues:

1. Check this troubleshooting section first
2. Look at the [GitHub Issues](https://github.com/dmberlin/cyberpunk-agent/issues)
3. Create a new issue with:
   - FoundryVTT version
   - Browser and version
   - Steps to reproduce the problem
   - Any console errors (F12 → Console)

## Version Compatibility

| Cyberpunk Agent | FoundryVTT | Cyberpunk RED System |
|----------------|------------|---------------------|
| 2.x.x          | v11+       | 0.88.0+            |
| 1.x.x          | v10-v11    | 0.88.0+            |

Always use the latest versions for the best experience.
