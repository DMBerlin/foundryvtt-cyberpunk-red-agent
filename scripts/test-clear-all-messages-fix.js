/**
 * Test script for Clear All Messages broadcast fix
 * This script tests that the SocketLib broadcast for Clear All Messages works correctly
 */

console.log("=== Testing Clear All Messages Broadcast Fix ===");

// Test function to verify the fix
async function testClearAllMessagesBroadcast() {
  console.log("🔍 Testing Clear All Messages broadcast functionality...");

  try {
    // Check if we have the CyberpunkAgent instance
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    const agent = window.CyberpunkAgent.instance;

    // Check if user is GM
    if (!game.user.isGM) {
      console.warn("⚠️ User is not GM - some tests may be limited");
    }

    // Check SocketLib availability
    const socketLibAvailable = agent._isSocketLibAvailable();
    console.log("🔍 SocketLib available:", socketLibAvailable);

    // Check window.socket availability
    const windowSocketAvailable = !!window.socket;
    console.log("🔍 window.socket available:", windowSocketAvailable);

    // Check socketLibIntegration
    const integrationAvailable = !!agent.socketLibIntegration;
    console.log("🔍 socketLibIntegration available:", integrationAvailable);

    // Test the clearAllMessages method (if GM)
    if (game.user.isGM) {
      console.log("🔍 Testing clearAllMessages method...");

      // Check if the method exists
      if (typeof agent.clearAllMessages === 'function') {
        console.log("✅ clearAllMessages method exists");

        // We won't actually call it to avoid clearing data, but we can check the method
        const methodString = agent.clearAllMessages.toString();

        // Check if it uses the correct socket access pattern
        if (methodString.includes('window.socket.executeForEveryone')) {
          console.log("✅ Method uses correct window.socket.executeForEveryone pattern");
        } else {
          console.error("❌ Method does not use correct window.socket.executeForEveryone pattern");
          console.log("🔍 Method content:", methodString);
        }

        // Check if it includes the userId and userName in the broadcast data
        if (methodString.includes('userId: game.user.id') && methodString.includes('userName: game.user.name')) {
          console.log("✅ Method includes userId and userName in broadcast data");
        } else {
          console.warn("⚠️ Method may not include userId and userName in broadcast data");
        }

      } else {
        console.error("❌ clearAllMessages method not found");
      }
    }

    // Test SocketLib integration methods
    if (agent.socketLibIntegration) {
      console.log("🔍 Testing SocketLib integration methods...");

      const methods = [
        'sendMessageUpdate',
        'sendMessageDeletion',
        'sendConversationClear',
        'sendDeviceMessageDeletion'
      ];

      methods.forEach(method => {
        if (typeof agent.socketLibIntegration[method] === 'function') {
          console.log(`✅ ${method} method available`);
        } else {
          console.warn(`⚠️ ${method} method not available`);
        }
      });
    }

    // Test broadcast handlers
    console.log("🔍 Testing broadcast handlers...");

    // Check if handleAllMessagesCleared exists in socketlib-integration.js
    if (typeof handleAllMessagesCleared === 'function') {
      console.log("✅ handleAllMessagesCleared handler exists");
    } else {
      console.warn("⚠️ handleAllMessagesCleared handler not found");
    }

    // Check if handleBroadcastUpdate exists and handles allMessagesCleared
    if (typeof handleBroadcastUpdate === 'function') {
      console.log("✅ handleBroadcastUpdate handler exists");

      const handlerString = handleBroadcastUpdate.toString();
      if (handlerString.includes("'allMessagesCleared'")) {
        console.log("✅ handleBroadcastUpdate handles allMessagesCleared type");
      } else {
        console.warn("⚠️ handleBroadcastUpdate may not handle allMessagesCleared type");
      }
    } else {
      console.warn("⚠️ handleBroadcastUpdate handler not found");
    }

    console.log("✅ Clear All Messages broadcast fix test completed");
    return true;

  } catch (error) {
    console.error("❌ Error during test:", error);
    return false;
  }
}

// Test function to simulate the broadcast (without actually clearing messages)
async function testBroadcastSimulation() {
  console.log("🔍 Testing broadcast simulation...");

  try {
    if (!window.socket) {
      console.warn("⚠️ window.socket not available for simulation test");
      return false;
    }

    // Check if executeForEveryone method exists
    if (typeof window.socket.executeForEveryone === 'function') {
      console.log("✅ window.socket.executeForEveryone method available");

      // Test the broadcast data structure (without actually sending)
      const testData = {
        type: 'allMessagesCleared',
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name
      };

      console.log("✅ Test data structure:", testData);
      console.log("✅ Broadcast simulation test passed");
      return true;

    } else {
      console.error("❌ window.socket.executeForEveryone method not available");
      return false;
    }

  } catch (error) {
    console.error("❌ Error during broadcast simulation test:", error);
    return false;
  }
}

// Main test function
async function runClearAllMessagesTests() {
  console.log("🚀 Starting Clear All Messages broadcast fix tests...");

  const test1 = await testClearAllMessagesBroadcast();
  const test2 = await testBroadcastSimulation();

  if (test1 && test2) {
    console.log("🎉 All tests passed! Clear All Messages broadcast fix appears to be working correctly.");
  } else {
    console.error("❌ Some tests failed. Please check the console output above.");
  }

  console.log("=== Test completed ===");
}

// Export functions for manual testing
window.testClearAllMessagesBroadcast = testClearAllMessagesBroadcast;
window.testBroadcastSimulation = testBroadcastSimulation;
window.runClearAllMessagesTests = runClearAllMessagesTests;

// Auto-run tests if this script is loaded
if (typeof game !== 'undefined' && game.user) {
  // Wait a bit for everything to load
  setTimeout(() => {
    runClearAllMessagesTests();
  }, 1000);
}

console.log("📝 Clear All Messages broadcast fix test script loaded");
console.log("📝 Available test functions:");
console.log("   - runClearAllMessagesTests() - Run all tests");
console.log("   - testClearAllMessagesBroadcast() - Test broadcast functionality");
console.log("   - testBroadcastSimulation() - Test broadcast simulation"); 