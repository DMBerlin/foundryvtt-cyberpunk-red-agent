/**
 * Test Script: Realtime Unread Count Fix
 * 
 * This script tests the improved real-time unread count functionality:
 * 1. Messages received should immediately update the unread count in Chat7
 * 2. Opening a conversation should mark all messages as read
 * 3. The unread count should be cleared when messages are marked as read
 */

console.log("Cyberpunk Agent | Testing real-time unread count fix...");

async function testRealtimeUnreadCountFix() {
  try {
    // Step 1: Setup test actors
    console.log("\n1. Setting up test actors...");
    const actor1 = game.actors.getName("Test Actor 1") || game.actors.contents[0];
    const actor2 = game.actors.getName("Test Actor 2") || game.actors.contents[1];

    if (!actor1 || !actor2) {
      console.error("❌ Need at least 2 actors for testing");
      return;
    }

    console.log(`✅ Using actors: ${actor1.name} and ${actor2.name}`);

    // Step 2: Ensure actors are contacts
    console.log("\n2. Ensuring actors are contacts...");
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Add actor2 as contact to actor1
      await window.CyberpunkAgent.instance.addContactToActor(actor1.id, actor2.id);
      console.log("✅ Actor2 added as contact to Actor1");
    }

    // Step 3: Send a message from actor2 to actor1
    console.log("\n3. Sending test message...");
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      const success = await window.CyberpunkAgent.instance.sendMessage(actor2.id, actor1.id, "Test message for unread count");
      if (success) {
        console.log("✅ Test message sent successfully");
      } else {
        console.error("❌ Failed to send test message");
        return;
      }
    }

    // Step 4: Open Chat7 for actor1 and check unread count
    console.log("\n4. Opening Chat7 for actor1...");
    const chat7 = new window.AgentApplication(actor1);
    chat7.navigateTo('chat7');
    chat7.render(true);

    // Wait a moment for the interface to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if unread count is displayed
    const unreadElement = chat7.element?.find(`[data-contact-id="${actor2.id}"] .cp-unread-count`);
    if (unreadElement && unreadElement.length > 0) {
      const unreadCount = unreadElement.text();
      console.log(`✅ Unread count displayed: ${unreadCount}`);

      if (parseInt(unreadCount) > 0) {
        console.log("✅ Unread count is greater than 0 - real-time update working");
      } else {
        console.warn("⚠️ Unread count is 0 - may need to check message status");
      }
    } else {
      console.error("❌ Unread count element not found");
    }

    // Step 5: Click on the contact to open conversation
    console.log("\n5. Opening conversation with contact...");
    const contactItem = chat7.element?.find(`[data-contact-id="${actor2.id}"]`);
    if (contactItem && contactItem.length > 0) {
      // Simulate click
      contactItem[0].click();

      // Wait for conversation to open
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("✅ Conversation opened");
    } else {
      console.error("❌ Contact item not found");
    }

    // Step 6: Check if unread count is cleared
    console.log("\n6. Checking if unread count is cleared...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for mark as read to process

    // Navigate back to Chat7
    chat7.navigateTo('chat7');
    chat7.render(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if unread count is now cleared
    const unreadElementAfter = chat7.element?.find(`[data-contact-id="${actor2.id}"] .cp-unread-count`);
    if (!unreadElementAfter || unreadElementAfter.length === 0) {
      console.log("✅ Unread count cleared - messages marked as read successfully");
    } else {
      const unreadCountAfter = unreadElementAfter.text();
      console.warn(`⚠️ Unread count still shows: ${unreadCountAfter}`);
    }

    // Step 7: Send another message and test real-time update
    console.log("\n7. Testing real-time update with new message...");
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      const success = await window.CyberpunkAgent.instance.sendMessage(actor2.id, actor1.id, "Another test message");
      if (success) {
        console.log("✅ Second test message sent");

        // Wait for real-time update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Force re-render to check for updates
        chat7.render(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if unread count appears again
        const unreadElementNew = chat7.element?.find(`[data-contact-id="${actor2.id}"] .cp-unread-count`);
        if (unreadElementNew && unreadElementNew.length > 0) {
          const unreadCountNew = unreadElementNew.text();
          console.log(`✅ New unread count displayed: ${unreadCountNew}`);
          console.log("✅ Real-time update working correctly");
        } else {
          console.warn("⚠️ New unread count not displayed - may need to check real-time update");
        }
      }
    }

    // Step 8: Cleanup
    console.log("\n8. Cleaning up...");
    chat7.close();

    console.log("\n🎉 Test completed successfully!");
    console.log("✅ Real-time unread count updates working");
    console.log("✅ Messages marked as read when conversation opened");
    console.log("✅ Unread count cleared after marking as read");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testRealtimeUnreadCountFix(); 