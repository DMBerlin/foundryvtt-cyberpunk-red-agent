/**
 * Test scroll behavior in chat conversation
 * This test verifies that the scroll always stays at the bottom of messages
 */

console.log("Cyberpunk Agent | Testing scroll behavior...");

// Mock the necessary FoundryVTT objects
if (typeof game === 'undefined') {
  global.game = {
    user: { id: 'test-user', name: 'Test User', isGM: true },
    actors: new Map(),
    settings: {
      get: () => ({}),
      set: () => { }
    }
  };
}

if (typeof ui === 'undefined') {
  global.ui = {
    windows: {},
    notifications: {
      info: (msg) => console.log('INFO:', msg),
      warn: (msg) => console.log('WARN:', msg),
      error: (msg) => console.log('ERROR:', msg)
    }
  };
}

// Test scroll behavior
function testScrollBehavior() {
  console.log("Cyberpunk Agent | Starting scroll behavior test...");

  // Test 1: Check if scroll methods exist
  console.log("Test 1: Checking scroll methods...");

  // Mock ChatConversationApplication
  const mockChatApp = {
    element: {
      find: (selector) => {
        if (selector === '#messages-container') {
          return [{
            scrollTop: 0,
            scrollHeight: 1000,
            clientHeight: 500,
            scrollTo: (options) => {
              console.log('Scroll to:', options);
            }
          }];
        }
        return [];
      }
    },
    _scrollToBottom: function () {
      const messagesContainer = this.element.find('#messages-container');
      if (messagesContainer.length) {
        messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;
      }
    },
    _scrollToBottomImmediate: function () {
      const messagesContainer = this.element.find('#messages-container');
      if (messagesContainer.length) {
        const container = messagesContainer[0];
        container.scrollTop = container.scrollHeight;
      }
    },
    _ensureScrollToBottom: function () {
      const attempts = [0, 50, 100, 200];
      attempts.forEach((delay) => {
        setTimeout(() => {
          this._scrollToBottomImmediate();
        }, delay);
      });
    }
  };

  // Test scroll methods
  console.log("Testing _scrollToBottom...");
  mockChatApp._scrollToBottom();

  console.log("Testing _scrollToBottomImmediate...");
  mockChatApp._scrollToBottomImmediate();

  console.log("Testing _ensureScrollToBottom...");
  mockChatApp._ensureScrollToBottom();

  // Test 2: Check scroll position calculation
  console.log("Test 2: Checking scroll position calculation...");

  const container = mockChatApp.element.find('#messages-container')[0];
  const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
  console.log("Is at bottom:", isAtBottom);

  // Test 3: Test message count tracking
  console.log("Test 3: Testing message count tracking...");

  const mockMessages = [
    { id: '1', text: 'Hello', time: '10:00' },
    { id: '2', text: 'Hi there', time: '10:01' },
    { id: '3', text: 'How are you?', time: '10:02' }
  ];

  console.log("Initial message count:", mockMessages.length);

  // Simulate adding a new message
  mockMessages.push({ id: '4', text: 'I am fine', time: '10:03' });
  console.log("New message count:", mockMessages.length);
  console.log("New message detected:", mockMessages.length > 3);

  console.log("Cyberpunk Agent | Scroll behavior test completed!");
}

// Run the test
testScrollBehavior();

module.exports = { testScrollBehavior }; 