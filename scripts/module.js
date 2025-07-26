/**
 * Cyberpunk Agent Module
 * A FoundryVTT module for cyberpunk-style messaging
 */

console.log("Cyberpunk Agent | Loading module.js...");

class CyberpunkAgent {
    constructor() {
        this.id = "cyberpunk-agent";
        this.title = "Cyberpunk Agent";
        this.version = "1.0.0";
        this.agentData = new Map(); // Store agent data per actor
        this.contactNetworks = new Map(); // Store contact networks per actor
    }

    /**
     * Register module settings
     */
    static registerSettings() {
        console.log("Cyberpunk Agent | Registering settings...");

        game.settings.register('cyberpunk-agent', 'contact-networks', {
            name: 'Redes de Contatos',
            hint: 'Configure as redes de contatos para cada Actor',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        game.settings.register('cyberpunk-agent', 'agent-data', {
            name: 'Agent Data',
            hint: 'Dados internos do Agent',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        // Register a custom settings menu for Cyberpunk Agent
        game.settings.registerMenu('cyberpunk-agent', 'contact-manager-menu', {
            name: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON'),
            hint: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_HINT'),
            label: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON'),
            icon: 'fas fa-users',
            type: ContactManagerMenu,
            restricted: true
        });

        console.log("Cyberpunk Agent | Settings registered successfully");
    }

    /**
     * Setup the agent system
     */
    setupAgentSystem() {
        console.log("Cyberpunk Agent | Setting up agent system...");

        // Wait a bit for other files to load
        setTimeout(() => {
            this._setupAgentSystemInternal();
        }, 500);
    }

    /**
     * Internal setup method
     */
    _setupAgentSystemInternal() {
        // Check if required classes are loaded
        console.log("Cyberpunk Agent | Checking required classes:");
        console.log("  - AgentHomeApplication:", typeof AgentHomeApplication);
        console.log("  - Window AgentHomeApplication:", typeof window.AgentHomeApplication);
        console.log("  - Chat7Application:", typeof Chat7Application);
        console.log("  - Window Chat7Application:", typeof window.Chat7Application);
        console.log("  - ContactManagerApplication:", typeof ContactManagerApplication);
        console.log("  - Window ContactManagerApplication:", typeof window.ContactManagerApplication);

        if (typeof AgentHomeApplication === 'undefined' && typeof window.AgentHomeApplication === 'undefined') {
            console.error("Cyberpunk Agent | AgentHomeApplication not loaded!");
        }
        if (typeof Chat7Application === 'undefined' && typeof window.Chat7Application === 'undefined') {
            console.error("Cyberpunk Agent | Chat7Application not loaded!");
        }
        if (typeof ContactManagerApplication === 'undefined' && typeof window.ContactManagerApplication === 'undefined') {
            console.error("Cyberpunk Agent | ContactManagerApplication not loaded!");
        }

        // Load agent data
        this.loadAgentData();

        // Setup hooks only if methods exist
        if (this.handleActorUpdate) {
            Hooks.on('updateActor', this.handleActorUpdate.bind(this));
        }

        console.log("Cyberpunk Agent | Agent system setup complete");
    }

    /**
     * Add control button to the scene controls
     */
    addControlButton(controls) {
        // Find the token controls
        const tokenControl = controls.find(control => control.name === "token");

        if (tokenControl) {
            // Add the agent tool to the token controls
            tokenControl.tools.push({
                name: "agent",
                title: "Cyberpunk Agent",
                icon: "fas fa-mobile-alt",
                onClick: () => {
                    this.openAgentInterface();
                }
            });
        }
    }

    /**
     * Get user's accessible actors
     */
    getUserActors() {
        console.log("Cyberpunk Agent | Checking actors for user:", game.user.name);
        console.log("Cyberpunk Agent | User ID:", game.user.id);
        console.log("Cyberpunk Agent | Is GM:", game.user.isGM);

        // If user is GM, return all character actors
        if (game.user.isGM) {
            const allCharacterActors = game.actors.filter(actor => actor.type === 'character');
            console.log(`Cyberpunk Agent | GM access - returning all ${allCharacterActors.length} character actors`);
            return allCharacterActors;
        }

        // For regular users, get character actors they have access to
        let userActors = [];

        // Method 1: Get character actors from the user's owned tokens
        try {
            const ownedTokens = game.scenes.active.tokens.filter(token =>
                token.actor &&
                token.actor.type === 'character' &&
                token.actor.ownership[game.user.id] === 1
            );
            userActors = ownedTokens.map(token => token.actor);
            console.log(`Cyberpunk Agent | Found ${userActors.length} character actors from owned tokens`);
        } catch (error) {
            console.log("Cyberpunk Agent | Error getting owned tokens:", error);
        }

        // Method 2: Get character actors from the user's character list
        try {
            const characterActors = game.actors.filter(actor =>
                actor.type === 'character' &&
                actor.ownership &&
                actor.ownership[game.user.id] === 1
            );
            console.log(`Cyberpunk Agent | Found ${characterActors.length} character actors from character list`);
            userActors = [...userActors, ...characterActors];
        } catch (error) {
            console.log("Cyberpunk Agent | Error getting character actors:", error);
        }

        // Method 3: Get all character actors that the user has any permission to
        try {
            const accessibleActors = game.actors.filter(actor => {
                if (actor.type !== 'character') return false;
                if (!actor.ownership) return false;
                return actor.ownership[game.user.id] !== undefined;
            });
            console.log(`Cyberpunk Agent | Found ${accessibleActors.length} accessible character actors`);
            userActors = [...userActors, ...accessibleActors];
        } catch (error) {
            console.log("Cyberpunk Agent | Error getting accessible actors:", error);
        }

        // Remove duplicates
        const uniqueActors = [];
        const seenIds = new Set();
        for (const actor of userActors) {
            if (!seenIds.has(actor.id)) {
                seenIds.add(actor.id);
                uniqueActors.push(actor);
            }
        }

        console.log(`Cyberpunk Agent | Final unique accessible character actors: ${uniqueActors.length}`);
        uniqueActors.forEach(actor => {
            console.log(`  - ${actor.name} (${actor.id}) - Type: ${actor.type}`);
        });

        return uniqueActors;
    }

    /**
     * Open the agent interface
     */
    async openAgentInterface() {
        // Get user's actors using the correct method
        const userActors = this.getUserActors();

        if (userActors.length === 0) {
            ui.notifications.warn("Você não tem acesso a nenhum Actor para usar o Agent.");
            return;
        }

        let selectedActor = null;

        // If user has multiple actors, show selection dialog
        if (userActors.length > 1) {
            const actorOptions = userActors.map(actor => ({
                label: actor.name,
                value: actor.id
            }));

            const selectedActorId = await new Promise((resolve) => {
                new Dialog({
                    title: "Selecionar Actor",
                    content: `
                        <form>
                            <div class="form-group">
                                <label>Escolha qual Actor usar com o Agent:</label>
                                <select id="actor-select">
                                    ${actorOptions.map(option =>
                        `<option value="${option.value}">${option.label}</option>`
                    ).join('')}
                                </select>
                            </div>
                        </form>
                    `,
                    buttons: {
                        confirm: {
                            label: "Confirmar",
                            callback: (html) => {
                                const actorId = html.find('#actor-select').val();
                                resolve(actorId);
                            }
                        },
                        cancel: {
                            label: "Cancelar"
                        }
                    }
                }).render(true);
            });

            if (selectedActorId) {
                selectedActor = game.actors.get(selectedActorId);
            }
        } else {
            selectedActor = userActors[0];
        }

        if (selectedActor) {
            this.showAgentHome(selectedActor);
        }
    }

    /**
     * Show the agent home screen
     */
    showAgentHome(actor) {
        console.log("Cyberpunk Agent | Attempting to show agent home for actor:", actor.name);
        console.log("Cyberpunk Agent | AgentHomeApplication available:", typeof AgentHomeApplication);
        console.log("Cyberpunk Agent | Window AgentHomeApplication:", typeof window.AgentHomeApplication);

        // Check if classes are loaded
        if (typeof AgentHomeApplication === 'undefined' && typeof window.AgentHomeApplication === 'undefined') {
            console.error("Cyberpunk Agent | AgentHomeApplication is not defined!");
            console.log("Cyberpunk Agent | Available global objects:", Object.keys(window).filter(key => key.includes('Agent')));

            // Try to reload the module
            ui.notifications.warn("Recarregando módulo Cyberpunk Agent...");
            game.modules.get('cyberpunk-agent').api?.reload?.();

            ui.notifications.error("Erro ao carregar a interface do Agent. Tente recarregar a página (F5).");
            return;
        }

        try {
            console.log("Cyberpunk Agent | Creating AgentHomeApplication instance...");
            const AgentClass = AgentHomeApplication || window.AgentHomeApplication;
            const agentHome = new AgentClass(actor);
            console.log("Cyberpunk Agent | AgentHomeApplication instance created successfully");

            // Render the application
            agentHome.render(true);
        } catch (error) {
            console.error("Cyberpunk Agent | Error creating AgentHomeApplication:", error);
            ui.notifications.error("Erro ao criar a interface do Agent: " + error.message);
        }
    }

    /**
     * Get agent data for a specific actor
     */
    getAgentData(actorId) {
        return this.agentData.get(actorId) || {};
    }

    /**
     * Set agent data for a specific actor
     */
    setAgentData(actorId, data) {
        this.agentData.set(actorId, data);
        this.saveAgentData();
    }

    /**
     * Load agent data from settings
     */
    loadAgentData() {
        try {
            const savedData = game.settings.get('cyberpunk-agent', 'agent-data') || {};
            this.agentData = new Map(Object.entries(savedData));

            const contactNetworks = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
            this.contactNetworks = new Map(Object.entries(contactNetworks));
        } catch (error) {
            console.warn("Cyberpunk Agent | Error loading data:", error);
            this.agentData = new Map();
            this.contactNetworks = new Map();
        }
    }

    /**
     * Save agent data to settings
     */
    saveAgentData() {
        try {
            const dataObject = Object.fromEntries(this.agentData);
            game.settings.set('cyberpunk-agent', 'agent-data', dataObject);
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving agent data:", error);
        }
    }

    /**
     * Handle actor updates
     */
    handleActorUpdate(actor, changes, options, userId) {
        // Update contact networks if actor name changed
        if (changes.name && this.contactNetworks.has(actor.id)) {
            const contacts = this.contactNetworks.get(actor.id);
            // Update contact names in other actors' networks
            this.updateContactNames(actor.id, changes.name);
        }
    }

    /**
     * Update contact names in networks
     */
    updateContactNames(actorId, newName) {
        this.contactNetworks.forEach((contacts, networkActorId) => {
            if (networkActorId !== actorId) {
                const contactIndex = contacts.findIndex(contact => contact.id === actorId);
                if (contactIndex !== -1) {
                    contacts[contactIndex].name = newName;
                }
            }
        });
    }

    /**
     * Get contacts for an actor
     */
    getContactsForActor(actorId) {
        return this.contactNetworks.get(actorId) || [];
    }

    /**
     * Add contact to actor's network
     */
    addContactToActor(actorId, contactActorId) {
        const contact = game.actors.get(contactActorId);
        if (!contact) return false;

        if (!this.contactNetworks.has(actorId)) {
            this.contactNetworks.set(actorId, []);
        }

        const contacts = this.contactNetworks.get(actorId);
        const existingContact = contacts.find(c => c.id === contactActorId);

        if (!existingContact) {
            contacts.push({
                id: contactActorId,
                name: contact.name,
                img: contact.img
            });

            this.saveContactNetworks();
            return true;
        }

        return false;
    }

    /**
     * Remove contact from actor's network
     */
    removeContactFromActor(actorId, contactActorId) {
        if (this.contactNetworks.has(actorId)) {
            const contacts = this.contactNetworks.get(actorId);
            const index = contacts.findIndex(c => c.id === contactActorId);
            if (index !== -1) {
                contacts.splice(index, 1);
                this.saveContactNetworks();
                return true;
            }
        }
        return false;
    }

    /**
     * Save contact networks to settings
     */
    saveContactNetworks() {
        try {
            const networksObject = Object.fromEntries(this.contactNetworks);
            game.settings.set('cyberpunk-agent', 'contact-networks', networksObject);
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving contact networks:", error);
        }
    }

    /**
     * Clean up resources when the module is disabled
     */
    static cleanup() {
        console.log("Cyberpunk Agent | Module cleanup called");
    }
}

console.log("Cyberpunk Agent | module.js loaded successfully");

// Initialize the module
Hooks.once('init', () => {
    console.log("Cyberpunk Agent | Init hook triggered");
    CyberpunkAgent.registerSettings();
});

Hooks.once('ready', () => {
    console.log("Cyberpunk Agent | Ready hook triggered");
    console.log("Cyberpunk Agent | Module loaded successfully!");

    // Check if Cyberpunk RED system is active
    if (game.system.id === 'cyberpunk-red-core') {
        console.log("Cyberpunk Agent | Cyberpunk RED system detected!");
    } else {
        console.warn("Cyberpunk Agent | Warning: Cyberpunk RED system not detected. Current system:", game.system.id);
    }

    // Initialize the agent system
    CyberpunkAgent.instance = new CyberpunkAgent();
    CyberpunkAgent.instance.setupAgentSystem();

    // Hook for when a user joins
    Hooks.on('userJoined', (user) => {
        console.log(`Cyberpunk Agent | User ${user.name} joined the session`);
    });

    // Hook for when actors are updated
    Hooks.on('updateActor', (actor, changes, options, userId) => {
        if (CyberpunkAgent.instance) {
            CyberpunkAgent.instance.handleActorUpdate(actor, changes, options, userId);
        }
    });

    // Hook for when the controls toolbar is rendered
    Hooks.on('getSceneControlButtons', (controls) => {
        if (CyberpunkAgent.instance) {
            CyberpunkAgent.instance.addControlButton(controls);
        }
    });

    // Note: Contact Manager is now accessed through a custom settings menu
});

Hooks.once('disableModule', () => {
    console.log("Cyberpunk Agent | Disable hook triggered");
    CyberpunkAgent.cleanup();
});

// Make CyberpunkAgent globally available
window.CyberpunkAgent = CyberpunkAgent;
console.log("Cyberpunk Agent | CyberpunkAgent class made globally available"); 