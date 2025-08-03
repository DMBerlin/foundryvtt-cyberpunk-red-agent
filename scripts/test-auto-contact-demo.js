/**
 * Auto Contact Addition Demo
 * 
 * This script demonstrates how the auto contact addition feature works
 * when devices send messages to each other.
 */

console.log('=== Auto Contact Addition Demo ===');

// Check if CyberpunkAgent is available
if (!window.CyberpunkAgent?.instance) {
  console.error('❌ CyberpunkAgent instance not found. Please ensure the module is loaded.');
  return;
}

const cyberpunkAgent = window.CyberpunkAgent.instance;

// Demo function
async function demonstrateAutoContactAddition() {
  console.log('\n=== Starting Auto Contact Addition Demo ===');

  // Get all available devices
  const allDevices = cyberpunkAgent.getAllRegisteredDevices();
  console.log(`Found ${allDevices.length} registered devices`);

  if (allDevices.length < 2) {
    console.log('❌ Need at least 2 devices to demonstrate auto contact addition');
    console.log('Please ensure multiple characters have Agent items equipped');
    return;
  }

  // Display current devices and their contact lists
  console.log('\n--- Current Device Status ---');
  allDevices.forEach(device => {
    const contacts = cyberpunkAgent.getContactsForDevice(device.id);
    console.log(`${device.name} (${device.id}): ${contacts.length} contacts`);
    if (contacts.length > 0) {
      console.log(`  Contacts: ${contacts.map(c => {
        const contactDevice = allDevices.find(d => d.id === c);
        return contactDevice ? contactDevice.name : c;
      }).join(', ')}`);
    }
  });

  // Find two devices that don't have each other as contacts
  let device1 = null;
  let device2 = null;

  for (let i = 0; i < allDevices.length; i++) {
    for (let j = i + 1; j < allDevices.length; j++) {
      const d1 = allDevices[i];
      const d2 = allDevices[j];

      const d1Contacts = cyberpunkAgent.getContactsForDevice(d1.id);
      const d2Contacts = cyberpunkAgent.getContactsForDevice(d2.id);

      if (!d1Contacts.includes(d2.id) || !d2Contacts.includes(d1.id)) {
        device1 = d1;
        device2 = d2;
        break;
      }
    }
    if (device1 && device2) break;
  }

  if (!device1 || !device2) {
    console.log('✅ All devices already have each other as contacts!');
    console.log('This means the auto contact addition feature has already been used.');
    return;
  }

  console.log(`\n--- Demo: Auto Contact Addition ---`);
  console.log(`Device 1: ${device1.name} (${device1.id})`);
  console.log(`Device 2: ${device2.name} (${device2.id})`);

  // Check current contact status
  const device1Contacts = cyberpunkAgent.getContactsForDevice(device1.id);
  const device2Contacts = cyberpunkAgent.getContactsForDevice(device2.id);

  console.log(`\nBefore sending message:`);
  console.log(`${device1.name} has ${device2.name} as contact: ${device1Contacts.includes(device2.id)}`);
  console.log(`${device2.name} has ${device1.name} as contact: ${device2Contacts.includes(device1.id)}`);

  // Send a test message
  console.log(`\n--- Sending test message ---`);
  const testMessage = `Hello from ${device1.name}! This is a test message to demonstrate auto contact addition.`;

  try {
    const success = await cyberpunkAgent.sendDeviceMessage(device1.id, device2.id, testMessage);

    if (success) {
      console.log('✅ Message sent successfully!');

      // Check contact status after sending message
      const newDevice1Contacts = cyberpunkAgent.getContactsForDevice(device1.id);
      const newDevice2Contacts = cyberpunkAgent.getContactsForDevice(device2.id);

      console.log(`\nAfter sending message:`);
      console.log(`${device1.name} has ${device2.name} as contact: ${newDevice1Contacts.includes(device2.id)}`);
      console.log(`${device2.name} has ${device1.name} as contact: ${newDevice2Contacts.includes(device1.id)}`);

      // Verify auto contact addition worked
      if (newDevice1Contacts.includes(device2.id) && newDevice2Contacts.includes(device1.id)) {
        console.log('✅ SUCCESS: Auto contact addition worked!');
        console.log('Both devices now have each other as contacts.');
      } else {
        console.log('❌ FAILED: Auto contact addition did not work as expected');
      }

      // Check if contacts were added (not just already existed)
      const device1Added = !device1Contacts.includes(device2.id) && newDevice1Contacts.includes(device2.id);
      const device2Added = !device2Contacts.includes(device1.id) && newDevice2Contacts.includes(device1.id);

      if (device1Added || device2Added) {
        console.log('\n--- Contact Addition Summary ---');
        if (device1Added) {
          console.log(`✅ ${device2.name} was automatically added to ${device1.name}'s contacts`);
        }
        if (device2Added) {
          console.log(`✅ ${device1.name} was automatically added to ${device2.name}'s contacts`);
        }
      } else {
        console.log('ℹ️  Both devices already had each other as contacts');
      }

    } else {
      console.log('❌ Failed to send message');
    }

  } catch (error) {
    console.error('❌ Error sending message:', error);
  }

  // Show final contact lists
  console.log('\n--- Final Contact Lists ---');
  allDevices.forEach(device => {
    const contacts = cyberpunkAgent.getContactsForDevice(device.id);
    console.log(`${device.name}: ${contacts.length} contacts`);
    if (contacts.length > 0) {
      console.log(`  Contacts: ${contacts.map(c => {
        const contactDevice = allDevices.find(d => d.id === c);
        return contactDevice ? contactDevice.name : c;
      }).join(', ')}`);
    }
  });

  console.log('\n=== Auto Contact Addition Demo Complete ===');
}

// Run the demo
demonstrateAutoContactAddition().catch(console.error); 