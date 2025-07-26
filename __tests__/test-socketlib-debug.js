/**
 * SocketLib Debug Test
 * Comprehensive debugging for SocketLib propagation issues
 */

console.log("Cyberpunk Agent | Loading SocketLib debug tests...");

async function debugSocketLibPropagation() {
  console.log("=== SocketLib Propagation Debug ===");

  // Step 1: Check SocketLib availability
  console.log("1. Checking SocketLib availability...");
  if (!window.socketlib) {
    console.error("❌ SocketLib not available globally");
    console.log("💡 Make sure SocketLib module is installed and enabled");
    return false;
  }
  console.log("✅ SocketLib available globally");

  // Step 2: Check CyberpunkAgent
  console.log("\n2. Checking CyberpunkAgent...");
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }
  console.log("✅ CyberpunkAgent available");

  const agent = window.CyberpunkAgent.instance;

  // Step 3: Check SocketLib integration
  console.log("\n3. Checking SocketLib integration...");
  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib integration not available");
    console.log("💡 SocketLib integration failed to initialize");
    return false;
  }
  console.log("✅ SocketLib integration available");

  // Step 4: Check SocketLib connection
  console.log("\n4. Checking SocketLib connection...");
  const isConnected = agent.socketLibIntegration.socketlib.isConnected();
  console.log(`📊 SocketLib connected: ${isConnected}`);

  if (!isConnected) {
    console.warn("⚠️ SocketLib not connected - this will prevent propagation");
  }

  // Step 5: Check module registration
  console.log("\n5. Checking module registration...");
  try {
    const modules = agent.socketLibIntegration.socketlib.modules || [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`📊 Module registered: ${isRegistered}`);

    if (!isRegistered) {
      console.warn("⚠️ Module not registered with SocketLib");
    }
  } catch (error) {
    console.error("❌ Error checking module registration:", error);
  }

  // Step 6: Check communication method
  console.log("\n6. Checking communication method...");
  const currentMethod = agent._getCommunicationMethod();
  const setting = game.settings.get('cyberpunk-agent', 'communication-method');
  console.log(`📊 Setting: ${setting}`);
  console.log(`📊 Actual method: ${currentMethod}`);

  if (currentMethod !== 'socketlib') {
    console.warn("⚠️ Not using SocketLib for communication");
    console.log("💡 Try: changeCommunicationMethod('socketlib-only')");
  }

  // Step 7: Test broadcast
  console.log("\n7. Testing SocketLib broadcast...");
  try {
    const result = await agent.socketLibIntegration.testBroadcast();
    console.log(`📊 Broadcast test result: ${result}`);
  } catch (error) {
    console.error("❌ Broadcast test failed:", error);
  }

  return true;
}

async function testContactUpdateFlow() {
  console.log("\n=== Contact Update Flow Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("Testing complete contact update flow...");

  // Store original console.log to capture output
  const originalLog = console.log;
  let logOutput = '';
  console.log = function (...args) {
    logOutput += args.join(' ') + '\n';
    originalLog.apply(console, args);
  };

  try {
    // Trigger a contact update
    console.log("Triggering contact update...");
    await agent.notifyContactUpdate();

    // Restore console.log
    console.log = originalLog;

    // Analyze the output
    console.log("\n📋 Communication method used:");
    if (logOutput.includes('SocketLib')) {
      console.log("✅ SocketLib was used");
    } else if (logOutput.includes('native socket')) {
      console.log("⚠️ Native socket was used");
    } else if (logOutput.includes('chat message')) {
      console.log("⚠️ Chat fallback was used");
    } else if (logOutput.includes('skipping cross-client')) {
      console.log("ℹ️ Single user session - no communication needed");
    } else {
      console.log("❓ Unknown method:", logOutput.trim());
    }

  } catch (error) {
    console.log = originalLog;
    console.error("❌ Error during contact update test:", error);
    return false;
  }

  return true;
}

function checkSocketLibMethods() {
  console.log("\n=== SocketLib Methods Check ===");

  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    return false;
  }

  const methods = [
    'register',
    'registerModule',
    'executeForEveryone',
    'executeAsGM',
    'executeAsUser',
    'isConnected',
    'modules'
  ];

  console.log("📋 SocketLib methods available:");
  methods.forEach(method => {
    const available = typeof window.socketlib[method] === 'function' || typeof window.socketlib[method] !== 'undefined';
    console.log(`  ${method}: ${available ? '✅' : '❌'}`);
  });

  return true;
}

function testManualSocketLibCommunication() {
  console.log("\n=== Manual SocketLib Communication Test ===");

  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("Testing manual SocketLib communication...");

  try {
    // Register a test handler
    window.socketlib.register('testMessage', (data) => {
      console.log("🎉 Received manual test message:", data);
      ui.notifications.info("Manual SocketLib test received!");
    });

    // Send a test message
    const testData = {
      timestamp: Date.now(),
      userId: game.user.id,
      userName: game.user.name,
      test: 'manual-communication'
    };

    window.socketlib.executeForEveryone('testMessage', testData);
    console.log("✅ Manual test message sent via SocketLib");

  } catch (error) {
    console.error("❌ Manual SocketLib communication failed:", error);
    return false;
  }

  return true;
}

