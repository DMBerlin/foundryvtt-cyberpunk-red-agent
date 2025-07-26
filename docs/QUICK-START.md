# Quick Start Guide - Cyberpunk Agent

**Your Development Environment:**
- **Project Path:** `C:\Users\danie\Documents\.code\Projects\Personal\foundryvtt-modules\cyberpunk-agent`
- **FoundryVTT Path:** `C:\Users\danie\AppData\Local\FoundryVTT\V11\Data\modules\cyberpunk-agent`

## 🚀 Setup Development Environment

### Option 1: Automatic Setup (Recommended)

```bash
# Run the setup script
npm run setup
```

This will:
- ✅ Check if FoundryVTT is installed
- ✅ Create symbolic link (if you run as Administrator)
- ✅ Fall back to file copy if symbolic link fails
- ✅ Verify the setup

### Option 2: Manual Symbolic Link

**Run PowerShell as Administrator:**
```powershell
# Navigate to your project
cd "C:\Users\danie\Documents\.code\Projects\Personal\foundryvtt-modules\cyberpunk-agent"

# Create symbolic link
mklink /D "C:\Users\danie\AppData\Local\FoundryVTT\V11\Data\modules\cyberpunk-agent" "C:\Users\danie\Documents\.code\Projects\Personal\foundryvtt-modules\cyberpunk-agent"
```

### Option 3: Manual File Copy

```bash
# Copy files to FoundryVTT
npm run dev:copy
```

## 🎮 Test the Module

### 1. Start FoundryVTT
- Launch FoundryVTT
- Create or open a world with Cyberpunk RED system

### 2. Enable Developer Mode
- Go to **Settings** → **Configure Settings** → **System**
- Enable **"Developer Mode"**
- Save settings

### 3. Enable Module
- Go to **Add-on Modules**
- Find **"Cyberpunk Agent"**
- Check the box to enable it
- Click **"Save Module Settings"**

### 4. Check Console
- Press **F12** to open browser console
- Look for these messages:
  ```
  Cyberpunk Agent | Initializing module...
  Cyberpunk Agent | Module loaded successfully!
  Cyberpunk Agent | Cyberpunk RED system detected!
  ```

## 🔧 Development Workflow

### If using Symbolic Link (Option 1 & 2):
1. **Make changes** to your code
2. **Refresh browser** (F5 or Ctrl+R)
3. **Check console** for errors
4. **Test functionality**

### If using File Copy (Option 3):
1. **Make changes** to your code
2. **Copy files:** `npm run dev:copy`
3. **Refresh browser** (F5 or Ctrl+R)
4. **Check console** for errors
5. **Test functionality**

## 🐛 Debug Commands

Once the module is loaded, use these in the browser console (F12):

```javascript
// Check module status
CyberpunkAgentDebug.checkModuleStatus()

// Run all tests
CyberpunkAgentDebug.runTests()

// Get module information
CyberpunkAgentDebug.getModuleInfo()

// Enable/disable debug mode
CyberpunkAgentDebug.setDebugMode(true)
```

## ⚡ Quick Commands

```bash
# Setup development environment
npm run setup

# Copy files to FoundryVTT
npm run dev:copy

# Watch for changes (requires nodemon)
npm run dev:watch

# Run tests
npm run test

# Package for distribution
npm run package
```

## 🚨 Troubleshooting

### Symbolic Link Failed
- **Solution:** Run PowerShell as Administrator
- **Alternative:** Use `npm run dev:copy` instead

### Module Not Loading
- Check if FoundryVTT is running
- Verify Developer Mode is enabled
- Check browser console for errors
- Run `CyberpunkAgentDebug.checkModuleStatus()`

### Files Not Updating
- Clear browser cache (Ctrl+Shift+R)
- Check if symbolic link is working
- Use `npm run dev:copy` to force copy

### Permission Errors
- Run PowerShell as Administrator
- Check file permissions
- Ensure FoundryVTT is not running during setup

## 📁 File Structure

```
cyberpunk-agent/
├── module.json          # Module manifest
├── scripts/
│   ├── module.js        # Main module code
│   ├── debug.js         # Debug utilities
│   └── setup-dev.js     # Setup script
├── styles/
│   └── module.css       # Module styles
├── lang/
│   ├── en.json          # English translations
│   └── pt-BR.json       # Portuguese translations
└── assets/              # Static resources
```

## 🎯 Next Steps

1. **Test the basic setup** - Make sure module loads
2. **Add your features** - Start developing
3. **Use debug tools** - Monitor performance and errors
4. **Test thoroughly** - Check different scenarios
5. **Package when ready** - Use `npm run package`

## 📞 Need Help?

1. Check the browser console (F12)
2. Run `CyberpunkAgentDebug.runTests()`
3. Check the main documentation
4. Open an issue on GitHub

---

**Happy coding! 🎉** 