/**
 * Class Checker for Cyberpunk Agent
 * Simple verification that classes are being loaded
 */

console.log("Cyberpunk Agent | Loading class-checker.js...");

/**
 * Check if classes are loaded
 */
function checkClassesLoaded() {
  console.log("=== Cyberpunk Agent Class Checker ===");

  const classes = {
    'AgentHomeApplication': {
      global: typeof AgentHomeApplication !== 'undefined',
      window: typeof window.AgentHomeApplication !== 'undefined'
    },
    'Chat7Application': {
      global: typeof Chat7Application !== 'undefined',
      window: typeof window.Chat7Application !== 'undefined'
    },

    'CyberpunkAgent': {
      global: typeof CyberpunkAgent !== 'undefined',
      window: typeof window.CyberpunkAgent !== 'undefined'
    }
  };

  Object.entries(classes).forEach(([className, status]) => {
    const available = status.global || status.window;
    console.log(`${available ? '✓' : '✗'} ${className}:`);
    console.log(`  - Global: ${status.global ? 'Yes' : 'No'}`);
    console.log(`  - Window: ${status.window ? 'Yes' : 'No'}`);
  });

  console.log("=== Class Check Complete ===");
}

// Make function globally available
window.checkClassesLoaded = checkClassesLoaded;

console.log("Cyberpunk Agent | class-checker.js loaded successfully");
console.log("Class checker function available: checkClassesLoaded()");

// Simple check after a delay
Hooks.once('ready', () => {
  console.log("Cyberpunk Agent | Running class check...");
  setTimeout(() => {
    checkClassesLoaded();
  }, 1000);
}); 