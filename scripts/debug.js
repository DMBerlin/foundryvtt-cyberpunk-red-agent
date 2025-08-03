/**
 * Debug utilities for Cyberpunk Agent
 */

console.log("Cyberpunk Agent | Loading debug.js...");

/**
 * Debug function to check module status
 */
function debugCyberpunkAgent() {
  console.log("=== Cyberpunk Agent Debug Report ===");

  // Check if module is loaded
  const module = game.modules.get('cyberpunk-agent');
  console.log("Module loaded:", !!module);
  console.log("Module active:", module?.active);

  // Check global classes
  console.log("AgentHomeApplication:", typeof (typeof AgentHomeApplication !== 'undefined' ? AgentHomeApplication : 'undefined'));
  console.log("Window AgentHomeApplication:", typeof (typeof window.AgentHomeApplication !== 'undefined' ? window.AgentHomeApplication : 'undefined'));
  console.log("Chat7Application:", typeof (typeof Chat7Application !== 'undefined' ? Chat7Application : 'undefined'));
  console.log("Window Chat7Application:", typeof (typeof window.Chat7Application !== 'undefined' ? window.Chat7Application : 'undefined'));


  // Check CyberpunkAgent instance
  console.log("CyberpunkAgent class:", typeof (typeof CyberpunkAgent !== 'undefined' ? CyberpunkAgent : 'undefined'));
  console.log("CyberpunkAgent instance:", !!(typeof CyberpunkAgent !== 'undefined' && CyberpunkAgent && CyberpunkAgent.instance));
  console.log("Window CyberpunkAgent:", typeof (typeof window.CyberpunkAgent !== 'undefined' ? window.CyberpunkAgent : 'undefined'));

  // Check settings
  try {
    const agentData = game.settings.get('cyberpunk-agent', 'agent-data');
    console.log("Agent data setting:", agentData);
  } catch (error) {
    console.error("Error getting settings:", error);
  }

  // Check user permissions
  console.log("User is GM:", game.user.isGM);
  console.log("User ID:", game.user.id);

  // Check available actors
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  console.log("Character actors available:", characterActors.length);
  characterActors.forEach(actor => {
    console.log(`  - ${actor.name} (${actor.id})`);
  });

  console.log("=== End Debug Report ===");
}

/**
 * Test function to create AgentHomeApplication
 */
function testAgentHome() {
  console.log("=== Testing AgentHomeApplication ===");

  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length === 0) {
    console.error("No character actors found!");
    return;
  }

  const testActor = characterActors[0];
  console.log("Testing with actor:", testActor.name);

  try {
    const AgentClass = (typeof AgentHomeApplication !== 'undefined' ? AgentHomeApplication : null) ||
      (typeof window.AgentHomeApplication !== 'undefined' ? window.AgentHomeApplication : null);
    if (typeof AgentClass === 'undefined' || AgentClass === null) {
      console.error("AgentHomeApplication not available!");
      return;
    }

    console.log("Creating AgentHomeApplication instance...");
    const agentHome = new AgentClass(testActor);
    console.log("Instance created successfully!");

    console.log("Rendering application...");
    agentHome.render(true);
    console.log("Application rendered!");

  } catch (error) {
    console.error("Error testing AgentHomeApplication:", error);
  }

  console.log("=== End Test ===");
}



// Make functions globally available
window.debugCyberpunkAgent = debugCyberpunkAgent;
window.testAgentHome = testAgentHome;

console.log("Cyberpunk Agent | debug.js loaded successfully");
console.log("Debug functions available: debugCyberpunkAgent(), testAgentHome()");
console.log("Note: Use checkModuleStatus() for automatic status checking");
console.log("Note: Use debugCyberpunkAgent() manually when needed"); 