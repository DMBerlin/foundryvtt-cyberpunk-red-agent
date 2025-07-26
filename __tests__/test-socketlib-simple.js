/**
 * Simple SocketLib Test
 * Quick test to verify SocketLib is working after fixes
 */

console.log("Cyberpunk Agent | Loading simple SocketLib test...");

function testSocketLibSimple() {
  console.log("=== Simple SocketLib Test ===");

  // Check if SocketLib is available globally
  if (typeof socketlib === 'undefined') {
    console.error("❌ SocketLib not available globally");
    return false;
  }
  console.log("✅ SocketLib available globally");

  // Check if our socket variable is set
  if (typeof socket === 'undefined') {
    console.error("❌ Socket variable not set");
    return false;
  }
  console.log("✅ Socket variable is set");

  // Check if CyberpunkAgent is available
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }
  console.log("✅ CyberpunkAgent available");

  const agent = window.CyberpunkAgent.instance;

  // Check SocketLib integration
  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib integration not available");
    return false;
  }
  console.log("✅ SocketLib integration available");

  // Check connection
  const isConnected = socketlib.isConnected();
  console.log(`📊 SocketLib connected: ${isConnected}`);

  // Check module registration
  try {
    const modules = socketlib.modules || [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`📊 Module registered: ${isRegistered}`);
  } catch (error) {
    console.error("❌ Error checking module registration:", error);
  }

  console.log("=== Simple test completed ===");
  return true;
}

// Test functions
window.testSocketLibSimple = testSocketLibSimple;

console.log("Cyberpunk Agent | Simple SocketLib test loaded");
console.log("Run 'testSocketLibSimple()' to test SocketLib"); 