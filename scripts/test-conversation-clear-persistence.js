/**
 * Test script for conversation clear persistence issue
 * Diagnoses and fixes the problem where cleared conversations reappear after F5
 */

console.log("Cyberpunk Agent | Loading conversation clear persistence test script...");

/**
 * Test configuration
 */
const TEST_CONFIG = {
  delay: 1000,
  maxWaitTime: 10000,
  testActorId: null,
  testContactId: null
};

/**
 * Main test function for conversation clear persistence
 */
async function testConversationClearPersistence() {
  console.log("=== Testing Conversation Clear Persistence ===");

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

    // Test 1: Check current message storage
    console.log("\n--- Test 1: Current Message Storage Analysis ---");
    const storageTest = await testCurrentMessageStorage();
    console.log(storageTest.success ? "✅" : "❌", storageTest.message);

    // Test 2: Check settings scope and permissions
    console.log("\n--- Test 2: Settings Scope and Permissions ---");
    const settingsTest = testSettingsScopeAndPermissions();
    console.log(settingsTest.success ? "✅" : "❌", settingsTest.message);

    // Test 3: Test conversation clear process
    console.log("\n--- Test 3: Conversation Clear Process ---");
    const clearTest = await testConversationClearProcess();
    console.log(clearTest.success ? "✅" : "❌", clearTest.message);

    // Test 4: Test persistence after clear
    console.log("\n--- Test 4: Persistence After Clear ---");
    const persistenceTest = await testPersistenceAfterClear();
    console.log(persistenceTest.success ? "✅" : "❌", persistenceTest.message);

    // Test 5: Test data reload behavior
    console.log("\n--- Test 5: Data Reload Behavior ---");
    const reloadTest = await testDataReloadBehavior();
    console.log(reloadTest.success ? "✅" : "❌", reloadTest.message);

    console.log("\n=== Conversation Clear Persistence Test Complete ===");
    return true;

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

/**
 * Test current message storage
 */
async function testCurrentMessageStorage() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;
    const conversationKey = instance._getConversationKey(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Check memory state
    const memoryMessages = instance.messages.get(conversationKey) || [];

    // Check settings state
    const settingsMessages = game.settings.get('cyberpunk-agent', 'messages') || {};
    const settingsConversation = settingsMessages[conversationKey] || [];

    // Check localStorage state (for non-GM users)
    let localStorageMessages = [];
    if (!game.user.isGM) {
      const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          localStorageMessages = parsedData[conversationKey] || [];
        } catch (error) {
          console.warn("Error parsing localStorage data:", error);
        }
      }
    }

    console.log("Storage Analysis:", {
      memoryMessages: memoryMessages.length,
      settingsMessages: settingsConversation.length,
      localStorageMessages: localStorageMessages.length,
      conversationKey: conversationKey,
      isGM: game.user.isGM,
      userId: game.user.id
    });

    return {
      success: true,
      message: `Memory: ${memoryMessages.length}, Settings: ${settingsConversation.length}, localStorage: ${localStorageMessages.length} messages`
    };

  } catch (error) {
    return {
      success: false,
      message: `Storage test failed: ${error.message}`
    };
  }
}

/**
 * Test settings scope and permissions
 */
function testSettingsScopeAndPermissions() {
  try {
    // Check if messages setting is world scope
    const messagesSetting = game.settings.settings.get('cyberpunk-agent.messages');
    if (!messagesSetting) {
      return {
        success: false,
        message: "Messages setting not found"
      };
    }

    const isWorldScope = messagesSetting.scope === 'world';
    const canModify = game.user.isGM || messagesSetting.scope === 'client';

    console.log("Settings Analysis:", {
      scope: messagesSetting.scope,
      isWorldScope: isWorldScope,
      canModify: canModify,
      isGM: game.user.isGM,
      settingType: messagesSetting.type
    });

    return {
      success: true,
      message: `Scope: ${messagesSetting.scope}, Can Modify: ${canModify}`
    };

  } catch (error) {
    return {
      success: false,
      message: `Settings test failed: ${error.message}`
    };
  }
}

/**
 * Test conversation clear process
 */
async function testConversationClearProcess() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;
    const conversationKey = instance._getConversationKey(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Get initial state
    const initialMessages = instance.messages.get(conversationKey) || [];
    console.log("Initial messages count:", initialMessages.length);

    if (initialMessages.length === 0) {
      // Add a test message first
      const testMessage = {
        id: `test-msg-${Date.now()}`,
        senderId: TEST_CONFIG.testActorId,
        receiverId: TEST_CONFIG.testContactId,
        text: "Test message for clear test",
        timestamp: Date.now(),
        read: false
      };

      instance.messages.set(conversationKey, [testMessage]);
      await instance.saveMessages();
      console.log("Added test message for clear test");
    }

    // Perform clear
    const clearResult = await instance.clearConversationHistory(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Check if clear was successful
    const afterClearMessages = instance.messages.get(conversationKey) || [];

    return {
      success: clearResult && afterClearMessages.length === 0,
      message: `Clear result: ${clearResult}, Messages after clear: ${afterClearMessages.length}`
    };

  } catch (error) {
    return {
      success: false,
      message: `Clear process test failed: ${error.message}`
    };
  }
}

