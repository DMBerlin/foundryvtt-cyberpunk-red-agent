/**
 * Test script for Chat Message Prevention
 * Run this in the browser console to test if chat messages are being avoided
 */

console.log("Cyberpunk Agent | Testing chat message prevention...");

function testChatMessagePrevention() {
  console.log("=== Chat Message Prevention Test ===");

  // Check if the module is loaded
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not loaded!");
    return false;
  }

  console.log("✅ CyberpunkAgent loaded");

  // Test cross-client communication detection
  console.log("Testing cross-client communication detection...");

  if (typeof window.CyberpunkAgent.instance._needsCrossClientCommunication === 'function') {
    console.log("✅ _needsCrossClientCommunication method available");

    const needsCommunication = window.CyberpunkAgent.instance._needsCrossClientCommunication();
    const userCount = game.users.size;

    console.log(`📊 Users in session: ${userCount}`);
    console.log(`📊 Needs cross-client communication: ${needsCommunication}`);

    if (userCount === 1 && !needsCommunication) {
      console.log("✅ Correctly detected single user session");
    } else if (userCount > 1 && needsCommunication) {
      console.log("✅ Correctly detected multi-user session");
    } else {
      console.warn("⚠️ Cross-client communication detection may not be working correctly");
    }
  } else {
    console.error("❌ _needsCrossClientCommunication method not available");
    return false;
  }

  // Test notification method
  console.log("Testing notification method...");

  if (typeof window.CyberpunkAgent.instance.notifyContactUpdate === 'function') {
    console.log("✅ notifyContactUpdate method available");
  } else {
    console.error("❌ notifyContactUpdate method not available");
    return false;
  }

  // Test broadcast method
  console.log("Testing broadcast method...");

  if (typeof window.CyberpunkAgent.instance.broadcastContactUpdate === 'function') {
    console.log("✅ broadcastContactUpdate method available");
  } else {
    console.error("❌ broadcastContactUpdate method not available");
    return false;
  }

  console.log("=== Chat message prevention tests completed successfully! ===");
  return true;
}

function testSingleUserBehavior() {
  console.log("=== Single User Behavior Test ===");

  // Check if there's only one user
  if (game.users.size !== 1) {
    console.warn("⚠️ This test requires a single user session");
    console.log(`💡 Current users: ${game.users.size}`);
    return false;
  }

  console.log("✅ Single user session detected");

  // Test that notifications are skipped for single user
  console.log("Testing notification behavior for single user...");

  try {
    // Store original console.log to capture output
    const originalLog = console.log;
    let logOutput = '';
    console.log = function (...args) {
      logOutput += args.join(' ') + '\n';
      originalLog.apply(console, args);
    };

    // Trigger a notification
    window.CyberpunkAgent.instance.notifyContactUpdate();

    // Restore console.log
    console.log = originalLog;

    // Check if the skip message was logged
    if (logOutput.includes('Single user session, skipping cross-client notification')) {
      console.log("✅ Correctly skipped cross-client notification for single user");
    } else {
      console.warn("⚠️ Cross-client notification may not have been skipped");
    }

  } catch (error) {
    console.error("❌ Error during single user test:", error);
    return false;
  }

  console.log("=== Single user behavior test completed! ===");
  return true;
}

function testMultiUserBehavior() {
  console.log("=== Multi User Behavior Test ===");

  // Check if there are multiple users
  if (game.users.size <= 1) {
    console.warn("⚠️ This test requires multiple users");
    console.log(`💡 Current users: ${game.users.size}`);
    return false;
  }

  console.log("✅ Multi-user session detected");

  // Test that notifications are sent for multiple users
  console.log("Testing notification behavior for multiple users...");

  try {
    // Store original console.log to capture output
    const originalLog = console.log;
    let logOutput = '';
    console.log = function (...args) {
      logOutput += args.join(' ') + '\n';
      originalLog.apply(console, args);
    };

    // Trigger a notification
    window.CyberpunkAgent.instance.notifyContactUpdate();

    // Restore console.log
    console.log = originalLog;

    // Check if the notification was sent
    if (logOutput.includes('Sending contact update notification to all clients')) {
      console.log("✅ Correctly sent cross-client notification for multiple users");
    } else {
      console.warn("⚠️ Cross-client notification may not have been sent");
    }

  } catch (error) {
    console.error("❌ Error during multi-user test:", error);
    return false;
  }

  console.log("=== Multi-user behavior test completed! ===");
  return true;
}

