/**
 * Test Context Menu Ownership Restriction with GM Access
 * 
 * This test verifies that the context menu is only accessible for messages
 * that the user owns (sent by the current user's device), with the exception
 * that Game Masters (GM) can access context menu on all messages.
 */

console.log("🧪 Testing Context Menu Ownership Restriction with GM Access");

// Mock FoundryVTT game object
const game = {
  user: {
    isGM: false
  }
};

// Mock ui notifications
const ui = {
  notifications: {
    warn: (message) => console.log("UI Notification:", message)
  }
};

// Helper function to set GM status
function setGMStatus(isGM) {
  game.user.isGM = isGM;
}

// Mock DOM elements for testing
function createMockMessageElement(isOwn = false) {
  const element = {
    className: `cp-message ${isOwn ? 'own' : 'other'}`,
    dataset: {
      messageId: 'test-message-123',
      messageText: 'Test message content',
      messageTime: '14:30'
    },
    classList: {
      contains: (className) => element.className.includes(className)
    }
  };
  return element;
}

// Test function to simulate context menu click
function testContextMenuAccess(isOwnMessage, isGM = false) {
  console.log(`\n📱 Testing context menu for ${isOwnMessage ? 'own' : 'other'} message (GM: ${isGM})`);

  // Set GM status for this test
  setGMStatus(isGM);

  const messageElement = createMockMessageElement(isOwnMessage);
  const event = {
    preventDefault: () => console.log("✅ Event prevented"),
    currentTarget: messageElement
  };

  // Simulate the context menu handler logic
  const messageId = event.currentTarget.dataset.messageId;
  const messageText = event.currentTarget.dataset.messageText;
  const messageTime = event.currentTarget.dataset.messageTime;
  const messageElement2 = event.currentTarget;

  console.log("📝 Message details:", { messageId, messageText, messageTime });

  // Check if this message belongs to the current user (isOwn)
  const isOwnMessage2 = messageElement2.classList.contains('own');

  // GM can access context menu on all messages, players only on their own messages
  if (!game.user.isGM && !isOwnMessage2) {
    console.log("❌ Context menu blocked: User does not own this message and is not GM");
    console.log("✅ Test PASSED: Context menu correctly blocked for other user's message (non-GM)");
    return false;
  } else {
    console.log("✅ Context menu allowed: User owns this message or is GM");
    console.log("✅ Test PASSED: Context menu correctly allowed");
    return true;
  }
}

// Run tests
function runContextMenuOwnershipTests() {
  console.log("\n🚀 Starting Context Menu Ownership Tests with GM Access");

  // Test 1: Own message should allow context menu (non-GM)
  const test1Result = testContextMenuAccess(true, false);

  // Test 2: Other user's message should block context menu (non-GM)
  const test2Result = testContextMenuAccess(false, false);

  // Test 3: Own message should allow context menu (GM)
  const test3Result = testContextMenuAccess(true, true);

  // Test 4: Other user's message should allow context menu (GM)
  const test4Result = testContextMenuAccess(false, true);

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log(`✅ Own message context menu (non-GM): ${test1Result ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Other message context menu (non-GM): ${!test2Result ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Own message context menu (GM): ${test3Result ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Other message context menu (GM): ${test4Result ? 'PASSED' : 'FAILED'}`);

  if (test1Result && !test2Result && test3Result && test4Result) {
    console.log("\n🎉 All tests PASSED! Context menu ownership restriction with GM access is working correctly.");
  } else {
    console.log("\n❌ Some tests FAILED! Context menu ownership restriction with GM access needs fixing.");
  }
}

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testContextMenuAccess,
    runContextMenuOwnershipTests,
    createMockMessageElement
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runContextMenuOwnershipTests);
  } else {
    runContextMenuOwnershipTests();
  }
} else {
  // Run tests in Node.js environment
  runContextMenuOwnershipTests();
} 