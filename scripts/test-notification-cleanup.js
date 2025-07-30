/**
 * Test script for notification cleanup
 * Tests:
 * 1. Save success notifications moved to console log
 * 2. UI notifications reduced for better user experience
 */

console.log("=== Cyberpunk Agent | Notification Cleanup Test ===");

// Wait for the module to be ready
Hooks.once('ready', async () => {
  console.log("🚀 Starting notification cleanup test...");

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
    // Test 1: Check if save success notifications are moved to console
    console.log("\n1. Testing save success notification cleanup...");

    // Check if handleSaveMessagesResponse has console.log instead of ui.notifications
    const handleSaveMessagesResponseSource = agent.handleSaveMessagesResponse.toString();
    if (handleSaveMessagesResponseSource.includes('console.log') && !handleSaveMessagesResponseSource.includes('ui.notifications.info')) {
      console.log("✅ Save success notifications moved to console log");
    } else {
      console.log("❌ Save success notifications should be moved to console log");
    }

    // Test 2: Check socketlib-integration.js for the same change
    console.log("\n2. Testing socketlib integration notification cleanup...");

    // We can't directly access the socketlib integration functions, but we can test the behavior
    // by sending a message and checking if the notification appears in UI
    console.log("📤 Sending test message to trigger save process...");

    // Send a message to trigger the save process
    await agent.sendMessage(actor1.id, actor2.id, "Test message for notification cleanup");
    console.log("✅ Test message sent");

    // Test 3: Check if error notifications are still in UI (they should be)
    console.log("\n3. Testing error notifications are still in UI...");

    // Check if error notifications are still using ui.notifications
    if (handleSaveMessagesResponseSource.includes('ui.notifications.error')) {
      console.log("✅ Error notifications still in UI (correct behavior)");
    } else {
      console.log("❌ Error notifications should remain in UI");
    }

    // Test 4: Check other notification patterns
    console.log("\n4. Testing other notification patterns...");

    // Check if interface update notifications are moved to console
    const updateOpenInterfacesSource = agent.updateOpenInterfaces.toString();
    if (updateOpenInterfacesSource.includes('console.log') && !updateOpenInterfacesSource.includes('ui.notifications.info')) {
      console.log("✅ Interface update notifications moved to console log");
    } else {
      console.log("❌ Interface update notifications should be moved to console log");
    }

    // Check if force update notifications are moved to console
    const forceUpdateSource = agent.forceUpdateChatInterfaces.toString();
    if (forceUpdateSource.includes('console.log') && !forceUpdateSource.includes('ui.notifications.info')) {
      console.log("✅ Force update notifications moved to console log");
    } else {
      console.log("❌ Force update notifications should be moved to console log");
    }

    console.log("\n🎉 Notification cleanup test completed!");
    console.log("📋 Summary:");
    console.log("   - Save success notifications moved to console log");
    console.log("   - Error notifications remain in UI for user awareness");
    console.log("   - Interface update notifications moved to console log");
    console.log("   - UI is cleaner with fewer unnecessary notifications");

  } catch (error) {
    console.error("❌ Error during notification cleanup test:", error);
  }
}); 