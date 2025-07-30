/**
 * Test notification sound functionality
 */

function testNotificationSound() {
  console.log("=== Notification Sound Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Test 1: Check if playNotificationSound method exists
    console.log("Testing playNotificationSound method...");
    if (typeof agent.playNotificationSound === 'function') {
      console.log("✅ playNotificationSound method exists");
    } else {
      console.error("❌ playNotificationSound method not found");
      return false;
    }

    // Test 2: Check if notification sound setting exists
    console.log("Testing notification sound setting...");
    const settingExists = game.settings.settings.has('cyberpunk-agent.notification-sound');
    if (settingExists) {
      console.log("✅ notification-sound setting exists");
    } else {
      console.error("❌ notification-sound setting not found");
      return false;
    }

    // Test 3: Test sound playback (with setting enabled)
    console.log("Testing sound playback with setting enabled...");
    const originalSetting = game.settings.get('cyberpunk-agent', 'notification-sound');

    // Enable the setting
    game.settings.set('cyberpunk-agent', 'notification-sound', true);

    // Mock the playSoundEffect method to avoid actual audio
    const originalPlaySoundEffect = agent.playSoundEffect;
    let soundPlayed = false;
    agent.playSoundEffect = function (soundName) {
      if (soundName === 'notification-message') {
        soundPlayed = true;
        console.log("🔊 Would play notification sound (mocked)");
      }
    };

    // Test the notification sound
    agent.playNotificationSound();

    if (soundPlayed) {
      console.log("✅ Notification sound would play when enabled");
    } else {
      console.error("❌ Notification sound not triggered when enabled");
    }

    // Test 4: Test sound playback (with setting disabled)
    console.log("Testing sound playback with setting disabled...");
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

    console.log("=== Notification sound test completed successfully! ===");
    return true;

  } catch (error) {
    console.error("❌ Error during notification sound test:", error);
    return false;
  }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testNotificationSound };
} 