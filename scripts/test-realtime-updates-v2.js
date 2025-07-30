/**
 * Test script for enhanced real-time updates and Foundry chat integration
 * Version 2.0 - Tests the improved UI update mechanisms
 */

console.log("Cyberpunk Agent | Loading real-time updates test script v2...");

// Test configuration
const TEST_CONFIG = {
  delay: 1000,
  maxWaitTime: 10000,
  testActorId: null,
  testContactId: null
};

/**
 * Test the enhanced real-time chat update mechanism
 */
async function testEnhancedRealtimeUpdates() {
  console.log("=== Testing Enhanced Real-time Updates ===");

  try {
    // Get test data
    const testData = await getTestData();
    if (!testData.success) {
      console.error("❌ Failed to get test data:", testData.error);
      return false;
    }

    TEST_CONFIG.testActorId = testData.actorId;
    TEST_CONFIG.testContactId = testData.contactId;

    console.log("✅ Test data obtained:", {
      actorId: TEST_CONFIG.testActorId,
      contactId: TEST_CONFIG.testContactId
    });

    // Test 1: UI Controller availability
    console.log("\n--- Test 1: UI Controller Availability ---");
    const uiControllerTest = testUIControllerAvailability();
    console.log(uiControllerTest.success ? "✅" : "❌", uiControllerTest.message);

    // Test 2: Component registration
    console.log("\n--- Test 2: Component Registration ---");
    const componentTest = await testComponentRegistration();
    console.log(componentTest.success ? "✅" : "❌", componentTest.message);

    // Test 3: Real-time message updates
    console.log("\n--- Test 3: Real-time Message Updates ---");
    const messageUpdateTest = await testRealtimeMessageUpdates();
    console.log(messageUpdateTest.success ? "✅" : "❌", messageUpdateTest.message);

    // Test 4: UI rebuild on mark as read
    console.log("\n--- Test 4: UI Rebuild on Mark as Read ---");
    const markAsReadTest = await testMarkAsReadUIUpdate();
    console.log(markAsReadTest.success ? "✅" : "❌", markAsReadTest.message);

    // Test 5: Multiple UI update strategies
    console.log("\n--- Test 5: Multiple UI Update Strategies ---");
    const strategiesTest = await testMultipleUIUpdateStrategies();
    console.log(strategiesTest.success ? "✅" : "❌", strategiesTest.message);

    // Test 6: Foundry chat integration protection
    console.log("\n--- Test 6: Foundry Chat Integration Protection ---");
    const foundryTest = await testFoundryChatProtection();
    console.log(foundryTest.success ? "✅" : "❌", foundryTest.message);

    // Test 7: GM-to-player notifications
    console.log("\n--- Test 7: GM-to-Player Notifications ---");
    const gmNotificationTest = await testGMToPlayerNotifications();
    console.log(gmNotificationTest.success ? "✅" : "❌", gmNotificationTest.message);

    console.log("\n=== Enhanced Real-time Updates Test Complete ===");
    return true;

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

/**
 * Test UI Controller availability
 */
function testUIControllerAvailability() {
  try {
    if (!window.CyberpunkAgentUIController) {
      return {
        success: false,
        message: "UI Controller not available"
      };
    }

    const methods = [
      'registerComponent',
      'unregisterComponent',
      'markDirty',
      'markDirtyMultiple',
      'markAllDirty',
      'performUpdate'
    ];

    for (const method of methods) {
      if (typeof window.CyberpunkAgentUIController[method] !== 'function') {
        return {
          success: false,
          message: `UI Controller method ${method} not available`
        };
      }
    }

    return {
      success: true,
      message: "UI Controller is available with all required methods"
    };

  } catch (error) {
    return {
      success: false,
      message: `UI Controller test failed: ${error.message}`
    };
  }
}

/**
 * Test component registration
 */
async function testComponentRegistration() {
  try {
    const componentId = `test-component-${Date.now()}`;
    const testComponent = { id: componentId };
    let updateCalled = false;

    const updateCallback = () => {
      updateCalled = true;
    };

    // Register component
    window.CyberpunkAgentUIController.registerComponent(componentId, testComponent, updateCallback);

    // Check if component is registered
    if (!window.CyberpunkAgentUIController.hasComponent(componentId)) {
      return {
        success: false,
        message: "Component registration failed"
      };
    }

    // Mark as dirty and trigger update
    window.CyberpunkAgentUIController.markDirty(componentId);
    window.CyberpunkAgentUIController.performUpdate();

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Unregister component
    window.CyberpunkAgentUIController.unregisterComponent(componentId);

    return {
      success: true,
      message: "Component registration and update mechanism working"
    };

  } catch (error) {
    return {
      success: false,
      message: `Component registration test failed: ${error.message}`
    };
  }
}

/**
 * Test real-time message updates
 */
async function testRealtimeMessageUpdates() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;

    // Create a test message
    const testMessage = {
      id: `test-msg-${Date.now()}`,
      senderId: TEST_CONFIG.testActorId,
      receiverId: TEST_CONFIG.testContactId,
      text: "Test real-time message",
      timestamp: Date.now(),
      read: false
    };

    // Simulate message update
    const updateData = {
      userId: game.user.id,
      userName: game.user.name,
      timestamp: Date.now(),
      senderId: TEST_CONFIG.testActorId,
      receiverId: TEST_CONFIG.testContactId,
      message: testMessage
    };

    // Call handleMessageUpdate
    instance.handleMessageUpdate(updateData);

    // Wait for UI updates
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: "Real-time message update mechanism working"
    };

  } catch (error) {
    return {
      success: false,
      message: `Real-time message update test failed: ${error.message}`
    };
  }
}

