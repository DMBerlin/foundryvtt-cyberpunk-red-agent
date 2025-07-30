/**
 * Test script to verify SocketLib fix
 * This script tests the SocketLib availability check and communication
 */

console.log("=== SocketLib Fix Test ===");

// Test function to check SocketLib status
window.testSocketLibFix = async () => {
  console.log("🧪 Testing SocketLib fix...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check SocketLib availability
  console.log("1. Testing SocketLib availability check...");
  const isAvailable = agent._isSocketLibAvailable();
  console.log(`✅ SocketLib available: ${isAvailable}`);

  // Test 2: Test message sending without errors
  console.log("2. Testing message sending...");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📱 Testing message from ${actor1.name} to ${actor2.name}`);

  try {
    const result = await agent.sendMessage(actor1.id, actor2.id, "Teste do fix do SocketLib");
    console.log(`✅ Message send result: ${result}`);

    if (result) {
      console.log("✅ Message sent successfully without SocketLib errors");
    } else {
      console.warn("⚠️ Message send returned false, but no errors should appear");
    }
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return false;
  }

  // Test 3: Test save messages without errors
  console.log("3. Testing save messages...");
  try {
    await agent.saveMessages();
    console.log("✅ Save messages completed without SocketLib errors");
  } catch (error) {
    console.error("❌ Error saving messages:", error);
    return false;
  }

  // Test 4: Test contact update notification without errors
  console.log("4. Testing contact update notification...");
  try {
    await agent.notifyContactUpdate({
      action: 'test',
      contactName: 'Test Contact'
    });
    console.log("✅ Contact update notification completed without SocketLib errors");
  } catch (error) {
    console.error("❌ Error notifying contact update:", error);
    return false;
  }

  console.log("✅ All SocketLib fix tests completed successfully!");
  console.log("💡 Check the console - there should be no SocketLib error messages");

  ui.notifications.success("Teste do fix do SocketLib concluído com sucesso!");
  return true;
};

// Test function to check SocketLib status details
window.checkSocketLibStatus = () => {
  console.log("=== SocketLib Status Check ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔍 SocketLib Status Details:");
  console.log(`- SocketLib global: ${typeof socketlib !== 'undefined'}`);
  console.log(`- Socket available: ${!!window.socket}`);
  console.log(`- Integration available: ${!!agent.socketLibIntegration}`);
  console.log(`- Integration isAvailable: ${agent.socketLibIntegration ? agent.socketLibIntegration.isAvailable : false}`);

  if (socketlib) {
    console.log(`- SocketLib version: ${socketlib.version}`);
    console.log(`- SocketLib connected: ${socketlib.isConnected ? socketlib.isConnected() : 'method not available'}`);
    console.log(`- SocketLib modules: ${socketlib.modules ? socketlib.modules.join(', ') : 'not available'}`);
  }

  const isAvailable = agent._isSocketLibAvailable();
  console.log(`- Final availability check: ${isAvailable}`);

  if (isAvailable) {
    console.log("✅ SocketLib is considered available");
  } else {
    console.log("⚠️ SocketLib is not considered available, but communication may still work");
  }
};

// Test function to simulate the original error conditions
window.testOriginalSocketLibError = () => {
  console.log("=== Testing Original SocketLib Error Conditions ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Simulate the original strict check
  const hasIntegration = !!agent.socketLibIntegration;
  const integrationAvailable = agent.socketLibIntegration ? agent.socketLibIntegration.isAvailable : false;
  const socketlibGlobal = typeof socketlib !== 'undefined';
  const socketlibConnected = socketlib && typeof socketlib.isConnected === 'function' ? socketlib.isConnected() : false;
  const socketAvailable = !!window.socket;
  const moduleRegistered = socketlib && socketlib.modules && Array.isArray(socketlib.modules) ? socketlib.modules.includes('cyberpunk-agent') : false;

  console.log("🔍 Original strict check results:");
  console.log(`- hasIntegration: ${hasIntegration}`);
  console.log(`- integrationAvailable: ${integrationAvailable}`);
  console.log(`- socketlibGlobal: ${socketlibGlobal}`);
  console.log(`- socketlibConnected: ${socketlibConnected}`);
  console.log(`- socketAvailable: ${socketAvailable}`);
  console.log(`- moduleRegistered: ${moduleRegistered}`);

  const originalResult = hasIntegration && integrationAvailable && socketlibGlobal && socketlibConnected && socketAvailable && moduleRegistered;
  console.log(`- Original strict result: ${originalResult}`);

  const newResult = agent._isSocketLibAvailable();
  console.log(`- New lenient result: ${newResult}`);

  if (originalResult !== newResult) {
    console.log("✅ Fix working: Original strict check would have failed, but new check passes");
  } else {
    console.log("ℹ️ Both checks give same result");
  }
};

console.log("Cyberpunk Agent | SocketLib fix test functions loaded:");
console.log("  - testSocketLibFix() - Test the SocketLib fix");
console.log("  - checkSocketLibStatus() - Check detailed SocketLib status");
console.log("  - testOriginalSocketLibError() - Test original error conditions"); 