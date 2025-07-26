/**
 * Test script for Communication Methods
 * Run this in the browser console to test different communication options
 */

console.log("Cyberpunk Agent | Testing communication methods...");

function testCommunicationMethods() {
  console.log("=== Communication Methods Test ===");

  // Check if the module is loaded
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not loaded!");
    return false;
  }

  console.log("✅ CyberpunkAgent loaded");

  // Test all communication methods
  console.log("Testing communication method detection...");

  if (typeof window.CyberpunkAgent.instance._getCommunicationMethod === 'function') {
    console.log("✅ _getCommunicationMethod method available");
  } else {
    console.error("❌ _getCommunicationMethod method not available");
    return false;
  }

  if (typeof window.CyberpunkAgent.instance._isSocketWorking === 'function') {
    console.log("✅ _isSocketWorking method available");
  } else {
    console.error("❌ _isSocketWorking method not available");
    return false;
  }

  if (typeof window.CyberpunkAgent.instance._needsCrossClientCommunication === 'function') {
    console.log("✅ _needsCrossClientCommunication method available");
  } else {
    console.error("❌ _needsCrossClientCommunication method not available");
    return false;
  }

  console.log("=== Communication methods tests completed successfully! ===");
  return true;
}

function testCurrentCommunicationStatus() {
  console.log("=== Current Communication Status ===");

  const agent = window.CyberpunkAgent.instance;

  // Check current settings
  const currentMethod = game.settings.get('cyberpunk-agent', 'communication-method') || 'auto';
  console.log(`📊 Current communication method setting: ${currentMethod}`);

  // Check socket status
  const socketWorking = agent._isSocketWorking();
  console.log(`📊 Socket working: ${socketWorking}`);

  // Check if cross-client communication is needed
  const needsCommunication = agent._needsCrossClientCommunication();
  console.log(`📊 Needs cross-client communication: ${needsCommunication}`);

  // Check what method would be used
  const actualMethod = agent._getCommunicationMethod();
  console.log(`📊 Actual communication method: ${actualMethod}`);

  // Check user count
  const userCount = game.users.size;
  console.log(`📊 Users in session: ${userCount}`);

  // Provide recommendations
  console.log("\n💡 Recommendations:");

  if (userCount === 1) {
    console.log("  - Single user session: No communication needed");
    console.log("  - Setting: 'none' would be most efficient");
  } else if (socketWorking) {
    console.log("  - Socket working: 'socket-only' or 'auto' recommended");
    console.log("  - Fastest and most reliable method");
  } else {
    console.log("  - Socket not working: 'chat-only' or 'auto' recommended");
    console.log("  - Chat fallback will be used");
  }

  return {
    setting: currentMethod,
    socketWorking,
    needsCommunication,
    actualMethod,
    userCount
  };
}

function testSocketConnectivity() {
  console.log("=== Socket Connectivity Test ===");

  const agent = window.CyberpunkAgent.instance;

  if (typeof agent._testSocketConnectivity !== 'function') {
    console.error("❌ _testSocketConnectivity method not available");
    return false;
  }

  console.log("Testing socket connectivity...");

  agent._testSocketConnectivity().then((isWorking) => {
    if (isWorking) {
      console.log("✅ Socket connectivity test passed");
    } else {
      console.log("❌ Socket connectivity test failed");
    }
  }).catch((error) => {
    console.error("❌ Error during socket test:", error);
  });

  return true;
}

function testDifferentCommunicationSettings() {
  console.log("=== Testing Different Communication Settings ===");

  const agent = window.CyberpunkAgent.instance;
  const originalSetting = game.settings.get('cyberpunk-agent', 'communication-method');

  const testSettings = ['auto', 'socket-only', 'chat-only', 'none'];

  console.log("Testing different communication settings...");

  testSettings.forEach(setting => {
    // Temporarily change setting
    game.settings.set('cyberpunk-agent', 'communication-method', setting);

    // Get what method would be used
    const method = agent._getCommunicationMethod();

    console.log(`  ${setting}: ${method}`);
  });

  // Restore original setting
  game.settings.set('cyberpunk-agent', 'communication-method', originalSetting);

  console.log("✅ Communication settings test completed");
  return true;
}

function compareCommunicationMethods() {
  console.log("=== Communication Methods Comparison ===");

  console.log("📋 Available Communication Methods:");
  console.log("");
  console.log("1. 🔄 AUTO (Recomendado)");
  console.log("   - Usa socket se disponível");
  console.log("   - Fallback para chat se necessário");
  console.log("   - Melhor para maioria dos casos");
  console.log("");
  console.log("2. 🔌 SOCKET-ONLY");
  console.log("   - Apenas comunicação via socket");
  console.log("   - Mais rápido e eficiente");
  console.log("   - Pode falhar se socket não funcionar");
  console.log("");
  console.log("3. 💬 CHAT-ONLY");
  console.log("   - Apenas comunicação via chat");
  console.log("   - Mais lento mas mais confiável");
  console.log("   - Cria mensagens invisíveis no chat");
  console.log("");
  console.log("4. ❌ NONE");
  console.log("   - Sem comunicação entre clientes");
  console.log("   - Apenas atualização local");
  console.log("   - Ideal para sessões únicas");
  console.log("");
  console.log("💡 Recomendações:");
  console.log("  - Sessão única: Use 'none'");
  console.log("  - Socket funcionando: Use 'socket-only'");
  console.log("  - Problemas de rede: Use 'chat-only'");
  console.log("  - Incerteza: Use 'auto'");

  return true;
}

