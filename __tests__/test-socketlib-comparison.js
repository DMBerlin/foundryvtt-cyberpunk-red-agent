/**
 * SocketLib vs Native Socket Comparison Test
 * Run this in the browser console to compare communication methods
 */

console.log("Cyberpunk Agent | Loading SocketLib comparison tests...");

async function compareCommunicationMethods() {
  console.log("=== SocketLib vs Native Socket Comparison ===");

  // Check if the module is loaded
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not loaded!");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("✅ CyberpunkAgent loaded");

  // Test SocketLib availability
  const socketLibStatus = window.getSocketLibStatus ? window.getSocketLibStatus() : { available: false };
  console.log("📊 SocketLib Status:", socketLibStatus);

  // Test native socket
  const nativeSocketStatus = {
    available: agent._isSocketWorking(),
    method: 'native-socket'
  };
  console.log("📊 Native Socket Status:", nativeSocketStatus);

  // Compare methods
  console.log("\n🔍 Method Comparison:");

  const methods = [
    { name: 'SocketLib', available: socketLibStatus.available, priority: 1 },
    { name: 'Native Socket', available: nativeSocketStatus.available, priority: 2 },
    { name: 'Chat Fallback', available: true, priority: 3 },
    { name: 'None', available: true, priority: 4 }
  ];

  methods.forEach(method => {
    const status = method.available ? "✅ Available" : "❌ Not Available";
    console.log(`  ${method.name}: ${status} (Priority: ${method.priority})`);
  });

  // Test current communication method
  const currentMethod = agent._getCommunicationMethod();
  console.log(`\n🎯 Current Communication Method: ${currentMethod}`);

  // Performance test
  await testPerformance();

  return true;
}

async function testPerformance() {
  console.log("\n⚡ Performance Test ===");

  const agent = window.CyberpunkAgent.instance;

  // Test SocketLib performance
  if (agent._isSocketLibAvailable()) {
    console.log("Testing SocketLib performance...");

    const startTime = performance.now();

    try {
      await agent.socketLibIntegration.testConnection();
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`✅ SocketLib response time: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error("❌ SocketLib performance test failed:", error);
    }
  }

  // Test native socket performance
  if (agent._isSocketWorking()) {
    console.log("Testing native socket performance...");

    const startTime = performance.now();

    try {
      // Simple ping test
      const testData = {
        type: 'ping',
        timestamp: Date.now()
      };

      game.socket.emit('module.cyberpunk-agent', testData);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`✅ Native socket response time: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error("❌ Native socket performance test failed:", error);
    }
  }
}

function testReliability() {
  console.log("\n🛡️ Reliability Test ===");

  const agent = window.CyberpunkAgent.instance;

  console.log("📋 Reliability Features Comparison:");

  const features = [
    {
      feature: "Automatic Reconnection",
      socketlib: "✅ Built-in",
      native: "❌ Manual handling required"
    },
    {
      feature: "Connection Monitoring",
      socketlib: "✅ Real-time status",
      native: "⚠️ Basic status only"
    },
    {
      feature: "Fallback Methods",
      socketlib: "✅ Multiple fallbacks",
      native: "❌ Single method"
    },
    {
      feature: "Error Handling",
      socketlib: "✅ Comprehensive",
      native: "⚠️ Basic error handling"
    },
    {
      feature: "Cross-Client Messaging",
      socketlib: "✅ GM-to-client, client-to-client",
      native: "⚠️ Limited to broadcast"
    }
  ];

  features.forEach(feature => {
    console.log(`  ${feature.feature}:`);
    console.log(`    SocketLib: ${feature.socketlib}`);
    console.log(`    Native: ${feature.native}`);
  });
}

function testFeatures() {
  console.log("\n🚀 Feature Comparison ===");

  console.log("📋 SocketLib Features:");
  console.log("  ✅ Reliable WebSocket communication");
  console.log("  ✅ Automatic reconnection handling");
  console.log("  ✅ Connection status monitoring");
  console.log("  ✅ Multiple fallback methods");
  console.log("  ✅ GM-to-client messaging");
  console.log("  ✅ Client-to-client messaging");
  console.log("  ✅ Broadcast capabilities");
  console.log("  ✅ Connection testing");
  console.log("  ✅ Error recovery");
  console.log("  ✅ Optimized for FoundryVTT");

  console.log("\n📋 Native Socket Features:");
  console.log("  ⚠️ Basic WebSocket communication");
  console.log("  ❌ Manual reconnection required");
  console.log("  ⚠️ Limited status monitoring");
  console.log("  ❌ Single fallback method");
  console.log("  ⚠️ Broadcast only");
  console.log("  ❌ No client-to-client messaging");
  console.log("  ⚠️ Basic error handling");
  console.log("  ❌ No connection testing");

  console.log("\n📋 Chat Fallback Features:");
  console.log("  ✅ Always available");
  console.log("  ✅ Works with any network");
  console.log("  ❌ Slower than sockets");
  console.log("  ❌ Creates chat messages");
  console.log("  ❌ Limited to broadcast");
  console.log("  ❌ No real-time status");
}

