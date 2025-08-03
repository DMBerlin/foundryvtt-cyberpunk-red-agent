/**
 * Test utilities for Cyberpunk Agent
 */

console.log("Cyberpunk Agent | Loading test.js...");

/**
 * Run all tests
 */
function runAllTests() {
  console.log("=== Running All Tests ===");

  testModuleLoading();
  testClassAvailability();
  testSettings();
  testActorAccess();
  testNotificationSound();

  console.log("=== All Tests Complete ===");
}

/**
 * Test module loading
 */
function testModuleLoading() {
  console.log("--- Test: Module Loading ---");

  const module = game.modules.get('cyberpunk-agent');
  if (module && module.active) {
    console.log("✓ Module is loaded and active");
  } else {
    console.error("✗ Module is not loaded or not active");
  }
}

/**
 * Test class availability
 */
function testClassAvailability() {
  console.log("--- Test: Class Availability ---");

  // Test AgentHomeApplication
  if (typeof AgentHomeApplication !== 'undefined') {
    console.log("✓ AgentHomeApplication class found");
  } else if (typeof window.AgentHomeApplication !== 'undefined') {
    console.log("✓ AgentHomeApplication class found in window");
  } else {
    console.log("✗ AgentHomeApplication class not found");
  }

  // Test Chat7Application
  if (typeof Chat7Application !== 'undefined') {
    console.log("✓ Chat7Application class found");
  } else if (typeof window.Chat7Application !== 'undefined') {
    console.log("✓ Chat7Application class found in window");
  } else {
    console.log("✗ Chat7Application class not found");
  }



  // Test CyberpunkAgent
  if (typeof CyberpunkAgent !== 'undefined') {
    console.log("✓ CyberpunkAgent class found");
    if (CyberpunkAgent && CyberpunkAgent.instance) {
      console.log("✓ CyberpunkAgent instance exists");
    } else {
      console.log("⚠ CyberpunkAgent instance not found");
    }
  } else {
    console.log("✗ CyberpunkAgent class not found");
  }
}

/**
 * Test settings
 */
function testSettings() {
  console.log("--- Test: Settings ---");

  try {


    const agentData = game.settings.get('cyberpunk-agent', 'agent-data');
    console.log("✓ Agent data setting accessible:", agentData);
  } catch (error) {
    console.error("✗ Error accessing settings:", error);
  }
}

/**
 * Test actor access
 */
function testActorAccess() {
  console.log("--- Test: Actor Access ---");

  const characterActors = game.actors.filter(actor => actor.type === 'character');
  console.log(`✓ Found ${characterActors.length} character actors`);

  if (characterActors.length > 0) {
    const testActor = characterActors[0];
    console.log(`✓ Test actor: ${testActor.name} (${testActor.id})`);

    // Test if we can access actor data
    try {
      const actorData = testActor.toObject();
      console.log("✓ Actor data accessible");
    } catch (error) {
      console.error("✗ Error accessing actor data:", error);
    }
  }
}

/**
 * Test creating AgentHomeApplication
 */
function testCreateAgentHome() {
  console.log("--- Test: Creating AgentHomeApplication ---");

  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length === 0) {
    console.error("✗ No character actors available for testing");
    return;
  }

  const testActor = characterActors[0];
  console.log(`Testing with actor: ${testActor.name}`);

  try {
    const AgentClass = (typeof AgentHomeApplication !== 'undefined' ? AgentHomeApplication : null) ||
      (typeof window.AgentHomeApplication !== 'undefined' ? window.AgentHomeApplication : null);
    if (typeof AgentClass === 'undefined' || AgentClass === null) {
      console.error("✗ AgentHomeApplication class not available");
      return;
    }

    console.log("✓ AgentHomeApplication class available");
    const agentHome = new AgentClass(testActor);
    console.log("✓ AgentHomeApplication instance created");

    // Test rendering
    agentHome.render(true);
    console.log("✓ AgentHomeApplication rendered successfully");

  } catch (error) {
    console.error("✗ Error creating AgentHomeApplication:", error);
  }
}



// Make functions globally available
window.runAllTests = runAllTests;
window.testModuleLoading = testModuleLoading;
window.testClassAvailability = testClassAvailability;
window.testSettings = testSettings;
window.testActorAccess = testActorAccess;
window.testCreateAgentHome = testCreateAgentHome;

window.testNotificationSound = testNotificationSound;

console.log("Cyberpunk Agent | test.js loaded successfully");
console.log("Test functions available:");
console.log("- runAllTests()");
console.log("- testModuleLoading()");
console.log("- testClassAvailability()");
console.log("- testSettings()");
console.log("- testActorAccess()");
console.log("- testCreateAgentHome()");

console.log("- testNotificationSound()");
console.log("Note: Use checkModuleStatus() for automatic status checking");
console.log("Note: Use runAllTests() manually when needed"); 