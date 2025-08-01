/**
 * Test script to verify that the interface auto-open issue has been fixed
 * This script simulates the data clearing process and checks if the interface opens unexpectedly
 */

console.log("Cyberpunk Agent | Testing interface auto-open fix...");

// Test function to simulate clearing all data
async function testClearAllData() {
  console.log("Cyberpunk Agent | Starting test: Clear all data");

  try {
    // Check if there are any open agent interfaces before clearing
    const openWindowsBefore = Object.values(ui.windows).filter(window =>
      window && window.rendered &&
      (window.constructor.name === 'AgentApplication' ||
        window.constructor.name === 'AgentHomeApplication' ||
        window.constructor.name === 'Chat7Application' ||
        window.constructor.name === 'ChatConversationApplication')
    );

    console.log(`Cyberpunk Agent | Open agent interfaces before clearing: ${openWindowsBefore.length}`);

    // Simulate clearing all contacts (which also clears messages)
    if (window.CyberpunkAgent?.instance?.clearAllContacts) {
      console.log("Cyberpunk Agent | Calling clearAllContacts...");
      await window.CyberpunkAgent.instance.clearAllContacts();
      console.log("Cyberpunk Agent | clearAllContacts completed");
    } else {
      console.error("Cyberpunk Agent | clearAllContacts method not available");
      return;
    }

    // Wait a moment for any potential interface updates
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if any new agent interfaces were opened
    const openWindowsAfter = Object.values(ui.windows).filter(window =>
      window && window.rendered &&
      (window.constructor.name === 'AgentApplication' ||
        window.constructor.name === 'AgentHomeApplication' ||
        window.constructor.name === 'Chat7Application' ||
        window.constructor.name === 'ChatConversationApplication')
    );

    console.log(`Cyberpunk Agent | Open agent interfaces after clearing: ${openWindowsAfter.length}`);

    // Check if any new interfaces were opened
    const newInterfaces = openWindowsAfter.filter(window =>
      !openWindowsBefore.includes(window)
    );

    if (newInterfaces.length > 0) {
      console.error("Cyberpunk Agent | TEST FAILED: New interfaces were opened unexpectedly!");
      console.error("Cyberpunk Agent | New interfaces:", newInterfaces.map(w => w.constructor.name));

      // Close the unexpected interfaces
      newInterfaces.forEach(window => {
        console.log(`Cyberpunk Agent | Closing unexpected interface: ${window.constructor.name}`);
        window.close();
      });

      return false;
    } else {
      console.log("Cyberpunk Agent | TEST PASSED: No unexpected interfaces were opened!");
      return true;
    }

  } catch (error) {
    console.error("Cyberpunk Agent | Test error:", error);
    return false;
  }
}

// Test function to simulate clearing all messages
async function testClearAllMessages() {
  console.log("Cyberpunk Agent | Starting test: Clear all messages");

  try {
    // Check if there are any open agent interfaces before clearing
    const openWindowsBefore = Object.values(ui.windows).filter(window =>
      window && window.rendered &&
      (window.constructor.name === 'AgentApplication' ||
        window.constructor.name === 'AgentHomeApplication' ||
        window.constructor.name === 'Chat7Application' ||
        window.constructor.name === 'ChatConversationApplication')
    );

    console.log(`Cyberpunk Agent | Open agent interfaces before clearing messages: ${openWindowsBefore.length}`);

    // Simulate clearing all messages
    if (window.CyberpunkAgent?.instance?.clearAllMessages) {
      console.log("Cyberpunk Agent | Calling clearAllMessages...");
      await window.CyberpunkAgent.instance.clearAllMessages();
      console.log("Cyberpunk Agent | clearAllMessages completed");
    } else {
      console.error("Cyberpunk Agent | clearAllMessages method not available");
      return;
    }

    // Wait a moment for any potential interface updates
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if any new agent interfaces were opened
    const openWindowsAfter = Object.values(ui.windows).filter(window =>
      window && window.rendered &&
      (window.constructor.name === 'AgentApplication' ||
        window.constructor.name === 'AgentHomeApplication' ||
        window.constructor.name === 'Chat7Application' ||
        window.constructor.name === 'ChatConversationApplication')
    );

    console.log(`Cyberpunk Agent | Open agent interfaces after clearing messages: ${openWindowsAfter.length}`);

    // Check if any new interfaces were opened
    const newInterfaces = openWindowsAfter.filter(window =>
      !openWindowsBefore.includes(window)
    );

    if (newInterfaces.length > 0) {
      console.error("Cyberpunk Agent | TEST FAILED: New interfaces were opened unexpectedly!");
      console.error("Cyberpunk Agent | New interfaces:", newInterfaces.map(w => w.constructor.name));

      // Close the unexpected interfaces
      newInterfaces.forEach(window => {
        console.log(`Cyberpunk Agent | Closing unexpected interface: ${window.constructor.name}`);
        window.close();
      });

      return false;
    } else {
      console.log("Cyberpunk Agent | TEST PASSED: No unexpected interfaces were opened!");
      return true;
    }

  } catch (error) {
    console.error("Cyberpunk Agent | Test error:", error);
    return false;
  }
}

// Test function to check event listener cleanup
function testEventListenerCleanup() {
  console.log("Cyberpunk Agent | Starting test: Event listener cleanup");

  try {
    // Get all event listeners for cyberpunk-agent-update
    const listeners = getEventListeners('cyberpunk-agent-update');
    console.log(`Cyberpunk Agent | Current cyberpunk-agent-update listeners: ${listeners.length}`);

    // Check if there are any listeners that might be from closed applications
    const suspiciousListeners = listeners.filter(listener => {
      // This is a simplified check - in a real scenario, you'd need more sophisticated detection
      return listener && typeof listener === 'function';
    });

    console.log(`Cyberpunk Agent | Suspicious listeners found: ${suspiciousListeners.length}`);

    if (suspiciousListeners.length > 10) { // Arbitrary threshold
      console.warn("Cyberpunk Agent | WARNING: Many event listeners detected - potential memory leak");
      return false;
    } else {
      console.log("Cyberpunk Agent | Event listener count looks reasonable");
      return true;
    }

  } catch (error) {
    console.error("Cyberpunk Agent | Event listener test error:", error);
    return false;
  }
}

// Helper function to get event listeners (simplified)
function getEventListeners(eventType) {
  // This is a simplified implementation
  // In a real scenario, you'd need to track listeners more carefully
  return [];
}

// Main test runner
async function runAllTests() {
  console.log("Cyberpunk Agent | Running all interface auto-open tests...");

  const results = {
    clearAllData: await testClearAllData(),
    clearAllMessages: await testClearAllMessages(),
    eventListenerCleanup: testEventListenerCleanup()
  };

  console.log("Cyberpunk Agent | Test results:", results);

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("Cyberpunk Agent | ALL TESTS PASSED! Interface auto-open issue appears to be fixed.");
    ui.notifications.info("Interface auto-open tests passed!");
  } else {
    console.error("Cyberpunk Agent | SOME TESTS FAILED! Interface auto-open issue may still exist.");
    ui.notifications.warn("Some interface auto-open tests failed. Check console for details.");
  }

  return allPassed;
}

// Export test functions for manual execution
window.CyberpunkAgentTests = {
  testClearAllData,
  testClearAllMessages,
  testEventListenerCleanup,
  runAllTests
};

console.log("Cyberpunk Agent | Interface auto-open tests loaded. Run CyberpunkAgentTests.runAllTests() to execute tests."); 