function testInvisibleChatMessages() {
  console.log("=== Invisible Chat Messages Test ===");

  // Check if we can create a test message
  if (!game.user.isGM) {
    console.warn("⚠️ This test requires GM permissions");
    return false;
  }

  console.log("✅ GM permissions confirmed");

  try {
    // Test the broadcast method
    const testData = {
      type: 'contactUpdate',
      data: {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        test: true
      }
    };

    // Create a test message
    window.CyberpunkAgent.instance.broadcastContactUpdate(testData);

    console.log("✅ Test message created successfully");

    // Check if CSS is applied to hide messages
    const styleSheets = Array.from(document.styleSheets);
    const cyberpunkStyles = styleSheets.find(sheet =>
      sheet.href && sheet.href.includes('cyberpunk-agent')
    );

    if (cyberpunkStyles) {
      console.log("✅ Cyberpunk Agent CSS loaded");
    } else {
      console.warn("⚠️ Cyberpunk Agent CSS may not be loaded");
    }

    // Check for invisible message styles
    const invisibleStyles = document.querySelector('style[data-cyberpunk-agent]') ||
      document.querySelector('link[href*="cyberpunk-agent"]');

    if (invisibleStyles) {
      console.log("✅ Invisible message styles found");
    } else {
      console.log("ℹ️ Invisible message styles may be in external CSS");
    }

  } catch (error) {
    console.error("❌ Error during invisible message test:", error);
    return false;
  }

  console.log("=== Invisible chat messages test completed! ===");
  return true;
}

function checkCurrentChatMessages() {
  console.log("=== Current Chat Messages Check ===");

  // Get all chat messages
  const chatMessages = game.messages.contents;
  const cyberpunkMessages = chatMessages.filter(msg =>
    msg.flags && msg.flags['cyberpunk-agent']
  );

  console.log(`📊 Total chat messages: ${chatMessages.length}`);
  console.log(`📊 Cyberpunk Agent messages: ${cyberpunkMessages.length}`);

  if (cyberpunkMessages.length > 0) {
    console.log("📋 Cyberpunk Agent messages found:");
    cyberpunkMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ID: ${msg.id}, User: ${msg.user.name}, Visible: ${!msg.data.blind}`);
    });
  } else {
    console.log("✅ No Cyberpunk Agent messages found");
  }

  // Check for visible cyberpunk messages
  const visibleCyberpunkMessages = cyberpunkMessages.filter(msg => !msg.data.blind);

  if (visibleCyberpunkMessages.length > 0) {
    console.warn("⚠️ Found visible Cyberpunk Agent messages!");
    visibleCyberpunkMessages.forEach((msg, index) => {
      console.warn(`  ${index + 1}. ID: ${msg.id}, User: ${msg.user.name}`);
    });
  } else {
    console.log("✅ All Cyberpunk Agent messages are properly hidden");
  }

  return {
    total: chatMessages.length,
    cyberpunk: cyberpunkMessages.length,
    visible: visibleCyberpunkMessages.length
  };
}

// Main test function
function runAllChatMessageTests() {
  console.log("🚀 Starting Chat Message Prevention comprehensive tests...");

  const results = {
    prevention: testChatMessagePrevention(),
    singleUser: testSingleUserBehavior(),
    multiUser: testMultiUserBehavior(),
    invisible: testInvisibleChatMessages(),
    current: checkCurrentChatMessages()
  };

  console.log("=== Chat Message Test Results Summary ===");
  console.log("Message Prevention:", results.prevention ? "✅ PASS" : "❌ FAIL");
  console.log("Single User Behavior:", results.singleUser ? "✅ PASS" : "❌ FAIL");
  console.log("Multi User Behavior:", results.multiUser ? "✅ PASS" : "❌ FAIL");
  console.log("Invisible Messages:", results.invisible ? "✅ PASS" : "❌ FAIL");

  if (results.current) {
    console.log("Current Messages:", results.current.visible === 0 ? "✅ PASS" : "❌ FAIL");
  }

  const allPassed = Object.values(results).every(result =>
    result === true || (typeof result === 'object' && result.visible === 0)
  );

  if (allPassed) {
    console.log("🎉 All chat message tests passed! Messages are being properly handled.");
  } else {
    console.log("⚠️ Some chat message tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Make test functions globally available
window.testChatMessagePrevention = testChatMessagePrevention;
window.testSingleUserBehavior = testSingleUserBehavior;
window.testMultiUserBehavior = testMultiUserBehavior;
window.testInvisibleChatMessages = testInvisibleChatMessages;
window.checkCurrentChatMessages = checkCurrentChatMessages;
window.runAllChatMessageTests = runAllChatMessageTests;

console.log("Cyberpunk Agent | Chat message prevention test functions loaded");
console.log("Run 'runAllChatMessageTests()' to test everything");
console.log("Run 'checkCurrentChatMessages()' to check current messages"); 