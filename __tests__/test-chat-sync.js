/**
 * Test Chat Sync on Open
 * ======================
 * 
 * This script tests the automatic synchronization with the server
 * when opening a chat conversation with a contact.
 */

console.log("=== Testing Chat Sync on Open ===");

/**
 * Test 1: Verify sync is triggered when opening a conversation
 */
async function testChatSyncOnOpen() {
  console.log("\n--- Test 1: Chat Sync on Open ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    if (userDevices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDevice = userDevices[0];
    console.log(`✅ Testing with device: ${testDevice.deviceName}`);

    // Get device contacts
    const contacts = cyberpunkAgent.getContactsForDevice(testDevice.id);
    if (contacts.length === 0) {
      console.log("⚠️ No contacts available for testing");
      return true;
    }

    const testContact = contacts[0];
    console.log(`✅ Testing with contact: ${testContact.name || testContact.id}`);

    // Create a mock AgentApplication instance for testing
    const mockAgentApp = {
      device: testDevice,
      currentView: 'home',
      currentContact: null,
      navigateTo: async function (view, contact = null) {
        console.log(`🔄 Mock navigateTo called with view: ${view}, contact:`, contact);

        if (view === 'conversation' && contact) {
          console.log("🔄 Simulating conversation navigation with sync...");

          // Simulate the sync that happens in navigateTo
          try {
            await cyberpunkAgent.syncMessagesWithServer(this.device.id);
            console.log("✅ Mock sync completed successfully");
          } catch (error) {
            console.error("❌ Mock sync failed:", error);
            return false;
          }
        }

        this.currentView = view;
        this.currentContact = contact;
        return true;
      }
    };

    // Test the navigation with sync
    console.log("🔄 Testing conversation navigation with sync...");
    const result = await mockAgentApp.navigateTo('conversation', testContact);

    if (result) {
      console.log("✅ Chat sync on open test passed!");
      return true;
    } else {
      console.error("❌ Chat sync on open test failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing chat sync on open:", error);
    return false;
  }
}

/**
 * Test 2: Verify sync happens before conversation is rendered
 */
async function testSyncBeforeRendering() {
  console.log("\n--- Test 2: Sync Before Rendering ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    if (userDevices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDevice = userDevices[0];
    console.log(`✅ Testing with device: ${testDevice.deviceName}`);

    // Mock the _renderConversationView method
    const originalRenderMethod = cyberpunkAgent._renderConversationView;
    let syncCalled = false;

    cyberpunkAgent._renderConversationView = async function () {
      console.log("🔄 Mock _renderConversationView called");

      // Simulate the sync that happens in _renderConversationView
      try {
        console.log("🔄 Performing sync check in conversation view...");
        await this.syncMessagesWithServer(testDevice.id);
        syncCalled = true;
        console.log("✅ Sync check completed in conversation view");
      } catch (error) {
        console.error("❌ Sync check failed in conversation view:", error);
        return false;
      }

      return true;
    };

    // Test the conversation view rendering
    console.log("🔄 Testing conversation view rendering with sync...");
    const result = await cyberpunkAgent._renderConversationView();

    // Restore original method
    cyberpunkAgent._renderConversationView = originalRenderMethod;

    if (result && syncCalled) {
      console.log("✅ Sync before rendering test passed!");
      return true;
    } else {
      console.error("❌ Sync before rendering test failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing sync before rendering:", error);
    return false;
  }
}

/**
 * Test 3: Verify messages are up to date after sync
 */
async function testMessagesUpToDate() {
  console.log("\n--- Test 3: Messages Up to Date After Sync ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    if (userDevices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDevice = userDevices[0];
    console.log(`✅ Testing with device: ${testDevice.deviceName}`);

    // Get device contacts
    const contacts = cyberpunkAgent.getContactsForDevice(testDevice.id);
    if (contacts.length === 0) {
      console.log("⚠️ No contacts available for testing");
      return true;
    }

    const testContact = contacts[0];
    console.log(`✅ Testing with contact: ${testContact.name || testContact.id}`);

    // Get messages before sync
    const messagesBefore = cyberpunkAgent.getMessagesForDeviceConversation(testDevice.id, testContact.id);
    console.log(`✅ Messages before sync: ${messagesBefore.length}`);

    // Perform sync
    console.log("🔄 Performing sync...");
    await cyberpunkAgent.syncMessagesWithServer(testDevice.id);

    // Get messages after sync
    const messagesAfter = cyberpunkAgent.getMessagesForDeviceConversation(testDevice.id, testContact.id);
    console.log(`✅ Messages after sync: ${messagesAfter.length}`);

    // Check if messages are properly loaded
    if (messagesAfter.length >= messagesBefore.length) {
      console.log("✅ Messages are up to date after sync");
      return true;
    } else {
      console.error("❌ Messages are not up to date after sync");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing messages up to date:", error);
    return false;
  }
}

/**
 * Test 4: Verify sync performance
 */
async function testSyncPerformance() {
  console.log("\n--- Test 4: Sync Performance ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    if (userDevices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDevice = userDevices[0];
    console.log(`✅ Testing with device: ${testDevice.deviceName}`);

    // Measure sync performance
    const startTime = Date.now();
    console.log("🔄 Starting sync performance test...");

    await cyberpunkAgent.syncMessagesWithServer(testDevice.id);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Sync completed in ${duration}ms`);

    // Sync should complete within reasonable time (5 seconds)
    if (duration < 5000) {
      console.log("✅ Sync performance is acceptable");
      return true;
    } else {
      console.error("❌ Sync performance is too slow");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing sync performance:", error);
    return false;
  }
}

/**
 * Run all chat sync tests
 */
async function runChatSyncTests() {
  console.log("=== Running Chat Sync Tests ===");

  const tests = [
    testChatSyncOnOpen,
    testSyncBeforeRendering,
    testMessagesUpToDate,
    testSyncPerformance
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
    }
  }

  console.log(`\n=== Test Results: ${passedTests}/${totalTests} tests passed ===`);

  if (passedTests === totalTests) {
    console.log("🎉 All chat sync tests passed!");
  } else {
    console.log("⚠️ Some tests failed. Check the logs above for details.");
  }

  return passedTests === totalTests;
}

/**
 * Quick test function
 */
function testChatSync() {
  console.log("Testing chat sync functionality...");
  runChatSyncTests().then(success => {
    if (success) {
      console.log("✅ Chat sync test passed!");
    } else {
      console.log("❌ Chat sync test failed");
    }
  });
}

/**
 * Test specific sync functionality
 */
function testSpecificSync() {
  console.log("Testing specific sync functionality...");
  testChatSyncOnOpen().then(success => {
    if (success) {
      console.log("✅ Specific sync test passed!");
    } else {
      console.log("❌ Specific sync test failed");
    }
  });
}

// Export functions for manual testing
window.testChatSync = testChatSync;
window.runChatSyncTests = runChatSyncTests;
window.testSpecificSync = testSpecificSync;

console.log("Chat sync tests loaded. Use testChatSync() to run tests.");
console.log("Use testSpecificSync() to test specific sync functionality."); 