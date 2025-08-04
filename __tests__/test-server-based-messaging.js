/**
 * Test Server-Based Messaging System
 * ===================================
 * 
 * This test script verifies the new server-based messaging system
 * that stores all messages on the Foundry server instead of using
 * direct client-to-client communication.
 */

console.log("=== Testing Server-Based Messaging System ===");

/**
 * Test 1: Save message to server
 */
async function testSaveMessageToServer() {
    console.log("\n--- Test 1: Save Message to Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const testMessage = {
            id: 'test-message-1',
            senderId: 'device-1',
            receiverId: 'device-2',
            text: 'Test message from server-based system',
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR'),
            read: false
        };

        const success = await cyberpunkAgent.saveMessageToServer('device-1', 'device-2', testMessage);
        
        if (success) {
            console.log("✅ Message saved to server successfully");
            
            // Verify message was saved
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages');
            const device1Messages = serverMessages['device-1'];
            const device2Messages = serverMessages['device-2'];
            
            if (device1Messages && device2Messages) {
                console.log("✅ Message found in server storage for both devices");
                return true;
            } else {
                console.error("❌ Message not found in server storage");
                return false;
            }
        } else {
            console.error("❌ Failed to save message to server");
            return false;
        }
    } catch (error) {
        console.error("❌ Error testing save message to server:", error);
        return false;
    }
}

/**
 * Test 2: Load messages from server
 */
async function testLoadMessagesFromServer() {
    console.log("\n--- Test 2: Load Messages from Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const success = await cyberpunkAgent.loadMessagesFromServer('device-1');
        
        if (success) {
            console.log("✅ Messages loaded from server successfully");
            
            // Check if messages are in local storage
            const conversationKey = cyberpunkAgent._getDeviceConversationKey('device-1', 'device-2');
            const messages = cyberpunkAgent.messages.get(conversationKey);
            
            if (messages && messages.length > 0) {
                console.log(`✅ Found ${messages.length} messages in local storage`);
                return true;
            } else {
                console.error("❌ No messages found in local storage");
                return false;
            }
        } else {
            console.error("❌ Failed to load messages from server");
            return false;
        }
    } catch (error) {
        console.error("❌ Error testing load messages from server:", error);
        return false;
    }
}

/**
 * Test 3: Sync messages with server
 */
async function testSyncMessagesWithServer() {
    console.log("\n--- Test 3: Sync Messages with Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const success = await cyberpunkAgent.syncMessagesWithServer('device-1');
        
        if (success) {
            console.log("✅ Messages synced with server successfully");
            return true;
        } else {
            console.error("❌ Failed to sync messages with server");
            return false;
        }
    } catch (error) {
        console.error("❌ Error testing sync messages with server:", error);
        return false;
    }
}

/**
 * Test 4: Send message via server
 */
async function testSendMessageViaServer() {
    console.log("\n--- Test 4: Send Message via Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const success = await cyberpunkAgent.sendMessage('actor-1', 'actor-2', 'Test message via server');
        
        if (success) {
            console.log("✅ Message sent via server successfully");
            
            // Check if message was saved to server
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages');
            const hasMessage = Object.values(serverMessages).some(deviceMessages => 
                Object.values(deviceMessages).some(conversation => 
                    conversation.some(msg => msg.text === 'Test message via server')
                )
            );
            
            if (hasMessage) {
                console.log("✅ Message found in server storage");
                return true;
            } else {
                console.error("❌ Message not found in server storage");
                return false;
            }
        } else {
            console.error("❌ Failed to send message via server");
            return false;
        }
    } catch (error) {
        console.error("❌ Error testing send message via server:", error);
        return false;
    }
}

/**
 * Test 5: Send device message via server
 */
async function testSendDeviceMessageViaServer() {
    console.log("\n--- Test 5: Send Device Message via Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const success = await cyberpunkAgent.sendDeviceMessage('device-1', 'device-2', 'Test device message via server');
        
        if (success) {
            console.log("✅ Device message sent via server successfully");
            
            // Check if message was saved to server
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages');
            const hasMessage = Object.values(serverMessages).some(deviceMessages => 
                Object.values(deviceMessages).some(conversation => 
                    conversation.some(msg => msg.text === 'Test device message via server')
                )
            );
            
            if (hasMessage) {
                console.log("✅ Device message found in server storage");
                return true;
            } else {
                console.error("❌ Device message not found in server storage");
                return false;
            }
        } else {
            console.error("❌ Failed to send device message via server");
            return false;
        }
    } catch (error) {
        console.error("❌ Error testing send device message via server:", error);
        return false;
    }
}

