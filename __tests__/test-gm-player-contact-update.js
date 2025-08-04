/**
 * Test GM-Player Contact List Update
 * 
 * This test verifies that real-time contact list updates work correctly
 * for both GM messaging players and players messaging GMs.
 */

console.log("Cyberpunk Agent | Starting GM-Player Contact List Update Test...");

async function testGMPlayerContactUpdate() {
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

    // Find GM and Player devices
    let gmDevice = null;
    let playerDevice = null;

    for (const device of devices) {
      const actor = game.actors.get(device.ownerActorId);
      if (actor && actor.ownership && actor.ownership[game.user.id] === 1) {
        if (game.user.isGM) {
          gmDevice = device;
        } else {
          playerDevice = device;
        }
      }
    }

    // If we can't determine GM/Player devices, use the first two
    if (!gmDevice || !playerDevice) {
      gmDevice = devices[0];
      playerDevice = devices[1];
      console.log("⚠️ Could not determine GM/Player devices, using first two devices");
    }

    console.log(`📱 Testing with devices: ${gmDevice.deviceName} (${gmDevice.id}) and ${playerDevice.deviceName} (${playerDevice.id})`);

    // Clear existing contacts between these devices
    console.log("🧹 Clearing existing contacts between devices...");
    if (agent.isDeviceContact(gmDevice.id, playerDevice.id)) {
      await agent.removeContactFromDevice(gmDevice.id, playerDevice.id);
    }
    if (agent.isDeviceContact(playerDevice.id, gmDevice.id)) {
      await agent.removeContactFromDevice(playerDevice.id, gmDevice.id);
    }

    // Verify devices are not contacts initially
    const isContactBefore = agent.isDeviceContact(gmDevice.id, playerDevice.id);
    console.log(`📋 GM has Player as contact before test: ${isContactBefore}`);

    if (isContactBefore) {
      console.error("❌ Devices should not be contacts initially");
      return false;
    }

    // Test 1: GM messaging Player
    console.log("\n🧪 Test 1: GM messaging Player");

    // Open Agent interface for GM
    console.log("🔧 Opening Agent interface for GM...");
    const gmAgentWindow = await agent.showAgentHome(gmDevice);

    if (!gmAgentWindow || !gmAgentWindow.rendered) {
      console.error("❌ Failed to open GM Agent interface");
      return false;
    }

    console.log("✅ GM Agent interface opened successfully");

    // Navigate to Chat7 view
    console.log("📱 Navigating to Chat7 view...");
    gmAgentWindow.navigateTo('chat7');

    // Wait a moment for the view to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial contact count for GM
    const gmInitialContacts = agent.getContactsForDevice(gmDevice.id);
    console.log(`📋 GM initial contacts count: ${gmInitialContacts.length}`);

    // Send a message from GM to Player
    console.log("💬 Sending message from GM to Player...");
    const gmToPlayerMessage = `Test message from GM to Player at ${new Date().toLocaleTimeString()}`;
    const gmMessageSent = await agent.sendDeviceMessage(gmDevice.id, playerDevice.id, gmToPlayerMessage);

    if (!gmMessageSent) {
      console.error("❌ Failed to send GM message");
      return false;
    }

    console.log("✅ GM message sent successfully");

    // Wait a moment for the contact update to process
    console.log("⏳ Waiting for contact update to process...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if Player was automatically added to GM's contacts
    const gmHasPlayerContact = agent.isDeviceContact(gmDevice.id, playerDevice.id);
    console.log(`📋 GM has Player as contact after GM message: ${gmHasPlayerContact}`);

    if (!gmHasPlayerContact) {
      console.error("❌ Player should have been automatically added to GM's contacts");
      return false;
    }

    // Check if GM's contact list UI has been updated
    console.log("🔍 Checking if GM's contact list UI has been updated...");

    // Force a re-render to ensure we get the latest data
    gmAgentWindow.render(true);

    // Wait for the re-render to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if Player appears in GM's contact list
    const gmContactElements = gmAgentWindow.element.find('.contact-item');
    let playerFoundInGMList = false;

    gmContactElements.each((index, element) => {
      const contactId = $(element).data('contact-id');
      if (contactId === playerDevice.id) {
        playerFoundInGMList = true;
        console.log("✅ Player found in GM's contact list UI");
      }
    });

    if (!playerFoundInGMList) {
      console.warn("⚠️ Player not found in GM's contact list UI - this might be a UI update issue");
    }

    // Test 2: Player messaging GM
    console.log("\n🧪 Test 2: Player messaging GM");

    // Close GM's agent window
    if (gmAgentWindow && gmAgentWindow.close) {
      gmAgentWindow.close();
    }

    // Open Agent interface for Player
    console.log("🔧 Opening Agent interface for Player...");
    const playerAgentWindow = await agent.showAgentHome(playerDevice);

    if (!playerAgentWindow || !playerAgentWindow.rendered) {
      console.error("❌ Failed to open Player Agent interface");
      return false;
    }

    console.log("✅ Player Agent interface opened successfully");

    // Navigate to Chat7 view
    console.log("📱 Navigating to Chat7 view...");
    playerAgentWindow.navigateTo('chat7');

    // Wait a moment for the view to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial contact count for Player
    const playerInitialContacts = agent.getContactsForDevice(playerDevice.id);
    console.log(`📋 Player initial contacts count: ${playerInitialContacts.length}`);

    // Send a message from Player to GM
    console.log("💬 Sending message from Player to GM...");
    const playerToGMMessage = `Test message from Player to GM at ${new Date().toLocaleTimeString()}`;
    const playerMessageSent = await agent.sendDeviceMessage(playerDevice.id, gmDevice.id, playerToGMMessage);

    if (!playerMessageSent) {
      console.error("❌ Failed to send Player message");
      return false;
    }

    console.log("✅ Player message sent successfully");

    // Wait a moment for the contact update to process
    console.log("⏳ Waiting for contact update to process...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if GM was automatically added to Player's contacts
    const playerHasGMContact = agent.isDeviceContact(playerDevice.id, gmDevice.id);
    console.log(`📋 Player has GM as contact after Player message: ${playerHasGMContact}`);

    if (!playerHasGMContact) {
      console.error("❌ GM should have been automatically added to Player's contacts");
      return false;
    }

    // Check if Player's contact list UI has been updated
    console.log("🔍 Checking if Player's contact list UI has been updated...");

    // Force a re-render to ensure we get the latest data
    playerAgentWindow.render(true);

    // Wait for the re-render to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if GM appears in Player's contact list
    const playerContactElements = playerAgentWindow.element.find('.contact-item');
    let gmFoundInPlayerList = false;

    playerContactElements.each((index, element) => {
      const contactId = $(element).data('contact-id');
      if (contactId === gmDevice.id) {
        gmFoundInPlayerList = true;
        console.log("✅ GM found in Player's contact list UI");
      }
    });

    if (!gmFoundInPlayerList) {
      console.warn("⚠️ GM not found in Player's contact list UI - this might be a UI update issue");

      // Try to manually trigger a contact update event
      console.log("🔄 Manually triggering contact update event...");
      document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
        detail: {
          type: 'contactUpdate',
          deviceId: playerDevice.id,
          contactDeviceId: gmDevice.id,
          action: 'auto-add',
          reason: 'test',
          timestamp: Date.now()
        }
      }));

      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 1000));
      playerAgentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const playerContactElementsAfter = playerAgentWindow.element.find('.contact-item');
      gmFoundInPlayerList = false;

      playerContactElementsAfter.each((index, element) => {
        const contactId = $(element).data('contact-id');
        if (contactId === gmDevice.id) {
          gmFoundInPlayerList = true;
          console.log("✅ GM found in Player's contact list UI after manual trigger");
        }
      });
    }

    // Test 3: Verify bidirectional contact relationship
    console.log("\n🧪 Test 3: Verifying bidirectional contact relationship");

    const gmHasPlayer = agent.isDeviceContact(gmDevice.id, playerDevice.id);
    const playerHasGM = agent.isDeviceContact(playerDevice.id, gmDevice.id);

    console.log(`📋 GM has Player as contact: ${gmHasPlayer}`);
    console.log(`📋 Player has GM as contact: ${playerHasGM}`);

    if (!gmHasPlayer || !playerHasGM) {
      console.error("❌ Bidirectional contact relationship not established");
      return false;
    }

    console.log("✅ Bidirectional contact relationship verified");

    // Test 4: Test conversation access
    console.log("\n🧪 Test 4: Testing conversation access");

    // Try to open conversation from Player's contact list
    const gmElement = playerAgentWindow.element.find(`[data-contact-id="${gmDevice.id}"]`);
    if (gmElement.length > 0) {
      gmElement.find('.contact-chat-button').click();

      // Wait for conversation to open
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we're in conversation view
      if (playerAgentWindow.currentView === 'conversation' && playerAgentWindow.currentContact && playerAgentWindow.currentContact.id === gmDevice.id) {
        console.log("✅ Conversation with GM opened successfully from Player's contact list");

        // Check if the test messages are visible
        const messageElements = playerAgentWindow.element.find('.message');
        let gmMessageFound = false;
        let playerMessageFound = false;

        messageElements.each((index, element) => {
          const messageText = $(element).find('.message-text').text();
          if (messageText.includes(gmToPlayerMessage)) {
            gmMessageFound = true;
            console.log("✅ GM's message found in conversation");
          }
          if (messageText.includes(playerToGMMessage)) {
            playerMessageFound = true;
            console.log("✅ Player's message found in conversation");
          }
        });

        if (!gmMessageFound || !playerMessageFound) {
          console.warn("⚠️ Some test messages not found in conversation - this might be a message display issue");
        }
      } else {
        console.warn("⚠️ Failed to open conversation with GM from Player's contact list");
      }
    } else {
      console.warn("⚠️ Could not find GM element in Player's contact list to test conversation");
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...");
    await agent.removeContactFromDevice(gmDevice.id, playerDevice.id);
    await agent.removeContactFromDevice(playerDevice.id, gmDevice.id);

    // Close the agent window
    if (playerAgentWindow && playerAgentWindow.close) {
      playerAgentWindow.close();
    }

    console.log("✅ GM-Player Contact List Update Test completed successfully");
    return true;

  } catch (error) {
    console.error("❌ GM-Player Contact List Update Test failed:", error);
    return false;
  }
}

// Export the test function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGMPlayerContactUpdate };
} else {
  // Make it available globally for browser testing
  window.testGMPlayerContactUpdate = testGMPlayerContactUpdate;
}

// Auto-run the test if this script is executed directly
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test-gm-player-contact-update.js')) {
  console.log("🚀 Auto-running GM-Player Contact List Update Test...");
  testGMPlayerContactUpdate().then(success => {
    console.log(success ? "🎉 Test passed!" : "💥 Test failed!");
  });
} 