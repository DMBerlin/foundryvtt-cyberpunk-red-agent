/**
 * Test notification sound functionality
 * Run this script in the browser console to test the notification sound feature
 */

function testNotificationSoundFeature() {
  console.log("=== Testing Notification Sound Feature ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Test 1: Check if the method exists
    console.log("1. Checking if playNotificationSound method exists...");
    if (typeof agent.playNotificationSound === 'function') {
      console.log("✅ playNotificationSound method exists");
    } else {
      console.error("❌ playNotificationSound method not found");
      return false;
    }

    // Test 2: Check if the setting exists
    console.log("2. Checking if notification sound setting exists...");
    const settingExists = game.settings.settings.has('cyberpunk-agent.notification-sound');
    if (settingExists) {
      console.log("✅ notification-sound setting exists");
    } else {
      console.error("❌ notification-sound setting not found");
      return false;
    }

    // Test 3: Test with setting enabled
    console.log("3. Testing with notification sound enabled...");
    const originalSetting = game.settings.get('cyberpunk-agent', 'notification-sound');
    game.settings.set('cyberpunk-agent', 'notification-sound', true);

    // Mock the playSoundEffect to avoid actual audio
    const originalPlaySoundEffect = agent.playSoundEffect;
    let soundPlayed = false;
    agent.playSoundEffect = function (soundName) {
      if (soundName === 'notification-message') {
        soundPlayed = true;
        console.log("🔊 Would play notification sound (mocked)");
      }
    };

    agent.playNotificationSound();

    if (soundPlayed) {
      console.log("✅ Notification sound would play when enabled");
    } else {
      console.error("❌ Notification sound not triggered when enabled");
    }

    // Test 4: Test with setting disabled
    console.log("4. Testing with notification sound disabled...");
    game.settings.set('cyberpunk-agent', 'notification-sound', false);
    soundPlayed = false;

    agent.playNotificationSound();

    if (!soundPlayed) {
      console.log("✅ Notification sound correctly disabled when setting is off");
    } else {
      console.error("❌ Notification sound played when it should be disabled");
    }

    // Restore original methods and settings
    agent.playSoundEffect = originalPlaySoundEffect;
    game.settings.set('cyberpunk-agent', 'notification-sound', originalSetting);

    // Test 5: Test actual sound playback (optional)
    console.log("5. Testing actual sound playback...");
    console.log("🔊 Playing notification sound (if enabled)...");
    agent.playNotificationSound();

    console.log("=== Notification sound feature test completed successfully! ===");
    console.log("💡 You can enable/disable the notification sound in the module settings");
    return true;

  } catch (error) {
    console.error("❌ Error during notification sound test:", error);
    return false;
  }
}

// Test message handlers
function testMessageHandlers() {
  console.log("=== Testing Message Handlers ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Create test data
    const testData = {
      userId: 'test-user-id',
      userName: 'Test User',
      timestamp: Date.now(),
      senderId: 'actor-1',
      receiverId: 'actor-2'
    };

    // Get current user's actors
    const userActors = agent.getUserActors();
    if (userActors.length > 0) {
      // Use the first user actor as receiver
      testData.receiverId = userActors[0].id;
      console.log(`Using actor ${userActors[0].name} (${userActors[0].id}) as receiver`);
    }

    // Mock the playNotificationSound method
    const originalPlayNotificationSound = agent.playNotificationSound;
    let notificationSoundPlayed = false;
    agent.playNotificationSound = function () {
      notificationSoundPlayed = true;
      console.log("🔊 Notification sound would play (mocked)");
    };

    // Test handleMessageUpdate
    console.log("Testing handleMessageUpdate...");
    notificationSoundPlayed = false;
    agent.handleMessageUpdate(testData);

    if (notificationSoundPlayed) {
      console.log("✅ handleMessageUpdate would play notification sound");
    } else {
      console.log("ℹ️ handleMessageUpdate did not play notification sound (may be expected)");
    }

    // Restore original method
    agent.playNotificationSound = originalPlayNotificationSound;

    console.log("=== Message handlers test completed! ===");
    return true;

  } catch (error) {
    console.error("❌ Error during message handlers test:", error);
    return false;
  }
}

// Make functions globally available
window.testNotificationSoundFeature = testNotificationSoundFeature;
window.testMessageHandlers = testMessageHandlers;

console.log("Notification sound test functions loaded:");
console.log("- testNotificationSoundFeature() - Test the notification sound functionality");
console.log("- testMessageHandlers() - Test message handlers with notification sound"); 