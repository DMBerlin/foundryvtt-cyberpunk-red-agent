/**
 * Debug script to test token controls functionality
 * Run this in the FoundryVTT console to diagnose token controls issues
 */

console.log('=== Cyberpunk Agent Token Controls Debug ===');

// Check if the module is loaded
if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
  console.error('❌ CyberpunkAgent instance not found!');
  console.log('Available global objects:', Object.keys(window).filter(key => key.toLowerCase().includes('cyberpunk')));
  return;
}

const agent = window.CyberpunkAgent.instance;
console.log('✅ CyberpunkAgent instance found');

// Test 1: Check if devices are loaded
console.log('\n=== Test 1: Device Data ===');
console.log('Devices Map:', agent.devices);
console.log('Devices size:', agent.devices?.size || 0);
console.log('Device Phone Numbers:', agent.devicePhoneNumbers);
console.log('Device Phone Numbers size:', agent.devicePhoneNumbers?.size || 0);

// Test 2: Check equipped agents for current user
console.log('\n=== Test 2: Equipped Agents for Current User ===');
agent.getEquippedAgentsForUser().then(equippedAgents => {
  console.log('Equipped agents:', equippedAgents);
  console.log('Number of equipped agents:', equippedAgents.length);

  if (equippedAgents.length === 0) {
    console.log('⚠️  No equipped agents found for current user');
    console.log('This could be why token controls are not appearing for players');
  }
}).catch(error => {
  console.error('❌ Error getting equipped agents:', error);
});

// Test 3: Check all registered devices (for GM)
console.log('\n=== Test 3: All Registered Devices ===');
const allDevices = agent.getAllRegisteredDevices();
console.log('All registered devices:', allDevices);
console.log('Number of registered devices:', allDevices.length);

if (allDevices.length === 0) {
  console.log('⚠️  No registered devices found');
  console.log('This could be why token controls are not appearing for GM');
}

// Test 4: Check user actors
console.log('\n=== Test 4: User Actors ===');
const userActors = agent.getUserActors();
console.log('User actors:', userActors);
console.log('Number of user actors:', userActors.length);

// Test 5: Check if devices have phone numbers
console.log('\n=== Test 5: Device Phone Numbers ===');
if (agent.devices && agent.devices.size > 0) {
  for (const [deviceId, device] of agent.devices) {
    const phoneNumber = agent.devicePhoneNumbers.get(deviceId);
    console.log(`Device ${deviceId}: ${phoneNumber || 'No phone number'}`);
  }
} else {
  console.log('No devices to check phone numbers for');
}

// Test 6: Force device discovery
console.log('\n=== Test 6: Force Device Discovery ===');
agent.discoverAndCreateDevices().then(() => {
  console.log('✅ Device discovery completed');
  console.log('Devices after discovery:', agent.devices?.size || 0);

  // Re-check equipped agents
  return agent.getEquippedAgentsForUser();
}).then(equippedAgents => {
  console.log('Equipped agents after discovery:', equippedAgents.length);
}).catch(error => {
  console.error('❌ Error during device discovery:', error);
});

// Test 7: Check token controls setup
console.log('\n=== Test 7: Token Controls Setup ===');
console.log('Current user is GM:', game.user.isGM);

// Test 8: Simulate addControlButton call
console.log('\n=== Test 8: Simulate addControlButton ===');
const mockControls = [
  {
    name: "token",
    title: "Token Controls",
    icon: "fas fa-users",
    tools: []
  }
];

console.log('Mock controls before:', mockControls);
agent.addControlButton(mockControls).then(() => {
  console.log('Mock controls after:', mockControls);
  console.log('Token tools added:', mockControls[0].tools.length);

  if (mockControls[0].tools.length === 0) {
    console.log('⚠️  No token tools were added');
  } else {
    console.log('✅ Token tools were added successfully');
    mockControls[0].tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.title}`);
    });
  }
}).catch(error => {
  console.error('❌ Error adding control button:', error);
});

// Test 9: Check if there are any Agent items in the world
console.log('\n=== Test 9: Agent Items in World ===');
const allItems = game.items.filter(item =>
  item.type === 'gear' &&
  item.name.toLowerCase().includes('agent')
);
console.log('Agent items found:', allItems.length);
allItems.forEach(item => {
  console.log(`  - ${item.name} (${item.id}) - Owner: ${item.actor?.name || 'No owner'}`);
});

// Test 10: Check equipped Agent items
console.log('\n=== Test 10: Equipped Agent Items ===');
const equippedAgentItems = allItems.filter(item => {
  const isEquipped =
    item.system?.equipped === true ||
    item.system?.equipped === 'equipped' ||
    item.flags?.equipped === true ||
    item.system?.equippedState === 'equipped' ||
    item.system?.equippedState === true ||
    item.system?.equipped === 1 ||
    item.system?.equipped === '1' ||
    item.system?.equipped === 'true';

  return isEquipped;
});

console.log('Equipped agent items:', equippedAgentItems.length);
equippedAgentItems.forEach(item => {
  console.log(`  - ${item.name} (${item.id}) - Owner: ${item.actor?.name || 'No owner'}`);
  console.log(`    Equipped status: ${item.system?.equipped} (${typeof item.system?.equipped})`);
});

console.log('\n=== Debug Complete ===');
console.log('If token controls are not appearing, check the warnings above.'); 