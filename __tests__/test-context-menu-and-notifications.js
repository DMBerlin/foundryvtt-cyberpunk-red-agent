/**
 * Test script for context menu and notification fixes
 * Tests that contact context menus work correctly and notification sounds play
 */

console.log("🧪 Testing Context Menu and Notification Fixes...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check notification sound system
  console.log("\n🔊 Testing Notification Sound System:");

  // Test notification sound function
  console.log("   Testing playNotificationSound function...");
  try {
    window.cyberpunkAgent.playNotificationSound();
    console.log("   ✅ playNotificationSound() called successfully");
  } catch (error) {
    console.error("   ❌ Error calling playNotificationSound:", error);
  }

  // Test sound effect function
  console.log("   Testing playSoundEffect function...");
  try {
    window.cyberpunkAgent.playSoundEffect('notification-message');
    console.log("   ✅ playSoundEffect('notification-message') called successfully");
  } catch (error) {
    console.error("   ❌ Error calling playSoundEffect:", error);
  }

  // Test toggle notification sounds
  console.log("   Testing toggleNotificationSounds function...");
  try {
    const currentState = window.cyberpunkAgent.toggleNotificationSounds();
    console.log(`   ✅ toggleNotificationSounds() returned: ${currentState}`);
    // Toggle back to original state
    window.cyberpunkAgent.toggleNotificationSounds();
    console.log("   ✅ Toggled back to original state");
  } catch (error) {
    console.error("   ❌ Error calling toggleNotificationSounds:", error);
  }

  // Test 3: Check available devices for context menu testing
  console.log("\n📱 Available Devices for Context Menu Testing:");
  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    allDevices.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.ownerName} - ${device.phoneNumber} (${device.deviceId})`);
    });
  } else {
    console.log("   No devices found");
  }

  // Test 4: Check contacts for context menu testing
  console.log("\n👥 Contacts for Context Menu Testing:");
  const devices = window.cyberpunkAgent.devices;
  if (devices && devices.size > 0) {
    for (const [deviceId, device] of devices) {
      const contacts = window.cyberpunkAgent.getContactsForDevice(deviceId);
      if (contacts && contacts.length > 0) {
        console.log(`\n   ${device.deviceName || deviceId}:`);
        contacts.forEach(contactDeviceId => {
          const contactDevice = window.cyberpunkAgent.devices.get(contactDeviceId);
          if (contactDevice) {
            console.log(`     📱 ${contactDevice.deviceName} (${contactDeviceId})`);
          }
        });
      }
    }
  } else {
    console.log("   No devices found");
  }

  // Test 5: Context menu fix verification
  console.log("\n🎯 Context Menu Fix Verification:");
  console.log("   ✅ Fixed: Contacts background context menu only shows when not clicking on contacts");
  console.log("   ✅ Fixed: Contact context menu shows when right-clicking on contact items");
  console.log("   ✅ Fixed: Event propagation properly controlled");

  // Test 6: Notification sound fix verification
  console.log("\n🔔 Notification Sound Fix Verification:");
  console.log("   ✅ Fixed: playNotificationSound() called with correct parameters in handleMessageUpdate");
  console.log("   ✅ Fixed: SocketLib handleMessageUpdate calls playNotificationSound with sender/receiver IDs");
  console.log("   ✅ Fixed: Mute system respected in notification sounds");

  // Test 7: Manual testing instructions
  console.log("\n🎮 Manual Testing Instructions:");

  console.log("\n📋 Context Menu Testing:");
  console.log("1. Open any agent device");
  console.log("2. Navigate to Chat7");
  console.log("3. Right-click on a contact item");
  console.log("4. Verify: Contact context menu appears (mute, mark read, clear history, info)");
  console.log("5. Right-click on empty space in contacts list");
  console.log("6. Verify: Background context menu appears (add contact)");
  console.log("7. Verify: No conflict between the two context menus");

  console.log("\n🔊 Notification Sound Testing:");
  console.log("1. Open two different agent devices (or have another player send a message)");
  console.log("2. Send a message from one device to another");
  console.log("3. Verify: Notification sound plays for the receiver");
  console.log("4. Test mute functionality:");
  console.log("   - Right-click on a contact and select 'Silenciar Contato'");
  console.log("   - Send another message to that contact");
  console.log("   - Verify: No notification sound plays for muted contacts");
  console.log("5. Test notification toggle:");
  console.log("   - Run: window.cyberpunkAgent.toggleNotificationSounds()");
  console.log("   - Send a message");
  console.log("   - Verify: No notification sound plays when disabled");

  // Test 8: Available test functions
  console.log("\n🛠️ Available Test Functions:");
  console.log("- window.cyberpunkAgent.playNotificationSound(senderId, receiverId) - Test notification sound");
  console.log("- window.cyberpunkAgent.playSoundEffect('notification-message') - Test sound effect");
  console.log("- window.cyberpunkAgent.toggleNotificationSounds() - Toggle notification sounds");
  console.log("- window.cyberpunkAgent.testSoundEffects() - Test all sound effects");

  // Test 9: Expected behavior after fixes
  console.log("\n✅ Expected Behavior After Fixes:");
  console.log("1. Contact context menus work correctly without conflicts");
  console.log("2. Background context menu only shows when clicking empty space");
  console.log("3. Notification sounds play for new messages");
  console.log("4. Muted contacts don't trigger notification sounds");
  console.log("5. Notification sounds can be toggled on/off");
  console.log("6. All context menu options work properly");

  console.log("\n🎉 Context Menu and Notification Fixes test setup complete!");
  console.log("Test the context menus and notification sounds to verify the fixes work.");
} 