/**
 * Test Player-to-Player Contact List Update
 * 
 * This test verifies that real-time contact list updates work correctly
 * for player-to-player communication.
 */

console.log("Cyberpunk Agent | Starting Player-to-Player Contact List Update Test...");

async function testPlayerToPlayerContactUpdate() {
  try {
    // Check if the agent instance is available
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
      console.error("❌ CyberpunkAgent instance not available");
      return false;
    }

    const agent = window.CyberpunkAgent.instance;
    console.log("✅ CyberpunkAgent instance found");

    // Get test devices
    const devices = Array.from(agent.devices.values());
    if (devices.length < 2) {
      console.error("❌ Need at least 2 devices for this test");
      return false;
    }

    // Find two different player devices (not GM devices)
    let playerDeviceA = null;
    let playerDeviceB = null;

    for (const device of devices) {
      const actor = game.actors.get(device.ownerActorId);
      if (actor && actor.ownership) {
        // Check if this is a player-owned device (not GM)
        const isPlayerDevice = Object.keys(actor.ownership).some(userId => {
          const user = game.users.get(userId);
          return user && !user.isGM && actor.ownership[userId] === 1;
        });

        if (isPlayerDevice) {
          if (!playerDeviceA) {
            playerDeviceA = device;
          } else if (!playerDeviceB && device.id !== playerDeviceA.id) {
            playerDeviceB = device;
            break;
          }
        }
      }
    }

    // If we can't find two player devices, use the first two devices
    if (!playerDeviceA || !playerDeviceB) {
      playerDeviceA = devices[0];
      playerDeviceB = devices[1];
      console.log("⚠️ Could not determine player devices, using first two devices");
    }

    console.log(`📱 Testing with devices: ${playerDeviceA.deviceName} (${playerDeviceA.id}) and ${playerDeviceB.deviceName} (${playerDeviceB.id})`);

    // Clear existing contacts between these devices
    console.log("🧹 Clearing existing contacts between devices...");
    if (agent.isDeviceContact(playerDeviceA.id, playerDeviceB.id)) {
      await agent.removeContactFromDevice(playerDeviceA.id, playerDeviceB.id);
    }
    if (agent.isDeviceContact(playerDeviceB.id, playerDeviceA.id)) {
      await agent.removeContactFromDevice(playerDeviceB.id, playerDeviceA.id);
    }

    // Verify devices are not contacts initially
    const isContactBefore = agent.isDeviceContact(playerDeviceA.id, playerDeviceB.id);
    console.log(`📋 Player A has Player B as contact before test: ${isContactBefore}`);

    if (isContactBefore) {
      console.error("❌ Devices should not be contacts initially");
      return false;
    }

    // Test 1: Player A messaging Player B
    console.log("\n🧪 Test 1: Player A messaging Player B");

    // Open Agent interface for Player A
    console.log("🔧 Opening Agent interface for Player A...");
    const playerAAgentWindow = await agent.showAgentHome(playerDeviceA);

    if (!playerAAgentWindow || !playerAAgentWindow.rendered) {
      console.error("❌ Failed to open Player A Agent interface");
      return false;
    }

    console.log("✅ Player A Agent interface opened successfully");

    // Navigate to Chat7 view
    console.log("📱 Navigating to Chat7 view...");
    playerAAgentWindow.navigateTo('chat7');

    // Wait a moment for the view to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial contact count for Player A
    const playerAInitialContacts = agent.getContactsForDevice(playerDeviceA.id);
    console.log(`📋 Player A initial contacts count: ${playerAInitialContacts.length}`);

    // Send a message from Player A to Player B
    console.log("💬 Sending message from Player A to Player B...");
    const playerAToBMessage = `Test message from Player A to Player B at ${new Date().toLocaleTimeString()}`;
    const playerAMessageSent = await agent.sendDeviceMessage(playerDeviceA.id, playerDeviceB.id, playerAToBMessage);

    if (!playerAMessageSent) {
      console.error("❌ Failed to send Player A message");
      return false;
    }

    console.log("✅ Player A message sent successfully");

    // Wait a moment for the contact update to process
    console.log("⏳ Waiting for contact update to process...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if Player B was automatically added to Player A's contacts
    const playerAHasPlayerBContact = agent.isDeviceContact(playerDeviceA.id, playerDeviceB.id);
    console.log(`📋 Player A has Player B as contact after Player A message: ${playerAHasPlayerBContact}`);

    if (!playerAHasPlayerBContact) {
      console.error("❌ Player B should have been automatically added to Player A's contacts");
      return false;
    }

    // Check if Player A's contact list UI has been updated
    console.log("🔍 Checking if Player A's contact list UI has been updated...");

    // Force a re-render to ensure we get the latest data
    playerAAgentWindow.render(true);

    // Wait for the re-render to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if Player B appears in Player A's contact list
    const playerAContactElements = playerAAgentWindow.element.find('.contact-item');
    let playerBFoundInPlayerAList = false;

    playerAContactElements.each((index, element) => {
      const contactId = $(element).data('contact-id');
      if (contactId === playerDeviceB.id) {
        playerBFoundInPlayerAList = true;
        console.log("✅ Player B found in Player A's contact list UI");
      }
    });

    if (!playerBFoundInPlayerAList) {
      console.warn("⚠️ Player B not found in Player A's contact list UI - this might be a UI update issue");
    }

    // Test 2: Player B messaging Player A
    console.log("\n🧪 Test 2: Player B messaging Player A");

    // Close Player A's agent window
    if (playerAAgentWindow && playerAAgentWindow.close) {
      playerAAgentWindow.close();
    }

    // Open Agent interface for Player B
    console.log("🔧 Opening Agent interface for Player B...");
    const playerBAgentWindow = await agent.showAgentHome(playerDeviceB);

    if (!playerBAgentWindow || !playerBAgentWindow.rendered) {
      console.error("❌ Failed to open Player B Agent interface");
      return false;
    }

    console.log("✅ Player B Agent interface opened successfully");

    // Navigate to Chat7 view
    console.log("📱 Navigating to Chat7 view...");
    playerBAgentWindow.navigateTo('chat7');

    // Wait a moment for the view to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial contact count for Player B
    const playerBInitialContacts = agent.getContactsForDevice(playerDeviceB.id);
    console.log(`📋 Player B initial contacts count: ${playerBInitialContacts.length}`);

    // Send a message from Player B to Player A
    console.log("💬 Sending message from Player B to Player A...");
    const playerBToAMessage = `Test message from Player B to Player A at ${new Date().toLocaleTimeString()}`;
    const playerBMessageSent = await agent.sendDeviceMessage(playerDeviceB.id, playerDeviceA.id, playerBToAMessage);

    if (!playerBMessageSent) {
      console.error("❌ Failed to send Player B message");
      return false;
    }

    console.log("✅ Player B message sent successfully");

    // Wait a moment for the contact update to process
    console.log("⏳ Waiting for contact update to process...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if Player A was automatically added to Player B's contacts
    const playerBHasPlayerAContact = agent.isDeviceContact(playerDeviceB.id, playerDeviceA.id);
    console.log(`📋 Player B has Player A as contact after Player B message: ${playerBHasPlayerAContact}`);

    if (!playerBHasPlayerAContact) {
      console.error("❌ Player A should have been automatically added to Player B's contacts");
      return false;
    }

    // Check if Player B's contact list UI has been updated
    console.log("🔍 Checking if Player B's contact list UI has been updated...");

    // Force a re-render to ensure we get the latest data
    playerBAgentWindow.render(true);

    // Wait for the re-render to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if Player A appears in Player B's contact list
    const playerBContactElements = playerBAgentWindow.element.find('.contact-item');
    let playerAFoundInPlayerBList = false;

    playerBContactElements.each((index, element) => {
      const contactId = $(element).data('contact-id');
      if (contactId === playerDeviceA.id) {
        playerAFoundInPlayerBList = true;
        console.log("✅ Player A found in Player B's contact list UI");
      }
    });

    if (!playerAFoundInPlayerBList) {
      console.warn("⚠️ Player A not found in Player B's contact list UI - this might be a UI update issue");

      // Try to manually trigger a contact update event
      console.log("🔄 Manually triggering contact update event...");
      document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
        detail: {
          type: 'contactUpdate',
          deviceId: playerDeviceB.id,
          contactDeviceId: playerDeviceA.id,
          action: 'auto-add',
          reason: 'test',
          timestamp: Date.now()
        }
      }));

      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 1000));
      playerBAgentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const playerBContactElementsAfter = playerBAgentWindow.element.find('.contact-item');
      playerAFoundInPlayerBList = false;

      playerBContactElementsAfter.each((index, element) => {
        const contactId = $(element).data('contact-id');
        if (contactId === playerDeviceA.id) {
          playerAFoundInPlayerBList = true;
          console.log("✅ Player A found in Player B's contact list UI after manual trigger");
        }
      });
    }

    // Test 3: Verify bidirectional contact relationship
    console.log("\n🧪 Test 3: Verifying bidirectional contact relationship");

    const playerAHasPlayerB = agent.isDeviceContact(playerDeviceA.id, playerDeviceB.id);
    const playerBHasPlayerA = agent.isDeviceContact(playerDeviceB.id, playerDeviceA.id);

    console.log(`📋 Player A has Player B as contact: ${playerAHasPlayerB}`);
    console.log(`📋 Player B has Player A as contact: ${playerBHasPlayerA}`);

    if (!playerAHasPlayerB || !playerBHasPlayerA) {
      console.error("❌ Bidirectional contact relationship not established");
      return false;
    }

    console.log("✅ Bidirectional contact relationship verified");

    // Test 4: Test conversation access
    console.log("\n🧪 Test 4: Testing conversation access");

    // Try to open conversation from Player B's contact list
    const playerAElement = playerBAgentWindow.element.find(`[data-contact-id="${playerDeviceA.id}"]`);
    if (playerAElement.length > 0) {
      playerAElement.find('.contact-chat-button').click();

      // Wait for conversation to open
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we're in conversation view
      if (playerBAgentWindow.currentView === 'conversation' && playerBAgentWindow.currentContact && playerBAgentWindow.currentContact.id === playerDeviceA.id) {
        console.log("✅ Conversation with Player A opened successfully from Player B's contact list");

        // Check if the test messages are visible
        const messageElements = playerBAgentWindow.element.find('.message');
        let playerAMessageFound = false;
        let playerBMessageFound = false;

        messageElements.each((index, element) => {
          const messageText = $(element).find('.message-text').text();
          if (messageText.includes(playerAToBMessage)) {
            playerAMessageFound = true;
            console.log("✅ Player A's message found in conversation");
          }
          if (messageText.includes(playerBToAMessage)) {
            playerBMessageFound = true;
            console.log("✅ Player B's message found in conversation");
          }
        });

        if (!playerAMessageFound || !playerBMessageFound) {
          console.warn("⚠️ Some test messages not found in conversation - this might be a message display issue");
        }
      } else {
        console.warn("⚠️ Failed to open conversation with Player A from Player B's contact list");
      }
    } else {
      console.warn("⚠️ Could not find Player A element in Player B's contact list to test conversation");
    }

    // Test 5: Test SocketLib propagation
    console.log("\n🧪 Test 5: Testing SocketLib propagation");

    // Check if SocketLib is available
    if (agent.socketLibIntegration && agent.socketLibIntegration.isAvailable) {
      console.log("✅ SocketLib is available for testing");

      // Test sending a message via SocketLib to verify propagation
      const testMessage = `SocketLib test message at ${new Date().toLocaleTimeString()}`;
      const socketLibMessageSent = await agent.sendDeviceMessage(playerDeviceA.id, playerDeviceB.id, testMessage);

      if (socketLibMessageSent) {
        console.log("✅ SocketLib message sent successfully");

        // Wait for SocketLib propagation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if the message was received
        const messages = agent.getMessagesForDeviceConversation(playerDeviceA.id, playerDeviceB.id);
        const testMessageFound = messages.some(msg => msg.text.includes(testMessage));

        if (testMessageFound) {
          console.log("✅ SocketLib message propagation verified");
        } else {
          console.warn("⚠️ SocketLib message propagation may have issues");
        }
      } else {
        console.warn("⚠️ SocketLib message sending failed");
      }
    } else {
      console.warn("⚠️ SocketLib not available for testing");
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...");
    await agent.removeContactFromDevice(playerDeviceA.id, playerDeviceB.id);
    await agent.removeContactFromDevice(playerDeviceB.id, playerDeviceA.id);

    // Close the agent window
    if (playerBAgentWindow && playerBAgentWindow.close) {
      playerBAgentWindow.close();
    }

    console.log("✅ Player-to-Player Contact List Update Test completed successfully");
    return true;

  } catch (error) {
    console.error("❌ Player-to-Player Contact List Update Test failed:", error);
    return false;
  }
}

// Export the test function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPlayerToPlayerContactUpdate };
} else {
  // Make it available globally for browser testing
  window.testPlayerToPlayerContactUpdate = testPlayerToPlayerContactUpdate;
}

// Auto-run the test if this script is executed directly
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test-player-to-player-contact-update.js')) {
  console.log("🚀 Auto-running Player-to-Player Contact List Update Test...");
  testPlayerToPlayerContactUpdate().then(success => {
    console.log(success ? "🎉 Test passed!" : "💥 Test failed!");
  });
} 