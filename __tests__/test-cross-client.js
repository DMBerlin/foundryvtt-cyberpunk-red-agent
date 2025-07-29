/**
 * Cross-Client Communication Test Script
 * Tests communication between different clients/browsers
 */

console.log("Cyberpunk Agent | Loading test-cross-client.js...");

/**
 * Test cross-client communication
 */
function testCrossClientCommunication() {
  console.log("=== Cross-Client Communication Test ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check socket availability
  console.log("Test 1: Checking socket availability...");
  const socketAvailable = !!game.socket;
  console.log(`Socket available: ${socketAvailable ? '✓' : '✗'}`);

  if (socketAvailable) {
    console.log("Socket details:", {
      connected: game.socket.connected,
      id: game.socket.id
    });
  }

  // Test 2: Check user information
  console.log("Test 2: Checking user information...");
  console.log("User:", {
    id: game.user.id,
    name: game.user.name,
    isGM: game.user.isGM,
    role: game.user.role
  });

  // Test 3: Check session information
  console.log("Test 3: Checking session information...");
  console.log("Session:", {
    id: game.data.id,
    title: game.data.title,
    users: Object.keys(game.users).length
  });

  // Test 4: Test notification sending (GM only)
  if (game.user.isGM) {
    console.log("Test 4: Testing notification sending...");
    try {
      agent.testCrossClientCommunication();
      console.log("✓ Notification test sent");
    } catch (error) {
      console.error("✗ Error sending notification:", error);
    }
  } else {
    console.log("Test 4: Skipped (not GM)");
  }

  // Test 5: Check communication methods
  console.log("Test 5: Checking communication methods...");
  const methods = [
    'notifyContactUpdate',
    'broadcastContactUpdate',
    'setupSocketCommunication',
    'setupChatMessageListener'
  ];

  methods.forEach(method => {
    const available = typeof agent[method] === 'function';
    console.log(`${method}: ${available ? '✓' : '✗'}`);
  });

  console.log("=== Cross-Client Test Complete ===");
}

/**
 * Monitor for incoming notifications
 */
function monitorNotifications() {
  console.log("=== Monitoring for Notifications ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;
  let notificationCount = 0;

  // Create a custom event listener for notifications
  const originalHandleContactUpdate = agent.handleContactUpdate.bind(agent);

  agent.handleContactUpdate = function (data) {
    notificationCount++;
    console.log(`📨 Notification #${notificationCount} received from: ${data.userName}`);
    console.log("Notification data:", data);

    // Call the original method
    originalHandleContactUpdate(data);
  };

  console.log("Monitoring started. Notifications will be logged here.");
  console.log("Use stopNotificationMonitor() to stop monitoring.");

  // Store the original method for cleanup
  window.originalHandleContactUpdate = originalHandleContactUpdate;
  window.notificationCount = 0;
}

/**
 * Stop notification monitoring
 */
function stopNotificationMonitor() {
  console.log("=== Stopping Notification Monitor ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  if (window.originalHandleContactUpdate) {
    agent.handleContactUpdate = window.originalHandleContactUpdate;
    delete window.originalHandleContactUpdate;
    console.log("✓ Notification monitoring stopped");
  } else {
    console.log("No monitoring was active");
  }
}

/**
 * Test manual notification processing
 */
function testManualNotification() {
  console.log("=== Testing Manual Notification Processing ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available!");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Create a test notification
  const testData = {
    timestamp: Date.now(),
    userId: 'test-user-id',
    userName: 'Test User',
    sessionId: game.data.id
  };

  console.log("Processing test notification:", testData);

  try {
    agent.handleContactUpdate(testData);
    console.log("✓ Manual notification test completed");
  } catch (error) {
    console.error("✗ Error processing manual notification:", error);
  }
}

/**
 * Check network connectivity
 */
function checkNetworkConnectivity() {
  console.log("=== Network Connectivity Check ===");

  // Check if we're online
  const online = navigator.onLine;
  console.log(`Online status: ${online ? '✓' : '✗'}`);

  // Check WebSocket support
  const websocketSupported = typeof WebSocket !== 'undefined';
  console.log(`WebSocket support: ${websocketSupported ? '✓' : '✗'}`);

  // Check FoundryVTT socket
  const foundrySocket = !!game.socket;
  console.log(`FoundryVTT socket: ${foundrySocket ? '✓' : '✗'}`);

  if (foundrySocket && game.socket) {
    console.log("Socket details:", {
      connected: game.socket.connected,
      readyState: game.socket.readyState
    });
  }

  // Check user count
  const userCount = game.users ? Object.keys(game.users).length : 0;
  console.log(`Connected users: ${userCount}`);

  // List connected users
  if (game.users) {
    Object.values(game.users).forEach(user => {
      console.log(`  - ${user.name} (${user.id}) - ${user.active ? 'Active' : 'Inactive'}`);
    });
  } else {
    console.log("  - No users data available yet");
  }

  console.log("=== Network Check Complete ===");
}

/**
 * Comprehensive cross-client test
 */
function comprehensiveCrossClientTest() {
  console.log("=== Comprehensive Cross-Client Test ===");

  // Step 1: Basic checks
  testCrossClientCommunication();

  // Step 2: Network check
  checkNetworkConnectivity();

  // Step 3: Start monitoring
  monitorNotifications();

  // Step 4: Test manual notification
  setTimeout(() => {
    testManualNotification();
  }, 1000);

  // Step 5: Auto-stop monitoring after 30 seconds
  setTimeout(() => {
    stopNotificationMonitor();
    console.log("=== Comprehensive Test Complete ===");
  }, 30000);

  console.log("Comprehensive test started. Will auto-complete in 30 seconds.");
}

// Make functions globally available
window.testCrossClientCommunication = testCrossClientCommunication;
window.monitorNotifications = monitorNotifications;
window.stopNotificationMonitor = stopNotificationMonitor;
window.testManualNotification = testManualNotification;
window.checkNetworkConnectivity = checkNetworkConnectivity;
window.comprehensiveCrossClientTest = comprehensiveCrossClientTest;

console.log("Cyberpunk Agent | Cross-client test functions made globally available");

// Auto-run basic test on load
setTimeout(() => {
  console.log("Cyberpunk Agent | Running auto cross-client test...");
  // Only run if game is fully loaded
  if (game && game.users && game.socket) {
    checkNetworkConnectivity();
  } else {
    console.log("Cyberpunk Agent | Game not fully loaded yet, skipping auto test");
  }
}, 3000); 