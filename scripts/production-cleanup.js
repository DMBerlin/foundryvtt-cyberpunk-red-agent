/**
 * Production Cleanup Script
 * Removes all debug and test functions, keeping only essential GM functions
 */

console.log("Cyberpunk Agent | Production cleanup - removing debug functions...");

// Remove debug functions but keep essential GM functions
const functionsToKeep = [
  'cyberpunkAgentMasterReset',
  'cyberpunkAgentCheckStatus'
];

// List of debug functions to remove
const debugFunctions = [
  'cyberpunkAgentFixTokenControls',
  'cyberpunkAgentTestContactLogic',
  'cyberpunkAgentTestNPCMessaging',
  'cyberpunkAgentDebugActorDevices',
  'cyberpunkAgentDebugChat7',
  'cyberpunkAgentDebugNavigation',
  'cyberpunkAgentTestPlayerMessaging',
  'cyberpunkAgentTestOfflineQueue',
  'cyberpunkAgentDebugOfflineMessages',
  'cyberpunkAgentDebugGMMessaging',
  'cyberpunkAgentSyncWithServer',
  'cyberpunkAgentTestGMConnection',
  'cyberpunkAgentTestOfflinePlayerSync',
  'testContactNetworkPersistence',
  'testPlayerContactNetworkAccess',
  'testMessagePersistence',
  'testRealtimeCommunication',
  'testSocketLibSetup'
];

// Remove debug functions from window object
debugFunctions.forEach(funcName => {
  if (window[funcName]) {
    delete window[funcName];
    console.log(`Cyberpunk Agent | Removed debug function: ${funcName}`);
  }
});

console.log("Cyberpunk Agent | Production cleanup completed");
console.log("Cyberpunk Agent | Remaining GM functions:");
functionsToKeep.forEach(funcName => {
  if (window[funcName]) {
    console.log(`  - ${funcName}() available`);
  }
});
