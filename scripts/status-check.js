/**
 * Status Check for Cyberpunk Agent
 * Simple status checking without causing errors
 */

console.log("Cyberpunk Agent | Loading status-check.js...");

/**
 * Safe status check function
 */
function checkModuleStatus() {
  console.log("=== Cyberpunk Agent Status Check ===");

  // Check module loading
  const module = game.modules.get('cyberpunk-agent');
  if (module && module.active) {
    console.log("✓ Module is loaded and active");
  } else {
    console.log("✗ Module is not loaded or not active");
  }

  // Check classes safely
  const classes = {
    'AgentHomeApplication': typeof AgentHomeApplication !== 'undefined' || typeof window.AgentHomeApplication !== 'undefined',
    'Chat7Application': typeof Chat7Application !== 'undefined' || typeof window.Chat7Application !== 'undefined',
    'ContactManagerApplication': typeof ContactManagerApplication !== 'undefined' || typeof window.ContactManagerApplication !== 'undefined',
    'CyberpunkAgent': typeof CyberpunkAgent !== 'undefined' || typeof window.CyberpunkAgent !== 'undefined'
  };

  Object.entries(classes).forEach(([className, available]) => {
    console.log(`${available ? '✓' : '✗'} ${className}: ${available ? 'Available' : 'Not Available'}`);
  });

  // Check settings
  try {
    const contactNetworks = game.settings.get('cyberpunk-agent', 'contact-networks');
    const agentData = game.settings.get('cyberpunk-agent', 'agent-data');
    console.log("✓ Settings accessible");
  } catch (error) {
    console.log("✗ Settings not accessible");
  }

  // Check user permissions
  console.log(`User: ${game.user.name} (${game.user.role})`);
  console.log(`Is GM: ${game.user.isGM}`);

  // Check actors
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  console.log(`Character actors: ${characterActors.length}`);

  console.log("=== Status Check Complete ===");
}

// Make function globally available
window.checkModuleStatus = checkModuleStatus;

console.log("Cyberpunk Agent | status-check.js loaded successfully");
console.log("Status check function available: checkModuleStatus()");

// Auto-run status check on ready (simple, no loops)
Hooks.once('ready', () => {
    console.log("Cyberpunk Agent | Running status check...");
    setTimeout(() => {
        checkModuleStatus();
    }, 2000);
}); 