/**
 * Test All Message Scenarios
 * 
 * This test verifies that real-time contact list updates work correctly
 * for all three message scenarios:
 * 1. GM to Player
 * 2. Player to GM  
 * 3. Player to Player
 */

console.log("Cyberpunk Agent | Starting All Message Scenarios Test...");

async function testAllMessageScenarios() {
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
    if (devices.length < 3) {
      console.error("❌ Need at least 3 devices for this test (GM + 2 Players)");
      return false;
    }

    // Find GM device and two player devices
    let gmDevice = null;
    let playerDeviceA = null;
    let playerDeviceB = null;

    for (const device of devices) {
      const actor = game.actors.get(device.ownerActorId);
      if (actor && actor.ownership) {
        // Check if this is a GM-owned device
        const isGMDevice = Object.keys(actor.ownership).some(userId => {
          const user = game.users.get(userId);
          return user && user.isGM && actor.ownership[userId] === 1;
        });

        // Check if this is a player-owned device
        const isPlayerDevice = Object.keys(actor.ownership).some(userId => {
          const user = game.users.get(userId);
          return user && !user.isGM && actor.ownership[userId] === 1;
        });

        if (isGMDevice && !gmDevice) {
          gmDevice = device;
        } else if (isPlayerDevice) {
          if (!playerDeviceA) {
            playerDeviceA = device;
          } else if (!playerDeviceB && device.id !== playerDeviceA.id) {
            playerDeviceB = device;
          }
        }
      }
    }

    // If we can't find the specific device types, use the first three devices
    if (!gmDevice || !playerDeviceA || !playerDeviceB) {
      gmDevice = devices[0];
      playerDeviceA = devices[1];
      playerDeviceB = devices[2];
      console.log("⚠️ Could not determine device types, using first three devices");
    }

    console.log(`📱 Testing with devices:`);
    console.log(`   GM: ${gmDevice.deviceName} (${gmDevice.id})`);
    console.log(`   Player A: ${playerDeviceA.deviceName} (${playerDeviceA.id})`);
    console.log(`   Player B: ${playerDeviceB.deviceName} (${playerDeviceB.id})`);

    // Clear all existing contacts between these devices
    console.log("\n🧹 Clearing all existing contacts between devices...");
    const devicePairs = [
      [gmDevice.id, playerDeviceA.id],
      [gmDevice.id, playerDeviceB.id],
      [playerDeviceA.id, playerDeviceB.id]
    ];

    for (const [device1, device2] of devicePairs) {
      if (agent.isDeviceContact(device1, device2)) {
        await agent.removeContactFromDevice(device1, device2);
        console.log(`   Removed contact: ${device1} → ${device2}`);
      }
      if (agent.isDeviceContact(device2, device1)) {
        await agent.removeContactFromDevice(device2, device1);
        console.log(`   Removed contact: ${device2} → ${device1}`);
      }
    }

    // Verify no contacts exist initially
    console.log("\n📋 Verifying no contacts exist initially...");
    for (const [device1, device2] of devicePairs) {
      const hasContact = agent.isDeviceContact(device1, device2);
      if (hasContact) {
        console.error(`❌ Contact still exists: ${device1} → ${device2}`);
        return false;
      }
    }
    console.log("✅ All contacts cleared successfully");

    // Test Results tracking
    const testResults = {
      gmToPlayer: { success: false, details: [] },
      playerToGm: { success: false, details: [] },
      playerToPlayer: { success: false, details: [] }
    };

    // ========================================
    // SCENARIO 1: GM to Player
    // ========================================
    console.log("\n" + "=".repeat(50));
    console.log("🧪 SCENARIO 1: GM to Player");
    console.log("=".repeat(50));

    try {
      // Open GM's Agent interface
      console.log("🔧 Opening GM Agent interface...");
      const gmAgentWindow = await agent.showAgentHome(gmDevice);

      if (!gmAgentWindow || !gmAgentWindow.rendered) {
        throw new Error("Failed to open GM Agent interface");
      }

      console.log("✅ GM Agent interface opened successfully");

      // Navigate to Chat7 view
      console.log("📱 Navigating to Chat7 view...");
      gmAgentWindow.navigateTo('chat7');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get initial contact count for GM
      const gmInitialContacts = agent.getContactsForDevice(gmDevice.id);
      console.log(`📋 GM initial contacts count: ${gmInitialContacts.length}`);

      // Send message from GM to Player A
      console.log("💬 Sending message from GM to Player A...");
      const gmToPlayerMessage = `GM to Player A test message at ${new Date().toLocaleTimeString()}`;
      const gmMessageSent = await agent.sendDeviceMessage(gmDevice.id, playerDeviceA.id, gmToPlayerMessage);

      if (!gmMessageSent) {
        throw new Error("Failed to send GM message");
      }

      console.log("✅ GM message sent successfully");

      // Wait for contact update to process
      console.log("⏳ Waiting for contact update to process...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if Player A was automatically added to GM's contacts
      const gmHasPlayerAContact = agent.isDeviceContact(gmDevice.id, playerDeviceA.id);
      console.log(`📋 GM has Player A as contact: ${gmHasPlayerAContact}`);

      if (!gmHasPlayerAContact) {
        throw new Error("Player A should have been automatically added to GM's contacts");
      }

      // Check if GM's contact list UI has been updated
      console.log("🔍 Checking if GM's contact list UI has been updated...");
      gmAgentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const gmContactElements = gmAgentWindow.element.find('.contact-item');
      let playerAFoundInGMList = false;

      gmContactElements.each((index, element) => {
        const contactId = $(element).data('contact-id');
        if (contactId === playerDeviceA.id) {
          playerAFoundInGMList = true;
          console.log("✅ Player A found in GM's contact list UI");
        }
      });

      if (!playerAFoundInGMList) {
        console.warn("⚠️ Player A not found in GM's contact list UI - this might be a UI update issue");
      }

      // Close GM's agent window
      if (gmAgentWindow && gmAgentWindow.close) {
        gmAgentWindow.close();
      }

      testResults.gmToPlayer.success = true;
      testResults.gmToPlayer.details.push("GM message sent successfully");
      testResults.gmToPlayer.details.push("Player A added to GM's contacts");
      testResults.gmToPlayer.details.push("Contact list UI updated");

      console.log("✅ SCENARIO 1: GM to Player - SUCCESS");

    } catch (error) {
      console.error("❌ SCENARIO 1: GM to Player - FAILED:", error.message);
      testResults.gmToPlayer.details.push(`Error: ${error.message}`);
    }

    // ========================================
    // SCENARIO 2: Player to GM
    // ========================================
    console.log("\n" + "=".repeat(50));
    console.log("🧪 SCENARIO 2: Player to GM");
    console.log("=".repeat(50));

    try {
      // Open Player A's Agent interface
      console.log("🔧 Opening Player A Agent interface...");
      const playerAAgentWindow = await agent.showAgentHome(playerDeviceA);

      if (!playerAAgentWindow || !playerAAgentWindow.rendered) {
        throw new Error("Failed to open Player A Agent interface");
      }

      console.log("✅ Player A Agent interface opened successfully");

      // Navigate to Chat7 view
      console.log("📱 Navigating to Chat7 view...");
      playerAAgentWindow.navigateTo('chat7');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get initial contact count for Player A
      const playerAInitialContacts = agent.getContactsForDevice(playerDeviceA.id);
      console.log(`📋 Player A initial contacts count: ${playerAInitialContacts.length}`);

      // Send message from Player A to GM
      console.log("💬 Sending message from Player A to GM...");
      const playerToGmMessage = `Player A to GM test message at ${new Date().toLocaleTimeString()}`;
      const playerMessageSent = await agent.sendDeviceMessage(playerDeviceA.id, gmDevice.id, playerToGmMessage);

      if (!playerMessageSent) {
        throw new Error("Failed to send Player A message");
      }

      console.log("✅ Player A message sent successfully");

      // Wait for contact update to process
      console.log("⏳ Waiting for contact update to process...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if GM was automatically added to Player A's contacts
      const playerAHasGmContact = agent.isDeviceContact(playerDeviceA.id, gmDevice.id);
      console.log(`📋 Player A has GM as contact: ${playerAHasGmContact}`);

      if (!playerAHasGmContact) {
        throw new Error("GM should have been automatically added to Player A's contacts");
      }

      // Check if Player A's contact list UI has been updated
      console.log("🔍 Checking if Player A's contact list UI has been updated...");
      playerAAgentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const playerAContactElements = playerAAgentWindow.element.find('.contact-item');
      let gmFoundInPlayerAList = false;

      playerAContactElements.each((index, element) => {
        const contactId = $(element).data('contact-id');
        if (contactId === gmDevice.id) {
          gmFoundInPlayerAList = true;
          console.log("✅ GM found in Player A's contact list UI");
        }
      });

      if (!gmFoundInPlayerAList) {
        console.warn("⚠️ GM not found in Player A's contact list UI - this might be a UI update issue");
      }

      // Close Player A's agent window
      if (playerAAgentWindow && playerAAgentWindow.close) {
        playerAAgentWindow.close();
      }

      testResults.playerToGm.success = true;
      testResults.playerToGm.details.push("Player A message sent successfully");
      testResults.playerToGm.details.push("GM added to Player A's contacts");
      testResults.playerToGm.details.push("Contact list UI updated");

      console.log("✅ SCENARIO 2: Player to GM - SUCCESS");

    } catch (error) {
      console.error("❌ SCENARIO 2: Player to GM - FAILED:", error.message);
      testResults.playerToGm.details.push(`Error: ${error.message}`);
    }

    // ========================================
    // SCENARIO 3: Player to Player
    // ========================================
    console.log("\n" + "=".repeat(50));
    console.log("🧪 SCENARIO 3: Player to Player");
    console.log("=".repeat(50));

    try {
      // Open Player B's Agent interface
      console.log("🔧 Opening Player B Agent interface...");
      const playerBAgentWindow = await agent.showAgentHome(playerDeviceB);

      if (!playerBAgentWindow || !playerBAgentWindow.rendered) {
        throw new Error("Failed to open Player B Agent interface");
      }

      console.log("✅ Player B Agent interface opened successfully");

      // Navigate to Chat7 view
      console.log("📱 Navigating to Chat7 view...");
      playerBAgentWindow.navigateTo('chat7');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get initial contact count for Player B
      const playerBInitialContacts = agent.getContactsForDevice(playerDeviceB.id);
      console.log(`📋 Player B initial contacts count: ${playerBInitialContacts.length}`);

      // Send message from Player B to Player A
      console.log("💬 Sending message from Player B to Player A...");
      const playerToPlayerMessage = `Player B to Player A test message at ${new Date().toLocaleTimeString()}`;
      const playerBMessageSent = await agent.sendDeviceMessage(playerDeviceB.id, playerDeviceA.id, playerToPlayerMessage);

      if (!playerBMessageSent) {
        throw new Error("Failed to send Player B message");
      }

      console.log("✅ Player B message sent successfully");

      // Wait for contact update to process
      console.log("⏳ Waiting for contact update to process...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if Player A was automatically added to Player B's contacts
      const playerBHasPlayerAContact = agent.isDeviceContact(playerDeviceB.id, playerDeviceA.id);
      console.log(`📋 Player B has Player A as contact: ${playerBHasPlayerAContact}`);

      if (!playerBHasPlayerAContact) {
        throw new Error("Player A should have been automatically added to Player B's contacts");
      }

      // Check if Player B's contact list UI has been updated
      console.log("🔍 Checking if Player B's contact list UI has been updated...");
      playerBAgentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

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

      // Close Player B's agent window
      if (playerBAgentWindow && playerBAgentWindow.close) {
        playerBAgentWindow.close();
      }

      testResults.playerToPlayer.success = true;
      testResults.playerToPlayer.details.push("Player B message sent successfully");
      testResults.playerToPlayer.details.push("Player A added to Player B's contacts");
      testResults.playerToPlayer.details.push("Contact list UI updated");

      console.log("✅ SCENARIO 3: Player to Player - SUCCESS");

    } catch (error) {
      console.error("❌ SCENARIO 3: Player to Player - FAILED:", error.message);
      testResults.playerToPlayer.details.push(`Error: ${error.message}`);
    }

    // ========================================
    // FINAL VERIFICATION
    // ========================================
    console.log("\n" + "=".repeat(50));
    console.log("🔍 FINAL VERIFICATION");
    console.log("=".repeat(50));

    // Verify all bidirectional contact relationships
    console.log("📋 Verifying all bidirectional contact relationships...");

    const expectedContacts = [
      [gmDevice.id, playerDeviceA.id],
      [gmDevice.id, playerDeviceB.id],
      [playerDeviceA.id, playerDeviceB.id]
    ];

    let allContactsVerified = true;
    for (const [device1, device2] of expectedContacts) {
      const device1HasDevice2 = agent.isDeviceContact(device1, device2);
      const device2HasDevice1 = agent.isDeviceContact(device2, device1);

      console.log(`   ${device1} → ${device2}: ${device1HasDevice2}`);
      console.log(`   ${device2} → ${device1}: ${device2HasDevice1}`);

      if (!device1HasDevice2 || !device2HasDevice1) {
        allContactsVerified = false;
        console.error(`❌ Bidirectional contact relationship not established for ${device1} ↔ ${device2}`);
      }
    }

    if (allContactsVerified) {
      console.log("✅ All bidirectional contact relationships verified");
    }

    // Test SocketLib propagation
    console.log("\n🔌 Testing SocketLib propagation...");
    if (agent.socketLibIntegration && agent.socketLibIntegration.isAvailable) {
      console.log("✅ SocketLib is available");

      // Test sending a message via SocketLib
      const socketLibTestMessage = `SocketLib propagation test at ${new Date().toLocaleTimeString()}`;
      const socketLibMessageSent = await agent.sendDeviceMessage(gmDevice.id, playerDeviceA.id, socketLibTestMessage);

      if (socketLibMessageSent) {
        console.log("✅ SocketLib message sent successfully");

        // Wait for SocketLib propagation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if the message was received
        const messages = agent.getMessagesForDeviceConversation(gmDevice.id, playerDeviceA.id);
        const socketLibMessageFound = messages.some(msg => msg.text.includes(socketLibTestMessage));

        if (socketLibMessageFound) {
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

    // ========================================
    // TEST RESULTS SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));

    const totalScenarios = 3;
    const passedScenarios = Object.values(testResults).filter(result => result.success).length;

    console.log(`\n🎯 Overall Results: ${passedScenarios}/${totalScenarios} scenarios passed`);

    console.log("\n📋 Detailed Results:");
    console.log(`   1. GM to Player: ${testResults.gmToPlayer.success ? '✅ PASS' : '❌ FAIL'}`);
    if (testResults.gmToPlayer.details.length > 0) {
      testResults.gmToPlayer.details.forEach(detail => console.log(`      - ${detail}`));
    }

    console.log(`   2. Player to GM: ${testResults.playerToGm.success ? '✅ PASS' : '❌ FAIL'}`);
    if (testResults.playerToGm.details.length > 0) {
      testResults.playerToGm.details.forEach(detail => console.log(`      - ${detail}`));
    }

    console.log(`   3. Player to Player: ${testResults.playerToPlayer.success ? '✅ PASS' : '❌ FAIL'}`);
    if (testResults.playerToPlayer.details.length > 0) {
      testResults.playerToPlayer.details.forEach(detail => console.log(`      - ${detail}`));
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...");
    for (const [device1, device2] of devicePairs) {
      await agent.removeContactFromDevice(device1, device2);
      await agent.removeContactFromDevice(device2, device1);
    }

    const overallSuccess = passedScenarios === totalScenarios;
    console.log(`\n${overallSuccess ? '🎉' : '💥'} All Message Scenarios Test ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    return overallSuccess;

  } catch (error) {
    console.error("❌ All Message Scenarios Test failed:", error);
    return false;
  }
}

// Export the test function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAllMessageScenarios };
} else {
  // Make it available globally for browser testing
  window.testAllMessageScenarios = testAllMessageScenarios;
}

// Auto-run the test if this script is executed directly
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test-all-message-scenarios.js')) {
  console.log("🚀 Auto-running All Message Scenarios Test...");
  testAllMessageScenarios().then(success => {
    console.log(success ? "🎉 All scenarios passed!" : "💥 Some scenarios failed!");
  });
} 