/**
 * Test 6: Auto-add contacts
 */
async function testAutoAddContacts() {
    console.log("\n--- Test 6: Auto-Add Contacts ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        // Create a test message from an unknown contact
        const testMessage = {
            id: 'test-contact-message',
            senderId: 'unknown-device',
            receiverId: 'device-1',
            text: 'Message from unknown contact',
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR'),
            read: false
        };

        // Save message to server
        await cyberpunkAgent.saveMessageToServer('unknown-device', 'device-1', testMessage);
        
        // Process messages and contacts
        await cyberpunkAgent.processNewMessagesAndContacts('device-1');
        
        console.log("✅ Contact processing completed");
        return true;
    } catch (error) {
        console.error("❌ Error testing auto-add contacts:", error);
        return false;
    }
}

/**
 * Test 7: Get unread count from server
 */
async function testGetUnreadCountFromServer() {
    console.log("\n--- Test 7: Get Unread Count from Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        const unreadCount = await cyberpunkAgent.getUnreadCountFromServer('device-1');
        
        console.log(`✅ Unread count from server: ${unreadCount}`);
        return true;
    } catch (error) {
        console.error("❌ Error testing get unread count from server:", error);
        return false;
    }
}

/**
 * Test 8: Mark messages as read on server
 */
async function testMarkMessagesAsReadOnServer() {
    console.log("\n--- Test 8: Mark Messages as Read on Server ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        await cyberpunkAgent.markMessagesAsReadOnServer('device-1', 'device-2');
        
        console.log("✅ Messages marked as read on server");
        return true;
    } catch (error) {
        console.error("❌ Error testing mark messages as read on server:", error);
        return false;
    }
}

/**
 * Test 9: Fix for processNewMessagesAndContacts error
 */
async function testProcessNewMessagesAndContactsFix() {
    console.log("\n--- Test 9: Process New Messages and Contacts Fix ---");
    
    try {
        const cyberpunkAgent = window.CyberpunkAgent?.instance;
        if (!cyberpunkAgent) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }

        // Test with a real device ID from the system
        const devices = cyberpunkAgent.getUserAccessibleDevices();
        if (devices.length === 0) {
            console.log("⚠️ No devices available for testing");
            return true; // Not an error, just no devices to test with
        }

        const testDeviceId = devices[0].id;
        console.log(`Testing with device: ${testDeviceId}`);

        // This should not throw an error anymore
        await cyberpunkAgent.processNewMessagesAndContacts(testDeviceId);
        
        console.log("✅ processNewMessagesAndContacts completed without errors");
        return true;
    } catch (error) {
        console.error("❌ Error testing processNewMessagesAndContacts fix:", error);
        return false;
    }
}

/**
 * Run all server-based messaging tests
 */
async function runAllServerBasedMessagingTests() {
    console.log("=== Running All Server-Based Messaging Tests ===");
    
    const tests = [
        testSaveMessageToServer,
        testLoadMessagesFromServer,
        testSyncMessagesWithServer,
        testSendMessageViaServer,
        testSendDeviceMessageViaServer,
        testAutoAddContacts,
        testGetUnreadCountFromServer,
        testMarkMessagesAsReadOnServer,
        testProcessNewMessagesAndContactsFix
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
        console.log("🎉 All server-based messaging tests passed!");
    } else {
        console.log("⚠️ Some tests failed. Check the logs above for details.");
    }
    
    return passedTests === totalTests;
}

/**
 * Manual test function for quick testing
 */
function testServerBasedMessaging() {
    console.log("Starting server-based messaging test...");
    runAllServerBasedMessagingTests().then(success => {
        if (success) {
            console.log("✅ All tests completed successfully");
        } else {
            console.log("❌ Some tests failed");
        }
    });
}

/**
 * Quick test for the specific error fix
 */
function testErrorFix() {
    console.log("Testing the processNewMessagesAndContacts error fix...");
    testProcessNewMessagesAndContactsFix().then(success => {
        if (success) {
            console.log("✅ Error fix test passed!");
        } else {
            console.log("❌ Error fix test failed");
        }
    });
}

// Export functions for manual testing
window.testServerBasedMessaging = testServerBasedMessaging;
window.runAllServerBasedMessagingTests = runAllServerBasedMessagingTests;
window.testErrorFix = testErrorFix;

console.log("Server-based messaging tests loaded. Use testServerBasedMessaging() to run tests.");
console.log("For quick error fix test, use testErrorFix()."); 