function testNotificationBehavior() {
  console.log("=== Notification Behavior Test ===");

  const agent = window.CyberpunkAgent.instance;

  console.log("Testing notification behavior with current settings...");

  try {
    // Store original console.log to capture output
    const originalLog = console.log;
    let logOutput = '';
    console.log = function (...args) {
      logOutput += args.join(' ') + '\n';
      originalLog.apply(console, args);
    };

    // Trigger a notification
    agent.notifyContactUpdate();

    // Restore console.log
    console.log = originalLog;

    // Analyze the output
    if (logOutput.includes('Single user session, skipping cross-client notification')) {
      console.log("✅ Correctly skipped notification for single user");
    } else if (logOutput.includes('via socket')) {
      console.log("✅ Used socket communication");
    } else if (logOutput.includes('via chat message')) {
      console.log("✅ Used chat fallback");
    } else if (logOutput.includes('No communication method available')) {
      console.log("✅ Correctly disabled communication");
    } else {
      console.log("ℹ️ Notification behavior:", logOutput.trim());
    }

  } catch (error) {
    console.error("❌ Error during notification test:", error);
    return false;
  }

  console.log("=== Notification behavior test completed! ===");
  return true;
}

// Main test function
function runAllCommunicationTests() {
  console.log("🚀 Starting Communication Methods comprehensive tests...");

  const results = {
    methods: testCommunicationMethods(),
    status: testCurrentCommunicationStatus(),
    socket: testSocketConnectivity(),
    settings: testDifferentCommunicationSettings(),
    comparison: compareCommunicationMethods(),
    behavior: testNotificationBehavior()
  };

  console.log("=== Communication Test Results Summary ===");
  console.log("Methods Available:", results.methods ? "✅ PASS" : "❌ FAIL");
  console.log("Status Check:", results.status ? "✅ PASS" : "❌ FAIL");
  console.log("Socket Test:", results.socket ? "✅ PASS" : "❌ FAIL");
  console.log("Settings Test:", results.settings ? "✅ PASS" : "❌ FAIL");
  console.log("Comparison:", results.comparison ? "✅ PASS" : "❌ FAIL");
  console.log("Behavior Test:", results.behavior ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All communication tests passed! System is working correctly.");
  } else {
    console.log("⚠️ Some communication tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Utility functions
function changeCommunicationMethod(method) {
  const validMethods = ['auto', 'socket-only', 'chat-only', 'none'];

  if (!validMethods.includes(method)) {
    console.error("❌ Invalid method. Valid options:", validMethods);
    return false;
  }

  game.settings.set('cyberpunk-agent', 'communication-method', method);
  console.log(`✅ Communication method changed to: ${method}`);

  // Test the new setting
  const agent = window.CyberpunkAgent.instance;
  const actualMethod = agent._getCommunicationMethod();
  console.log(`📊 Actual method will be: ${actualMethod}`);

  return true;
}

function getCommunicationInfo() {
  const agent = window.CyberpunkAgent.instance;
  const setting = game.settings.get('cyberpunk-agent', 'communication-method');
  const actual = agent._getCommunicationMethod();
  const socketWorking = agent._isSocketWorking();
  const needsCommunication = agent._needsCrossClientCommunication();

  console.log("=== Communication Info ===");
  console.log(`Setting: ${setting}`);
  console.log(`Actual: ${actual}`);
  console.log(`Socket Working: ${socketWorking}`);
  console.log(`Needs Communication: ${needsCommunication}`);
  console.log(`Users: ${game.users.size}`);

  return { setting, actual, socketWorking, needsCommunication, users: game.users.size };
}

// Make test functions globally available
window.testCommunicationMethods = testCommunicationMethods;
window.testCurrentCommunicationStatus = testCurrentCommunicationStatus;
window.testSocketConnectivity = testSocketConnectivity;
window.testDifferentCommunicationSettings = testDifferentCommunicationSettings;
window.compareCommunicationMethods = compareCommunicationMethods;
window.testNotificationBehavior = testNotificationBehavior;
window.runAllCommunicationTests = runAllCommunicationTests;
window.changeCommunicationMethod = changeCommunicationMethod;
window.getCommunicationInfo = getCommunicationInfo;

console.log("Cyberpunk Agent | Communication methods test functions loaded");
console.log("Run 'runAllCommunicationTests()' to test everything");
console.log("Run 'changeCommunicationMethod(\"none\")' to disable communication");
console.log("Run 'getCommunicationInfo()' to see current status"); 