function forceSocketLibUsage() {
  console.log("\n=== Forcing SocketLib Usage ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Change to socketlib-only
  game.settings.set('cyberpunk-agent', 'communication-method', 'socketlib-only');
  console.log("✅ Communication method set to 'socketlib-only'");

  // Check if it's working
  const newMethod = agent._getCommunicationMethod();
  console.log(`📊 New communication method: ${newMethod}`);

  if (newMethod === 'socketlib') {
    console.log("✅ SocketLib is now the active communication method");
  } else {
    console.warn("⚠️ SocketLib is not available, falling back to:", newMethod);
  }

  return newMethod === 'socketlib';
}

function checkUserActivity() {
  console.log("\n=== User Activity Check ===");

  const userCount = game.users.size;
  const isGM = game.user.isGM;
  const currentUser = game.user.name;

  console.log(`📊 Users in session: ${userCount}`);
  console.log(`📊 Current user: ${currentUser}`);
  console.log(`📊 Is GM: ${isGM}`);

  if (userCount === 1) {
    console.log("ℹ️ Single user session - no propagation needed");
    return false;
  }

  console.log("✅ Multi-user session - propagation should work");
  return true;
}

// Main debug function
async function runSocketLibDebug() {
  console.log("🚀 Starting comprehensive SocketLib debug...");

  const results = {
    availability: await debugSocketLibPropagation(),
    flow: await testContactUpdateFlow(),
    methods: checkSocketLibMethods(),
    manual: testManualSocketLibCommunication(),
    force: forceSocketLibUsage(),
    users: checkUserActivity()
  };

  console.log("\n=== Debug Results Summary ===");
  console.log("Availability Check:", results.availability ? "✅ PASS" : "❌ FAIL");
  console.log("Flow Test:", results.flow ? "✅ PASS" : "❌ FAIL");
  console.log("Methods Check:", results.methods ? "✅ PASS" : "❌ FAIL");
  console.log("Manual Test:", results.manual ? "✅ PASS" : "❌ FAIL");
  console.log("Force SocketLib:", results.force ? "✅ PASS" : "❌ FAIL");
  console.log("User Activity:", results.users ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All debug tests passed! SocketLib should be working.");
  } else {
    console.log("⚠️ Some debug tests failed. Check the logs above for details.");
    console.log("🔧 Try the following fixes:");
    console.log("  1. Restart SocketLib module");
    console.log("  2. Restart Cyberpunk Agent module");
    console.log("  3. Check browser console for errors");
    console.log("  4. Verify SocketLib is installed and enabled");
  }

  return allPassed;
}

// Utility functions
function restartSocketLib() {
  console.log("🔄 Restarting SocketLib module...");

  try {
    const socketlibModule = game.modules.get('socketlib');
    if (socketlibModule) {
      socketlibModule.disable();
      setTimeout(() => {
        socketlibModule.enable();
        console.log("✅ SocketLib module restarted");
      }, 1000);
    } else {
      console.error("❌ SocketLib module not found");
    }
  } catch (error) {
    console.error("❌ Error restarting SocketLib:", error);
  }
}

function checkSocketLibStatus() {
  console.log("=== SocketLib Status Check ===");

  const socketlibModule = game.modules.get('socketlib');
  if (socketlibModule) {
    console.log(`📊 SocketLib module active: ${socketlibModule.active}`);
    console.log(`📊 SocketLib module version: ${socketlibModule.version}`);
  } else {
    console.log("❌ SocketLib module not found");
  }

  if (window.socketlib) {
    console.log("✅ SocketLib global object available");
    console.log(`📊 SocketLib connected: ${window.socketlib.isConnected()}`);
  } else {
    console.log("❌ SocketLib global object not available");
  }
}

// Make debug functions globally available
window.debugSocketLibPropagation = debugSocketLibPropagation;
window.testContactUpdateFlow = testContactUpdateFlow;
window.checkSocketLibMethods = checkSocketLibMethods;
window.testManualSocketLibCommunication = testManualSocketLibCommunication;
window.forceSocketLibUsage = forceSocketLibUsage;
window.checkUserActivity = checkUserActivity;
window.runSocketLibDebug = runSocketLibDebug;
window.restartSocketLib = restartSocketLib;
window.checkSocketLibStatus = checkSocketLibStatus;

console.log("Cyberpunk Agent | SocketLib debug functions loaded");
console.log("Run 'runSocketLibDebug()' for comprehensive debugging");
console.log("Run 'forceSocketLibUsage()' to force SocketLib usage");
console.log("Run 'restartSocketLib()' to restart SocketLib module");
console.log("Run 'checkSocketLibStatus()' to check SocketLib status"); 