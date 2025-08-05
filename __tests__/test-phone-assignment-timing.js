/**
 * Test script to verify phone number assignment timing
 * This script tests that phone numbers are assigned immediately when agent items are added to actor gear
 */

console.log("=== Cyberpunk Agent | Phone Number Assignment Timing Test ===");

// Test function to verify phone number assignment on item creation
async function testPhoneNumberAssignmentOnCreation() {
  console.log("\n--- Testing Phone Number Assignment on Item Creation ---");

  const agent = window.CyberpunkAgent.instance;
  if (!agent) {
    console.error("❌ CyberpunkAgent instance not found");
    return;
  }

  // Get current phone number count before test
  const beforeCount = agent.devicePhoneNumbers.size;
  console.log(`📱 Phone numbers before test: ${beforeCount}`);

  // Get a test actor (first character actor)
  const testActor = game.actors.find(actor => actor.type === 'character');
  if (!testActor) {
    console.error("❌ No character actor found for testing");
    return;
  }

  console.log(`🎭 Using test actor: ${testActor.name} (${testActor.id})`);

  // Create a test agent item
  const testItemData = {
    name: "Test Agent Device",
    type: "gear",
    system: {
      equipped: true
    }
  };

  try {
    console.log("🔧 Creating test agent item...");
    const testItem = await testActor.createEmbeddedDocuments("Item", [testItemData]);

    if (testItem && testItem.length > 0) {
      const item = testItem[0];
      console.log(`✅ Test agent item created: ${item.name} (${item.id})`);

      // Wait a moment for hooks to process
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if device was created
      const deviceId = `device-${testActor.id}-${item.id}`;
      const device = agent.devices.get(deviceId);

      if (device) {
        console.log(`✅ Device created: ${deviceId}`);

        // Check if phone number was assigned
        const phoneNumber = agent.devicePhoneNumbers.get(deviceId);
        if (phoneNumber) {
          console.log(`✅ Phone number assigned immediately: ${phoneNumber}`);
          console.log(`📞 Formatted: ${agent.formatPhoneNumberForDisplay(phoneNumber)}`);
        } else {
          console.log(`❌ Phone number NOT assigned immediately`);
        }

        // Check phone number count after creation
        const afterCount = agent.devicePhoneNumbers.size;
        console.log(`📱 Phone numbers after test: ${afterCount}`);
        console.log(`📈 Phone numbers added: ${afterCount - beforeCount}`);

      } else {
        console.log(`❌ Device was not created: ${deviceId}`);
      }

      // Clean up - delete the test item
      console.log("🧹 Cleaning up test item...");
      await item.delete();

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify cleanup
      const deviceAfterCleanup = agent.devices.get(deviceId);
      const phoneNumberAfterCleanup = agent.devicePhoneNumbers.get(deviceId);

      if (!deviceAfterCleanup && !phoneNumberAfterCleanup) {
        console.log("✅ Cleanup successful - device and phone number removed");
      } else {
        console.log("❌ Cleanup failed - device or phone number still exists");
      }

    } else {
      console.error("❌ Failed to create test agent item");
    }

  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

// Test function to verify phone number assignment on equipment
async function testPhoneNumberAssignmentOnEquipment() {
  console.log("\n--- Testing Phone Number Assignment on Equipment ---");

  const agent = window.CyberpunkAgent.instance;
  if (!agent) {
    console.error("❌ CyberpunkAgent instance not found");
    return;
  }

  // Get a test actor
  const testActor = game.actors.find(actor => actor.type === 'character');
  if (!testActor) {
    console.error("❌ No character actor found for testing");
    return;
  }

  console.log(`🎭 Using test actor: ${testActor.name} (${testActor.id})`);

  // Create a test agent item (unequipped)
  const testItemData = {
    name: "Test Agent Device (Unequipped)",
    type: "gear",
    system: {
      equipped: false
    }
  };

  try {
    console.log("🔧 Creating test agent item (unequipped)...");
    const testItem = await testActor.createEmbeddedDocuments("Item", [testItemData]);

    if (testItem && testItem.length > 0) {
      const item = testItem[0];
      console.log(`✅ Test agent item created: ${item.name} (${item.id})`);

      // Wait for hooks to process
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if device was created
      const deviceId = `device-${testActor.id}-${item.id}`;
      const device = agent.devices.get(deviceId);

      if (device) {
        console.log(`✅ Device created: ${deviceId}`);

        // Check if phone number was assigned (should be, even if unequipped)
        const phoneNumber = agent.devicePhoneNumbers.get(deviceId);
        if (phoneNumber) {
          console.log(`✅ Phone number assigned: ${phoneNumber}`);
        } else {
          console.log(`❌ Phone number NOT assigned`);
        }

        // Now equip the item
        console.log("🔧 Equipping the agent item...");
        await item.update({ "system.equipped": true });

        // Wait for hooks to process
        await new Promise(resolve => setTimeout(resolve, 200));

        // Check if phone number is still there after equipping
        const phoneNumberAfterEquip = agent.devicePhoneNumbers.get(deviceId);
        if (phoneNumberAfterEquip) {
          console.log(`✅ Phone number still assigned after equipping: ${phoneNumberAfterEquip}`);
        } else {
          console.log(`❌ Phone number lost after equipping`);
        }

      } else {
        console.log(`❌ Device was not created: ${deviceId}`);
      }

      // Clean up
      console.log("🧹 Cleaning up test item...");
      await item.delete();

    } else {
      console.error("❌ Failed to create test agent item");
    }

  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

// Test function to verify phone number cleanup on deletion
async function testPhoneNumberCleanupOnDeletion() {
  console.log("\n--- Testing Phone Number Cleanup on Deletion ---");

  const agent = window.CyberpunkAgent.instance;
  if (!agent) {
    console.error("❌ CyberpunkAgent instance not found");
    return;
  }

  // Get current phone number count
  const beforeCount = agent.devicePhoneNumbers.size;
  console.log(`📱 Phone numbers before test: ${beforeCount}`);

  // Get a test actor
  const testActor = game.actors.find(actor => actor.type === 'character');
  if (!testActor) {
    console.error("❌ No character actor found for testing");
    return;
  }

  console.log(`🎭 Using test actor: ${testActor.name} (${testActor.id})`);

  // Create a test agent item
  const testItemData = {
    name: "Test Agent Device for Deletion",
    type: "gear",
    system: {
      equipped: true
    }
  };

  try {
    console.log("🔧 Creating test agent item...");
    const testItem = await testActor.createEmbeddedDocuments("Item", [testItemData]);

    if (testItem && testItem.length > 0) {
      const item = testItem[0];
      console.log(`✅ Test agent item created: ${item.name} (${item.id})`);

      // Wait for hooks to process
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if device and phone number were created
      const deviceId = `device-${testActor.id}-${item.id}`;
      const device = agent.devices.get(deviceId);
      const phoneNumber = agent.devicePhoneNumbers.get(deviceId);

      if (device && phoneNumber) {
        console.log(`✅ Device and phone number created: ${phoneNumber}`);

        // Now delete the item
        console.log("🗑️ Deleting the agent item...");
        await item.delete();

        // Wait for cleanup hooks to process
        await new Promise(resolve => setTimeout(resolve, 200));

        // Check if device and phone number were cleaned up
        const deviceAfterDelete = agent.devices.get(deviceId);
        const phoneNumberAfterDelete = agent.devicePhoneNumbers.get(deviceId);

        if (!deviceAfterDelete && !phoneNumberAfterDelete) {
          console.log("✅ Cleanup successful - device and phone number removed");
        } else {
          console.log("❌ Cleanup failed - device or phone number still exists");
          if (deviceAfterDelete) console.log(`   Device still exists: ${deviceId}`);
          if (phoneNumberAfterDelete) console.log(`   Phone number still exists: ${phoneNumberAfterDelete}`);
        }

        // Check phone number count after deletion
        const afterCount = agent.devicePhoneNumbers.size;
        console.log(`📱 Phone numbers after deletion: ${afterCount}`);
        console.log(`📉 Phone numbers removed: ${beforeCount - afterCount}`);

      } else {
        console.log(`❌ Device or phone number was not created properly`);
        console.log(`   Device exists: ${!!device}`);
        console.log(`   Phone number exists: ${!!phoneNumber}`);
      }

    } else {
      console.error("❌ Failed to create test agent item");
    }

  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

// Main test function
async function runPhoneNumberAssignmentTests() {
  console.log("🚀 Starting Phone Number Assignment Timing Tests...");

  try {
    await testPhoneNumberAssignmentOnCreation();
    await testPhoneNumberAssignmentOnEquipment();
    await testPhoneNumberCleanupOnDeletion();

    console.log("\n✅ All phone number assignment timing tests completed!");

  } catch (error) {
    console.error("❌ Error running tests:", error);
  }
}

// Export the test function
window.testPhoneNumberAssignmentTiming = runPhoneNumberAssignmentTests;

console.log("📝 Test script loaded. Run 'window.testPhoneNumberAssignmentTiming()' to execute tests."); 