/**
 * Test Error Fix for processNewMessagesAndContacts
 * ================================================
 * 
 * This script specifically tests the fix for the error:
 * "TypeError: Cannot read properties of undefined (reading 'devices')"
 */

console.log("=== Testing Error Fix for processNewMessagesAndContacts ===");

/**
 * Test the specific error fix
 */
async function testProcessNewMessagesAndContactsErrorFix() {
  console.log("\n--- Testing processNewMessagesAndContacts Error Fix ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    console.log("✅ CyberpunkAgent instance found");
    console.log("✅ this.devices type:", typeof cyberpunkAgent.devices);
    console.log("✅ this.devices size:", cyberpunkAgent.devices?.size);

    // Get available devices
    const devices = cyberpunkAgent.getUserAccessibleDevices();
    console.log("✅ Available devices:", devices.length);

    if (devices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true; // Not an error, just no devices to test with
    }

    const testDeviceId = devices[0].id;
    console.log(`✅ Testing with device: ${testDeviceId}`);

    // Test the method that was causing the error
    console.log("🔄 Calling processNewMessagesAndContacts...");
    await cyberpunkAgent.processNewMessagesAndContacts(testDeviceId);

    console.log("✅ processNewMessagesAndContacts completed without errors!");
    return true;
  } catch (error) {
    console.error("❌ Error testing processNewMessagesAndContacts fix:", error);
    console.error("❌ Error stack:", error.stack);
    return false;
  }
}

/**
 * Test device data loading
 */
async function testDeviceDataLoading() {
  console.log("\n--- Testing Device Data Loading ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    console.log("✅ Testing loadDeviceData method...");

    // Test loadDeviceData method
    cyberpunkAgent.loadDeviceData();

    console.log("✅ loadDeviceData completed");
    console.log("✅ this.devices size after load:", cyberpunkAgent.devices.size);
    console.log("✅ this.deviceMappings size after load:", cyberpunkAgent.deviceMappings.size);

    return true;
  } catch (error) {
    console.error("❌ Error testing device data loading:", error);
    return false;
  }
}

/**
 * Test device retrieval
 */
async function testDeviceRetrieval() {
  console.log("\n--- Testing Device Retrieval ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get available devices
    const devices = cyberpunkAgent.getUserAccessibleDevices();

    if (devices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDeviceId = devices[0].id;
    console.log(`✅ Testing device retrieval for: ${testDeviceId}`);

    // Load device data
    cyberpunkAgent.loadDeviceData();

    // Try to get the device
    const device = cyberpunkAgent.devices.get(testDeviceId);

    if (device) {
      console.log("✅ Device retrieved successfully:", device.deviceName);
      return true;
    } else {
      console.error("❌ Device not found in this.devices");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing device retrieval:", error);
    return false;
  }
}

/**
 * Comprehensive test of the error fix
 */
async function runComprehensiveErrorFixTest() {
  console.log("=== Running Comprehensive Error Fix Test ===");

  const tests = [
    testDeviceDataLoading,
    testDeviceRetrieval,
    testProcessNewMessagesAndContactsErrorFix
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
    }
  }

  console.log(`\n=== Test Results: ${passedTests}/${totalTests} tests passed ===`);

  if (passedTests === totalTests) {
    console.log("🎉 All error fix tests passed! The issue should be resolved.");
  } else {
    console.log("⚠️ Some tests failed. The error might still occur.");
  }

  return passedTests === totalTests;
}

/**
 * Quick test function
 */
function testErrorFix() {
  console.log("Testing the processNewMessagesAndContacts error fix...");
  runComprehensiveErrorFixTest().then(success => {
    if (success) {
      console.log("✅ Error fix test passed!");
    } else {
      console.log("❌ Error fix test failed");
    }
  });
}

/**
 * Force cache refresh test
 */
function forceCacheRefresh() {
  console.log("Forcing cache refresh...");

  // Clear any cached data
  if (window.CyberpunkAgent?.instance) {
    const cyberpunkAgent = window.CyberpunkAgent.instance;

    // Clear and reload device data
    cyberpunkAgent.devices.clear();
    cyberpunkAgent.deviceMappings.clear();

    console.log("✅ Cache cleared, reloading data...");
    cyberpunkAgent.loadDeviceData();

    console.log("✅ Cache refresh completed");
  } else {
    console.error("❌ CyberpunkAgent instance not found");
  }
}

// Export functions for manual testing
window.testErrorFix = testErrorFix;
window.runComprehensiveErrorFixTest = runComprehensiveErrorFixTest;
window.forceCacheRefresh = forceCacheRefresh;

console.log("Error fix tests loaded. Use testErrorFix() to run tests.");
console.log("Use forceCacheRefresh() to clear and reload cached data."); 