# Development Guide - Cyberpunk Agent

This document contains information for developers who want to contribute or extend the module.

## Project Structure

```
cyberpunk-agent/
├── module.json          # Module manifest (required)
├── README.md            # Main documentation
├── LICENSE              # Project license
├── CHANGELOG.md         # Change history
├── package.json         # Node.js configuration
├── .gitignore           # Git ignored files
├── scripts/             # JavaScript code
│   └── module.js        # Main module file
├── styles/              # CSS files
│   └── module.css       # Module styles
├── lang/                # Localization files
│   ├── en.json          # English
│   └── pt-BR.json       # Brazilian Portuguese
└── assets/              # Static resources
    └── README.md        # Assets documentation
```

## Requirements

- **FoundryVTT**: Version 11+
- **System**: Cyberpunk RED 0.88+
- **Node.js**: 16.0.0+ (for development)

## Testing During Development

### Method 1: Direct Development (Recommended)

This is the most efficient method for active development:

1. **Setup Development Environment**:
   ```bash
   # Create a symbolic link to your FoundryVTT modules folder
   # Windows (Run as Administrator):
   mklink /D "C:\Users\[YourUser]\AppData\Local\FoundryVTT\Data\modules\cyberpunk-agent" "C:\path\to\your\cyberpunk-agent"
   
   # macOS/Linux:
   ln -s /path/to/your/cyberpunk-agent /path/to/FoundryVTT/Data/modules/cyberpunk-agent
   ```

2. **Enable Developer Mode**:
   - In FoundryVTT, go to Settings → Configure Settings → System
   - Enable "Developer Mode"

3. **Real-time Testing**:
   - Make changes to your code
   - Press `F5` or `Ctrl+R` to refresh the browser
   - Check the browser console (F12) for logs and errors
   - The module will reload automatically

### Method 2: Manual Copy (Alternative)

If symbolic links don't work for you:

1. **Copy to FoundryVTT**:
   ```bash
   # Copy your module to FoundryVTT modules folder
   cp -r ./cyberpunk-agent /path/to/FoundryVTT/Data/modules/
   ```

2. **Development Workflow**:
   - Make changes in your development folder
   - Copy updated files to FoundryVTT folder
   - Refresh browser to test

### Method 3: Using npm scripts (Advanced)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev:copy": "xcopy .\\* \"C:\\Users\\%USERNAME%\\AppData\\Local\\FoundryVTT\\Data\\modules\\cyberpunk-agent\\\" /E /Y",
    "dev:watch": "nodemon --watch scripts --watch styles --watch lang --exec \"npm run dev:copy\"",
    "test": "npm run dev:copy && echo 'Files copied to FoundryVTT. Please refresh your browser.'"
  }
}
```

Then use:
```bash
npm run dev:copy    # Copy files once
npm run dev:watch   # Auto-copy on file changes (requires nodemon)
```

## Debugging Tips

### 1. Console Logging
```javascript
// In your module.js
console.log("Cyberpunk Agent | Debug message");
console.warn("Cyberpunk Agent | Warning message");
console.error("Cyberpunk Agent | Error message");
```

### 2. Browser Developer Tools
- **F12** → Console: See logs and errors
- **F12** → Network: Check if files are loading
- **F12** → Sources: Set breakpoints in your code

### 3. FoundryVTT Debug Mode
```javascript
// Enable detailed logging
CONFIG.debug.hooks = true;
CONFIG.debug.packages = true;
```

### 4. Module-specific Debugging
```javascript
// Add this to your module.js for detailed debugging
const DEBUG = true;

