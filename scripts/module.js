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
        this.socketLibIntegration = null; // SocketLib integration
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

        game.settings.register('cyberpunk-agent', 'communication-method', {
            name: 'Método de Comunicação',
            hint: 'Escolha como o módulo deve comunicar mudanças entre usuários',
            scope: 'world',
            config: true,
            type: String,
            choices: {
                'auto': 'Automático (Recomendado)',
                'socketlib-only': 'Apenas SocketLib (Melhor)',
                'socket-only': 'Apenas Socket Nativo',
                'chat-only': 'Apenas Chat (Fallback)',
                'none': 'Sem Comunicação'
            },
            default: 'auto'
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

        // Setup SocketLib integration if available
        this.setupSocketLibIntegration();

        // Setup socket communication for real-time updates (fallback)
        this.setupSocketCommunication();

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

            // Notify all clients about the contact update
            this.notifyContactUpdate();

            // Also trigger immediate update for local interfaces
            this._updateContactManagerImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving contact networks:", error);
        }
    }

    /**
     * Update contact manager immediately for better UX
     */
    _updateContactManagerImmediately() {
        // Find and update any open ContactManagerApplication
        const openWindows = Object.values(ui.windows);
        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'ContactManagerApplication') {
                console.log("Cyberpunk Agent | Updating ContactManagerApplication immediately");
                try {
                    // Use the internal update method if available
                    if (window._handleRealtimeUpdate) {
                        window._handleRealtimeUpdate();
                    } else {
                        // Fallback to re-render
                        window.render(true);
                    }
                } catch (error) {
                    console.warn("Cyberpunk Agent | Error updating ContactManagerApplication:", error);
                }
            }
        });
    }

    /**
     * Setup SocketLib integration
     */
    setupSocketLibIntegration() {
        try {
            // Check if SocketLib integration is available
            if (typeof window.SocketLibIntegration !== 'undefined') {
                this.socketLibIntegration = new window.SocketLibIntegration();
                console.log("Cyberpunk Agent | SocketLib integration initialized");
            } else {
                console.log("Cyberpunk Agent | SocketLib integration not available");
            }
        } catch (error) {
            console.warn("Cyberpunk Agent | Error setting up SocketLib integration:", error);
        }
    }

    /**
     * Check if cross-client communication is needed
     */
    _needsCrossClientCommunication() {
        // Only need cross-client communication if there are multiple users
        return game.users.size > 1;
    }

    /**
     * Check if socket communication is working
     */
    _isSocketWorking() {
        return game.socket && game.socket.connected;
    }

    /**
 * Get preferred communication method
 */
    _getCommunicationMethod() {
        // Check user preference (if implemented)
        const preferredMethod = game.settings.get('cyberpunk-agent', 'communication-method') || 'auto';

        switch (preferredMethod) {
            case 'socketlib-only':
                return this._isSocketLibAvailable() ? 'socketlib' : 'none';
            case 'socket-only':
                return this._isSocketWorking() ? 'socket' : 'none';
            case 'chat-only':
                return 'chat';
            case 'auto':
            default:
                // Priority: SocketLib > Socket > Chat > None
                if (this._isSocketLibAvailable()) {
                    return 'socketlib';
                } else if (this._isSocketWorking()) {
                    return 'socket';
                } else if (this._needsCrossClientCommunication()) {
                    return 'chat';
                } else {
                    return 'none';
                }
        }
    }

    /**
     * Check if SocketLib is available and working
     */
    _isSocketLibAvailable() {
        return this.socketLibIntegration && this.socketLibIntegration.isAvailable && typeof socketlib !== 'undefined';
    }

    /**
     * Send notification via native socket
     */
    _sendViaNativeSocket() {
        if (game.socket) {
            console.log("Cyberpunk Agent | Sending contact update notification via native socket");

            const notificationData = {
                type: 'contactUpdate',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id
                }
            };

            // Send via socket
            game.socket.emit('module.cyberpunk-agent', notificationData);

            // Only use chat fallback if socket might not reach all users
            if (game.user.isGM) {
                this.broadcastContactUpdate(notificationData);
            }
        } else {
            console.warn("Cyberpunk Agent | Native socket not available, falling back to chat.");
            this._sendViaChat();
        }
    }

    /**
     * Send notification via chat
     */
    _sendViaChat() {
        console.log("Cyberpunk Agent | Sending contact update notification via chat message (fallback)");
        this.broadcastContactUpdate({
            type: 'contactUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id
            }
        });
    }

    /**
     * Test socket connectivity
     */
    _testSocketConnectivity() {
        if (!game.socket) {
            return false;
        }

        return new Promise((resolve) => {
            const testData = {
                type: 'ping',
                timestamp: Date.now()
            };

            // Set a timeout for the test
            const timeout = setTimeout(() => {
                resolve(false);
            }, 2000);

            // Listen for pong response
            const pongHandler = (data) => {
                if (data.type === 'pong' && data.timestamp === testData.timestamp) {
                    clearTimeout(timeout);
                    game.socket.off('module.cyberpunk-agent', pongHandler);
                    resolve(true);
                }
            };

            game.socket.on('module.cyberpunk-agent', pongHandler);

            // Send ping
            game.socket.emit('module.cyberpunk-agent', testData);
        });
    }

    /**
     * Notify all clients about contact updates
     */
    async notifyContactUpdate() {
        // Always update local interfaces immediately for better UX
        this._updateContactManagerImmediately();

        // Only send cross-client notifications if there are multiple users
        if (!this._needsCrossClientCommunication()) {
            console.log("Cyberpunk Agent | Single user session, skipping cross-client notification");
            return;
        }

        const communicationMethod = this._getCommunicationMethod();
        console.log("Cyberpunk Agent | Using communication method:", communicationMethod);

        if (communicationMethod === 'socketlib') {
            console.log("Cyberpunk Agent | Sending contact update notification via SocketLib");

            try {
                const success = await this.socketLibIntegration.sendContactUpdate({
                    type: 'contactUpdate',
                    action: 'contactModified'
                });

                if (success) {
                    console.log("Cyberpunk Agent | SocketLib notification sent successfully");
                    return;
                } else {
                    console.warn("Cyberpunk Agent | SocketLib failed, trying fallback methods");
                }
            } catch (error) {
                console.error("Cyberpunk Agent | SocketLib error:", error);
            }

            // Fallback to native socket
            if (this._isSocketWorking()) {
                console.log("Cyberpunk Agent | Falling back to native socket");
                this._sendViaNativeSocket();
            } else {
                console.log("Cyberpunk Agent | Falling back to chat");
                this._sendViaChat();
            }
        } else if (communicationMethod === 'socket') {
            this._sendViaNativeSocket();
        } else if (communicationMethod === 'chat') {
            this._sendViaChat();
        } else {
            console.log("Cyberpunk Agent | No communication method available, skipping notification.");
        }
    }

    /**
     * Broadcast contact update via chat message (fallback method)
     * This method creates completely invisible chat messages for cross-client communication
     */
    broadcastContactUpdate(data) {
        try {
            // Validate data before broadcasting
            if (!data || !data.type || !data.data) {
                console.error("Cyberpunk Agent | Invalid data for broadcast:", data);
                return;
            }

            // Create a completely invisible chat message to broadcast the update
            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-update" data-update='${JSON.stringify(data)}' style="display: none; position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: [],
                blind: true, // Make message blind (only visible to GM)
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        invisible: true
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Contact update broadcasted via invisible chat message");
        } catch (error) {
            console.error("Cyberpunk Agent | Error broadcasting contact update:", error);
            console.error("Data that failed to broadcast:", data);
        }
    }

    /**
    * Handle contact update notifications from other clients
    */
    handleContactUpdate(data) {
        console.log("Cyberpunk Agent | Received contact update notification from:", data.userName);

        // Prevent processing our own updates
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own update notification");
            return;
        }

        // Check if this is a recent update to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore updates older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old update notification (age:", timeDiff, "ms)");
            return;
        }

        // Reload contact data from settings
        this.loadAgentData();

        // Update all open interfaces
        this.updateOpenInterfaces();

        // Show notification to user with more details
        const message = data.userName === game.user.name
            ? "Sua lista de contatos foi atualizada!"
            : `Lista de contatos atualizada por ${data.userName}!`;

        ui.notifications.info(message);

        console.log("Cyberpunk Agent | Contact update processed successfully");
    }

    /**
    * Update all open agent interfaces
    */
    updateOpenInterfaces() {
        console.log("Cyberpunk Agent | Updating open interfaces...");

        // Check if there are any open interfaces first
        if (!this.hasOpenInterfaces()) {
            console.log("Cyberpunk Agent | No open interfaces to update");
            return;
        }

        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered) {
                // Check if it's an agent-related application
                if (window.constructor.name === 'AgentHomeApplication' ||
                    window.constructor.name === 'Chat7Application' ||
                    window.constructor.name === 'ContactManagerApplication') {

                    console.log(`Cyberpunk Agent | Updating ${window.constructor.name}`);

                    try {
                        // Re-render the application to refresh data
                        window.render(true);
                        updatedCount++;
                    } catch (error) {
                        console.warn(`Cyberpunk Agent | Error updating ${window.constructor.name}:`, error);
                    }
                }
            }
        });

        // Also check for any dialogs that might be open
        const dialogs = document.querySelectorAll('.dialog');
        dialogs.forEach(dialog => {
            const dialogContent = dialog.querySelector('.dialog-content');
            if (dialogContent && dialogContent.innerHTML.includes('cyberpunk-agent')) {
                console.log("Cyberpunk Agent | Found agent-related dialog, updating...");
                // Trigger a custom event to refresh dialog content
                dialog.dispatchEvent(new CustomEvent('cyberpunk-agent-update'));
            }
        });

        // Trigger custom event for any other listeners
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                timestamp: Date.now(),
                type: 'contactUpdate'
            }
        }));

        console.log(`Cyberpunk Agent | Updated ${updatedCount} interfaces`);

        // Show a subtle notification if interfaces were updated
        if (updatedCount > 0) {
            ui.notifications.info(`Atualizadas ${updatedCount} interface(s) do Agent`);
        }
    }

    /**
 * Setup socket communication for real-time updates
 */
    setupSocketCommunication() {
        if (game.socket) {
            console.log("Cyberpunk Agent | Setting up socket communication");

            game.socket.on('module.cyberpunk-agent', (data) => {
                if (data.type === 'contactUpdate') {
                    console.log("Cyberpunk Agent | Received socket notification:", data);
                    this.handleContactUpdate(data.data);
                } else if (data.type === 'ping') {
                    // Respond to ping with pong
                    console.log("Cyberpunk Agent | Received ping, sending pong");
                    game.socket.emit('module.cyberpunk-agent', {
                        type: 'pong',
                        timestamp: data.timestamp
                    });
                }
            });
        }

        // Setup chat message listener for fallback communication
        this.setupChatMessageListener();

        console.log("Cyberpunk Agent | Socket communication setup complete");
    }

    /**
    * Setup chat message listener for fallback communication
    */
    setupChatMessageListener() {
        Hooks.on('createChatMessage', (message) => {
            try {
                // Check if this is a cyberpunk agent update message
                // message.content is a string, not a DOM element
                if (!message || typeof message.content !== 'string') {
                    return; // Skip if message is invalid or content is not a string
                }

                if (message.content.includes('cyberpunk-agent-update')) {
                    // Create a temporary DOM element to parse the content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = message.content;

                    const updateElement = tempDiv.querySelector('.cyberpunk-agent-update');
                    if (updateElement && updateElement.dataset.update) {
                        const updateData = JSON.parse(updateElement.dataset.update);
                        if (updateData && updateData.type === 'contactUpdate' && updateData.data) {
                            console.log("Cyberpunk Agent | Received chat notification:", updateData);
                            this.handleContactUpdate(updateData.data);
                        }
                    }
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error in chat message listener:", error);
                console.error("Message content:", message?.content);
            }
        });

        console.log("Cyberpunk Agent | Chat message listener setup complete");
    }

    /**
    * Test the real-time update system
    */
    testRealtimeUpdate() {
        console.log("Cyberpunk Agent | Testing real-time update system...");

        if (game.user.isGM) {
            // Simulate a contact update
            this.notifyContactUpdate();
            console.log("Cyberpunk Agent | Test notification sent");
        } else {
            // Test interface update
            this.updateOpenInterfaces();
            console.log("Cyberpunk Agent | Test interface update completed");
        }
    }

    /**
    * Test cross-client communication
    */
    testCrossClientCommunication() {
        console.log("Cyberpunk Agent | Testing cross-client communication...");

        if (!game.user.isGM) {
            console.log("Cyberpunk Agent | Cross-client test requires GM permissions");
            return;
        }

        // Test socket communication
        if (game.socket) {
            console.log("Cyberpunk Agent | Socket available, testing...");
            this.notifyContactUpdate();
        } else {
            console.log("Cyberpunk Agent | Socket not available, testing fallback...");
            this.broadcastContactUpdate({
                type: 'contactUpdate',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id
                }
            });
        }

        console.log("Cyberpunk Agent | Cross-client test completed");
    }

    /**
     * Test chat message broadcasting specifically
     */
    testChatBroadcasting() {
        console.log("Cyberpunk Agent | Testing chat message broadcasting...");

        if (!game.user.isGM) {
            console.log("Cyberpunk Agent | Chat broadcasting test requires GM permissions");
            return;
        }

        try {
            this.broadcastContactUpdate({
                type: 'contactUpdate',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id,
                    test: true
                }
            });
            console.log("Cyberpunk Agent | Chat broadcasting test completed");
        } catch (error) {
            console.error("Cyberpunk Agent | Error in chat broadcasting test:", error);
        }
    }

    /**
     * Check if there are any open agent interfaces
     */
    hasOpenInterfaces() {
        const openWindows = Object.values(ui.windows);
        return openWindows.some(window =>
            window && window.rendered && (
                window.constructor.name === 'AgentHomeApplication' ||
                window.constructor.name === 'Chat7Application' ||
                window.constructor.name === 'ContactManagerApplication'
            )
        );
    }

    /**
     * Get count of open agent interfaces
     */
    getOpenInterfacesCount() {
        const openWindows = Object.values(ui.windows);
        return openWindows.filter(window =>
            window && window.rendered && (
                window.constructor.name === 'AgentHomeApplication' ||
                window.constructor.name === 'Chat7Application' ||
                window.constructor.name === 'ContactManagerApplication'
            )
        ).length;
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

    // Hook for settings changes (backup for real-time updates)
    Hooks.on('renderSettingsConfig', (app, html, data) => {
        if (CyberpunkAgent.instance) {
            // Listen for changes to our module settings
            html.find('input[name="cyberpunk-agent.contact-networks"]').on('change', () => {
                console.log("Cyberpunk Agent | Settings change detected");
                setTimeout(() => {
                    CyberpunkAgent.instance.loadAgentData();
                    CyberpunkAgent.instance.updateOpenInterfaces();
                }, 100);
            });
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

// Make test functions globally available
window.testRealtimeUpdate = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testRealtimeUpdate();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.testCrossClientCommunication = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testCrossClientCommunication();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.testChatBroadcasting = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testChatBroadcasting();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.checkOpenInterfaces = () => {
    if (CyberpunkAgent.instance) {
        const count = CyberpunkAgent.instance.getOpenInterfacesCount();
        const hasOpen = CyberpunkAgent.instance.hasOpenInterfaces();
        console.log(`Cyberpunk Agent | Open interfaces: ${count} (has open: ${hasOpen})`);
        return { count, hasOpen };
    } else {
        console.error("Cyberpunk Agent | Instance not available");
        return { count: 0, hasOpen: false };
    }
};

window.forceUpdateInterfaces = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.updateOpenInterfaces();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

console.log("Cyberpunk Agent | CyberpunkAgent class and test functions made globally available"); 