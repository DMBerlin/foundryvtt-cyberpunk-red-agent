/**
 * Test script to investigate offline message retrieval issue
 * 
 * This script tests the scenario where:
 * 1. GM sends a message to an offline player
 * 2. Player connects later and opens the chat
 * 3. Messages should be retrieved from server but are not appearing
 */

console.log('=== Cyberpunk Agent | Offline Message Retrieval Test ===');

/**
 * Test the complete offline message flow
 */
async function testOfflineMessageFlow() {
    console.log('\n--- Testing Offline Message Flow ---');
    
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error('Cyberpunk Agent not available');
        return;
    }

    const instance = window.CyberpunkAgent.instance;
    
    // Step 1: Simulate GM sending message to offline player
    console.log('\n1. Simulating GM sending message to offline player...');
    
    // Get GM's device
    const gmDevices = instance.getUserAccessibleDevices();
    const gmDevice = gmDevices[0];
    
    if (!gmDevice) {
        console.error('No GM device found');
        return;
    }
    
    console.log('GM Device:', gmDevice);
    
    // Get a player device (simulate offline player)
    const allDevices = instance.getAllRegisteredDevices();
    const playerDevice = allDevices.find(d => d.owner !== gmDevice.owner);
    
    if (!playerDevice) {
        console.error('No player device found');
        return;
    }
    
    console.log('Player Device (offline):', playerDevice);
    
    // Send message from GM to offline player
    const testMessage = `Test offline message at ${new Date().toLocaleTimeString()}`;
    console.log(`Sending message: "${testMessage}"`);
    
    const sendResult = await instance.sendDeviceMessage(gmDevice.id, playerDevice.id, testMessage);
    console.log('Send result:', sendResult);
    
    // Step 2: Check server storage
    console.log('\n2. Checking server storage...');
    const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
    console.log('Server messages structure:', serverMessages);
    
    // Check if message was saved for both devices
    const gmServerMessages = serverMessages[gmDevice.id] || {};
    const playerServerMessages = serverMessages[playerDevice.id] || {};
    
    console.log('GM server messages:', gmServerMessages);
    console.log('Player server messages:', playerServerMessages);
    
    // Step 3: Simulate player connecting and syncing
    console.log('\n3. Simulating player connecting and syncing...');
    
    // Clear local messages to simulate fresh connection
    instance.messages.clear();
    console.log('Cleared local messages');
    
    // Sync messages from server for player device
    const syncResult = await instance.syncMessagesWithServer(playerDevice.id);
    console.log('Sync result:', syncResult);
    
    // Step 4: Check if messages were loaded
    console.log('\n4. Checking if messages were loaded...');
    
    const conversationKey = instance._getDeviceConversationKey(gmDevice.id, playerDevice.id);
    const loadedMessages = instance.messages.get(conversationKey) || [];
    
    console.log('Conversation key:', conversationKey);
    console.log('Loaded messages:', loadedMessages);
    console.log('Number of loaded messages:', loadedMessages.length);
    
    // Step 5: Check if messages can be retrieved for conversation
    console.log('\n5. Testing message retrieval for conversation...');
    
    const retrievedMessages = instance.getMessagesForDeviceConversation(playerDevice.id, gmDevice.id);
    console.log('Retrieved messages for conversation:', retrievedMessages);
    console.log('Number of retrieved messages:', retrievedMessages.length);
    
    // Step 6: Verify message content
    if (retrievedMessages.length > 0) {
        const lastMessage = retrievedMessages[retrievedMessages.length - 1];
        console.log('Last message details:', {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            receiverId: lastMessage.receiverId,
            text: lastMessage.text,
            timestamp: lastMessage.timestamp,
            time: lastMessage.time
        });
        
        if (lastMessage.text === testMessage) {
            console.log('✅ SUCCESS: Test message found in conversation!');
        } else {
            console.log('❌ FAILURE: Test message not found in conversation');
        }
    } else {
        console.log('❌ FAILURE: No messages found in conversation');
    }
}

/**
 * Test server message loading specifically
 */
async function testServerMessageLoading() {
    console.log('\n--- Testing Server Message Loading ---');
    
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error('Cyberpunk Agent not available');
        return;
    }

    const instance = window.CyberpunkAgent.instance;
    
    // Get all devices
    const allDevices = instance.getAllRegisteredDevices();
    console.log('All devices:', allDevices);
    
    // Test loading messages for each device
    for (const device of allDevices) {
        console.log(`\nTesting device: ${device.id} (${device.name})`);
        
        // Clear local messages first
        instance.messages.clear();
        
        // Load messages from server
        const loadResult = await instance.loadMessagesFromServer(device.id);
        console.log('Load result:', loadResult);
        
        // Check what was loaded
        console.log('Local messages after loading:', instance.messages);
        console.log('Number of conversations loaded:', instance.messages.size);
        
        // List all conversations for this device
        for (const [conversationKey, messages] of instance.messages.entries()) {
            console.log(`Conversation ${conversationKey}: ${messages.length} messages`);
            if (messages.length > 0) {
                console.log('Sample message:', messages[0]);
            }
        }
    }
}

