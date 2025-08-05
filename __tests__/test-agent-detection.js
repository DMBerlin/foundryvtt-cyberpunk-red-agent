/**
 * Simple test script to check Agent item detection
 * Run this in the FoundryVTT console (F12)
 */

console.log('=== Cyberpunk Agent Detection Test ===');

// Check if the module is loaded
if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
  console.error('❌ CyberpunkAgent instance not found!');
  return;
}

const agent = window.CyberpunkAgent.instance;
console.log('✅ CyberpunkAgent instance found');

// Test 1: Check all items in the world
console.log('\n=== Test 1: All Items ===');
const allItems = game.items.contents;
console.log('Total items in world:', allItems.length);

// Test 2: Check for Agent items
console.log('\n=== Test 2: Agent Items ===');
const agentItems = allItems.filter(item =>
  item.type === 'gear' &&
  item.name.toLowerCase().includes('agent')
);
console.log('Agent items found:', agentItems.length);

agentItems.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name} (${item.id})`);
  console.log(`   Type: ${item.type}`);
  console.log(`   Owner: ${item.actor?.name || 'No owner'}`);
  console.log(`   Equipped: ${item.system?.equipped}`);
  console.log(`   System:`, item.system);
});

// Test 3: Check equipped Agent items
console.log('\n=== Test 3: Equipped Agent Items ===');
const equippedAgentItems = agentItems.filter(item => {
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
equippedAgentItems.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name} (${item.id}) - Owner: ${item.actor?.name || 'No owner'}`);
  console.log(`   Equipped status: ${item.system?.equipped} (${typeof item.system?.equipped})`);
});

// Test 4: Check user actors
console.log('\n=== Test 4: User Actors ===');
const userActors = agent.getUserActors();
console.log('User actors:', userActors.length);
userActors.forEach(actor => {
  console.log(`- ${actor.name} (${actor.id})`);
});

// Test 5: Check equipped agents for current user
console.log('\n=== Test 5: Equipped Agents for Current User ===');
agent.getEquippedAgentsForUser().then(equippedAgents => {
  console.log('Equipped agents for current user:', equippedAgents.length);
  equippedAgents.forEach(agent => {
    console.log(`- ${agent.actorName} (${agent.deviceId})`);
  });
}).catch(error => {
  console.error('Error getting equipped agents:', error);
});

// Test 6: Check all registered devices
console.log('\n=== Test 6: All Registered Devices ===');
const allDevices = agent.getAllRegisteredDevices();
console.log('All registered devices:', allDevices.length);
allDevices.forEach(device => {
  console.log(`- ${device.ownerName} (${device.deviceId}) - ${device.phoneNumber}`);
});

// Test 7: Force device discovery
console.log('\n=== Test 7: Force Device Discovery ===');
agent.discoverAndCreateDevices().then(() => {
  console.log('✅ Device discovery completed');
  console.log('Devices after discovery:', agent.devices?.size || 0);

  // Re-check equipped agents
  return agent.getEquippedAgentsForUser();
}).then(equippedAgents => {
  console.log('Equipped agents after discovery:', equippedAgents.length);
}).catch(error => {
  console.error('Error during device discovery:', error);
});

console.log('\n=== Test Complete ==='); 