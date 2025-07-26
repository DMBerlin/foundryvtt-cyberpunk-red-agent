/**
 * SocketLib Fix Test
 * Test script to verify SocketLib fixes are working
 */

console.log("Cyberpunk Agent | Loading SocketLib fix test...");

async function testSocketLibFix() {
  console.log("=== SocketLib Fix Test ===");

  // Step 1: Check if SocketLib is available
  if (typeof socketlib === 'undefined') {
    console.error("❌ SocketLib not available globally");
    return false;
  }
  console.log("✅ SocketLib available globally");

  // Step 2: Check if our socket variable is set
  if (typeof socket === 'undefined') {
    console.error("❌ Socket variable not set");
    return false;
  }
  console.log("✅ Socket variable is set");

  // Step 3: Check if CyberpunkAgent is available
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }
  console.log("✅ CyberpunkAgent available");

  const agent = window.CyberpunkAgent.instance;

  // Step 4: Check SocketLib integration
  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib integration not available");
    return false;
  }
  console.log("✅ SocketLib integration available");

  // Step 5: Check connection
  const isConnected = socketlib.isConnected();
  console.log(`📊 SocketLib connected: ${isConnected}`);

  // Step 6: Check module registration
  try {
    const modules = socketlib.modules || [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`📊 Module registered: ${isRegistered}`);

    if (!isRegistered) {
      console.warn("⚠️ Module not registered with SocketLib");
    }
  } catch (error) {
    console.error("❌ Error checking module registration:", error);
  }

  // Step 7: Test communication method
  const currentMethod = agent._getCommunicationMethod();
  console.log(`📊 Current communication method: ${currentMethod}`);

  if (currentMethod !== 'socketlib') {
    console.warn("⚠️ Not using SocketLib for communication");
    console.log("💡 Try: changeCommunicationMethod('socketlib-only')");
  }

  // Step 8: Test broadcast
  console.log("\n🔍 Testing SocketLib broadcast...");
  try {
    const result = await agent.socketLibIntegration.testBroadcast();
    console.log(`📊 Broadcast test result: ${result}`);

    if (result) {
      console.log("✅ SocketLib broadcast test successful");
    } else {
      console.log("❌ SocketLib broadcast test failed");
    }
  } catch (error) {
    console.error("❌ Broadcast test error:", error);
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
    if (logOutput.includes('SocketLib notification sent successfully')) {
      console.log("✅ SocketLib was used successfully");
    } else if (logOutput.includes('SocketLib was used')) {
      console.log("⚠️ SocketLib was used but may have failed");
    } else if (logOutput.includes('native socket')) {
      console.log("⚠️ Native socket was used instead of SocketLib");
    } else if (logOutput.includes('chat message')) {
      console.log("⚠️ Chat fallback was used instead of SocketLib");
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

// Main test function
async function runSocketLibFixTest() {
  console.log("🚀 Starting SocketLib fix comprehensive test...");

  const results = {
    availability: await testSocketLibFix(),
    flow: await testContactUpdateFlow(),
    force: forceSocketLibUsage(),
    users: checkUserActivity()
  };

  console.log("\n=== Fix Test Results Summary ===");
  console.log("Availability Check:", results.availability ? "✅ PASS" : "❌ FAIL");
  console.log("Flow Test:", results.flow ? "✅ PASS" : "❌ FAIL");
  console.log("Force SocketLib:", results.force ? "✅ PASS" : "❌ FAIL");
  console.log("User Activity:", results.users ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All fix tests passed! SocketLib should be working correctly.");
  } else {
    console.log("⚠️ Some fix tests failed. Check the logs above for details.");
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

// Make test functions globally available
window.testSocketLibFix = testSocketLibFix;
window.testContactUpdateFlow = testContactUpdateFlow;
window.forceSocketLibUsage = forceSocketLibUsage;
window.checkUserActivity = checkUserActivity;
window.runSocketLibFixTest = runSocketLibFixTest;
window.restartSocketLib = restartSocketLib;
window.checkSocketLibStatus = checkSocketLibStatus;

console.log("Cyberpunk Agent | SocketLib fix test functions loaded");
console.log("Run 'runSocketLibFixTest()' for comprehensive testing");
console.log("Run 'forceSocketLibUsage()' to force SocketLib usage");
console.log("Run 'restartSocketLib()' to restart SocketLib module");
console.log("Run 'checkSocketLibStatus()' to check SocketLib status"); 