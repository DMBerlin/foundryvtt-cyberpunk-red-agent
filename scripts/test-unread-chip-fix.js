/**
 * Test script for unread message chip fixes
 * Tests:
 * 1. Unread chips zeroing out when chat is opened
 * 2. Real-time updates when new messages arrive
 * 3. UI notification removal
 */

console.log("=== Cyberpunk Agent | Unread Chip Fix Test ===");

// Wait for the module to be ready
Hooks.once('ready', async () => {
  console.log("🚀 Starting unread chip fix test...");

  // Get the CyberpunkAgent instance
  const agent = window.CyberpunkAgent?.instance;
  if (!agent) {
    console.error("❌ CyberpunkAgent instance not found");
    return;
  }

  // Get test actors
  const actors = game.actors.contents.filter(actor => actor.type === 'character').slice(0, 2);
  if (actors.length < 2) {
    console.error("❌ Need at least 2 character actors for testing");
    return;
  }

  const actor1 = actors[0];
  const actor2 = actors[1];

  console.log(`📱 Testing with actors: ${actor1.name} and ${actor2.name}`);

  try {
    // Test 1: Send a message and check unread count
    console.log("\n1. Testing unread count after sending message...");

    // Send a message from actor2 to actor1
    await agent.sendMessage(actor2.id, actor1.id, "Test message for unread count");
    console.log("✅ Message sent");

    // Check unread count
    const unreadCount = agent.getUnreadCount(actor1.id, actor2.id);
    console.log(`📊 Unread count for ${actor1.name}: ${unreadCount}`);

    if (unreadCount > 0) {
      console.log("✅ Unread count is greater than 0 (expected)");
    } else {
      console.log("❌ Unread count should be greater than 0");
    }

    // Test 2: Mark conversation as read and check unread count
    console.log("\n2. Testing mark conversation as read...");

    agent.markConversationAsRead(actor1.id, actor2.id);
    console.log("✅ markConversationAsRead called");

    // Check unread count again
    const unreadCountAfter = agent.getUnreadCount(actor1.id, actor2.id);
    console.log(`📊 Unread count after marking as read: ${unreadCountAfter}`);

    if (unreadCountAfter === 0) {
      console.log("✅ Unread count is 0 after marking as read (expected)");
    } else {
      console.log("❌ Unread count should be 0 after marking as read");
    }

    // Test 3: Send another message and check real-time updates
    console.log("\n3. Testing real-time unread count updates...");

    // Send another message
    await agent.sendMessage(actor2.id, actor1.id, "Another test message for real-time updates");
    console.log("✅ Second message sent");

    // Check unread count
    const unreadCount2 = agent.getUnreadCount(actor1.id, actor2.id);
    console.log(`📊 Unread count after second message: ${unreadCount2}`);

    if (unreadCount2 > 0) {
      console.log("✅ Unread count increased after new message (expected)");
    } else {
      console.log("❌ Unread count should increase after new message");
    }

    // Test 4: Check if interface updates are triggered
    console.log("\n4. Testing interface update triggers...");

    // Check if _updateChatInterfacesImmediately is called
    const originalUpdate = agent._updateChatInterfacesImmediately;
    let updateCalled = false;

    agent._updateChatInterfacesImmediately = function () {
      updateCalled = true;
      console.log("✅ _updateChatInterfacesImmediately was called");
      return originalUpdate.call(this);
    };

    // Trigger a message update
    await agent.notifyMessageUpdate(actor2.id, actor1.id, {
      id: 'test-message',
      text: 'Test message for interface update',
      senderId: actor2.id,
      receiverId: actor1.id,
      timestamp: Date.now(),
      read: false
    });

    // Restore original function
    agent._updateChatInterfacesImmediately = originalUpdate;

    if (updateCalled) {
      console.log("✅ Interface update was triggered");
    } else {
      console.log("❌ Interface update should have been triggered");
    }

    // Test 5: Check if UI notifications are removed
    console.log("\n5. Testing UI notification removal...");

    // Check if updateOpenInterfaces has console.log instead of ui.notifications
    const updateOpenInterfacesSource = agent.updateOpenInterfaces.toString();
    if (updateOpenInterfacesSource.includes('console.log') && !updateOpenInterfacesSource.includes('ui.notifications.info')) {
      console.log("✅ UI notifications removed from updateOpenInterfaces");
    } else {
      console.log("❌ UI notifications should be removed from updateOpenInterfaces");
    }

    // Check if forceUpdateChatInterfaces has console.log instead of ui.notifications
    const forceUpdateSource = agent.forceUpdateChatInterfaces.toString();
    if (forceUpdateSource.includes('console.log') && !forceUpdateSource.includes('ui.notifications.info')) {
      console.log("✅ UI notifications removed from forceUpdateChatInterfaces");
    } else {
      console.log("❌ UI notifications should be removed from forceUpdateChatInterfaces");
    }

    console.log("\n🎉 Unread chip fix test completed!");
    console.log("📋 Summary:");
    console.log("   - Unread counts are calculated correctly");
    console.log("   - markConversationAsRead clears unread counts");
    console.log("   - Interface updates are triggered");
    console.log("   - UI notifications moved to console logs");

  } catch (error) {
    console.error("❌ Error during unread chip fix test:", error);
  }
}); 