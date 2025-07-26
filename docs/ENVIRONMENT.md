# Environment Configuration Guide

This guide explains how to manage environment variables and paths for the Cyberpunk Agent module development.

## 📁 Configuration Files

### 1. `env.config.js` - Main Environment Configuration
This is the primary configuration file that contains all paths and settings.

```javascript
const envConfig = {
    // FoundryVTT Paths
    foundry: {
        username: 'danie',
        basePath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT',
        version: 'V11',
        modulesPath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules',
        modulePath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules\\cyberpunk-agent'
    },
    
    // Project Paths
    project: {
        root: 'C:\\Users\\danie\\Documents\\.code\\Projects\\Personal\\foundryvtt-modules\\cyberpunk-agent',
        name: 'cyberpunk-agent'
    }
};
```

### 2. `dev-config.json` - Development Settings
Contains development-specific configurations.

### 3. `scripts/generate-npm-scripts.js` - Dynamic Script Generator
Automatically generates npm scripts based on environment configuration.

## 🔧 How to Update Paths

### Method 1: Edit `env.config.js` (Recommended)

1. **Open** `env.config.js`
2. **Update** the paths you need to change
3. **Run** the script generator:
   ```bash
   npm run generate-scripts
   ```
4. **Test** the setup:
   ```bash
   npm run setup
   ```

### Method 2: Use the Generator Script

```bash
# Show current configuration
node scripts/generate-npm-scripts.js

# This will:
# - Display current paths
# - Generate symbolic link command
# - Update package.json scripts
```

## 📋 Common Path Updates

### Change FoundryVTT Version
```javascript
// In env.config.js
foundry: {
    version: 'V12', // Change from V11 to V12
    modulesPath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V12\\Data\\modules',
    modulePath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V12\\Data\\modules\\cyberpunk-agent'
}
```

### Change Username
```javascript
// In env.config.js
foundry: {
    username: 'newusername',
    basePath: 'C:\\Users\\newusername\\AppData\\Local\\FoundryVTT',
    // Update other paths accordingly
}
```

### Change Project Location
```javascript
// In env.config.js
project: {
    root: 'C:\\NewPath\\To\\Your\\Project',
    name: 'cyberpunk-agent'
}
```

## 🚀 Quick Update Commands

### Update All Scripts
```bash
npm run generate-scripts
```

### Setup with New Configuration
```bash
npm run setup
```

### Show Current Configuration
```bash
node scripts/generate-npm-scripts.js
```

## 📁 File Structure

```
cyberpunk-agent/
├── env.config.js                    # Main environment configuration
├── dev-config.json                  # Development settings
├── scripts/
│   ├── setup-dev.js                 # Setup script (uses env.config.js)
│   └── generate-npm-scripts.js      # Script generator
├── package.json                     # NPM scripts (auto-generated)
└── QUICK-START.md                   # Quick start guide
```

## 🔄 Workflow for Path Changes

1. **Edit** `env.config.js` with new paths
2. **Generate** new npm scripts: `npm run generate-scripts`
3. **Test** the setup: `npm run setup`
4. **Verify** everything works
5. **Commit** your changes

## 🛠️ Troubleshooting

### Path Not Found
- Check if the path exists in `env.config.js`
- Verify the path is correct for your system
- Run `npm run generate-scripts` to update scripts

### Scripts Not Working
- Run `npm run generate-scripts` to regenerate scripts
- Check if paths in `env.config.js` are correct
- Verify FoundryVTT is installed in the specified location

### Permission Errors
- Run PowerShell as Administrator for symbolic links
- Check file permissions
- Use `npm run dev:copy` as fallback

## 📝 Best Practices

1. **Always use** `env.config.js` as the single source of truth
2. **Run** `npm run generate-scripts` after changing paths
3. **Test** the setup after any changes
4. **Keep** `dev-config.json` in sync with `env.config.js`
5. **Document** any custom paths or configurations

## 🔍 Debugging Configuration

### Check Current Configuration
```bash
node scripts/generate-npm-scripts.js
```

### Verify Paths Exist
```javascript
// In browser console or Node.js
const envConfig = require('./env.config.js');
console.log('Modules Path:', envConfig.getFoundryModulesPath());
console.log('Module Path:', envConfig.getFoundryModulePath());
```

### Test Setup Script
```bash
npm run setup
```

## 📞 Need Help?

1. Check the current configuration: `node scripts/generate-npm-scripts.js`
2. Verify paths exist on your system
3. Run setup script: `npm run setup`
4. Check browser console for errors
5. Open an issue on GitHub

---

**Remember:** Always update `env.config.js` first, then run `npm run generate-scripts` to propagate changes to all scripts! 