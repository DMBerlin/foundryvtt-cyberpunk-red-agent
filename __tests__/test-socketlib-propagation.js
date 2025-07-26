/**
 * SocketLib Propagation Test
 * Diagnose and fix SocketLib propagation issues
 */

console.log("Cyberpunk Agent | Loading SocketLib propagation tests...");

async function diagnoseSocketLibPropagation() {
  console.log("=== SocketLib Propagation Diagnosis ===");

  // Check if SocketLib is available
  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    console.log("💡 Install SocketLib: https://github.com/League-of-Foundry-Developers/socketlib");
    return false;
  }

  console.log("✅ SocketLib found");

  // Check if CyberpunkAgent is loaded
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  console.log("✅ CyberpunkAgent loaded");

  // Check SocketLib integration
  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib integration not available");
    return false;
  }

  console.log("✅ SocketLib integration available");

  // Check current communication method
  const currentMethod = agent._getCommunicationMethod();
  console.log(`📊 Current communication method: ${currentMethod}`);

  // Check user count
  const userCount = game.users.size;
  console.log(`📊 Users in session: ${userCount}`);

  // Check if we're GM
  const isGM = game.user.isGM;
  console.log(`📊 Is GM: ${isGM}`);

  // Test SocketLib connection
  console.log("\n🔍 Testing SocketLib connection...");
  try {
    const connectionTest = await agent.socketLibIntegration.testConnection();
    console.log("Connection test result:", connectionTest);
  } catch (error) {
    console.error("Connection test failed:", error);
  }

  // Test broadcast
  console.log("\n🔍 Testing SocketLib broadcast...");
  try {
    const broadcastTest = await agent.socketLibIntegration.testBroadcast();
    console.log("Broadcast test result:", broadcastTest);
  } catch (error) {
    console.error("Broadcast test failed:", error);
  }

  return true;
}

async function testContactUpdatePropagation() {
  console.log("\n=== Contact Update Propagation Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib available, testing contact update propagation...");

  // Store original console.log to capture output
  const originalLog = console.log;
  let logOutput = '';
  console.log = function (...args) {
    logOutput += args.join(' ') + '\n';
    originalLog.apply(console, args);
  };

  try {
    // Trigger a contact update
    await agent.notifyContactUpdate();

    // Restore console.log
    console.log = originalLog;

    // Analyze the output
    if (logOutput.includes('SocketLib')) {
      console.log("✅ SocketLib was used for communication");
    } else if (logOutput.includes('native socket')) {
      console.log("⚠️ Native socket was used instead of SocketLib");
    } else if (logOutput.includes('chat message')) {
      console.log("⚠️ Chat fallback was used instead of SocketLib");
    } else {
      console.log("ℹ️ Communication method:", logOutput.trim());
    }

  } catch (error) {
    console.log = originalLog;
    console.error("❌ Error during contact update test:", error);
    return false;
  }

  return true;
}

function checkSocketLibRegistration() {
  console.log("\n=== SocketLib Registration Check ===");

  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib available");

  // Check if our module is registered
  try {
    const modules = window.socketlib.modules || [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`📊 Module registered: ${isRegistered}`);

    if (!isRegistered) {
      console.log("💡 Module not registered, this might be the issue");
    }
  } catch (error) {
    console.log("⚠️ Could not check module registration:", error);
  }

  // Check SocketLib methods
  const methods = [
    'register',
    'executeForEveryone',
    'executeAsGM',
    'executeAsUser',
    'isConnected'
  ];

  console.log("\n📋 SocketLib methods available:");
  methods.forEach(method => {
    const available = typeof window.socketlib[method] === 'function';
    console.log(`  ${method}: ${available ? '✅' : '❌'}`);
  });

  return true;
}

function testManualSocketLibBroadcast() {
  console.log("\n=== Manual SocketLib Broadcast Test ===");

  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib available, testing manual broadcast...");

  try {
    // Register our event handler if not already registered
    if (!window.socketlib.isRegistered('cyberpunk-agent', 'contactUpdate')) {
      window.socketlib.register('contactUpdate', (data) => {
        console.log("🎉 Received manual SocketLib broadcast:", data);
        ui.notifications.info("Manual SocketLib test received!");
      });
    }

    // Send a test broadcast
    const testData = {
      timestamp: Date.now(),
      userId: game.user.id,
      userName: game.user.name,
      test: 'manual'
    };

    window.socketlib.executeForEveryone('contactUpdate', testData);
    console.log("✅ Manual SocketLib broadcast sent");

  } catch (error) {
    console.error("❌ Manual SocketLib broadcast failed:", error);
    return false;
  }

  return true;
}

