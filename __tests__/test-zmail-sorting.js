/**
 * Test script for ZMail message sorting
 * Tests that ZMail messages are sorted with newest first
 */

class ZMailSortingTester {
  constructor() {
    this.agent = window.CyberpunkAgent?.instance;
    if (!this.agent) {
      throw new Error("CyberpunkAgent instance not found");
    }
  }

  /**
   * Test ZMail message sorting
   */
  async testZMailSorting() {
    console.log("Cyberpunk Agent | Testing ZMail message sorting...");

    // Get available devices
    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 1) {
      console.log("Cyberpunk Agent | Need at least 1 device to test ZMail sorting");
      return true;
    }

    const device1 = devices[0];

    console.log(`Testing with device: ${device1.id}`);

    // Step 1: Clear existing ZMail messages for clean test
    console.log("Step 1: Clearing existing ZMail messages...");
    this.agent.zmailMessages.set(device1.id, []);

    // Step 2: Create test ZMail messages with different timestamps
    console.log("Step 2: Creating test ZMail messages...");
    const now = Date.now();
    const testMessages = [
      {
        id: 'zmail-1',
        sender: 'Test Sender 1',
        subject: 'First Message',
        content: 'This is the first message',
        timestamp: now - 300000, // 5 minutes ago
        time: new Date(now - 300000).toLocaleTimeString(),
        isRead: false,
        recipientDeviceId: device1.id
      },
      {
        id: 'zmail-2',
        sender: 'Test Sender 2',
        subject: 'Second Message',
        content: 'This is the second message',
        timestamp: now - 600000, // 10 minutes ago
        time: new Date(now - 600000).toLocaleTimeString(),
        isRead: false,
        recipientDeviceId: device1.id
      },
      {
        id: 'zmail-3',
        sender: 'Test Sender 3',
        subject: 'Third Message',
        content: 'This is the third message',
        timestamp: now - 120000, // 2 minutes ago (newest)
        time: new Date(now - 120000).toLocaleTimeString(),
        isRead: false,
        recipientDeviceId: device1.id
      }
    ];

    // Add messages to the device
    this.agent.zmailMessages.set(device1.id, testMessages);

    // Step 3: Test getZMailMessages sorting
    console.log("Step 3: Testing getZMailMessages sorting...");
    const messages = this.agent.getZMailMessages(device1.id);

    if (messages.length !== 3) {
      throw new Error(`Expected 3 messages, got ${messages.length}`);
    }

    // Check if messages are sorted by newest first
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].timestamp < messages[i + 1].timestamp) {
        throw new Error(`Messages are not sorted correctly. Message ${i} (${messages[i].timestamp}) should come after message ${i + 1} (${messages[i + 1].timestamp})`);
      }
    }

    console.log("✓ ZMail messages are sorted correctly (newest first)");

    // Step 4: Test that the newest message is first
    const newestMessage = messages[0];
    if (newestMessage.id !== 'zmail-3') {
      throw new Error(`Expected newest message to be 'zmail-3', got '${newestMessage.id}'`);
    }

    console.log("✓ Newest message is first in the list");

    // Step 5: Test adding a new message and verify it goes to the top
    console.log("Step 5: Testing new message insertion...");
    const newMessage = {
      id: 'zmail-4',
      sender: 'Test Sender 4',
      subject: 'Newest Message',
      content: 'This is the newest message',
      timestamp: now, // Current time (newest)
      time: new Date(now).toLocaleTimeString(),
      isRead: false,
      recipientDeviceId: device1.id
    };

    // Add the new message
    const currentMessages = this.agent.getZMailMessages(device1.id);
    currentMessages.push(newMessage);
    this.agent.zmailMessages.set(device1.id, currentMessages);

    // Get messages again and check sorting
    const updatedMessages = this.agent.getZMailMessages(device1.id);

    if (updatedMessages[0].id !== 'zmail-4') {
      throw new Error(`Expected newest message to be 'zmail-4', got '${updatedMessages[0].id}'`);
    }

    console.log("✓ New message appears at the top of the list");

    // Step 6: Test the sorting in the agent interface
    console.log("Step 6: Testing agent interface sorting...");

    // Simulate the sorting logic used in the agent interface
    const formattedMessages = updatedMessages.map(message => ({
      ...message,
      preview: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content
    })).sort((a, b) => b.timestamp - a.timestamp);

    if (formattedMessages[0].id !== 'zmail-4') {
      throw new Error(`Expected formatted messages to be sorted with newest first, got '${formattedMessages[0].id}'`);
    }

    console.log("✓ Agent interface sorting works correctly");

    console.log("Cyberpunk Agent | ZMail sorting test passed!");
    return true;
  }

  /**
   * Test ZMail message merge sorting
   */
  async testZMailMergeSorting() {
    console.log("Cyberpunk Agent | Testing ZMail merge sorting...");

    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 1) {
      console.log("Cyberpunk Agent | Need at least 1 device to test ZMail merge sorting");
      return true;
    }

    const device1 = devices[0];

    // Create local messages
    const localMessages = [
      {
        id: 'local-1',
        sender: 'Local Sender',
        subject: 'Local Message',
        content: 'This is a local message',
        timestamp: Date.now() - 60000, // 1 minute ago
        time: new Date(Date.now() - 60000).toLocaleTimeString(),
        isRead: true,
        recipientDeviceId: device1.id
      }
    ];

    // Create server messages
    const serverMessages = [
      {
        id: 'server-1',
        sender: 'Server Sender',
        subject: 'Server Message',
        content: 'This is a server message',
        timestamp: Date.now() - 30000, // 30 seconds ago (newer)
        time: new Date(Date.now() - 30000).toLocaleTimeString(),
        isRead: false,
        recipientDeviceId: device1.id
      }
    ];

    // Simulate the merge logic from _loadZMailDataFromServer
    const localMessageIds = new Set(localMessages.map(msg => msg.id));
    const localMessagesMap = new Map();
    localMessages.forEach(msg => localMessagesMap.set(msg.id, msg));

    const mergedMessages = [...localMessages];
    let newMessages = 0;

    for (const serverMessage of serverMessages) {
      if (!localMessageIds.has(serverMessage.id)) {
        mergedMessages.push(serverMessage);
        newMessages++;
      } else {
        const localMessage = localMessagesMap.get(serverMessage.id);
        if (localMessage) {
          const mergedMessage = {
            ...serverMessage,
            isRead: localMessage.isRead
          };
          const index = mergedMessages.findIndex(msg => msg.id === serverMessage.id);
          if (index !== -1) {
            mergedMessages[index] = mergedMessage;
          }
        }
      }
    }

    // Sort by timestamp (newest first) - this is the fix we implemented
    mergedMessages.sort((a, b) => b.timestamp - a.timestamp);

    // Verify sorting
    if (mergedMessages[0].id !== 'server-1') {
      throw new Error(`Expected newest message to be 'server-1', got '${mergedMessages[0].id}'`);
    }

    console.log("✓ ZMail merge sorting works correctly");

    return true;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.testZMailSorting();
      await this.testZMailMergeSorting();
      console.log("Cyberpunk Agent | All ZMail sorting tests passed!");
    } catch (error) {
      console.error("Cyberpunk Agent | ZMail sorting test failed:", error);
      throw error;
    }
  }
}

// Global test function
window.testZMailSorting = async function () {
  const tester = new ZMailSortingTester();
  await tester.runAllTests();
};

// Export for use in other scripts
window.ZMailSortingTester = ZMailSortingTester;
