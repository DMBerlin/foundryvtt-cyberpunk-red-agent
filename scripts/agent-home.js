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
      width: 400,
      height: 700,
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

    // Get current time
    const now = new Date();
    const currentTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      ...data,
      actor: this.actor,
      currentTime: currentTime
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners for app icons
    html.find('.cp-app-icon[data-app="chat7"]').click(this._onChat7Click.bind(this));
  }

  /**
   * Handle Chat7 app click
   */
  _onChat7Click(event) {
    event.preventDefault();
    console.log("Chat7 app clicked for actor:", this.actor.name);

    // Close the current application
    this.close();

    // Open Chat7 application
    const ChatClass = Chat7Application || window.Chat7Application;
    if (typeof ChatClass !== 'undefined') {
      const chat7 = new ChatClass(this.actor);
      chat7.render(true);
    } else {
      console.error("Cyberpunk Agent | Chat7Application not loaded!");
      ui.notifications.error("Erro ao carregar o Chat7. Tente recarregar a página (F5).");
    }
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
      width: 400,
      height: 700,
      resizable: true,
      minimizable: true,
      title: "Chat7"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    const data = super.getData(options);

    // Get current time
    const now = new Date();
    const currentTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get contacts for this actor
    let contacts = [];
    try {
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        contacts = window.CyberpunkAgent.instance.getContactsForActor(this.actor.id) || [];
      }
    } catch (error) {
      console.warn("Cyberpunk Agent | Error getting contacts:", error);
    }

    return {
      ...data,
      actor: this.actor,
      currentTime: currentTime,
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
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-chat-button').click(this._onContactChatClick.bind(this));
  }

  /**
   * Handle back button click
   */
  _onBackClick(event) {
    event.preventDefault();
    console.log("Back button clicked");

    // Close the current application
    this.close();

    // Reopen the Agent Home
    const AgentClass = AgentHomeApplication || window.AgentHomeApplication;
    if (typeof AgentClass !== 'undefined') {
      const agentHome = new AgentClass(this.actor);
      agentHome.render(true);
    }
  }

  /**
   * Handle contact chat button click
   */
  _onContactChatClick(event) {
    event.preventDefault();
    const contactId = event.currentTarget.dataset.contactId;
    console.log("Contact chat clicked for contact:", contactId);

    // TODO: Implement actual chat with contact
    ui.notifications.info("Chat com contato será implementado em breve!");
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Chat7 form updated:", formData);
  }
}

console.log("Cyberpunk Agent | agent-home.js loaded successfully");
console.log("Cyberpunk Agent | AgentHomeApplication defined:", typeof AgentHomeApplication);
console.log("Cyberpunk Agent | Chat7Application defined:", typeof Chat7Application);

// Make classes globally available
window.AgentHomeApplication = AgentHomeApplication;
window.Chat7Application = Chat7Application;

console.log("Cyberpunk Agent | Classes made globally available"); 