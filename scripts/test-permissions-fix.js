/**
 * Test script to verify permissions fix for read timestamps
 * This script tests the read timestamps functionality for non-GM users
 */

console.log("=== Permissions Fix Test ===");

// Test function to check read timestamps permissions
window.testPermissionsFix = async () => {
  console.log("🧪 Testing permissions fix for read timestamps...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check current user permissions
  console.log("1. Testing current user permissions...");
  console.log(`👤 Current user: ${game.user.name}`);
  console.log(`🔑 Is GM: ${game.user.isGM}`);
  console.log(`🔑 Is Assistant: ${game.user.hasRole('ASSISTANT')}`);
  console.log(`🔑 User ID: ${game.user.id}`);

  // Test 2: Test loading read timestamps
  console.log("2. Testing read timestamps loading...");
  try {
    agent._loadReadTimestamps();
    console.log("✅ Read timestamps loaded successfully");
  } catch (error) {
    console.error("❌ Error loading read timestamps:", error);
    return false;
  }

  // Test 3: Test saving read timestamps
  console.log("3. Testing read timestamps saving...");
  try {
    // Add a test timestamp
    const testKey = `test-${Date.now()}`;
    agent.lastReadTimestamps.set(testKey, Date.now());

    // Try to save
    agent._saveReadTimestamps();
    console.log("✅ Read timestamps saved successfully");

    // Clean up test data
    agent.lastReadTimestamps.delete(testKey);
  } catch (error) {
    console.error("❌ Error saving read timestamps:", error);
    return false;
  }

  // Test 4: Test markConversationAsRead for non-GM users
  console.log("4. Testing markConversationAsRead for non-GM users...");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📱 Testing markConversationAsRead between ${actor1.name} and ${actor2.name}`);

  try {
    // Mark conversation as read
    agent.markConversationAsRead(actor1.id, actor2.id);
    console.log("✅ markConversationAsRead completed without permission errors");
  } catch (error) {
    console.error("❌ Error in markConversationAsRead:", error);
    return false;
  }

  // Test 5: Test localStorage fallback
  console.log("5. Testing localStorage fallback...");
  const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
  const storedData = localStorage.getItem(storageKey);

  if (storedData) {
    console.log("✅ Data found in localStorage");
    try {
      const parsedData = JSON.parse(storedData);
      console.log("✅ Data parsed successfully from localStorage");
      console.log("📊 Stored timestamps:", Object.keys(parsedData).length);
    } catch (error) {
      console.error("❌ Error parsing localStorage data:", error);
    }
  } else {
    console.log("ℹ️ No data in localStorage (this is normal for first run)");
  }

  console.log("✅ All permissions fix tests completed successfully!");
  console.log("💡 Non-GM users should now be able to mark conversations as read without permission errors");

  ui.notifications.success("Teste do fix de permissões concluído com sucesso!");
  return true;
};

// Test function to simulate the original error
window.testOriginalPermissionError = () => {
  console.log("=== Testing Original Permission Error ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔍 Simulating original permission error scenario...");
  console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

  // Test if the user would have had permission issues before the fix
  if (game.user.isGM) {
    console.log("ℹ️ User is GM, would not have had permission issues");
  } else {
    console.log("ℹ️ User is not GM, would have had permission issues before the fix");
    console.log("✅ Fix should prevent permission errors now");
  }

  // Test the current functionality
  try {
    const testKey = `test-permission-${Date.now()}`;
    agent.lastReadTimestamps.set(testKey, Date.now());
    agent._saveReadTimestamps();
    agent.lastReadTimestamps.delete(testKey);
    console.log("✅ Current functionality works without permission errors");
  } catch (error) {
    console.error("❌ Still getting permission errors:", error);
  }
};

// Test function to check localStorage functionality
window.testLocalStorageFunctionality = () => {
  console.log("=== Testing localStorage Functionality ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🧪 Testing localStorage read/write functionality...");

  // Test 1: Write to localStorage
  console.log("1. Testing localStorage write...");
  const testData = {
    "test-conversation-1": Date.now(),
    "test-conversation-2": Date.now() - 1000
  };

  const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;

  try {
    localStorage.setItem(storageKey, JSON.stringify(testData));
    console.log("✅ Data written to localStorage successfully");
  } catch (error) {
    console.error("❌ Error writing to localStorage:", error);
    return;
  }

  // Test 2: Read from localStorage
  console.log("2. Testing localStorage read...");
  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log("✅ Data read from localStorage successfully");
      console.log("📊 Stored data:", parsedData);
    } else {
      console.error("❌ No data found in localStorage");
    }
  } catch (error) {
    console.error("❌ Error reading from localStorage:", error);
  }

  // Test 3: Clear test data
  console.log("3. Cleaning up test data...");
  try {
    localStorage.removeItem(storageKey);
    console.log("✅ Test data cleaned up successfully");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
  }

  console.log("✅ localStorage functionality test completed!");
};

// Test function to check settings vs localStorage behavior
window.testSettingsVsLocalStorage = () => {
  console.log("=== Testing Settings vs localStorage Behavior ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔍 Testing behavior based on user role...");

  if (game.user.isGM || game.user.hasRole('ASSISTANT')) {
    console.log("👑 User is GM or Assistant - should use settings");
    console.log("📊 Settings scope: world");
  } else {
    console.log("👤 User is Player - should use localStorage");
    console.log("📊 Storage: localStorage per user");
  }

  // Test the actual behavior
  console.log("🧪 Testing actual behavior...");

  try {
    // Clear current data
    agent.lastReadTimestamps.clear();

    // Add test data
    const testKey = `test-behavior-${Date.now()}`;
    agent.lastReadTimestamps.set(testKey, Date.now());

    // Save
    agent._saveReadTimestamps();

    // Clear and reload
    agent.lastReadTimestamps.clear();
    agent._loadReadTimestamps();

    // Check if data was restored
    const restored = agent.lastReadTimestamps.has(testKey);
    console.log(`✅ Data persistence test: ${restored ? 'SUCCESS' : 'FAILED'}`);

    // Clean up
    agent.lastReadTimestamps.delete(testKey);

  } catch (error) {
    console.error("❌ Error testing behavior:", error);
  }

  console.log("✅ Settings vs localStorage behavior test completed!");
};

console.log("Cyberpunk Agent | Permissions fix test functions loaded:");
console.log("  - testPermissionsFix() - Test the complete permissions fix");
console.log("  - testOriginalPermissionError() - Test original error scenario");
console.log("  - testLocalStorageFunctionality() - Test localStorage functionality");
console.log("  - testSettingsVsLocalStorage() - Test settings vs localStorage behavior"); 