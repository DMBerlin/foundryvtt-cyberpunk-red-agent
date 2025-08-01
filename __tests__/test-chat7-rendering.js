/**
 * Test Script: Chat7 Contact List Rendering
 * 
 * This script tests that the Chat7 (contact list) screen re-renders properly:
 * 1. When opened (fresh data)
 * 2. When new messages arrive (real-time updates)
 * 3. When "mark all messages as read" is used
 * 
 * Usage: Run this script in the browser console
 */

console.log("Cyberpunk Agent | Testing Chat7 contact list rendering...");

async function testChat7Rendering() {
  try {
    // Get the CyberpunkAgent instance
    const agent = window.CyberpunkAgent?.instance;
    if (!agent) {
      console.error("❌ CyberpunkAgent instance not found");
      return;
    }

    console.log("✅ CyberpunkAgent instance found");

    // Get test actors
    const actors = agent.getUserActors();
    if (actors.length < 2) {
      console.error("❌ Need at least 2 actors for testing");
      return;
    }

    const actor1 = actors[0];
    const actor2 = actors[1];

    console.log(`✅ Test actors: ${actor1.name} and ${actor2.name}`);

    // Test 1: Verify Chat7Application renders with fresh data when opened
    console.log("\n🧪 Test 1: Chat7Application renders with fresh data when opened");

    // Create a Chat7Application instance
    const Chat7Class = Chat7Application || window.Chat7Application;
    if (!Chat7Class) {
      console.error("❌ Chat7Application class not found");
      return;
    }

    const chat7App = new Chat7Class(actor1);

    // Check if getData method returns fresh data
    const data = chat7App.getData();
    console.log("✅ Chat7Application.getData() returns data:", {
      actor: data.actor?.name,
      contactsCount: data.contacts?.length,
      hasUnreadCounts: data.contacts?.some(c => c.unreadCount > 0)
    });

    // Test 2: Verify real-time listener is set up
    console.log("\n🧪 Test 2: Real-time listener setup");

    // Check if _setupRealtimeListener method exists
    if (typeof chat7App._setupRealtimeListener === 'function') {
      console.log("✅ _setupRealtimeListener method exists");
    } else {
      console.error("❌ _setupRealtimeListener method not found");
    }

    // Test 3: Verify message update event triggers re-render
    console.log("\n🧪 Test 3: Message update event triggers re-render");

    // Mock the render method to track calls
    const originalRender = chat7App.render;
    let renderCallCount = 0;
    chat7App.render = function (force = false, options = {}) {
      renderCallCount++;
      console.log(`✅ Chat7Application.render() called (call #${renderCallCount})`);
      return originalRender.call(this, force, options);
    };

    // Dispatch a message update event
    document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
      detail: {
        timestamp: Date.now(),
        type: 'messageUpdate',
        senderId: actor2.id,
        receiverId: actor1.id,
        message: {
          id: 'test-message-' + Date.now(),
          text: 'Test message for rendering',
          timestamp: Date.now()
        }
      }
    }));

    // Wait a bit for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    if (renderCallCount > 0) {
      console.log(`✅ Message update event triggered ${renderCallCount} render call(s)`);
    } else {
      console.warn("⚠️ Message update event did not trigger render call");
    }

    // Test 4: Verify contact update event triggers re-render
    console.log("\n🧪 Test 4: Contact update event triggers re-render");

    // Reset render call count
    renderCallCount = 0;

    // Dispatch a contact update event
    document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
      detail: {
        timestamp: Date.now(),
        type: 'contactUpdate'
      }
    }));

    // Wait a bit for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    if (renderCallCount > 0) {
      console.log(`✅ Contact update event triggered ${renderCallCount} render call(s)`);
    } else {
      console.warn("⚠️ Contact update event did not trigger render call");
    }

    // Test 5: Verify "mark all messages as read" triggers re-render
    console.log("\n🧪 Test 5: Mark all messages as read triggers re-render");

    // Reset render call count
    renderCallCount = 0;

    // Call the _markAllMessagesAsRead method
    if (typeof chat7App._markAllMessagesAsRead === 'function') {
      console.log("✅ _markAllMessagesAsRead method exists");

      // Mock the markConversationAsRead method to avoid actual processing
      const originalMarkAsRead = agent.markConversationAsRead;
      agent.markConversationAsRead = function (actorId1, actorId2) {
        console.log(`✅ markConversationAsRead called for ${actorId1} and ${actorId2}`);
        return originalMarkAsRead.call(this, actorId1, actorId2);
      };

      await chat7App._markAllMessagesAsRead(actor2.id);

      // Wait a bit for the method to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (renderCallCount > 0) {
        console.log(`✅ Mark all messages as read triggered ${renderCallCount} render call(s)`);
      } else {
        console.warn("⚠️ Mark all messages as read did not trigger render call");
      }

      // Restore original method
      agent.markConversationAsRead = originalMarkAsRead;
    } else {
      console.error("❌ _markAllMessagesAsRead method not found");
    }

    // Test 6: Verify real-time listener is properly set up in activateListeners
    console.log("\n🧪 Test 6: Real-time listener setup in activateListeners");

    // Check if activateListeners calls _setupRealtimeListener
    const originalActivateListeners = chat7App.activateListeners;
    let setupRealtimeListenerCalled = false;

    chat7App._setupRealtimeListener = function () {
      setupRealtimeListenerCalled = true;
      console.log("✅ _setupRealtimeListener called");
    };

    // Call activateListeners
    chat7App.activateListeners(document.createElement('div'));

    if (setupRealtimeListenerCalled) {
      console.log("✅ activateListeners properly calls _setupRealtimeListener");
    } else {
      console.error("❌ activateListeners does not call _setupRealtimeListener");
    }

    // Restore original methods
    chat7App.render = originalRender;
    chat7App.activateListeners = originalActivateListeners;

    console.log("\n🎉 Chat7 rendering tests completed!");

  } catch (error) {
    console.error("❌ Error during Chat7 rendering tests:", error);
  }
}

// Export for global access
window.testChat7Rendering = testChat7Rendering;

console.log("Cyberpunk Agent | Chat7 rendering test script loaded");
console.log("Run testChat7Rendering() to test the contact list rendering functionality"); 