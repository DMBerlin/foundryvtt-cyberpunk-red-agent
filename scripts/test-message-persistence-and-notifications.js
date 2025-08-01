/**
 * Test script for message persistence and notification sounds
 * Tests that messages are saved properly and notification sounds play
 */

console.log("🧪 Testing Message Persistence and Notifications...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
    console.error("❌ window.cyberpunkAgent not available");
    console.log("Please ensure the module is loaded and try again");
} else {
    console.log("✅ window.cyberpunkAgent is available");

    // Test 2: Check current message state
    console.log("\n📱 === CURRENT MESSAGE STATE ===");
    console.log(`Total conversations in memory: ${window.cyberpunkAgent.messages.size}`);
    
    if (window.cyberpunkAgent.messages.size > 0) {
        console.log("Active conversations:");
        for (const [conversationKey, messages] of window.cyberpunkAgent.messages.entries()) {
            console.log(`  ${conversationKey}: ${messages.length} messages`);
        }
    } else {
        console.log("No conversations in memory");
    }

    // Test 3: Check localStorage for saved messages
    console.log("\n💾 === LOCALSTORAGE CHECK ===");
    const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
        try {
            const savedMessages = JSON.parse(storedData);
            console.log(`Saved conversations in localStorage: ${Object.keys(savedMessages).length}`);
            
            for (const [conversationKey, messages] of Object.entries(savedMessages)) {
                console.log(`  ${conversationKey}: ${messages.length} messages`);
            }
        } catch (error) {
            console.error("❌ Error parsing localStorage data:", error);
        }
    } else {
        console.log("No saved messages found in localStorage");
    }

    // Test 4: Check available devices for testing
    console.log("\n📱 === AVAILABLE DEVICES FOR TESTING ===");
    const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
    if (allDevices && allDevices.length > 0) {
        console.log("Available devices:");
        allDevices.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.ownerName} (${device.deviceId}) - ${device.phoneNumber}`);
        });

        // Test 5: Test message persistence (if multiple devices exist)
        if (allDevices.length > 1) {
            console.log("\n💬 === TESTING MESSAGE PERSISTENCE ===");
            const device1 = allDevices[0];
            const device2 = allDevices[1];
            
            console.log(`Testing with devices:`);
            console.log(`  Device 1: ${device1.ownerName} (${device1.deviceId})`);
            console.log(`  Device 2: ${device2.ownerName} (${device2.deviceId})`);

            // Get current conversation
            const conversationKey = window.cyberpunkAgent._getDeviceConversationKey(device1.deviceId, device2.deviceId);
            const currentMessages = window.cyberpunkAgent.messages.get(conversationKey) || [];
            console.log(`Current messages in conversation: ${currentMessages.length}`);

            // Test sending a message
            const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
            console.log(`\nSending test message: "${testMessage}"`);
            
            window.cyberpunkAgent.sendDeviceMessage(device1.deviceId, device2.deviceId, testMessage)
                .then(success => {
                    if (success) {
                        console.log("✅ Test message sent successfully");
                        
                        // Check if message was saved
                        const updatedMessages = window.cyberpunkAgent.messages.get(conversationKey) || [];
                        console.log(`Messages after sending: ${updatedMessages.length}`);
                        
                        // Check localStorage
                        const updatedStoredData = localStorage.getItem(storageKey);
                        if (updatedStoredData) {
                            const updatedSavedMessages = JSON.parse(updatedStoredData);
                            const savedConversation = updatedSavedMessages[conversationKey] || [];
                            console.log(`Messages in localStorage: ${savedConversation.length}`);
                            
                            if (savedConversation.length > 0) {
                                console.log("✅ Message persistence test PASSED - message saved to localStorage");
                            } else {
                                console.log("❌ Message persistence test FAILED - message not in localStorage");
                            }
                        } else {
                            console.log("❌ Message persistence test FAILED - no data in localStorage");
                        }
                    } else {
                        console.log("❌ Test message failed to send");
                    }
                })
                .catch(error => {
                    console.error("❌ Error sending test message:", error);
                });
        } else {
            console.log("Need at least 2 devices to test message persistence");
        }
    } else {
        console.log("No devices found for testing");
    }

    // Test 6: Test notification sound system
    console.log("\n🔊 === TESTING NOTIFICATION SOUND SYSTEM ===");
    
    // Test notification sound function
    console.log("Testing playNotificationSound function...");
    try {
        window.cyberpunkAgent.playNotificationSound();
        console.log("✅ playNotificationSound() called successfully");
    } catch (error) {
        console.error("❌ Error calling playNotificationSound:", error);
    }

    // Test sound effect function
    console.log("Testing playSoundEffect function...");
    try {
        window.cyberpunkAgent.playSoundEffect('notification-message');
        console.log("✅ playSoundEffect('notification-message') called successfully");
    } catch (error) {
        console.error("❌ Error calling playSoundEffect:", error);
    }

    // Test toggle notification sounds
    console.log("Testing toggleNotificationSounds function...");
    try {
        const currentState = window.cyberpunkAgent.toggleNotificationSounds();
        console.log(`✅ toggleNotificationSounds() returned: ${currentState}`);
        // Toggle back to original state
        window.cyberpunkAgent.toggleNotificationSounds();
        console.log("✅ Toggled back to original state");
    } catch (error) {
        console.error("❌ Error calling toggleNotificationSounds:", error);
    }

    // Test 7: Manual testing instructions
    console.log("\n🎮 === MANUAL TESTING INSTRUCTIONS ===");
    console.log("");
    console.log("1. MESSAGE PERSISTENCE TEST:");
    console.log("   - Send a message between two devices");
    console.log("   - Press Ctrl+F5 to refresh the page");
    console.log("   - Open the chat again");
    console.log("   - Verify: Message should still be there");
    console.log("");
    console.log("2. NOTIFICATION SOUND TEST:");
    console.log("   - Have another player send a message to your device");
    console.log("   - Verify: Notification sound should play");
    console.log("   - Test mute functionality:");
    console.log("     - Right-click on a contact and select 'Silenciar Contato'");
    console.log("     - Have them send another message");
    console.log("     - Verify: No notification sound should play");
    console.log("");
    console.log("3. DEBUG COMMANDS:");
    console.log("   - window.cyberpunkAgent.listAllChatHistory() - List all chat history");
    console.log("   - window.cyberpunkAgent.playNotificationSound() - Test notification sound");
    console.log("   - window.cyberpunkAgent.toggleNotificationSounds() - Toggle notification sounds");

    // Test 8: Expected behavior after fixes
    console.log("\n✅ === EXPECTED BEHAVIOR AFTER FIXES ===");
    console.log("1. Messages persist after page refresh (Ctrl+F5)");
    console.log("2. Notification sounds play for new messages");
    console.log("3. Muted contacts don't trigger notification sounds");
    console.log("4. Messages are saved to localStorage correctly");
    console.log("5. Messages load from localStorage on page refresh");

    console.log("\n🎉 Message Persistence and Notification test setup complete!");
    console.log("Follow the manual testing instructions to verify the fixes work.");
} 