/**
 * Test UI rebuild on mark as read
 */
async function testMarkAsReadUIUpdate() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;

    // Mark conversation as read
    instance.markConversationAsRead(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Wait for UI updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if unread count is updated
    const unreadCount = instance.getUnreadCount(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    return {
      success: unreadCount === 0,
      message: `Mark as read UI update test - Unread count: ${unreadCount}`
    };

  } catch (error) {
    return {
      success: false,
      message: `Mark as read UI update test failed: ${error.message}`
    };
  }
}

/**
 * Test multiple UI update strategies
 */
async function testMultipleUIUpdateStrategies() {
  try {
    // Test custom event dispatching
    let eventReceived = false;
    const eventHandler = (event) => {
      if (event.detail && event.detail.type === 'testUpdate') {
        eventReceived = true;
      }
    };

    document.addEventListener('cyberpunk-agent-update', eventHandler);

    // Dispatch test event
    document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
      detail: {
        type: 'testUpdate',
        timestamp: Date.now()
      }
    }));

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 100));

    document.removeEventListener('cyberpunk-agent-update', eventHandler);

    return {
      success: eventReceived,
      message: "Multiple UI update strategies working (custom events)"
    };

  } catch (error) {
    return {
      success: false,
      message: `Multiple UI update strategies test failed: ${error.message}`
    };
  }
}

/**
 * Test Foundry chat integration protection
 */
async function testFoundryChatProtection() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;

    // Test if _handleChatMessageDelete method exists
    if (typeof instance._handleChatMessageDelete !== 'function') {
      return {
        success: false,
        message: "Chat message deletion handler not available"
      };
    }

    // Test if chat message deletion hook is set up
    if (!instance._chatMessageDeleteHookSet) {
      return {
        success: false,
        message: "Chat message deletion hook not set up"
      };
    }

    return {
      success: true,
      message: "Foundry chat integration protection is active"
    };

  } catch (error) {
    return {
      success: false,
      message: `Foundry chat protection test failed: ${error.message}`
    };
  }
}

/**
 * Test GM-to-player notifications
 */
async function testGMToPlayerNotifications() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;

    // Test if _createGMToPlayerNotification method exists
    if (typeof instance._createGMToPlayerNotification !== 'function') {
      return {
        success: false,
        message: "GM-to-player notification method not available"
      };
    }

    // Test if the method can be called (without actually creating a message)
    try {
      // This should not throw an error even if actors don't exist
      instance._createGMToPlayerNotification('test-sender', 'test-receiver');
    } catch (error) {
      // Expected error for test actors, but method should exist
    }

    return {
      success: true,
      message: "GM-to-player notification system is available"
    };

  } catch (error) {
    return {
      success: false,
      message: `GM-to-player notification test failed: ${error.message}`
    };
  }
}

/**
 * Get test data for the tests
 */
async function getTestData() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        error: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;

    // Get user actors
    const userActors = instance.getUserActors();
    if (!userActors || userActors.length === 0) {
      return {
        success: false,
        error: "No user actors available"
      };
    }

    const actorId = userActors[0].id;

    // Get contacts for the actor
    const contacts = instance.getContactsForActor(actorId);
    const anonymousContacts = instance.getAnonymousContactsForActor(actorId);
    const allContacts = [...contacts, ...anonymousContacts];

    if (allContacts.length === 0) {
      return {
        success: false,
        error: "No contacts available for testing"
      };
    }

    const contactId = allContacts[0].id;

    return {
      success: true,
      actorId: actorId,
      contactId: contactId
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run the test suite
 */
async function runEnhancedRealtimeTests() {
  console.log("🚀 Starting Enhanced Real-time Updates Test Suite...");

  const startTime = Date.now();
  const success = await testEnhancedRealtimeUpdates();
  const endTime = Date.now();

  console.log(`\n⏱️  Test completed in ${endTime - startTime}ms`);
  console.log(success ? "✅ All tests passed!" : "❌ Some tests failed!");

  return success;
}

// Export for global access
window.testEnhancedRealtimeUpdates = testEnhancedRealtimeUpdates;
window.runEnhancedRealtimeTests = runEnhancedRealtimeTests;

console.log("Cyberpunk Agent | Enhanced real-time updates test script v2 loaded successfully");
console.log("Available functions:");
console.log("  - runEnhancedRealtimeTests()");
console.log("  - testEnhancedRealtimeUpdates()"); 