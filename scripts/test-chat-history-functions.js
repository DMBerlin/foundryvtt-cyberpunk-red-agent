/**
 * Test script for chat history functions
 * Demonstrates how to use the new chat history listing functions
 */

console.log("🧪 Testing Chat History Functions...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: List all chat history
  console.log("\n📱 === TESTING LIST ALL CHAT HISTORY ===");
  try {
    window.cyberpunkAgent.listAllChatHistory();
    console.log("✅ listAllChatHistory() executed successfully");
  } catch (error) {
    console.error("❌ Error calling listAllChatHistory:", error);
  }

  // Test 3: Get available devices for specific testing
  console.log("\n📱 === AVAILABLE DEVICES FOR TESTING ===");
  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    console.log("Available devices:");
    allDevices.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.ownerName} (${device.deviceId}) - ${device.phoneNumber}`);
    });

    // Test 4: List chat history for first device (if it has contacts)
    if (allDevices.length > 0) {
      const firstDevice = allDevices[0];
      console.log(`\n📱 === TESTING LIST DEVICE CHAT HISTORY FOR: ${firstDevice.ownerName} ===`);
      try {
        window.cyberpunkAgent.listDeviceChatHistory(firstDevice.deviceId);
        console.log("✅ listDeviceChatHistory() executed successfully");
      } catch (error) {
        console.error("❌ Error calling listDeviceChatHistory:", error);
      }

      // Test 5: Test conversation history between devices (if multiple devices exist)
      if (allDevices.length > 1) {
        const secondDevice = allDevices[1];
        console.log(`\n💬 === TESTING LIST CONVERSATION HISTORY BETWEEN: ${firstDevice.ownerName} AND ${secondDevice.ownerName} ===`);
        try {
          window.cyberpunkAgent.listConversationHistory(firstDevice.deviceId, secondDevice.deviceId);
          console.log("✅ listConversationHistory() executed successfully");
        } catch (error) {
          console.error("❌ Error calling listConversationHistory:", error);
        }
      } else {
        console.log("\n💬 === SKIPPING CONVERSATION HISTORY TEST ===");
        console.log("Need at least 2 devices to test conversation history");
      }
    }
  } else {
    console.log("No devices found for testing");
  }

  // Test 6: Function documentation
  console.log("\n📚 === FUNCTION DOCUMENTATION ===");
  console.log("Available chat history functions:");
  console.log("");
  console.log("1. listAllChatHistory()");
  console.log("   - Lists chat history for ALL devices in the system");
  console.log("   - Shows device info, contacts, message counts, and last messages");
  console.log("   - Provides overall statistics and averages");
  console.log("   - Usage: window.cyberpunkAgent.listAllChatHistory()");
  console.log("");
  console.log("2. listDeviceChatHistory(deviceId)");
  console.log("   - Lists chat history for a SPECIFIC device");
  console.log("   - Shows all conversations and messages for that device");
  console.log("   - Includes unread counts and mute status");
  console.log("   - Usage: window.cyberpunkAgent.listDeviceChatHistory('device-id-here')");
  console.log("");
  console.log("3. listConversationHistory(deviceId1, deviceId2)");
  console.log("   - Lists chat history for a SPECIFIC CONVERSATION between two devices");
  console.log("   - Shows all messages in chronological order");
  console.log("   - Includes conversation metadata (timeline, duration)");
  console.log("   - Usage: window.cyberpunkAgent.listConversationHistory('device1-id', 'device2-id')");
  console.log("");

  // Test 7: Example usage scenarios
  console.log("\n🎯 === EXAMPLE USAGE SCENARIOS ===");
  console.log("");
  console.log("Scenario 1: Debug all conversations");
  console.log("  window.cyberpunkAgent.listAllChatHistory()");
  console.log("");
  console.log("Scenario 2: Check a specific player's device");
  console.log("  // First get device ID from getAllRegisteredDevices()");
  console.log("  const devices = window.cyberpunkAgent.getAllRegisteredDevices();");
  console.log("  const playerDevice = devices.find(d => d.ownerName === 'Player Name');");
  console.log("  window.cyberpunkAgent.listDeviceChatHistory(playerDevice.deviceId);");
  console.log("");
  console.log("Scenario 3: Debug a specific conversation");
  console.log("  // Get device IDs for the two participants");
  console.log("  window.cyberpunkAgent.listConversationHistory('device1-id', 'device2-id');");
  console.log("");
  console.log("Scenario 4: Find devices with most activity");
  console.log("  // Run listAllChatHistory() and look for devices with high message counts");
  console.log("  window.cyberpunkAgent.listAllChatHistory();");
  console.log("");

  // Test 8: Error handling examples
  console.log("\n⚠️ === ERROR HANDLING EXAMPLES ===");
  console.log("");
  console.log("Example 1: Invalid device ID");
  console.log("  window.cyberpunkAgent.listDeviceChatHistory('invalid-device-id');");
  console.log("  // Will show: ❌ Device invalid-device-id not found");
  console.log("");
  console.log("Example 2: No devices registered");
  console.log("  // If no devices exist, listAllChatHistory() will show:");
  console.log("  // ❌ No devices registered in the system");
  console.log("");
  console.log("Example 3: No messages in conversation");
  console.log("  // If a conversation has no messages, listConversationHistory() will show:");
  console.log("  // 💬 No messages in this conversation");
  console.log("");

  // Test 9: Output format explanation
  console.log("\n📋 === OUTPUT FORMAT EXPLANATION ===");
  console.log("");
  console.log("Message format:");
  console.log("  ✓ [14:30] Sender Name: Message text");
  console.log("  ○ [14:31] Receiver Name: Message text");
  console.log("");
  console.log("Symbols:");
  console.log("  ✓ = Message read");
  console.log("  ○ = Message unread");
  console.log("  → = Message sent by first device");
  console.log("  ← = Message received by first device");
  console.log("");
  console.log("Statistics shown:");
  console.log("  📊 Messages: Total message count");
  console.log("  📖 Unread: Number of unread messages");
  console.log("  🔇 Muted: Whether the contact is muted");
  console.log("  📈 Average: Average messages per conversation/device");
  console.log("");

  console.log("\n🎉 Chat History Functions test setup complete!");
  console.log("Use the functions above to explore chat history in your system.");
} 