/**
 * Test conversation key generation
 */
function testConversationKeyGeneration() {
    console.log('\n--- Testing Conversation Key Generation ---');
    
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error('Cyberpunk Agent not available');
        return;
    }

    const instance = window.CyberpunkAgent.instance;
    
    // Test with sample device IDs
    const device1 = 'test-device-1';
    const device2 = 'test-device-2';
    
    const key1 = instance._getDeviceConversationKey(device1, device2);
    const key2 = instance._getDeviceConversationKey(device2, device1);
    
    console.log('Key 1->2:', key1);
    console.log('Key 2->1:', key2);
    console.log('Keys match:', key1 === key2);
    
    // Test with real device IDs if available
    const allDevices = instance.getAllRegisteredDevices();
    if (allDevices.length >= 2) {
        const realKey1 = instance._getDeviceConversationKey(allDevices[0].id, allDevices[1].id);
        const realKey2 = instance._getDeviceConversationKey(allDevices[1].id, allDevices[0].id);
        
        console.log('Real device key 1->2:', realKey1);
        console.log('Real device key 2->1:', realKey2);
        console.log('Real keys match:', realKey1 === realKey2);
    }
}

/**
 * Debug server message structure
 */
function debugServerMessageStructure() {
    console.log('\n--- Debugging Server Message Structure ---');
    
    const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
    console.log('Raw server messages:', serverMessages);
    
    // Analyze structure
    const deviceIds = Object.keys(serverMessages);
    console.log('Device IDs in server:', deviceIds);
    
    for (const deviceId of deviceIds) {
        const deviceMessages = serverMessages[deviceId];
        console.log(`\nDevice ${deviceId}:`);
        console.log('  Conversations:', Object.keys(deviceMessages));
        
        for (const [conversationKey, messages] of Object.entries(deviceMessages)) {
            console.log(`    ${conversationKey}: ${messages.length} messages`);
            if (messages.length > 0) {
                console.log('      Sample:', messages[0]);
            }
        }
    }
}

/**
 * Test message saving to server
 */
async function testMessageSavingToServer() {
    console.log('\n--- Testing Message Saving to Server ---');
    
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error('Cyberpunk Agent not available');
        return;
    }

    const instance = window.CyberpunkAgent.instance;
    
    // Get test devices
    const allDevices = instance.getAllRegisteredDevices();
    if (allDevices.length < 2) {
        console.error('Need at least 2 devices for testing');
        return;
    }
    
    const device1 = allDevices[0];
    const device2 = allDevices[1];
    
    // Create test message
    const testMessage = {
        id: `test-${Date.now()}`,
        senderId: device1.id,
        receiverId: device2.id,
        text: 'Test server save message',
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        read: false
    };
    
    console.log('Test message:', testMessage);
    
    // Save to server
    const saveResult = await instance.saveMessageToServer(device1.id, device2.id, testMessage);
    console.log('Save result:', saveResult);
    
    // Verify it was saved
    const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
    const device1Messages = serverMessages[device1.id] || {};
    const device2Messages = serverMessages[device2.id] || {};
    
    const conversationKey = instance._getDeviceConversationKey(device1.id, device2.id);
    
    console.log('Device 1 messages:', device1Messages[conversationKey] || []);
    console.log('Device 2 messages:', device2Messages[conversationKey] || []);
    
    const device1HasMessage = device1Messages[conversationKey]?.some(m => m.id === testMessage.id);
    const device2HasMessage = device2Messages[conversationKey]?.some(m => m.id === testMessage.id);
    
    console.log('Device 1 has message:', device1HasMessage);
    console.log('Device 2 has message:', device2HasMessage);
    
    if (device1HasMessage && device2HasMessage) {
        console.log('✅ SUCCESS: Message saved to both devices on server');
    } else {
        console.log('❌ FAILURE: Message not saved properly to server');
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('Starting offline message retrieval tests...\n');
    
    try {
        await testOfflineMessageFlow();
        await testServerMessageLoading();
        testConversationKeyGeneration();
        debugServerMessageStructure();
        await testMessageSavingToServer();
        
        console.log('\n=== All tests completed ===');
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Export functions for manual testing
window.CyberpunkAgentOfflineTests = {
    testOfflineMessageFlow,
    testServerMessageLoading,
    testConversationKeyGeneration,
    debugServerMessageStructure,
    testMessageSavingToServer,
    runAllTests
};

// Auto-run if requested
if (window.location.search.includes('run-offline-tests')) {
    runAllTests();
}

console.log('Offline message retrieval test script loaded. Use window.CyberpunkAgentOfflineTests.runAllTests() to run tests.'); 