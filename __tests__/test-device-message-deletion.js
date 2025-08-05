/**
 * Test script for device-specific message deletion functionality
 * This script tests the new features for device-specific chat history management
 */

console.log("Cyberpunk Agent | Testing device-specific message deletion functionality...");

/**
 * Test device message deletion functionality
 */
async function testDeviceMessageDeletion() {
  console.log("=== Testing Device Message Deletion ===");

  if (!window.cyberpunkAgent) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.cyberpunkAgent;

  // Test 1: Check if deleteDeviceMessages method exists
  console.log("Test 1: Checking deleteDeviceMessages method...");
  if (typeof agent.deleteDeviceMessages === 'function') {
    console.log("✅ deleteDeviceMessages method exists");
  } else {
    console.error("❌ deleteDeviceMessages method not found");
  }

  // Test 2: Check if handleDeviceMessageDeletion method exists
  console.log("Test 2: Checking handleDeviceMessageDeletion method...");
  if (typeof agent.handleDeviceMessageDeletion === 'function') {
    console.log("✅ handleDeviceMessageDeletion method exists");
  } else {
    console.error("❌ handleDeviceMessageDeletion method not found");
  }

  // Test 3: List all devices to test with
  console.log("Test 3: Listing available devices...");
  const devices = agent.getAllRegisteredDevices();
  console.log("Available devices:", devices.length);
  devices.forEach((device, index) => {
    console.log(`  ${index + 1}. ${device.deviceName} (${device.id})`);
  });

  // Test 4: Check if devices have conversations
  if (devices.length >= 2) {
    const device1 = devices[0];
    const device2 = devices[1];

    console.log(`Test 4: Checking conversations between ${device1.deviceName} and ${device2.deviceName}...`);

    const messages = agent.getMessagesForDeviceConversation(device1.id, device2.id);
    console.log(`Found ${messages.length} messages in conversation`);

    if (messages.length > 0) {
      const testMessageId = messages[0].id;
      console.log(`Test 5: Testing message deletion for message ${testMessageId}...`);

      try {
        const result = await agent.deleteDeviceMessages(device1.id, device2.id, [testMessageId]);
        if (result) {
          console.log("✅ Message deletion test successful");

          // Check if message was actually deleted
          const updatedMessages = agent.getMessagesForDeviceConversation(device1.id, device2.id);
          const messageStillExists = updatedMessages.some(msg => msg.id === testMessageId);

          if (!messageStillExists) {
            console.log("✅ Message was successfully deleted from device conversation");
          } else {
            console.error("❌ Message still exists after deletion");
          }
        } else {
          console.error("❌ Message deletion test failed");
        }
      } catch (error) {
        console.error("❌ Error during message deletion test:", error);
      }
    } else {
      console.log("⚠️ No messages found to test deletion");
    }
  } else {
    console.log("⚠️ Need at least 2 devices to test message deletion");
  }
}

/**
 * Test context menu functionality
 */
function testContextMenuFunctionality() {
  console.log("=== Testing Context Menu Functionality ===");

  // Test 1: Check if message context menu elements exist
  console.log("Test 1: Checking message context menu elements...");
  const messageElements = document.querySelectorAll('.cp-message[data-action="message-context-menu"]');
  console.log(`Found ${messageElements.length} message elements with context menu`);

  if (messageElements.length > 0) {
    console.log("✅ Message context menu elements found");

    // Test 2: Check if elements have required data attributes
    const firstMessage = messageElements[0];
    const hasMessageId = firstMessage.dataset.messageId;
    const hasMessageText = firstMessage.dataset.messageText;
    const hasMessageTime = firstMessage.dataset.messageTime;

    console.log("Test 2: Checking data attributes...");
    console.log(`  Message ID: ${hasMessageId ? '✅' : '❌'}`);
    console.log(`  Message Text: ${hasMessageText ? '✅' : '❌'}`);
    console.log(`  Message Time: ${hasMessageTime ? '✅' : '❌'}`);
  } else {
    console.log("⚠️ No message elements found - open a conversation first");
  }
}

/**
 * Test device-specific clear history
 */
async function testDeviceSpecificClearHistory() {
  console.log("=== Testing Device-Specific Clear History ===");

  if (!window.cyberpunkAgent) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.cyberpunkAgent;

  // Test 1: Check if clearDeviceConversationHistory method exists
  console.log("Test 1: Checking clearDeviceConversationHistory method...");
  if (typeof agent.clearDeviceConversationHistory === 'function') {
    console.log("✅ clearDeviceConversationHistory method exists");
  } else {
    console.error("❌ clearDeviceConversationHistory method not found");
  }

  // Test 2: List devices and their conversations
  console.log("Test 2: Listing device conversations...");
  const devices = agent.getAllRegisteredDevices();

  devices.forEach(device => {
    const contacts = agent.getContactsForDevice(device.id);
    console.log(`Device ${device.deviceName} (${device.id}) has ${contacts.length} contacts`);

    contacts.forEach(contact => {
      const messages = agent.getMessagesForDeviceConversation(device.id, contact.id);
      console.log(`  - Conversation with ${contact.name}: ${messages.length} messages`);
    });
  });
}

/**
 * Manual testing instructions
 */
function manualTestInstructions() {
  console.log("=== Manual Testing Instructions ===");
  console.log("");
  console.log("1. Open an agent interface");
  console.log("2. Navigate to Chat7");
  console.log("3. Open a conversation with a contact");
  console.log("4. Right-click on any message balloon");
  console.log("5. You should see a context menu with options:");
  console.log("   - Deletar Mensagem");
  console.log("   - Copiar Texto");
  console.log("   - Informações da Mensagem");
  console.log("");
  console.log("6. Test each option:");
  console.log("   - Deletar Mensagem: Should remove the message from your device only");
  console.log("   - Copiar Texto: Should copy the message text to clipboard");
  console.log("   - Informações da Mensagem: Should show a dialog with message details");
  console.log("");
  console.log("7. Test contact context menu (right-click on contact):");
  console.log("   - Clear History should only clear history for your device");
  console.log("");
  console.log("8. Verify device-specific behavior:");
  console.log("   - Delete a message on one device");
  console.log("   - Check if the message still exists on another device");
  console.log("   - Clear history on one device");
  console.log("   - Check if history is preserved on another device");
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🚀 Starting comprehensive device message deletion tests...");
  console.log("");

  await testDeviceMessageDeletion();
  console.log("");

  testContextMenuFunctionality();
  console.log("");

  await testDeviceSpecificClearHistory();
  console.log("");

  manualTestInstructions();
  console.log("");
  console.log("🎉 All tests completed!");
}

// Make functions available globally
window.testDeviceMessageDeletion = testDeviceMessageDeletion;
window.testContextMenuFunctionality = testContextMenuFunctionality;
window.testDeviceSpecificClearHistory = testDeviceSpecificClearHistory;
window.testDeviceMessageDeletionManual = manualTestInstructions;
window.testDeviceMessageDeletionAll = runAllTests;

console.log("Cyberpunk Agent | Device message deletion test functions loaded:");
console.log("  - testDeviceMessageDeletion() - Test core deletion functionality");
console.log("  - testContextMenuFunctionality() - Test context menu elements");
console.log("  - testDeviceSpecificClearHistory() - Test device-specific clear history");
console.log("  - testDeviceMessageDeletionManual() - Show manual testing instructions");