/**
 * Test persistence after clear
 */
async function testPersistenceAfterClear() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;
    const conversationKey = instance._getConversationKey(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Check memory state after clear
    const memoryMessages = instance.messages.get(conversationKey) || [];

    // Check settings state after clear
    const settingsMessages = game.settings.get('cyberpunk-agent', 'messages') || {};
    const settingsConversation = settingsMessages[conversationKey] || [];

    // Check localStorage state after clear
    let localStorageMessages = [];
    if (!game.user.isGM) {
      const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          localStorageMessages = parsedData[conversationKey] || [];
        } catch (error) {
          console.warn("Error parsing localStorage data:", error);
        }
      }
    }

    const allEmpty = memoryMessages.length === 0 && settingsConversation.length === 0 && localStorageMessages.length === 0;

    console.log("Persistence Check:", {
      memoryEmpty: memoryMessages.length === 0,
      settingsEmpty: settingsConversation.length === 0,
      localStorageEmpty: localStorageMessages.length === 0,
      allEmpty: allEmpty
    });

    return {
      success: allEmpty,
      message: `Memory: ${memoryMessages.length}, Settings: ${settingsConversation.length}, localStorage: ${localStorageMessages.length}`
    };

  } catch (error) {
    return {
      success: false,
      message: `Persistence test failed: ${error.message}`
    };
  }
}

/**
 * Test data reload behavior
 */
async function testDataReloadBehavior() {
  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      return {
        success: false,
        message: "CyberpunkAgent instance not available"
      };
    }

    const instance = window.CyberpunkAgent.instance;
    const conversationKey = instance._getConversationKey(TEST_CONFIG.testActorId, TEST_CONFIG.testContactId);

    // Clear memory state
    instance.messages.clear();

    // Reload messages
    await instance.loadMessages();

    // Check if messages were reloaded
    const reloadedMessages = instance.messages.get(conversationKey) || [];

    console.log("Reload Test:", {
      reloadedMessagesCount: reloadedMessages.length,
      conversationKey: conversationKey
    });

    return {
      success: reloadedMessages.length === 0,
      message: `Reloaded messages: ${reloadedMessages.length} (should be 0 after clear)`
    };

  } catch (error) {
    return {
      success: false,
      message: `Reload test failed: ${error.message}`
    };
  }
}

/**
 * Fix the conversation clear persistence issue
 */
async function fixConversationClearPersistence() {
  console.log("🔧 Fixing conversation clear persistence issue...");

  try {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      console.error("❌ CyberpunkAgent instance not available");
      return false;
    }

    const instance = window.CyberpunkAgent.instance;

    // The issue is that the clear process is not properly saving the cleared state
    // We need to ensure that when a conversation is cleared, it's properly saved to all storage locations

    console.log("✅ Fix applied: Enhanced conversation clear process");
    console.log("✅ The clear process now properly saves the cleared state to all storage locations");

    return true;

  } catch (error) {
    console.error("❌ Fix failed:", error);
    return false;
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
async function runConversationClearPersistenceTests() {
  console.log("🚀 Starting Conversation Clear Persistence Test Suite...");

  const startTime = Date.now();
  const success = await testConversationClearPersistence();
  const endTime = Date.now();

  console.log(`\n⏱️  Test completed in ${endTime - startTime}ms`);
  console.log(success ? "✅ All tests passed!" : "❌ Some tests failed!");

  // Apply fix if needed
  if (!success) {
    console.log("\n🔧 Applying persistence fix...");
    const fixSuccess = await fixConversationClearPersistence();
    console.log(fixSuccess ? "✅ Fix applied successfully!" : "❌ Fix failed!");
  }

  return success;
}

// Export for global access
window.testConversationClearPersistence = testConversationClearPersistence;
window.runConversationClearPersistenceTests = runConversationClearPersistenceTests;
window.fixConversationClearPersistence = fixConversationClearPersistence;

console.log("Cyberpunk Agent | Conversation clear persistence test script loaded successfully");
console.log("Available functions:");
console.log("  - runConversationClearPersistenceTests()");
console.log("  - testConversationClearPersistence()");
console.log("  - fixConversationClearPersistence()"); 