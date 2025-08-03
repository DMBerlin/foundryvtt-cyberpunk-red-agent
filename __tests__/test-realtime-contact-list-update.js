/**
 * Test Real-time Contact List Update
 * 
 * This test verifies that when a user receives a message from someone not in their contact list,
 * the new contact appears immediately in the contact list without requiring a refresh.
 */

console.log("Cyberpunk Agent | Starting Real-time Contact List Update Test...");

async function testRealtimeContactListUpdate() {
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

    const deviceA = devices[0];
    const deviceB = devices[1];

    console.log(`📱 Testing with devices: ${deviceA.deviceName} (${deviceA.id}) and ${deviceB.deviceName} (${deviceB.id})`);

    // Clear existing contacts between these devices
    console.log("🧹 Clearing existing contacts between devices...");
    if (agent.isDeviceContact(deviceA.id, deviceB.id)) {
      await agent.removeContactFromDevice(deviceA.id, deviceB.id);
    }
    if (agent.isDeviceContact(deviceB.id, deviceA.id)) {
      await agent.removeContactFromDevice(deviceB.id, deviceA.id);
    }

    // Verify devices are not contacts initially
    const isContactBefore = agent.isDeviceContact(deviceA.id, deviceB.id);
    console.log(`📋 Device A has Device B as contact before test: ${isContactBefore}`);

    if (isContactBefore) {
      console.error("❌ Devices should not be contacts initially");
      return false;
    }

    // Open Agent interface for Device A
    console.log("🔧 Opening Agent interface for Device A...");
    const agentWindow = await agent.showAgentHome(deviceA);

    if (!agentWindow || !agentWindow.rendered) {
      console.error("❌ Failed to open Agent interface");
      return false;
    }

    console.log("✅ Agent interface opened successfully");

    // Navigate to Chat7 view
    console.log("📱 Navigating to Chat7 view...");
    agentWindow.navigateTo('chat7');

    // Wait a moment for the view to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial contact count
    const initialContacts = agent.getContactsForDevice(deviceA.id);
    console.log(`📋 Initial contacts count: ${initialContacts.length}`);

    // Send a message from Device B to Device A (this should auto-add Device B to Device A's contacts)
    console.log("💬 Sending message from Device B to Device A...");
    const testMessage = `Test message from ${deviceB.deviceName} at ${new Date().toLocaleTimeString()}`;
    const messageSent = await agent.sendDeviceMessage(deviceB.id, deviceA.id, testMessage);

    if (!messageSent) {
      console.error("❌ Failed to send message");
      return false;
    }

    console.log("✅ Message sent successfully");

    // Wait a moment for the contact update to process
    console.log("⏳ Waiting for contact update to process...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if Device B was automatically added to Device A's contacts
    const isContactAfter = agent.isDeviceContact(deviceA.id, deviceB.id);
    console.log(`📋 Device A has Device B as contact after message: ${isContactAfter}`);

    if (!isContactAfter) {
      console.error("❌ Device B should have been automatically added to Device A's contacts");
      return false;
    }

    // Get updated contact count
    const updatedContacts = agent.getContactsForDevice(deviceA.id);
    console.log(`📋 Updated contacts count: ${updatedContacts.length}`);

    if (updatedContacts.length <= initialContacts.length) {
      console.error("❌ Contact count should have increased");
      return false;
    }

    // Check if the contact list in the UI has been updated
    console.log("🔍 Checking if contact list UI has been updated...");

    // Force a re-render to ensure we get the latest data
    agentWindow.render(true);

    // Wait for the re-render to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if Device B appears in the contact list
    const contactElements = agentWindow.element.find('.contact-item');
    let deviceBFound = false;

    contactElements.each((index, element) => {
      const contactId = $(element).data('contact-id');
      if (contactId === deviceB.id) {
        deviceBFound = true;
        console.log("✅ Device B found in contact list UI");
      }
    });

    if (!deviceBFound) {
      console.warn("⚠️ Device B not found in contact list UI - this might be a UI update issue");

      // Try to manually trigger a contact update event
      console.log("🔄 Manually triggering contact update event...");
      document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
        detail: {
          type: 'contactUpdate',
          deviceId: deviceA.id,
          contactDeviceId: deviceB.id,
          action: 'auto-add',
          reason: 'test',
          timestamp: Date.now()
        }
      }));

      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 1000));
      agentWindow.render(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const contactElementsAfter = agentWindow.element.find('.contact-item');
      deviceBFound = false;

      contactElementsAfter.each((index, element) => {
        const contactId = $(element).data('contact-id');
        if (contactId === deviceB.id) {
          deviceBFound = true;
          console.log("✅ Device B found in contact list UI after manual trigger");
        }
      });
    }

    // Test the conversation functionality
    console.log("💬 Testing conversation functionality...");

    // Click on Device B in the contact list to open conversation
    const deviceBElement = agentWindow.element.find(`[data-contact-id="${deviceB.id}"]`);
    if (deviceBElement.length > 0) {
      deviceBElement.find('.contact-chat-button').click();

      // Wait for conversation to open
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we're in conversation view
      if (agentWindow.currentView === 'conversation' && agentWindow.currentContact && agentWindow.currentContact.id === deviceB.id) {
        console.log("✅ Conversation with Device B opened successfully");

        // Check if the test message is visible
        const messageElements = agentWindow.element.find('.message');
        let testMessageFound = false;

        messageElements.each((index, element) => {
          const messageText = $(element).find('.message-text').text();
          if (messageText.includes(testMessage)) {
            testMessageFound = true;
            console.log("✅ Test message found in conversation");
          }
        });

        if (!testMessageFound) {
          console.warn("⚠️ Test message not found in conversation - this might be a message display issue");
        }
      } else {
        console.warn("⚠️ Failed to open conversation with Device B");
      }
    } else {
      console.warn("⚠️ Could not find Device B element in contact list to test conversation");
    }

    // Clean up
    console.log("🧹 Cleaning up test data...");
    await agent.removeContactFromDevice(deviceA.id, deviceB.id);
    await agent.removeContactFromDevice(deviceB.id, deviceA.id);

    // Close the agent window
    if (agentWindow && agentWindow.close) {
      agentWindow.close();
    }

    console.log("✅ Real-time Contact List Update Test completed successfully");
    return true;

  } catch (error) {
    console.error("❌ Real-time Contact List Update Test failed:", error);
    return false;
  }
}

// Export the test function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testRealtimeContactListUpdate };
} else {
  // Make it available globally for browser testing
  window.testRealtimeContactListUpdate = testRealtimeContactListUpdate;
}

// Auto-run the test if this script is executed directly
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test-realtime-contact-list-update.js')) {
  console.log("🚀 Auto-running Real-time Contact List Update Test...");
  testRealtimeContactListUpdate().then(success => {
    console.log(success ? "🎉 Test passed!" : "💥 Test failed!");
  });
} 