function debugLog(message, data = null) {
    if (DEBUG) {
        console.log(`Cyberpunk Agent | ${message}`, data);
    }
}
```

## Testing Checklist

### Before Testing:
- [ ] FoundryVTT is running
- [ ] Developer mode is enabled
- [ ] Module is enabled in Add-on Modules
- [ ] Cyberpunk RED system is active
- [ ] Browser console is open (F12)

### During Testing:
- [ ] Check console for errors
- [ ] Verify module initialization logs
- [ ] Test all new features
- [ ] Check CSS styling
- [ ] Test with different user roles (GM, Player)
- [ ] Verify localization works

### After Testing:
- [ ] Fix any errors found
- [ ] Update documentation if needed
- [ ] Commit your changes
- [ ] Test again after fixes

## Common Issues and Solutions

### Module Not Loading:
1. Check `module.json` syntax
2. Verify file paths in `module.json`
3. Check browser console for errors
4. Ensure FoundryVTT version compatibility

### CSS Not Applying:
1. Check file path in `module.json`
2. Verify CSS syntax
3. Check browser console for 404 errors
4. Clear browser cache

### JavaScript Errors:
1. Check browser console
2. Verify JavaScript syntax
3. Check for missing dependencies
4. Ensure hooks are properly registered

## Performance Testing

### Memory Usage:
```javascript
// Monitor memory usage
console.log("Memory usage:", performance.memory);
```

### Load Time:
```javascript
// Measure module load time
const startTime = performance.now();
// Your initialization code
const loadTime = performance.now() - startTime;
console.log(`Module loaded in ${loadTime}ms`);
```

## Automated Testing (Future Enhancement)

Consider adding automated tests:

```javascript
// Example test structure
class ModuleTests {
    static runTests() {
        console.log("Running module tests...");
        
        // Test module initialization
        this.testInitialization();
        
        // Test feature functionality
        this.testFeatures();
        
        console.log("Tests completed!");
    }
    
    static testInitialization() {
        // Test initialization logic
    }
    
    static testFeatures() {
        // Test specific features
    }
}
```

## Local Development

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/dmberlin/cyberpunk-agent.git
cd cyberpunk-agent

# Install dependencies (if any)
npm install
```

### 2. Development

1. Copy the module folder to `[FoundryVTT]/modules/cyberpunk-agent/`
2. Enable the module in FoundryVTT
3. Use the browser console (F12) to see debug logs
4. Make your changes
5. Reload FoundryVTT to test

### 3. Packaging

```bash
# Create ZIP file for distribution
npm run package

# Clean temporary files
npm run clean
```

## FoundryVTT Hooks

The module uses the following hooks:

- `init`: Module initialization
- `ready`: When FoundryVTT is ready
- `cyberpunkred.ready`: When the Cyberpunk RED system is ready
- `userJoined`: When a user joins the session
- `disableModule`: When the module is disabled

## Cyberpunk RED Integration

To integrate with the Cyberpunk RED system, use:

```javascript
// Check if the system is active
if (game.system.id === 'cyberpunkred') {
    // Your code here
}

// Cyberpunk RED specific hook
Hooks.on('cyberpunkred.ready', () => {
    // Code executed when the system is ready
});
```

## Localization

To add support for new languages:

1. Create a file `lang/[language-code].json`
2. Add the language in `module.json`
3. Use `game.i18n.localize()` to translate strings

## CSS Styles

- Use the `.cyberpunk-agent` class as a prefix to avoid conflicts
- Maintain compatibility with FoundryVTT themes
- Use CSS variables when possible

## Best Practices

1. **Logs**: Use `console.log()` with module prefix
2. **Errors**: Handle errors appropriately
3. **Performance**: Avoid infinite loops and memory leaks
4. **Compatibility**: Test on different versions
5. **Documentation**: Comment your code

## Testing

To test the module:

1. Enable developer mode in FoundryVTT
2. Use the browser console for debugging
3. Test on different browsers
4. Check compatibility with other modules

## Distribution

1. Update the version in `module.json`
2. Update `CHANGELOG.md`
3. Create a release on GitHub
4. Update URLs in `module.json`

## Support

For questions or issues:

1. Check the documentation
2. Consult console logs
3. Open an issue on GitHub
4. Contact the maintainer 