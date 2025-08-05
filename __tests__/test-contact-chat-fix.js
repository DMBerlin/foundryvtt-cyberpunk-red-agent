/**
 * Test script for contact chat fix
 * Tests that clicking on contacts in Chat7 opens conversations correctly
 */

console.log("🧪 Testing Contact Chat Fix...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check available devices
  console.log("\n📋 Available Devices:");
  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    allDevices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.ownerName} - ${device.phoneNumber} (${device.deviceId})`);
    });
  } else {
    console.log("No devices found");
  }

  // Test 3: Check contacts for each device
  console.log("\n📞 Contacts for Each Device:");
  const devices = window.cyberpunkAgent.devices;
  if (devices && devices.size > 0) {
    for (const [deviceId, device] of devices) {
      const contacts = window.cyberpunkAgent.getContactsForDevice(deviceId);
      console.log(`\n${device.deviceName || deviceId}:`);

      if (contacts && contacts.length > 0) {
        contacts.forEach(contactDeviceId => {
          const contactDevice = window.cyberpunkAgent.devices.get(contactDeviceId);
          if (contactDevice) {
            console.log(`  📱 ${contactDevice.deviceName} (${contactDeviceId})`);
          } else {
            console.log(`  ⚠️  Contact device ${contactDeviceId} not found in devices map`);
          }
        });
      } else {
        console.log("  No contacts");
      }
    }
  }

  // Test 4: Test contact lookup simulation
  console.log("\n🔍 Testing Contact Lookup Simulation:");
  if (devices && devices.size > 0) {
    const firstDevice = Array.from(devices.values())[0];
    const contacts = window.cyberpunkAgent.getContactsForDevice(firstDevice.id);

    if (contacts && contacts.length > 0) {
      const testContactId = contacts[0];
      console.log(`Testing contact lookup for: ${testContactId}`);

      // Simulate the old broken logic
      console.log("\n❌ Old Logic (Broken):");
      console.log("  getContactsForDevice() returns:", contacts);
      console.log("  Trying to find contact with .find(c => c.id === contactId)");
      console.log("  This fails because contacts is an array of device IDs, not contact objects");

      // Simulate the new fixed logic
      console.log("\n✅ New Logic (Fixed):");
      const contactDevice = window.cyberpunkAgent.devices.get(testContactId);
      if (contactDevice) {
        const contact = {
          id: testContactId,
          name: contactDevice.deviceName || `Device ${testContactId}`,
          img: contactDevice.img || 'icons/svg/mystery-man.svg'
        };
        console.log("  devices.get(contactId) returns:", contactDevice);
        console.log("  Created contact object:", contact);
        console.log("  ✅ Contact found successfully!");
      } else {
        console.log("  ❌ Contact device not found in devices map");
      }
    } else {
      console.log("No contacts found to test");
    }
  }

  // Test 5: Test conversation opening simulation
  console.log("\n🎯 Testing Conversation Opening:");
  if (devices && devices.size > 0) {
    const firstDevice = Array.from(devices.values())[0];
    const contacts = window.cyberpunkAgent.getContactsForDevice(firstDevice.id);

    if (contacts && contacts.length > 0) {
      const testContactId = contacts[0];
      const contactDevice = window.cyberpunkAgent.devices.get(testContactId);

      if (contactDevice) {
        console.log(`\nSimulating opening conversation with ${contactDevice.deviceName}:`);
        console.log("1. Contact ID:", testContactId);
        console.log("2. Contact Device Data:", contactDevice);
        console.log("3. Created Contact Object:", {
          id: testContactId,
          name: contactDevice.deviceName,
          img: contactDevice.img
        });
        console.log("4. ✅ Ready to navigate to conversation view");
      }
    } else {
      console.log("No contacts found to test conversation opening");
    }
  }

  // Test 6: Test the actual flow
  console.log("\n🎮 Testing Actual Flow:");
  console.log("1. Open any agent device");
  console.log("2. Navigate to Chat7");
  console.log("3. Click on any contact in the list");
  console.log("4. Verify the conversation opens without 'Contato não encontrado!' error");
  console.log("5. Verify the conversation shows the correct contact name and avatar");

  // Test 7: Debug functions
  console.log("\n🛠️ Debug Functions Available:");
  console.log("- window.cyberpunkAgent.getAllRegisteredDevices() - List all devices");
  console.log("- window.cyberpunkAgent.devices - Access devices map directly");
  console.log("- window.cyberpunkAgent.getContactsForDevice(deviceId) - Get contacts for device");

  // Test 8: Expected behavior after fix
  console.log("\n✅ Expected Behavior After Fix:");
  console.log("1. Clicking contacts in Chat7 opens conversations");
  console.log("2. No more 'Contato não encontrado!' errors");
  console.log("3. Conversations show correct contact names and avatars");
  console.log("4. Context menus work correctly for contacts");
  console.log("5. All contact interactions work as expected");

  console.log("\n🎉 Contact Chat Fix test setup complete!");
  console.log("Test clicking on contacts in Chat7 to verify the fix works.");
} 