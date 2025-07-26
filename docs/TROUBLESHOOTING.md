# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "AgentHomeApplication is not defined" Error

**Symptoms:**
- Console shows: `AgentHomeApplication is not defined!`
- Error message: "Erro ao carregar a interface do Agent. Tente recarregar a página (F5)."
- Agent interface fails to open

**Root Cause:**
This error occurs when the JavaScript classes are not properly loaded or accessible when the module tries to use them.

**Solutions:**

#### 1. **Immediate Fix - Reload the Page**
1. Press `F5` to reload the FoundryVTT page
2. Wait for the page to fully load
3. Try using the Agent again

#### 2. **Check Module Loading Order**
1. Open the browser console (F12)
2. Look for these messages:
   ```
   Cyberpunk Agent | Loading agent-home.js...
   Cyberpunk Agent | agent-home.js loaded successfully
   Cyberpunk Agent | Classes made globally available
   ```
3. If these messages are missing, the module files aren't loading properly

#### 3. **Verify Module Configuration**
1. Go to **Game Settings** → **Manage Modules**
2. Ensure "Cyberpunk Agent" is enabled
3. Check that the module version is compatible with your FoundryVTT version

#### 4. **Clear Browser Cache**
1. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to hard refresh
2. Or clear browser cache manually:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Options → Privacy → Clear Data

#### 5. **Check for JavaScript Errors**
1. Open browser console (F12)
2. Look for any red error messages
3. If you see errors, try disabling other modules temporarily

#### 6. **Debug the Issue**
Run these commands in the browser console:

```javascript
// Check if classes are available
console.log("AgentHomeApplication:", typeof AgentHomeApplication);
console.log("Window AgentHomeApplication:", typeof window.AgentHomeApplication);

// Run automated tests
runAllTests();

// Test creating the application manually
testCreateAgentHome();
```

#### 7. **Manual Class Check**
If the classes aren't available, try:

```javascript
// Check what's available globally
Object.keys(window).filter(key => key.includes('Agent'));

// Check module status
const module = game.modules.get('cyberpunk-agent');
console.log("Module:", module);
console.log("Module active:", module?.active);
```

### Issue: Module Not Loading Properly

**Symptoms:**
- No "Cyberpunk Agent" button in token controls
- No console messages from the module
- Module appears in settings but doesn't work

**Solutions:**

#### 1. **Check FoundryVTT Version**
- Ensure you're using FoundryVTT v11
- The module is designed for v11 compatibility

#### 2. **Check System Compatibility**
- The module works best with Cyberpunk RED system
- Other systems may work but with limited functionality

#### 3. **Module Dependencies**
- Ensure all required files are present in the module folder
- Check that `module.json` includes all necessary scripts

### Issue: Contact Manager Not Working

**Symptoms:**
- Contact Manager button doesn't appear for GMs
- Can't add/remove contacts
- Contact networks not saving

**Solutions:**

#### 1. **GM Permissions**
- Ensure you're logged in as a Game Master
- Check that you have GM permissions in the world

#### 2. **Settings Access**
- Go to **Game Settings** → **Configure Settings**
- Look for "Cyberpunk Agent" section
- Verify settings are accessible

#### 3. **Test Contact Manager**
```javascript
// Test contact manager manually
testCreateContactManager();
```

### Issue: Performance Problems

**Symptoms:**
- Slow loading times
- Interface lag
- Browser becomes unresponsive

**Solutions:**

#### 1. **Reduce Actor Count**
- The module loads data for all character actors
- Consider reducing the number of actors if you have many

#### 2. **Disable Other Modules**
- Temporarily disable other modules to identify conflicts
- Re-enable them one by one to find the problematic module

#### 3. **Browser Performance**
- Close other browser tabs
- Restart the browser
- Try a different browser

### Issue: Visual/UI Problems

**Symptoms:**
- Interface looks broken
- CSS not loading properly
- Buttons not styled correctly

**Solutions:**

#### 1. **CSS Loading**
- Check if the CSS file is loading
- Look for `module.css` in browser network tab

#### 2. **Theme Conflicts**
- Try switching to a different FoundryVTT theme
- Some themes may conflict with the module's styling

#### 3. **Browser Compatibility**
- Ensure you're using a modern browser
- Try Chrome, Firefox, or Edge

## Debugging Commands

### Available Debug Functions

After the module loads, these functions are available in the browser console:

```javascript
// Simple status check (recommended)
checkModuleStatus();

// Run all diagnostic tests
runAllTests();

// Check module status
debugCyberpunkAgent();

// Test specific components
testAgentHome();
testContactManager();
testModuleLoading();
testClassAvailability();
testSettings();
testActorAccess();
```

### Manual Testing

```javascript
// Test creating AgentHomeApplication manually
const characterActors = game.actors.filter(actor => actor.type === 'character');
if (characterActors.length > 0) {
    const testActor = characterActors[0];
    const AgentClass = AgentHomeApplication || window.AgentHomeApplication;
    if (typeof AgentClass !== 'undefined') {
        const agentHome = new AgentClass(testActor);
        agentHome.render(true);
    }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the Console**: Look for error messages in the browser console
2. **Run Debug Commands**: Use the debug functions listed above
3. **Document the Issue**: Note down the exact error messages and steps to reproduce
4. **Check Module Version**: Ensure you're using the latest version
5. **Report the Issue**: Include console output and error messages when reporting

## Prevention Tips

1. **Regular Updates**: Keep FoundryVTT and the module updated
2. **Backup Worlds**: Always backup your world before testing new modules
3. **Test Environment**: Test new modules in a separate world first
4. **Module Conflicts**: Be aware of potential conflicts with other modules
5. **Browser Maintenance**: Keep your browser updated and clear cache regularly 