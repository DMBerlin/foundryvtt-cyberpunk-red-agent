/**
 * Test script for real-time contact updates
 * This script helps test the real-time update functionality
 */

console.log("Cyberpunk Agent | Loading test-realtime.js...");

/**
 * Test real-time contact updates
 */
function testRealtimeUpdates() {
  console.log("=== Testing Real-time Contact Updates ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check if socket communication is set up
  console.log("Test 1: Checking socket communication...");
  if (game.socket) {
    console.log("✓ Socket communication available");
  } else {
    console.error("✗ Socket communication not available");
  }

  // Test 2: Check if update methods exist
  console.log("Test 2: Checking update methods...");
  if (typeof agent.updateOpenInterfaces === 'function') {
    console.log("✓ updateOpenInterfaces method available");
  } else {
    console.error("✗ updateOpenInterfaces method not available");
  }

  if (typeof agent.notifyContactUpdate === 'function') {
    console.log("✓ notifyContactUpdate method available");
  } else {
    console.error("✗ notifyContactUpdate method not available");
  }

  if (typeof agent.handleContactUpdate === 'function') {
    console.log("✓ handleContactUpdate method available");
  } else {
    console.error("✗ handleContactUpdate method not available");
  }

  // Test 3: Check current open interfaces
  console.log("Test 3: Checking open interfaces...");
  const openInterfaces = agent.getOpenInterfacesCount();
  const hasOpen = agent.hasOpenInterfaces();
  console.log(`Open interfaces: ${openInterfaces} (has open: ${hasOpen})`);

  // Test 4: Simulate contact update (GM only)
  if (game.user.isGM) {
    console.log("Test 4: Simulating contact update notification...");
    try {
      agent.notifyContactUpdate();
      console.log("✓ Contact update notification sent");
    } catch (error) {
      console.error("✗ Error sending contact update notification:", error);
    }
  } else {
    console.log("Test 4: Skipped (not GM)");
  }

  // Test 5: Test interface update
  console.log("Test 5: Testing interface update...");
  try {
    agent.updateOpenInterfaces();
    console.log("✓ Interface update test completed");
  } catch (error) {
    console.error("✗ Error updating interfaces:", error);
  }

  console.log("=== End Test ===");
}

/**
 * Test adding a contact and checking real-time update
 */
function testAddContactRealtime() {
  console.log("=== Testing Add Contact Real-time ===");

  if (!game.user.isGM) {
    console.log("Skipped: Only GM can add contacts");
    return;
  }

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get first character actor
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length === 0) {
    console.error("No character actors found!");
    return;
  }

  const testActor = characterActors[0];
  console.log("Testing with actor:", testActor.name);

  // Get current contacts
  const currentContacts = agent.getContactsForActor(testActor.id);
  console.log("Current contacts:", currentContacts.length);

  // Try to add a contact if there are other actors
  if (characterActors.length > 1) {
    const contactActor = characterActors[1];
    console.log("Adding contact:", contactActor.name);

    const success = agent.addContactToActor(testActor.id, contactActor.id);
    if (success) {
      console.log("✓ Contact added successfully");

      // Check if interfaces were updated
      setTimeout(() => {
        const newContacts = agent.getContactsForActor(testActor.id);
        console.log("Contacts after update:", newContacts.length);
        console.log("Real-time update test completed");
      }, 1000);
    } else {
      console.log("Contact already exists or could not be added");
    }
  } else {
    console.log("Not enough character actors to test contact addition");
  }

  console.log("=== End Test ===");
}

/**
 * Monitor for real-time updates
 */
function monitorRealtimeUpdates() {
  console.log("=== Monitoring Real-time Updates ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Set up a periodic check for interface updates
  const monitorInterval = setInterval(() => {
    const openCount = agent.getOpenInterfacesCount();
    const hasOpen = agent.hasOpenInterfaces();

    if (hasOpen) {
      console.log(`Monitoring ${openCount} agent windows...`);
    }
  }, 5000); // Check every 5 seconds

  // Store the interval ID for cleanup
  window.cyberpunkAgentMonitor = monitorInterval;

  console.log("Real-time update monitoring started. Use stopRealtimeMonitor() to stop.");
}

/**
 * Stop real-time update monitoring
 */
function stopRealtimeMonitor() {
  if (window.cyberpunkAgentMonitor) {
    clearInterval(window.cyberpunkAgentMonitor);
    delete window.cyberpunkAgentMonitor;
    console.log("Real-time update monitoring stopped.");
  } else {
    console.log("No monitoring active.");
  }
}

/**
 * Test the complete real-time update flow
 */
function testCompleteRealtimeFlow() {
  console.log("=== Testing Complete Real-time Flow ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Step 1: Check initial state
  console.log("Step 1: Checking initial state...");
  const initialContacts = agent.getContactsForActor(game.user.character?.id || '');
  console.log("Initial contacts:", initialContacts.length);

  // Step 2: Simulate a contact update
  console.log("Step 2: Simulating contact update...");
  if (game.user.isGM) {
    agent.notifyContactUpdate();
    console.log("✓ Update notification sent");
  } else {
    console.log("Skipped (not GM)");
  }

  // Step 3: Check if interfaces update
  console.log("Step 3: Checking interface updates...");
  setTimeout(() => {
    agent.updateOpenInterfaces();
    console.log("✓ Interface update completed");
  }, 500);

  // Step 4: Verify final state
  console.log("Step 4: Verifying final state...");
  setTimeout(() => {
    const finalContacts = agent.getContactsForActor(game.user.character?.id || '');
    console.log("Final contacts:", finalContacts.length);
    console.log("Complete flow test finished");
  }, 1000);

  console.log("=== End Complete Flow Test ===");
}

/**
 * Quick status check
 */
function quickStatusCheck() {
  console.log("=== Quick Status Check ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("✗ Cyberpunk Agent instance not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Check socket
  const socketAvailable = !!game.socket;
  console.log(`Socket: ${socketAvailable ? '✓' : '✗'}`);

  // Check methods
  const methods = [
    'updateOpenInterfaces',
    'notifyContactUpdate',
    'handleContactUpdate',
    'hasOpenInterfaces',
    'getOpenInterfacesCount'
  ];

  methods.forEach(method => {
    const available = typeof agent[method] === 'function';
    console.log(`${method}: ${available ? '✓' : '✗'}`);
  });

  // Check open interfaces
  const openCount = agent.getOpenInterfacesCount();
  console.log(`Open interfaces: ${openCount}`);

  // Check user permissions
  console.log(`Is GM: ${game.user.isGM ? '✓' : '✗'}`);

  console.log("=== Status Check Complete ===");
}

// Make test functions globally available
window.testRealtimeUpdates = testRealtimeUpdates;
window.testAddContactRealtime = testAddContactRealtime;
window.monitorRealtimeUpdates = monitorRealtimeUpdates;
window.stopRealtimeMonitor = stopRealtimeMonitor;
window.testCompleteRealtimeFlow = testCompleteRealtimeFlow;
window.quickStatusCheck = quickStatusCheck;

console.log("Cyberpunk Agent | Real-time test functions made globally available");
console.log("Available functions:");
console.log("  - testRealtimeUpdates()");
console.log("  - testAddContactRealtime()");
console.log("  - monitorRealtimeUpdates()");
console.log("  - stopRealtimeMonitor()"); 