function fixSocketLibPropagation() {
  console.log("\n=== SocketLib Propagation Fix ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Check current settings
  const currentMethod = game.settings.get('cyberpunk-agent', 'communication-method');
  console.log(`📊 Current communication method setting: ${currentMethod}`);

  // Provide recommendations
  console.log("\n💡 Recommendations to fix propagation:");

  if (currentMethod !== 'socketlib-only' && currentMethod !== 'auto') {
    console.log("1. Change communication method to 'socketlib-only' or 'auto'");
    console.log("   Run: changeCommunicationMethod('socketlib-only')");
  }

  if (!agent._isSocketLibAvailable()) {
    console.log("2. SocketLib integration not available");
    console.log("   - Check if SocketLib module is installed and enabled");
    console.log("   - Restart Cyberpunk Agent module");
  }

  if (game.users.size === 1) {
    console.log("3. Single user session detected");
    console.log("   - No propagation needed for single user");
    console.log("   - Use 'none' for efficiency");
  }

  console.log("\n🔧 Quick fixes to try:");
  console.log("1. Restart Cyberpunk Agent module");
  console.log("2. Restart SocketLib module");
  console.log("3. Change communication method to 'socketlib-only'");
  console.log("4. Check browser console for errors");

  return true;
}

// Utility functions
function changeCommunicationMethod(method) {
  const validMethods = ['auto', 'socketlib-only', 'socket-only', 'chat-only', 'none'];

  if (!validMethods.includes(method)) {
    console.error("❌ Invalid method. Valid options:", validMethods);
    return false;
  }

  game.settings.set('cyberpunk-agent', 'communication-method', method);
  console.log(`✅ Communication method changed to: ${method}`);

  // Test the new setting
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    const agent = window.CyberpunkAgent.instance;
    const actualMethod = agent._getCommunicationMethod();
    console.log(`📊 Actual method will be: ${actualMethod}`);
  }

  return true;
}

function restartModule() {
  console.log("🔄 Restarting Cyberpunk Agent module...");

  try {
    // Disable and re-enable the module
    game.modules.get('cyberpunk-agent').disable();
    setTimeout(() => {
      game.modules.get('cyberpunk-agent').enable();
      console.log("✅ Module restarted");
    }, 1000);
  } catch (error) {
    console.error("❌ Error restarting module:", error);
  }
}

// Main test function
async function runSocketLibPropagationTests() {
  console.log("🚀 Starting SocketLib propagation comprehensive tests...");

  const results = {
    diagnosis: await diagnoseSocketLibPropagation(),
    propagation: await testContactUpdatePropagation(),
    registration: checkSocketLibRegistration(),
    manual: testManualSocketLibBroadcast(),
    fix: fixSocketLibPropagation()
  };

  console.log("\n=== Propagation Test Results Summary ===");
  console.log("Diagnosis:", results.diagnosis ? "✅ PASS" : "❌ FAIL");
  console.log("Propagation Test:", results.propagation ? "✅ PASS" : "❌ FAIL");
  console.log("Registration Check:", results.registration ? "✅ PASS" : "❌ FAIL");
  console.log("Manual Broadcast:", results.manual ? "✅ PASS" : "❌ FAIL");
  console.log("Fix Suggestions:", results.fix ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All propagation tests completed successfully!");
    console.log("💡 If propagation still doesn't work, try the suggested fixes above.");
  } else {
    console.log("⚠️ Some propagation tests failed. Check the logs above for details.");
    console.log("🔧 Try running the suggested fixes to resolve the issue.");
  }

  return allPassed;
}

// Make test functions globally available
window.diagnoseSocketLibPropagation = diagnoseSocketLibPropagation;
window.testContactUpdatePropagation = testContactUpdatePropagation;
window.checkSocketLibRegistration = checkSocketLibRegistration;
window.testManualSocketLibBroadcast = testManualSocketLibBroadcast;
window.fixSocketLibPropagation = fixSocketLibPropagation;
window.runSocketLibPropagationTests = runSocketLibPropagationTests;
window.changeCommunicationMethod = changeCommunicationMethod;
window.restartModule = restartModule;

console.log("Cyberpunk Agent | SocketLib propagation test functions loaded");
console.log("Run 'runSocketLibPropagationTests()' to diagnose propagation issues");
console.log("Run 'changeCommunicationMethod(\"socketlib-only\")' to force SocketLib");
console.log("Run 'restartModule()' to restart the module"); 