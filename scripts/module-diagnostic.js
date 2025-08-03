/**
 * Module Diagnostic Script
 * Run this in the FoundryVTT console to check if the module is loading properly
 */

console.log('=== Cyberpunk Agent Module Diagnostic ===');

// Check 1: Module registration
console.log('\n=== Check 1: Module Registration ===');
const moduleData = game.modules.get('cyberpunk-agent');
if (moduleData) {
  console.log('✅ Module found in game.modules');
  console.log('  - Name:', moduleData.name);
  console.log('  - Active:', moduleData.active);
  console.log('  - Enabled:', moduleData.enabled);
  console.log('  - Version:', moduleData.version);
} else {
  console.error('❌ Module not found in game.modules');
  console.log('Available modules:', Array.from(game.modules.keys()).filter(key => key.includes('cyberpunk')));
}

// Check 2: Global objects
console.log('\n=== Check 2: Global Objects ===');
if (window.CyberpunkAgent) {
  console.log('✅ window.CyberpunkAgent exists');
  console.log('  - Type:', typeof window.CyberpunkAgent);
  console.log('  - Instance:', !!window.CyberpunkAgent.instance);
} else {
  console.error('❌ window.CyberpunkAgent not found');
}

if (window.cyberpunkAgent) {
  console.log('✅ window.cyberpunkAgent exists');
  console.log('  - Type:', typeof window.cyberpunkAgent);
} else {
  console.error('❌ window.cyberpunkAgent not found');
}

// Check 3: Settings registration
console.log('\n=== Check 3: Settings Registration ===');
const settings = game.settings.settings;
const cyberpunkSettings = Object.keys(settings).filter(key => key.startsWith('cyberpunk-agent'));
console.log('Cyberpunk Agent settings found:', cyberpunkSettings.length);
cyberpunkSettings.forEach(setting => {
  console.log(`  - ${setting}: ${settings[setting].name}`);
});

// Check 4: Hooks registration
console.log('\n=== Check 4: Hooks Registration ===');
if (Hooks.events) {
  const hookEvents = Object.keys(Hooks.events);
  const cyberpunkHooks = hookEvents.filter(event =>
    Hooks.events[event] &&
    Hooks.events[event].some(hook =>
      hook.fn && hook.fn.toString().includes('CyberpunkAgent')
    )
  );
  console.log('Cyberpunk Agent hooks found:', cyberpunkHooks.length);
  cyberpunkHooks.forEach(hook => {
    console.log(`  - ${hook}`);
  });
} else {
  console.log('⚠️ Hooks.events not available');
}

// Check 5: Console errors
console.log('\n=== Check 5: Recent Console Errors ===');
console.log('Check the browser console for any JavaScript errors related to cyberpunk-agent');

// Check 6: Module files
console.log('\n=== Check 6: Module Files ===');
console.log('Check if these files exist in the module directory:');
console.log('  - scripts/module.js');
console.log('  - scripts/socketlib-integration.js');
console.log('  - module.json');

// Check 7: Force module reload
console.log('\n=== Check 7: Force Module Reload ===');
console.log('To force reload the module, try:');
console.log('1. Disable the module in Module Management');
console.log('2. Enable the module again');
console.log('3. Refresh the page');

// Check 8: Test basic functionality
console.log('\n=== Check 8: Test Basic Functionality ===');
if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
  console.log('✅ Testing basic functionality...');

  // Test device discovery
  try {
    window.CyberpunkAgent.instance.discoverAndCreateDevices().then(() => {
      console.log('✅ Device discovery working');
      console.log('  - Devices found:', window.CyberpunkAgent.instance.devices?.size || 0);
    }).catch(error => {
      console.error('❌ Device discovery failed:', error);
    });
  } catch (error) {
    console.error('❌ Device discovery error:', error);
  }
} else {
  console.log('⚠️ Cannot test functionality - instance not available');
}

console.log('\n=== Diagnostic Complete ===');
console.log('If you see errors above, the module may not be loading properly.');
console.log('Check the browser console (F12) for JavaScript errors.'); 