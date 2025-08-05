/**
 * Test script for offline message delivery
 * Tests that messages are properly delivered when the receiver's agent is closed
 */

console.log("🧪 Testing Offline Message Delivery...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check SocketLib availability
  console.log("\n🔌 === SOCKETLIB STATUS ===");
  if (window.cyberpunkAgent._isSocketLibAvailable()) {
    console.log("✅ SocketLib is available");
    const status = window.cyberpunkAgent.socketLibIntegration.getDetailedStatus();
    console.log("SocketLib status:", status);
  } else {
    console.log("❌ SocketLib is not available");
    console.log("Note: Offline message delivery requires SocketLib for cross-client communication");
  }

  // Test 3: Check available devices
  console.log("\n📱 === AVAILABLE DEVICES ===");
  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    console.log("Available devices:");
    allDevices.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.ownerName} (${device.deviceId}) - ${device.phoneNumber}`);
    });

    // Test 4: Check current message state
    console.log("\n💬 === CURRENT MESSAGE STATE ===");
    console.log(`Total conversations in memory: ${window.cyberpunkAgent.messages.size}`);

    if (window.cyberpunkAgent.messages.size > 0) {
      console.log("Active conversations:");
      for (const [conversationKey, messages] of window.cyberpunkAgent.messages.entries()) {
        console.log(`  ${conversationKey}: ${messages.length} messages`);
      }
    } else {
      console.log("No conversations in memory");
    }

    // Test 5: Test device message sync function
    if (allDevices.length > 0) {
      console.log("\n🔄 === TESTING DEVICE MESSAGE SYNC ===");
      const testDevice = allDevices[0];
      console.log(`Testing sync for device: ${testDevice.ownerName} (${testDevice.deviceId})`);

      window.cyberpunkAgent.syncMessagesForDevice(testDevice.deviceId)
        .then(() => {
          console.log("✅ Device message sync completed");
        })
        .catch(error => {
          console.error("❌ Device message sync failed:", error);
        });
    }

    // Test 6: Manual testing instructions
    console.log("\n🎮 === MANUAL TESTING INSTRUCTIONS ===");
    console.log("");
    console.log("1. OFFLINE MESSAGE DELIVERY TEST:");
    console.log("   - Have Player A close their agent interface completely");
    console.log("   - Have Player B send a message to Player A's device");
    console.log("   - Have Player A open their agent interface again");
    console.log("   - Verify: The message should appear in the conversation");
    console.log("");
    console.log("2. CROSS-CLIENT MESSAGE PERSISTENCE TEST:");
    console.log("   - Send messages between two devices on different clients");
    console.log("   - Close both agent interfaces");
    console.log("   - Refresh both pages (Ctrl+F5)");
    console.log("   - Open the agent interfaces again");
    console.log("   - Verify: All messages should still be there");
    console.log("");
    console.log("3. NOTIFICATION SOUND TEST (OFFLINE):");
    console.log("   - Close your agent interface");
    console.log("   - Have another player send you a message");
    console.log("   - Verify: Notification sound should play (if you're the receiver)");
    console.log("   - Open your agent interface");
    console.log("   - Verify: Message should be there and marked as unread");
    console.log("");
    console.log("4. DEBUG COMMANDS:");
    console.log("   - window.cyberpunkAgent.syncMessagesForDevice('deviceId') - Sync messages for a specific device");
    console.log("   - window.cyberpunkAgent.listAllChatHistory() - List all chat history");
    console.log("   - window.cyberpunkAgent.listDeviceChatHistory('deviceId') - List chat history for a specific device");

    // Test 7: Expected behavior after fixes
    console.log("\n✅ === EXPECTED BEHAVIOR AFTER FIXES ===");
    console.log("1. Messages sent to offline users are saved to sender's localStorage");
    console.log("2. When offline user opens agent, messages are synced from other clients");
    console.log("3. Messages persist across page refreshes for all users");
    console.log("4. Notification sounds play for offline users when they receive messages");
    console.log("5. Messages are properly saved using device conversation keys");
    console.log("6. SocketLib handlers work for both actor and device messages");

    // Test 8: Technical details of the fix
    console.log("\n🔧 === TECHNICAL FIXES APPLIED ===");
    console.log("1. Fixed handleSendMessage() to use _getDeviceConversationKey for device messages");
    console.log("2. Fixed handleSendMessage() to call saveMessagesForDevice for device messages");
    console.log("3. Enhanced notification sound check to handle device ownership");
    console.log("4. Added syncMessagesForDevice() function for offline message sync");
    console.log("5. Added SocketLib handlers for device message sync requests/responses");
    console.log("6. Updated showAgentHome() to call syncMessagesForDevice() on open");
    console.log("7. Fixed loadMessages() to be called during module initialization");

    console.log("\n🎉 Offline Message Delivery test setup complete!");
    console.log("Follow the manual testing instructions to verify the fixes work.");
    console.log("The key improvement is that messages now work even when the receiver's agent is closed!");
  } else {
    console.log("No devices found for testing");
    console.log("Please ensure you have at least one agent device equipped to test offline message delivery");
  }
} 