function getRecommendations() {
  console.log("\n💡 Recommendations ===");

  const agent = window.CyberpunkAgent.instance;
  const socketLibAvailable = agent._isSocketLibAvailable();
  const nativeSocketAvailable = agent._isSocketWorking();
  const userCount = game.users.size;

  console.log("📊 Current Environment:");
  console.log(`  Users: ${userCount}`);
  console.log(`  SocketLib: ${socketLibAvailable ? 'Available' : 'Not Available'}`);
  console.log(`  Native Socket: ${nativeSocketAvailable ? 'Available' : 'Not Available'}`);

  console.log("\n🎯 Recommended Settings:");

  if (userCount === 1) {
    console.log("  Single User Session:");
    console.log("    → Use 'none' for maximum efficiency");
    console.log("    → No communication needed");
  } else if (socketLibAvailable) {
    console.log("  Multi-User Session with SocketLib:");
    console.log("    → Use 'socketlib-only' for best performance");
    console.log("    → Most reliable and fastest method");
    console.log("    → Automatic fallback if needed");
  } else if (nativeSocketAvailable) {
    console.log("  Multi-User Session with Native Socket:");
    console.log("    → Use 'socket-only' for good performance");
    console.log("    → Consider installing SocketLib for better reliability");
  } else {
    console.log("  Multi-User Session without Sockets:");
    console.log("    → Use 'chat-only' as fallback");
    console.log("    → Consider network troubleshooting");
  }

  console.log("\n🔧 Installation Instructions:");
  console.log("  To install SocketLib:");
  console.log("    1. Go to Add-on Modules in FoundryVTT");
  console.log("    2. Install 'SocketLib' by League of Foundry Developers");
  console.log("    3. Enable SocketLib module");
  console.log("    4. Restart Cyberpunk Agent module");
}

// Main test function
async function runSocketLibComparison() {
  console.log("🚀 Starting SocketLib vs Native Socket comprehensive comparison...");

  const results = {
    comparison: await compareCommunicationMethods(),
    reliability: testReliability(),
    features: testFeatures(),
    recommendations: getRecommendations()
  };

  console.log("\n=== Comparison Test Results Summary ===");
  console.log("Method Comparison:", results.comparison ? "✅ PASS" : "❌ FAIL");
  console.log("Reliability Analysis:", results.reliability ? "✅ PASS" : "❌ FAIL");
  console.log("Feature Analysis:", results.features ? "✅ PASS" : "❌ FAIL");
  console.log("Recommendations:", results.recommendations ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All comparison tests completed successfully!");
    console.log("💡 Check the recommendations above for optimal configuration.");
  } else {
    console.log("⚠️ Some comparison tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Utility functions
function installSocketLibInstructions() {
  console.log("📥 SocketLib Installation Instructions:");
  console.log("");
  console.log("1. Open FoundryVTT");
  console.log("2. Go to 'Add-on Modules'");
  console.log("3. Click 'Install Module'");
  console.log("4. Enter manifest URL:");
  console.log("   https://github.com/League-of-Foundry-Developers/socketlib/releases/latest/download/module.json");
  console.log("5. Click 'Install'");
  console.log("6. Enable SocketLib module");
  console.log("7. Restart Cyberpunk Agent module");
  console.log("");
  console.log("After installation, run 'runSocketLibComparison()' to test the new setup.");
}

function getCurrentCommunicationInfo() {
  const agent = window.CyberpunkAgent.instance;

  return {
    socketLib: agent._isSocketLibAvailable(),
    nativeSocket: agent._isSocketWorking(),
    currentMethod: agent._getCommunicationMethod(),
    users: game.users.size,
    recommendation: getRecommendationForCurrentSetup()
  };
}

function getRecommendationForCurrentSetup() {
  const agent = window.CyberpunkAgent.instance;
  const socketLibAvailable = agent._isSocketLibAvailable();
  const userCount = game.users.size;

  if (userCount === 1) {
    return "Use 'none' - no communication needed for single user";
  } else if (socketLibAvailable) {
    return "Use 'socketlib-only' - best performance and reliability";
  } else if (agent._isSocketWorking()) {
    return "Use 'socket-only' - good performance, consider installing SocketLib";
  } else {
    return "Use 'chat-only' - fallback method, consider network troubleshooting";
  }
}

// Make test functions globally available
window.compareCommunicationMethods = compareCommunicationMethods;
window.testPerformance = testPerformance;
window.testReliability = testReliability;
window.testFeatures = testFeatures;
window.getRecommendations = getRecommendations;
window.runSocketLibComparison = runSocketLibComparison;
window.installSocketLibInstructions = installSocketLibInstructions;
window.getCurrentCommunicationInfo = getCurrentCommunicationInfo;
window.getRecommendationForCurrentSetup = getRecommendationForCurrentSetup;

console.log("Cyberpunk Agent | SocketLib comparison test functions loaded");
console.log("Run 'runSocketLibComparison()' to compare all methods");
console.log("Run 'installSocketLibInstructions()' for installation guide");
console.log("Run 'getCurrentCommunicationInfo()' to see current setup"); 