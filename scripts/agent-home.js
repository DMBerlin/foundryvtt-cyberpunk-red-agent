/**
 * Agent Home Application
 * The main interface for the Cyberpunk Agent
 */

console.log("Cyberpunk Agent | Loading agent-home.js...");

/**
 * Agent Home Application - Main interface for the Cyberpunk Agent
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class AgentHomeApplication extends FormApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;
    console.log("AgentHomeApplication constructor called with:", actor);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "agent-home",
      classes: ["cyberpunk-agent", "agent-home"],
      template: "modules/cyberpunk-agent/templates/agent-home.html",
      width: 800,
      height: 600,
      resizable: true,
      minimizable: true,
      title: "Cyberpunk Agent"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    const data = super.getData(options);

    // Get agent data for this actor
    let agentData = {};
    let contacts = [];

    try {
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        agentData = window.CyberpunkAgent.instance.getAgentData(this.actor.id) || {};
        contacts = window.CyberpunkAgent.instance.getContactsForActor(this.actor.id) || [];
      }
    } catch (error) {
      console.warn("Cyberpunk Agent | Error getting agent data:", error);
    }

    return {
      ...data,
      actor: this.actor,
      agentData: agentData,
      contacts: contacts,
      isGM: game.user.isGM
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners
    html.find('.chat-button').click(this._onChatClick.bind(this));
    html.find('.contacts-button').click(this._onContactsClick.bind(this));
    html.find('.settings-button').click(this._onSettingsClick.bind(this));
  }

  /**
   * Handle chat button click
   */
  _onChatClick(event) {
    event.preventDefault();
    console.log("Chat button clicked for actor:", this.actor.name);

    // TODO: Open chat interface
    ui.notifications.info("Chat interface coming soon!");
  }

  /**
   * Handle contacts button click
   */
  _onContactsClick(event) {
    event.preventDefault();
    console.log("Contacts button clicked for actor:", this.actor.name);

    // TODO: Open contacts interface
    ui.notifications.info("Contacts interface coming soon!");
  }

  /**
   * Handle settings button click
   */
  _onSettingsClick(event) {
    event.preventDefault();
    console.log("Settings button clicked for actor:", this.actor.name);

    // TODO: Open settings interface
    ui.notifications.info("Settings interface coming soon!");
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Agent home form updated:", formData);
  }
}

/**
 * Chat7 Application - Chat interface for the Cyberpunk Agent
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class Chat7Application extends FormApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;
    console.log("Chat7Application constructor called with:", actor);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "chat7",
      classes: ["cyberpunk-agent", "chat7"],
      template: "modules/cyberpunk-agent/templates/chat7.html",
      width: 600,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Agent Chat"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    const data = super.getData(options);

    return {
      ...data,
      actor: this.actor
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add chat-specific event listeners
    html.find('.cp-send-message').click(this._onSendMessage.bind(this));
    html.find('.cp-message-input').keypress(this._onMessageKeypress.bind(this));
  }

  /**
   * Handle send message button click
   */
  _onSendMessage(event) {
    event.preventDefault();
    const input = this.element.find('.cp-message-input');
    const message = input.val().trim();

    if (message) {
      this._sendMessage(message);
      input.val('');
    }
  }

  /**
   * Handle message input keypress (Enter key)
   */
  _onMessageKeypress(event) {
    if (event.which === 13) { // Enter key
      event.preventDefault();
      this._onSendMessage(event);
    }
  }

  /**
   * Send a message
   */
  _sendMessage(message) {
    console.log(`Sending message from ${this.actor.name}:`, message);

    // TODO: Implement actual message sending logic
    ui.notifications.info(`Message sent: ${message}`);
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Chat form updated:", formData);
  }
}

console.log("Cyberpunk Agent | agent-home.js loaded successfully");
console.log("Cyberpunk Agent | AgentHomeApplication defined:", typeof AgentHomeApplication);
console.log("Cyberpunk Agent | Chat7Application defined:", typeof Chat7Application);

// Make classes globally available
window.AgentHomeApplication = AgentHomeApplication;
window.Chat7Application = Chat7Application;

console.log("Cyberpunk Agent | Classes made globally available"); 