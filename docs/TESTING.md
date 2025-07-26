# Quick Testing Guide - Cyberpunk Agent

This is a quick reference for testing the module during development.

## 🚀 Quick Start Testing

### 1. Setup Development Environment

**Option A: Symbolic Link (Recommended)**
```bash
# Windows (Run as Administrator):
mklink /D "%APPDATA%\FoundryVTT\Data\modules\cyberpunk-agent" "C:\path\to\your\cyberpunk-agent"

# macOS/Linux:
ln -s /path/to/your/cyberpunk-agent /path/to/FoundryVTT/Data/modules/cyberpunk-agent
```

**Option B: Manual Copy**
```bash
# Copy files to FoundryVTT
npm run dev:copy
```

### 2. Enable Developer Mode

1. Open FoundryVTT
2. Go to **Settings** → **Configure Settings** → **System**
3. Enable **"Developer Mode"**
4. Save settings

### 3. Enable Module

1. Go to **Add-on Modules**
2. Find **"Cyberpunk Agent"**
3. Check the box to enable it
4. Click **"Save Module Settings"**

### 4. Test Module

1. Open browser console (**F12**)
2. Look for these messages:
   ```
   Cyberpunk Agent | Initializing module...
   Cyberpunk Agent | Module loaded successfully!
   Cyberpunk Agent | Cyberpunk RED system detected!
   ```

## 🔧 Debug Commands

Once the module is loaded, you can use these commands in the browser console:

```javascript
// Check module status
CyberpunkAgentDebug.checkModuleStatus()

// Run all tests
CyberpunkAgentDebug.runTests()

// Get module information
CyberpunkAgentDebug.getModuleInfo()

// Enable/disable debug mode
CyberpunkAgentDebug.setDebugMode(true)

// Measure performance
CyberpunkAgentDebug.measureTime("My Function", () => {
    // Your code here
})

// Check memory usage
CyberpunkAgentDebug.logMemoryUsage()
```

## 📋 Testing Checklist

### Before Each Test Session:
- [ ] FoundryVTT is running
- [ ] Developer mode is enabled
- [ ] Module is enabled
- [ ] Cyberpunk RED system is active
- [ ] Browser console is open (F12)

### During Development:
- [ ] Make changes to your code
- [ ] Refresh browser (F5 or Ctrl+R)
- [ ] Check console for errors
- [ ] Test new functionality
- [ ] Verify CSS changes
- [ ] Test with different user roles

### After Changes:
- [ ] Run `CyberpunkAgentDebug.runTests()`
- [ ] Fix any errors found
- [ ] Test again
- [ ] Commit your changes

## 🐛 Common Issues

### Module Not Loading
```javascript
// Check if module exists
game.modules.get('cyberpunk-agent')
```

### CSS Not Working
```javascript
// Check if CSS is loaded
Array.from(document.styleSheets).find(sheet => 
    sheet.href && sheet.href.includes('cyberpunk-agent')
)
```

### JavaScript Errors
```javascript
// Check for syntax errors
CyberpunkAgentDebug.checkModuleStatus()
```

## ⚡ Quick Commands

### Copy Files to FoundryVTT:
```bash
npm run dev:copy
```

### Watch for Changes (requires nodemon):
```bash
npm run dev:watch
```

### Package for Distribution:
```bash
npm run package
```

### Clean Build Files:
```bash
npm run clean
```

## 🎯 Performance Testing

### Monitor Load Time:
```javascript
const startTime = performance.now();
// Your code here
const loadTime = performance.now() - startTime;
console.log(`Operation took ${loadTime}ms`);
```

### Check Memory Usage:
```javascript
CyberpunkAgentDebug.logMemoryUsage();
```

## 🔍 Advanced Debugging

### Enable FoundryVTT Debug Mode:
```javascript
CONFIG.debug.hooks = true;
CONFIG.debug.packages = true;
```

### Monitor Hooks:
```javascript
Hooks.onAll((hookName, ...args) => {
    console.log(`Hook: ${hookName}`, args);
});
```

### Test Specific Features:
```javascript
// Test localization
game.i18n.localize("CYBERPUNK_AGENT.TITLE")

// Test system integration
game.system.id === 'cyberpunkred'

// Test user permissions
game.user.role
```

## 📝 Development Workflow

1. **Make Changes** → Edit your code
2. **Copy Files** → `npm run dev:copy`
3. **Refresh Browser** → F5 or Ctrl+R
4. **Check Console** → Look for errors
5. **Test Features** → Verify functionality
6. **Debug Issues** → Use debug commands
7. **Fix Problems** → Make corrections
8. **Repeat** → Go back to step 1

## 🎮 Testing Scenarios

### Test as Game Master:
- [ ] Module loads correctly
- [ ] All features work
- [ ] Settings are accessible
- [ ] No console errors

### Test as Player:
- [ ] Module works for players
- [ ] Permissions are correct
- [ ] Features are limited appropriately

### Test with Different Systems:
- [ ] Works with Cyberpunk RED
- [ ] Gracefully handles other systems
- [ ] No conflicts with other modules

## 🚨 Emergency Debug

If something goes wrong:

1. **Disable the module** in Add-on Modules
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Check console** for error messages
4. **Restart FoundryVTT** if needed
5. **Check file permissions** and paths

## 📞 Getting Help

If you encounter issues:

1. Check this testing guide
2. Look at the browser console
3. Run `CyberpunkAgentDebug.runTests()`
4. Check the main documentation
5. Open an issue on GitHub 