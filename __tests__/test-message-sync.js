/**
 * Test script for message synchronization functionality
 * This script tests the new message synchronization feature that ensures
 * messages are properly synced when an agent is opened
 */

console.log("=== Cyberpunk Agent Message Sync Test ===");

/**
 * Test basic message synchronization
 */
async function testMessageSync() {
  console.log("🧪 Testing message synchronization...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Check if SocketLib is available
  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib available");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length === 0) {
    console.error("❌ No user actors available");
    return false;
  }

  const testActor = userActors[0];
  console.log("✅ Test actor:", testActor.name);

  // Test synchronization
  try {
    console.log("🔄 Starting message synchronization...");
    await agent.synchronizeMessagesWithServer(testActor.id);
    console.log("✅ Message synchronization completed");
    return true;
  } catch (error) {
    console.error("❌ Message synchronization failed:", error);
    return false;
  }
}

/**
 * Test message sync request handling
 */
async function testMessageSyncRequest() {
  console.log("🧪 Testing message sync request handling...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Create a mock sync request
  const mockSyncRequest = {
    requestingUserId: "test-user-id",
    requestingUserName: "Test User",
    actorId: "test-actor-id",
    timestamp: Date.now()
  };

  try {
    console.log("🔄 Processing mock sync request...");
    await agent.handleMessageSyncRequest(mockSyncRequest);
    console.log("✅ Message sync request handling completed");
    return true;
  } catch (error) {
    console.error("❌ Message sync request handling failed:", error);
    return false;
  }
}

/**
 * Test message sync response handling
 */
async function testMessageSyncResponse() {
  console.log("🧪 Testing message sync response handling...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Create a mock sync response
  const mockSyncResponse = {
    respondingUserId: "test-responder-id",
    respondingUserName: "Test Responder",
    requestingUserId: game.user.id, // This should match current user
    actorId: "test-actor-id",
    messages: [
      {
        conversationKey: "actor1-actor2",
        message: {
          id: "test-message-1",
          senderId: "actor1",
          receiverId: "actor2",
          text: "Test synchronized message",
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          read: false
        }
      }
    ],
    timestamp: Date.now()
  };

  try {
    console.log("🔄 Processing mock sync response...");
    await agent.handleMessageSyncResponse(mockSyncResponse);
    console.log("✅ Message sync response handling completed");
    return true;
  } catch (error) {
    console.error("❌ Message sync response handling failed:", error);
    return false;
  }
}

/**
 * Test full synchronization flow
 */
async function testFullSyncFlow() {
  console.log("🧪 Testing full synchronization flow...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Check if multiple users are connected
  const users = Array.from(game.users.values()).filter(user => user.active);
  if (users.length < 2) {
    console.warn("⚠️  Less than 2 users connected, some tests may be limited");
  }

  console.log("👥 Active users:", users.map(u => u.name));

  // Test the full flow
  const results = {
    basicSync: await testMessageSync(),
    requestHandling: await testMessageSyncRequest(),
    responseHandling: await testMessageSyncResponse()
  };

  console.log("📊 Test results:", results);

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("✅ All message sync tests passed!");
  } else {
    console.log("❌ Some message sync tests failed");
  }

  return allPassed;
}

/**
 * Test synchronization with real data
 */
async function testRealDataSync() {
  console.log("🧪 Testing synchronization with real data...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length === 0) {
    console.error("❌ No user actors available");
    return false;
  }

  const testActor = userActors[0];
  console.log("🎭 Testing with actor:", testActor.name);

  // Check current message count
  const currentMessages = agent.messages.size;
  console.log("📨 Current messages in memory:", currentMessages);

  // Check localStorage
  const storageKey = `cyberpunk-agent-messages-${game.user.id}-${testActor.id}`;
  const storedData = localStorage.getItem(storageKey);
  let storedMessageCount = 0;

  if (storedData) {
    try {
      const messagesData = JSON.parse(storedData);
      storedMessageCount = Object.values(messagesData).reduce((total, conversation) => {
        return total + (Array.isArray(conversation) ? conversation.length : 0);
      }, 0);
    } catch (error) {
      console.error("❌ Error parsing stored messages:", error);
    }
  }

  console.log("💾 Stored messages for actor:", storedMessageCount);

  // Perform synchronization
  try {
    console.log("🔄 Performing real data synchronization...");
    await agent.synchronizeMessagesWithServer(testActor.id);

    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if message count changed
    const newMessageCount = agent.messages.size;
    console.log("📨 Messages after sync:", newMessageCount);

    if (newMessageCount > currentMessages) {
      console.log("✅ New messages were added during synchronization");
    } else {
      console.log("ℹ️  No new messages found during synchronization");
    }

    return true;
  } catch (error) {
    console.error("❌ Real data synchronization failed:", error);
    return false;
  }
}

/**
 * Run all message sync tests
 */
async function runAllMessageSyncTests() {
  console.log("🚀 Running all message synchronization tests...");
  console.log("");

  const tests = [
    { name: "Basic Message Sync", test: testMessageSync },
    { name: "Sync Request Handling", test: testMessageSyncRequest },
    { name: "Sync Response Handling", test: testMessageSyncResponse },
    { name: "Full Sync Flow", test: testFullSyncFlow },
    { name: "Real Data Sync", test: testRealDataSync }
  ];

  const results = {};

  for (const test of tests) {
    console.log(`🧪 Running: ${test.name}`);
    try {
      results[test.name] = await test.test();
      console.log(`✅ ${test.name}: ${results[test.name] ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR -`, error);
      results[test.name] = false;
    }
    console.log("");
  }

  // Summary
  console.log("📊 Test Summary:");
  Object.entries(results).forEach(([testName, result]) => {
    console.log(`  ${result ? '✅' : '❌'} ${testName}`);
  });

  const passedTests = Object.values(results).filter(result => result === true).length;
  const totalTests = Object.keys(results).length;

  console.log("");
  console.log(`🎯 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All message synchronization tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the logs above for details.");
  }

  return results;
}

// Make functions globally available
window.testMessageSync = testMessageSync;
window.testMessageSyncRequest = testMessageSyncRequest;
window.testMessageSyncResponse = testMessageSyncResponse;
window.testFullSyncFlow = testFullSyncFlow;
window.testRealDataSync = testRealDataSync;
window.runAllMessageSyncTests = runAllMessageSyncTests;

console.log("✅ Message sync test functions loaded");
console.log("Run 'runAllMessageSyncTests()' to execute all tests");
console.log("Or run individual tests:");
console.log("  - testMessageSync()");
console.log("  - testMessageSyncRequest()");
console.log("  - testMessageSyncResponse()");
console.log("  - testFullSyncFlow()");
console.log("  - testRealDataSync()"); 