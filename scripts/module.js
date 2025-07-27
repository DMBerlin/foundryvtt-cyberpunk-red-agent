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
        this.messages = new Map(); // Store messages between actors
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

        game.settings.register('cyberpunk-agent', 'messages', {
            name: 'Messages',
            hint: 'Mensagens entre personagens',
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

        game.settings.register('cyberpunk-agent', 'private-messages', {
            name: 'Mensagens Privadas',
            hint: 'Torna as mensagens do Agent privadas entre os participantes',
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
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

        // Register direct Contact Manager button
        game.settings.register('cyberpunk-agent', 'contact-manager-button', {
            name: 'Gerenciador de Contatos',
            hint: 'Clique para abrir diretamente o Gerenciador de Contatos',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (value) {
                    // Reset the setting immediately
                    game.settings.set('cyberpunk-agent', 'contact-manager-button', false);

                    // Open Contact Manager directly
                    if (!game.user.isGM) {
                        ui.notifications.warn('Apenas GMs podem acessar o Gerenciador de Contatos');
                        return;
                    }

                    // Play opening sound effect
                    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
                        window.CyberpunkAgent.instance.playSoundEffect('opening-window');
                    }

                    const ContactClass = ContactManagerApplication || window.ContactManagerApplication;
                    if (typeof ContactClass !== 'undefined') {
                        const contactManager = new ContactClass();
                        contactManager.render(true);
                    } else {
                        console.error("Cyberpunk Agent | ContactManagerApplication not loaded!");
                        ui.notifications.error("Erro ao carregar o Gerenciador de Contatos. Tente recarregar a página (F5).");
                    }
                }
            }
        });

        // Register data cleanup setting
        game.settings.register('cyberpunk-agent', 'clear-all-data', {
            name: 'Limpar Todos os Dados',
            hint: 'Remove todas as conexões entre contatos e todas as mensagens salvas. ATENÇÃO: Esta ação não pode ser desfeita!',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (value) {
                    // Reset the setting immediately
                    game.settings.set('cyberpunk-agent', 'clear-all-data', false);

                    // Show confirmation dialog
                    new Dialog({
                        title: 'Confirmar Limpeza de Dados',
                        content: `
                            <div style="padding: 20px;">
                                <h3 style="color: #ff0033; margin-bottom: 15px;">⚠️ ATENÇÃO ⚠️</h3>
                                <p style="margin-bottom: 15px;">Você está prestes a <strong>DELETAR PERMANENTEMENTE</strong>:</p>
                                <ul style="margin-bottom: 20px; padding-left: 20px;">
                                    <li>Todas as conexões entre contatos</li>
                                    <li>Todas as mensagens salvas</li>
                                    <li>Todos os dados do Agent</li>
                                </ul>
                                <p style="color: #ff0033; font-weight: bold;">Esta ação NÃO pode ser desfeita!</p>
                                <p>Digite <strong>CONFIRMAR</strong> para prosseguir:</p>
                                <input type="text" id="confirmText" style="width: 100%; margin-top: 10px; padding: 8px; border: 2px solid #ff0033; border-radius: 4px;">
                            </div>
                        `,
                        buttons: {
                            confirm: {
                                label: 'Limpar Dados',
                                icon: '<i class="fas fa-trash"></i>',
                                callback: (html) => {
                                    const confirmText = html.find('#confirmText').val();
                                    if (confirmText === 'CONFIRMAR') {
                                        CyberpunkAgent.instance.clearAllData();
                                        ui.notifications.info('Todos os dados foram limpos com sucesso!');
                                    } else {
                                        ui.notifications.warn('Texto de confirmação incorreto. Operação cancelada.');
                                    }
                                }
                            },
                            cancel: {
                                label: 'Cancelar',
                                icon: '<i class="fas fa-times"></i>'
                            }
                        },
                        default: 'cancel'
                    }).render(true);
                }
            }
        });

        // Register sound effects test button
        game.settings.register('cyberpunk-agent', 'test-sound-effects', {
            name: 'Testar Efeitos Sonoros',
            hint: 'Clique para testar os efeitos sonoros de abertura e fechamento',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (value) {
                    // Reset the setting immediately
                    game.settings.set('cyberpunk-agent', 'test-sound-effects', false);

                    // Test sound effects
                    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
                        window.CyberpunkAgent.instance.testSoundEffects();
                    } else {
                        ui.notifications.error("Cyberpunk Agent não está disponível!");
                    }
                }
            }
        });

        // Register data cleanup button setting
        game.settings.register('cyberpunk-agent', 'clear-all-data-button', {
            name: 'Limpar Todos os Dados',
            hint: 'Clique para abrir o diálogo de confirmação para limpar todos os dados',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (value) {
                    // Reset the setting immediately
                    game.settings.set('cyberpunk-agent', 'clear-all-data-button', false);

                    // Show confirmation dialog
                    new Dialog({
                        title: 'Confirmar Limpeza de Dados',
                        content: `
                            <div style="padding: 20px;">
                                <h3 style="color: #ff0033; margin-bottom: 15px;">⚠️ ATENÇÃO ⚠️</h3>
                                <p style="margin-bottom: 15px;">Você está prestes a <strong>DELETAR PERMANENTEMENTE</strong>:</p>
                                <ul style="margin-bottom: 20px; padding-left: 20px;">
                                    <li>Todas as conexões entre contatos</li>
                                    <li>Todas as mensagens salvas</li>
                                    <li>Todos os dados do Agent</li>
                                </ul>
                                <p style="color: #ff0033; font-weight: bold;">Esta ação NÃO pode ser desfeita!</p>
                                <p>Digite <strong>CONFIRMAR</strong> para prosseguir:</p>
                                <input type="text" id="confirmText" style="width: 100%; margin-top: 10px; padding: 8px; border: 2px solid #ff0033; border-radius: 4px;">
                            </div>
                        `,
                        buttons: {
                            confirm: {
                                label: 'Limpar Dados',
                                icon: '<i class="fas fa-trash"></i>',
                                callback: (html) => {
                                    const confirmText = html.find('#confirmText').val();
                                    if (confirmText === 'CONFIRMAR') {
                                        CyberpunkAgent.instance.clearAllData();
                                        ui.notifications.info('Todos os dados foram limpos com sucesso!');
                                    } else {
                                        ui.notifications.warn('Texto de confirmação incorreto. Operação cancelada.');
                                    }
                                }
                            },
                            cancel: {
                                label: 'Cancelar',
                                icon: '<i class="fas fa-times"></i>'
                            }
                        },
                        default: 'cancel'
                    }).render(true);
                }
            }
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
     * Setup FoundryVTT chat integration
     */
    setupFoundryChatIntegration() {
        console.log("Cyberpunk Agent | Setting up FoundryVTT chat integration...");

        // Sync messages when module loads
        this.syncMessagesWithFoundryChat();

        // Listen for new chat messages
        Hooks.on('createChatMessage', (message) => {
            this._handleNewChatMessage(message);
        });

        console.log("Cyberpunk Agent | FoundryVTT chat integration setup complete");
    }

    /**
     * Handle new chat messages from FoundryVTT
     */
    _handleNewChatMessage(message) {
        // Check if this is a cyberpunk agent message
        if (message.flags && message.flags['cyberpunk-agent'] && message.flags['cyberpunk-agent'].isAgentMessage) {
            console.log("Cyberpunk Agent | New agent chat message detected:", message);

            // Update our interfaces
            this._updateChatInterfacesImmediately();
            this.updateOpenInterfaces();
        }
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

        // Setup FoundryVTT chat integration
        this.setupFoundryChatIntegration();

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

            // Play opening sound effect
            this.playSoundEffect('opening-window');

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

            const messages = game.settings.get('cyberpunk-agent', 'messages') || {};
            this.messages = new Map(Object.entries(messages));
        } catch (error) {
            console.warn("Cyberpunk Agent | Error loading data:", error);
            this.agentData = new Map();
            this.contactNetworks = new Map();
            this.messages = new Map();
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
     * Save messages to settings
     */
    async saveMessages() {
        try {
            const messagesObject = Object.fromEntries(this.messages);

            // If user is GM, save directly
            if (game.user.isGM) {
                game.settings.set('cyberpunk-agent', 'messages', messagesObject);
            } else {
                // If user is not GM, send to GM to save
                await this._requestGMSaveMessages(messagesObject);
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving messages:", error);
        }
    }

    /**
     * Request GM to save messages
     */
    async _requestGMSaveMessages(messagesObject) {
        try {
            // Send message to GM via SocketLib if available
            if (this._isSocketLibAvailable() && this.socketLibIntegration) {
                await this.socketLibIntegration.sendMessageToGM('saveMessages', {
                    messages: messagesObject,
                    userId: game.user.id,
                    userName: game.user.name,
                    timestamp: Date.now()
                });
                console.log("Cyberpunk Agent | Message save request sent to GM via SocketLib");
            } else if (game.socket) {
                // Fallback to native socket
                game.socket.emit('module.cyberpunk-agent', {
                    type: 'saveMessagesRequest',
                    data: {
                        messages: messagesObject,
                        userId: game.user.id,
                        userName: game.user.name,
                        timestamp: Date.now()
                    }
                });
                console.log("Cyberpunk Agent | Message save request sent to GM via native socket");
            } else {
                // Fallback to chat message
                this._sendSaveRequestViaChat(messagesObject);
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error requesting GM to save messages:", error);
        }
    }

    /**
     * Send save request via chat message
     */
    _sendSaveRequestViaChat(messagesObject) {
        try {
            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-save-request" data-request='${JSON.stringify({
                    type: 'saveMessagesRequest',
                    messages: messagesObject,
                    userId: game.user.id,
                    userName: game.user.name,
                    timestamp: Date.now()
                })}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0, 255, 0, 0.1); border-radius: 4px; border-left: 3px solid #00ff00;">
                        <i class="fas fa-save" style="color: #00ff00;"></i>
                        <div>
                            <strong style="color: #00ff00;">Cyberpunk Agent - Save Request</strong><br>
                            <span style="font-size: 0.9em; color: #666;">
                                Request from <strong>${game.user.name}</strong> to save messages
                            </span>
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: game.users.filter(u => u.isGM).map(u => u.id), // Only visible to GMs
                blind: false,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: 'saveMessagesRequest'
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Save request sent via chat message");
        } catch (error) {
            console.error("Cyberpunk Agent | Error sending save request via chat:", error);
        }
    }

    /**
     * Get conversation key for two actors
     */
    _getConversationKey(actorId1, actorId2) {
        // Sort IDs to ensure consistent key regardless of sender/receiver order
        const sortedIds = [actorId1, actorId2].sort();
        return `${sortedIds[0]}-${sortedIds[1]}`;
    }

    /**
     * Get messages for a conversation between two actors
     */
    getMessagesForConversation(actorId1, actorId2) {
        const conversationKey = this._getConversationKey(actorId1, actorId2);
        const conversation = this.messages.get(conversationKey) || [];

        // Get messages from FoundryVTT chat as well
        const foundryMessages = this.getMessagesFromFoundryChat(actorId1, actorId2);

        // Merge messages from both sources
        const mergedMessages = this._mergeMessages(conversation, foundryMessages);

        // Mark messages as own/other based on sender
        return mergedMessages.map(message => ({
            ...message,
            isOwn: message.senderId === actorId1
        }));
    }

    /**
 * Send a message from one actor to another
 */
    async sendMessage(senderId, receiverId, text) {
        if (!text || !text.trim()) {
            return false;
        }

        const conversationKey = this._getConversationKey(senderId, receiverId);

        if (!this.messages.has(conversationKey)) {
            this.messages.set(conversationKey, []);
        }

        const conversation = this.messages.get(conversationKey);
        const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const message = {
            id: messageId,
            senderId: senderId,
            receiverId: receiverId,
            text: text.trim(),
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        conversation.push(message);
        await this.saveMessages();

        // Create FoundryVTT chat message for real chat integration
        this._createFoundryChatMessage(senderId, receiverId, text.trim(), messageId);

        // Try to send via SocketLib first
        let socketLibSuccess = false;
        if (this._isSocketLibAvailable() && this.socketLibIntegration) {
            try {
                console.log("Cyberpunk Agent | Attempting to send message via SocketLib");
                socketLibSuccess = await this.socketLibIntegration.sendMessage(senderId, receiverId, text.trim(), messageId);
                if (socketLibSuccess) {
                    console.log("Cyberpunk Agent | Message sent successfully via SocketLib");
                } else {
                    console.warn("Cyberpunk Agent | SocketLib message sending failed, using fallback");
                }
            } catch (error) {
                console.error("Cyberpunk Agent | SocketLib message sending error:", error);
            }
        }

        // If SocketLib failed or is not available, use fallback methods
        if (!socketLibSuccess) {
            console.log("Cyberpunk Agent | Using fallback message notification methods");
            this.notifyMessageUpdate(senderId, receiverId, message);
        }

        // Update local interfaces immediately for better UX (only once)
        this._updateChatInterfacesImmediately();

        console.log("Cyberpunk Agent | Message sent:", message);
        return true;
    }

    /**
 * Create a FoundryVTT chat message for real chat integration
 */
    _createFoundryChatMessage(senderId, receiverId, text, messageId) {
        try {
            const sender = game.actors.get(senderId);
            const receiver = game.actors.get(receiverId);

            if (!sender || !receiver) {
                console.warn("Cyberpunk Agent | Invalid sender or receiver for chat message");
                return;
            }

            // Check if private messages are enabled
            const privateMessages = game.settings.get('cyberpunk-agent', 'private-messages');

            // Determine message visibility based on user permissions
            const senderUser = this._getUserForActor(senderId);
            const receiverUser = this._getUserForActor(receiverId);

            let whisper = [];
            let blind = false;
            let type = CONST.CHAT_MESSAGE_TYPES.IC; // Default to IC

            if (privateMessages) {
                // Private message mode
                type = CONST.CHAT_MESSAGE_TYPES.WHISPER;

                // Always include GMs in whispers so they can see all messages
                const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
                whisper.push(...gmUsers);

                // Add sender if they are a player
                if (senderUser && !senderUser.isGM) {
                    whisper.push(senderUser.id);
                }

                // Add receiver if they are a player
                if (receiverUser && !receiverUser.isGM) {
                    whisper.push(receiverUser.id);
                }

                // Remove duplicates
                whisper = [...new Set(whisper)];

                // Make it blind for non-participants
                blind = true;
            } else {
                // Public message mode - visible to all
                type = CONST.CHAT_MESSAGE_TYPES.IC;
                blind = false;
            }

            // Create the chat message
            const messageData = {
                user: game.user.id,
                speaker: {
                    Actor: senderId,
                    alias: sender.name
                },
                content: `<div class="cyberpunk-agent-chat-message" data-message-id="${messageId}" data-private="${privateMessages}">
                    <div class="cyberpunk-agent-chat-header">
                        <img src="${sender.img}" alt="${sender.name}" class="cyberpunk-agent-chat-avatar" />
                        <span class="cyberpunk-agent-chat-sender">${sender.name}</span>
                        <span class="cyberpunk-agent-chat-arrow">→</span>
                        <span class="cyberpunk-agent-chat-receiver">${receiver.name}</span>
                    </div>
                    <div class="cyberpunk-agent-chat-content">
                        ${text}
                    </div>
                    <div class="cyberpunk-agent-chat-time">
                        ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>`,
                type: type,
                whisper: whisper,
                blind: blind,
                flags: {
                    'cyberpunk-agent': {
                        isAgentMessage: true,
                        messageId: messageId,
                        senderId: senderId,
                        receiverId: receiverId,
                        timestamp: Date.now(),
                        isPrivate: privateMessages
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Private FoundryVTT chat message created:", messageData);

        } catch (error) {
            console.error("Cyberpunk Agent | Error creating FoundryVTT chat message:", error);
        }
    }

    /**
     * Get user for an actor (if any)
     */
    _getUserForActor(actorId) {
        // Check if any user owns this actor
        const actor = game.actors.get(actorId);
        if (!actor) return null;

        // Check ownership
        for (const user of game.users.values()) {
            if (actor.ownership && actor.ownership[user.id] === 1) {
                return user;
            }
        }

        return null;
    }

    /**
     * Get messages from FoundryVTT chat for a conversation
     */
    getMessagesFromFoundryChat(actorId1, actorId2) {
        const conversationKey = this._getConversationKey(actorId1, actorId2);
        const messages = [];

        // Get all chat messages
        const chatMessages = game.messages.contents;

        for (const chatMessage of chatMessages) {
            // Check if this is a cyberpunk agent message
            if (chatMessage.flags && chatMessage.flags['cyberpunk-agent'] && chatMessage.flags['cyberpunk-agent'].isAgentMessage) {
                const agentFlags = chatMessage.flags['cyberpunk-agent'];

                // Check if this message belongs to our conversation
                if ((agentFlags.senderId === actorId1 && agentFlags.receiverId === actorId2) ||
                    (agentFlags.senderId === actorId2 && agentFlags.receiverId === actorId1)) {

                    // Parse the message content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = chatMessage.content;

                    const contentDiv = tempDiv.querySelector('.cyberpunk-agent-chat-content');
                    const timeDiv = tempDiv.querySelector('.cyberpunk-agent-chat-time');

                    if (contentDiv) {
                        messages.push({
                            id: agentFlags.messageId,
                            senderId: agentFlags.senderId,
                            receiverId: agentFlags.receiverId,
                            text: contentDiv.textContent.trim(),
                            timestamp: agentFlags.timestamp,
                            time: timeDiv ? timeDiv.textContent.trim() : new Date(agentFlags.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            isOwn: agentFlags.senderId === actorId1,
                            chatMessageId: chatMessage.id
                        });
                    }
                }
            }
        }

        // Sort by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        return messages;
    }

    /**
     * Sync messages between our system and FoundryVTT chat
     */
    syncMessagesWithFoundryChat() {
        console.log("Cyberpunk Agent | Syncing messages with FoundryVTT chat...");

        // Get all conversations from our system
        this.messages.forEach((conversation, conversationKey) => {
            const [actorId1, actorId2] = conversationKey.split('-');

            // Get messages from FoundryVTT chat
            const foundryMessages = this.getMessagesFromFoundryChat(actorId1, actorId2);

            // Merge messages
            const mergedMessages = this._mergeMessages(conversation, foundryMessages);

            // Update our conversation
            this.messages.set(conversationKey, mergedMessages);
        });

        // Save updated messages
        this.saveMessages();

        console.log("Cyberpunk Agent | Message sync completed");
    }

    /**
     * Merge messages from our system and FoundryVTT chat
     */
    _mergeMessages(ourMessages, foundryMessages) {
        const merged = [...ourMessages];

        for (const foundryMsg of foundryMessages) {
            // Check if we already have this message
            const existingIndex = merged.findIndex(msg => msg.id === foundryMsg.id);

            if (existingIndex === -1) {
                // Add new message from FoundryVTT
                merged.push(foundryMsg);
            } else {
                // Update existing message with FoundryVTT data
                merged[existingIndex] = { ...merged[existingIndex], ...foundryMsg };
            }
        }

        // Sort by timestamp
        merged.sort((a, b) => a.timestamp - b.timestamp);

        return merged;
    }

    /**
     * Check if an actor is in another actor's contact list
     */
    isContact(actorId, contactId) {
        const contacts = this.getContactsForActor(actorId);
        return contacts.some(contact => contact.id === contactId);
    }

    /**
     * Get anonymous contact info for unknown sender
     */
    /**
     * Generate random American phone number
     */
    _generateRandomPhoneNumber() {
        // Format: (XXX) XXX-XXXX
        const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
        const prefix = Math.floor(Math.random() * 900) + 100;   // 100-999
        const lineNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

        return `(${areaCode}) ${prefix}-${lineNumber}`;
    }

    /**
     * Get or create anonymous contact for sender
     */
    getAnonymousContact(senderId) {
        try {
            const sender = game.actors.get(senderId);
            if (!sender) {
                console.warn("Cyberpunk Agent | Sender not found:", senderId);
                return {
                    id: senderId,
                    name: "Desconhecido",
                    img: "icons/svg/mystery-man.svg",
                    isAnonymous: true
                };
            }

            // Check if we already have an anonymous contact for this sender
            const existingAnonymous = this._getExistingAnonymousContact(senderId);
            if (existingAnonymous) {
                return existingAnonymous;
            }

            // Create new anonymous contact data
            const anonymousContact = {
                id: senderId, // Use original sender ID for consistency
                name: this._generateRandomPhoneNumber(),
                img: 'icons/svg/mystery-man.svg',
                isAnonymous: true,
                originalSenderId: senderId
            };

            // Store the anonymous contact for consistency
            this._storeAnonymousContact(senderId, anonymousContact);

            return anonymousContact;
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting anonymous contact:", error);
            return {
                id: senderId,
                name: "Erro",
                img: "icons/svg/mystery-man.svg",
                isAnonymous: true
            };
        }
    }

    /**
     * Get existing anonymous contact for sender
     */
    _getExistingAnonymousContact(senderId) {
        try {
            // Check in agent data for stored anonymous contacts
            const anonymousContacts = this.agentData.get('anonymousContacts') || new Map();
            return anonymousContacts.get(senderId);
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting existing anonymous contact:", error);
            return null;
        }
    }

    /**
     * Store anonymous contact for consistency
     */
    _storeAnonymousContact(senderId, anonymousContact) {
        try {
            let anonymousContacts = this.agentData.get('anonymousContacts');
            if (!anonymousContacts) {
                anonymousContacts = new Map();
                this.agentData.set('anonymousContacts', anonymousContacts);
            }
            anonymousContacts.set(senderId, anonymousContact);
        } catch (error) {
            console.error("Cyberpunk Agent | Error storing anonymous contact:", error);
        }
    }

    /**
     * Get anonymous contacts for an actor (people who sent messages but aren't in contact list)
     */
    getAnonymousContactsForActor(actorId) {
        const anonymousContacts = [];
        const regularContacts = this.getContactsForActor(actorId);
        const regularContactIds = regularContacts.map(c => c.id);

        // Check all conversations for this actor
        this.messages.forEach((conversation, conversationKey) => {
            const [actor1Id, actor2Id] = conversationKey.split('-');

            // Find conversations where this actor is involved
            if (actor1Id === actorId || actor2Id === actorId) {
                // Get the other actor in the conversation
                const otherActorId = actor1Id === actorId ? actor2Id : actor1Id;

                // If the other actor is not in the contact list, they're anonymous
                if (!regularContactIds.includes(otherActorId)) {
                    const anonymousContact = this.getAnonymousContact(otherActorId);

                    // Use the original sender ID for the anonymous contact ID
                    anonymousContact.id = otherActorId;
                    anonymousContact.isAnonymous = true;

                    // Check if we already added this anonymous contact
                    if (!anonymousContacts.some(c => c.id === otherActorId)) {
                        anonymousContacts.push(anonymousContact);
                    }
                }
            }
        });

        return anonymousContacts;
    }

    /**
     * Notify about message updates
     */
    async notifyMessageUpdate(senderId, receiverId, message) {
        // Only send cross-client notifications if there are multiple users
        if (!this._needsCrossClientCommunication()) {
            console.log("Cyberpunk Agent | Single user session, skipping message notification");
            return;
        }

        const communicationMethod = this._getCommunicationMethod();
        console.log("Cyberpunk Agent | Using communication method for message:", communicationMethod);

        const notificationData = {
            type: 'messageUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id,
                senderId: senderId,
                receiverId: receiverId,
                message: message
            }
        };

        let notificationSent = false;

        if (communicationMethod === 'socketlib') {
            console.log("Cyberpunk Agent | Sending message notification via SocketLib");
            try {
                if (this.socketLibIntegration && this.socketLibIntegration.sendMessageUpdate) {
                    const success = await this.socketLibIntegration.sendMessageUpdate(notificationData);
                    if (success) {
                        notificationSent = true;
                        console.log("Cyberpunk Agent | SocketLib message notification sent successfully");
                    } else {
                        console.warn("Cyberpunk Agent | SocketLib message notification failed");
                    }
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib message notification failed:", error);
            }
        }

        if (!notificationSent && communicationMethod === 'socket') {
            console.log("Cyberpunk Agent | Sending message notification via native socket");
            this._sendMessageViaNativeSocket(notificationData);
            notificationSent = true;
        }

        if (!notificationSent) {
            console.log("Cyberpunk Agent | Sending message notification via chat fallback");
            this._sendMessageViaChat(notificationData);
        }
    }

    /**
     * Send message notification via native socket
     */
    _sendMessageViaNativeSocket(data) {
        if (game.socket) {
            console.log("Cyberpunk Agent | Sending message notification via native socket");
            game.socket.emit('module.cyberpunk-agent', data);
        }
    }

    /**
     * Send message notification via chat
     */
    _sendMessageViaChat(data) {
        console.log("Cyberpunk Agent | Sending message notification via chat");
        try {
            // Create a system message to broadcast the message update
            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-update" data-update='${JSON.stringify(data)}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0, 0, 0, 0.1); border-radius: 4px; border-left: 3px solid #ff6b35;">
                        <i class="fas fa-comment" style="color: #ff6b35;"></i>
                        <div>
                            <strong style="color: #ff6b35;">Cyberpunk Agent - Nova Mensagem</strong><br>
                            <span style="font-size: 0.9em; color: #666;">
                                Mensagem enviada por <strong>${data.data.userName}</strong>
                            </span>
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: game.users.filter(u => u.isGM).map(u => u.id), // Only visible to GMs
                blind: false,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: 'messageUpdate'
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Message update broadcasted via system message");
        } catch (error) {
            console.error("Cyberpunk Agent | Error broadcasting message update:", error);
        }
    }

    /**
 * Send contact update via chat as event system
 */
    _sendContactUpdateViaChat(actionDetails) {
        console.log("Cyberpunk Agent | Sending contact update via chat event system");
        try {
            // Determine which users should receive this update
            let targetUsers = [];

            if (actionDetails && actionDetails.actorId) {
                // Find users who own or have access to the affected actor
                const actor = game.actors.get(actionDetails.actorId);
                if (actor) {
                    // Add users who own this actor
                    for (const user of game.users.values()) {
                        if (actor.ownership && actor.ownership[user.id] === 1) {
                            targetUsers.push(user.id);
                        }
                    }
                }
            }

            // Always include GMs
            const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
            targetUsers = [...new Set([...targetUsers, ...gmUsers])];

            // Create action description with detailed information
            let actionDescription = "Lista de contatos atualizada";
            let icon = "fas fa-users";
            let color = "#00ff00";
            let details = "";

            if (actionDetails) {
                // Get actor names for better context
                const actor = actionDetails.actorId ? game.actors.get(actionDetails.actorId) : null;
                const contactActor = actionDetails.contactActorId ? game.actors.get(actionDetails.contactActorId) : null;

                const actorName = actor ? actor.name : "Desconhecido";
                const contactActorName = contactActor ? contactActor.name : actionDetails.contactName || "Desconhecido";

                if (actionDetails.action === 'add') {
                    actionDescription = `Contato <strong>${contactActorName}</strong> adicionado`;
                    details = `Adicionado à lista de contatos de <strong>${actorName}</strong>`;
                    icon = "fas fa-user-plus";
                    color = "#00ff00";
                } else if (actionDetails.action === 'remove') {
                    actionDescription = `Contato <strong>${contactActorName}</strong> removido`;
                    details = `Removido da lista de contatos de <strong>${actorName}</strong>`;
                    icon = "fas fa-user-minus";
                    color = "#ff6b35";
                } else if (actionDetails.action === 'modify') {
                    actionDescription = `Contato <strong>${contactActorName}</strong> modificado`;
                    details = `Modificado na lista de contatos de <strong>${actorName}</strong>`;
                    icon = "fas fa-user-edit";
                    color = "#ffaa00";
                } else if (actionDetails.action === 'bulk') {
                    if (actionDetails.description) {
                        actionDescription = actionDetails.description;
                    } else if (actionDetails.count) {
                        actionDescription = `${actionDetails.count} contato(s) atualizado(s)`;
                    } else {
                        actionDescription = "Múltiplos contatos atualizados";
                    }
                    details = `Operação em lote na lista de contatos de <strong>${actorName}</strong>`;
                    icon = "fas fa-users-cog";
                    color = "#ffaa00";
                } else if (actionDetails.action === 'test') {
                    actionDescription = `Teste de atualização - Contato <strong>${contactActorName}</strong>`;
                    details = `Teste na lista de contatos de <strong>${actorName}</strong>`;
                    icon = "fas fa-vial";
                    color = "#ff6b35";
                }
            }

            // Create the event message
            const eventData = {
                type: 'contactUpdate',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id,
                    actionDetails: actionDetails
                }
            };

            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-event" data-event='${JSON.stringify(eventData)}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%); border-radius: 8px; border-left: 4px solid ${color};">
                        <i class="${icon}" style="color: ${color}; font-size: 1.2em;"></i>
                        <div style="flex: 1;">
                            <strong style="color: ${color}; font-size: 1.1em;">Cyberpunk Agent - Evento</strong><br>
                            <span style="font-size: 0.9em; color: #ccc;">
                                ${actionDescription} por <strong>${game.user.name}</strong>
                            </span>
                            ${details ? `<br><span style="font-size: 0.85em; color: #aaa;">${details}</span>` : ''}
                        </div>
                        <div style="text-align: right; font-size: 0.8em; color: #888;">
                            ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: targetUsers,
                blind: targetUsers.length > 0,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: 'contactUpdate',
                        actionDetails: actionDetails,
                        isEvent: true
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Contact update event broadcasted via chat system");

            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error broadcasting contact update event:", error);
            return false;
        }
    }

    /**
     * Send event to specific user via chat
     */
    _sendEventToUser(userId, eventType, eventData) {
        console.log(`Cyberpunk Agent | Sending ${eventType} event to user ${userId} via chat`);
        try {
            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-event" data-event='${JSON.stringify({
                    type: eventType,
                    data: {
                        timestamp: Date.now(),
                        userId: game.user.id,
                        userName: game.user.name,
                        sessionId: game.data.id,
                        ...eventData
                    }
                })}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%); border-radius: 8px; border-left: 4px solid #00ff00;">
                        <i class="fas fa-bell" style="color: #00ff00; font-size: 1.2em;"></i>
                        <div style="flex: 1;">
                            <strong style="color: #00ff00; font-size: 1.1em;">Cyberpunk Agent - Notificação</strong><br>
                            <span style="font-size: 0.9em; color: #ccc;">
                                ${eventData.message || 'Nova atualização disponível'}
                            </span>
                        </div>
                        <div style="text-align: right; font-size: 0.8em; color: #888;">
                            ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: [userId],
                blind: true,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: eventType,
                        isEvent: true,
                        targetUser: userId
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log(`Cyberpunk Agent | Event sent to user ${userId} via chat`);
            return true;
        } catch (error) {
            console.error(`Cyberpunk Agent | Error sending event to user ${userId}:`, error);
            return false;
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

            const actionDetails = {
                action: 'add',
                contactName: contact.name,
                actorId: actorId,
                contactActorId: contactActorId
            };

            this.saveContactNetworks(actionDetails);

            // Convert anonymous contact to regular contact if it exists
            this._convertAnonymousToRegularContact(actorId, contactActorId);

            // Update any existing messages from this contact to show their real name
            this._updateMessagesForContact(actorId, contactActorId, contact.name);

            return true;
        }

        return false;
    }

    /**
     * Update messages to show real contact name when added to contacts
     */
    _updateMessagesForContact(actorId, contactActorId, contactName) {
        // This method can be used to update message display when a contact is added
        // For now, we'll just log the action
        console.log(`Cyberpunk Agent | Contact ${contactName} (${contactActorId}) added to ${actorId}'s contacts. Messages will now show real name.`);
    }

    /**
     * Convert anonymous contact to regular contact
     */
    _convertAnonymousToRegularContact(actorId, contactActorId) {
        try {
            // Remove the anonymous contact from storage
            let anonymousContacts = this.agentData.get('anonymousContacts');
            if (anonymousContacts && anonymousContacts.has(contactActorId)) {
                anonymousContacts.delete(contactActorId);
                console.log(`Cyberpunk Agent | Anonymous contact converted to regular contact for ${contactActorId}`);
            }

            // Update messages to reflect the new contact name
            this._updateMessagesForContact(actorId, contactActorId, game.actors.get(contactActorId)?.name);
        } catch (error) {
            console.error("Cyberpunk Agent | Error converting anonymous contact:", error);
        }
    }

    /**
     * Delete messages from a conversation
     */
    async deleteMessages(actorId1, actorId2, messageIds) {
        try {
            console.log("Cyberpunk Agent | Starting message deletion process");
            console.log("Cyberpunk Agent | Actor1:", actorId1, "Actor2:", actorId2, "MessageIds:", messageIds);

            if (!game.user.isGM) {
                console.error("Cyberpunk Agent | Only GMs can delete messages");
                return false;
            }

            const conversationKey = this._getConversationKey(actorId1, actorId2);
            console.log("Cyberpunk Agent | Conversation key:", conversationKey);

            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original messages count:", messages.length);

            // Filter out messages to be deleted
            const updatedMessages = messages.filter(message => !messageIds.includes(message.id));
            console.log("Cyberpunk Agent | Updated messages count:", updatedMessages.length);

            // Update the conversation
            this.messages.set(conversationKey, updatedMessages);

            // Save messages to settings
            console.log("Cyberpunk Agent | Saving messages to settings...");
            await this.saveMessages();

            // Delete corresponding FoundryVTT chat messages
            console.log("Cyberpunk Agent | Deleting FoundryVTT chat messages...");
            await this._deleteFoundryChatMessages(messageIds);

            // Notify all clients about the message deletion
            console.log("Cyberpunk Agent | Notifying clients about message deletion...");
            await this._notifyMessageDeletion(actorId1, actorId2, messageIds);

            console.log(`Cyberpunk Agent | Successfully deleted ${messageIds.length} messages from conversation ${conversationKey}`);
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting messages:", error);
            return false;
        }
    }

    /**
     * Delete FoundryVTT chat messages
     */
    async _deleteFoundryChatMessages(messageIds) {
        try {
            // Get all chat messages with cyberpunk-agent flags
            const chatMessages = game.messages.filter(msg =>
                msg.flags['cyberpunk-agent'] &&
                messageIds.includes(msg.flags['cyberpunk-agent'].messageId)
            );

            // Delete each chat message
            for (const chatMessage of chatMessages) {
                await chatMessage.delete();
            }

            console.log(`Cyberpunk Agent | Deleted ${chatMessages.length} FoundryVTT chat messages`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting FoundryVTT chat messages:", error);
        }
    }

    /**
     * Notify all clients about message deletion
     */
    async _notifyMessageDeletion(actorId1, actorId2, messageIds) {
        try {
            const notificationData = {
                type: 'messageDeletion',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id,
                    actorId1: actorId1,
                    actorId2: actorId2,
                    messageIds: messageIds
                }
            };

            const communicationMethod = this._getCommunicationMethod();
            console.log("Cyberpunk Agent | Using communication method for message deletion:", communicationMethod);

            let notificationSent = false;

            if (communicationMethod === 'socketlib') {
                console.log("Cyberpunk Agent | Sending message deletion notification via SocketLib");
                try {
                    if (this.socketLibIntegration && this.socketLibIntegration.sendMessageDeletion) {
                        const success = await this.socketLibIntegration.sendMessageDeletion(notificationData);
                        if (success) {
                            notificationSent = true;
                            console.log("Cyberpunk Agent | SocketLib message deletion notification sent successfully");
                        }
                    }
                } catch (error) {
                    console.warn("Cyberpunk Agent | SocketLib message deletion notification failed:", error);
                }
            }

            if (!notificationSent && communicationMethod === 'socket') {
                console.log("Cyberpunk Agent | Sending message deletion notification via native socket");
                this._sendMessageDeletionViaNativeSocket(notificationData);
                notificationSent = true;
            }

            if (!notificationSent) {
                console.log("Cyberpunk Agent | Sending message deletion notification via chat");
                this._sendMessageDeletionViaChat(notificationData);
            }

            // Also trigger immediate update for local interfaces
            this._updateChatInterfacesImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying message deletion:", error);
        }
    }

    /**
     * Send message deletion via native socket
     */
    _sendMessageDeletionViaNativeSocket(data) {
        try {
            game.socket.emit('module.cyberpunk-agent', {
                type: 'messageDeletion',
                data: data
            });
            console.log("Cyberpunk Agent | Message deletion sent via native socket");
        } catch (error) {
            console.error("Cyberpunk Agent | Error sending message deletion via native socket:", error);
        }
    }

    /**
     * Send message deletion via chat
     */
    _sendMessageDeletionViaChat(data) {
        try {
            const messageData = {
                user: game.user.id,
                speaker: { User: game.user.id },
                content: `<div class="cyberpunk-agent-deletion" data-deletion='${JSON.stringify(data)}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.2) 100%); border-radius: 8px; border-left: 4px solid #ff6b35;">
                        <i class="fas fa-trash" style="color: #ff6b35; font-size: 1.2em;"></i>
                        <div style="flex: 1;">
                            <strong style="color: #ff6b35; font-size: 1.1em;">Cyberpunk Agent - Mensagens Deletadas</strong><br>
                            <span style="font-size: 0.9em; color: #ccc;">
                                ${data.data.messageIds.length} mensagem${data.data.messageIds.length > 1 ? 'ns' : ''} deletada${data.data.messageIds.length > 1 ? 's' : ''} por <strong>${game.user.name}</strong>
                            </span>
                        </div>
                        <div style="text-align: right; font-size: 0.8em; color: #888;">
                            ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: 'messageDeletion',
                        isEvent: true
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Message deletion sent via chat");
        } catch (error) {
            console.error("Cyberpunk Agent | Error sending message deletion via chat:", error);
        }
    }

    /**
     * Update chat interfaces immediately for better UX
     */
    _updateChatInterfacesImmediately() {
        console.log("Cyberpunk Agent | Starting immediate chat interface update");

        // Find and update any open ChatConversationApplication
        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'ChatConversationApplication') {
                console.log("Cyberpunk Agent | Found ChatConversationApplication, updating...");
                try {
                    // Force a complete re-render to refresh data
                    window.render(true);
                    updatedCount++;
                    console.log("Cyberpunk Agent | ChatConversationApplication updated successfully");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Error updating ChatConversationApplication:", error);
                }
            }
        });

        console.log(`Cyberpunk Agent | Updated ${updatedCount} chat conversation interfaces`);

        // Also try to update any other chat-related interfaces
        this.updateOpenChatInterfaces();

        // Force a small delay to ensure DOM updates are processed
        setTimeout(() => {
            console.log("Cyberpunk Agent | Final check - forcing any remaining interface updates");
            this.updateOpenInterfaces();
        }, 100);
    }

    /**
 * Remove contact from actor's network
 */
    removeContactFromActor(actorId, contactActorId) {
        if (this.contactNetworks.has(actorId)) {
            const contacts = this.contactNetworks.get(actorId);
            const index = contacts.findIndex(c => c.id === contactActorId);
            if (index !== -1) {
                const removedContact = contacts[index];
                contacts.splice(index, 1);

                const actionDetails = {
                    action: 'remove',
                    contactName: removedContact.name,
                    actorId: actorId,
                    contactActorId: contactActorId
                };

                this.saveContactNetworks(actionDetails);
                return true;
            }
        }
        return false;
    }

    /**
     * Update multiple contacts in bulk (for operations that affect multiple contacts)
     */
    updateContactsBulk(actorId, action, count = null, description = null) {
        const actionDetails = {
            action: 'bulk',
            count: count,
            description: description,
            actorId: actorId
        };

        this.saveContactNetworks(actionDetails);
    }

    /**
     * Save contact networks to settings
     */
    saveContactNetworks(actionDetails = null) {
        try {
            const networksObject = Object.fromEntries(this.contactNetworks);
            game.settings.set('cyberpunk-agent', 'contact-networks', networksObject);

            // Notify all clients about the contact update
            this.notifyContactUpdate(actionDetails);

            // Also trigger immediate update for local interfaces
            this._updateContactManagerImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving contact networks:", error);
        }
    }

    /**
     * Clear all data (contacts and messages)
     */
    clearAllData() {
        try {
            console.log("Cyberpunk Agent | Clearing all data...");

            // Clear contact networks
            this.contactNetworks.clear();
            game.settings.set('cyberpunk-agent', 'contact-networks', {});

            // Clear messages
            this.messages.clear();
            game.settings.set('cyberpunk-agent', 'messages', {});

            // Clear agent data
            this.agentData.clear();
            game.settings.set('cyberpunk-agent', 'agent-data', {});

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this._updateContactManagerImmediately();
            this.updateOpenInterfaces();

            console.log("Cyberpunk Agent | All data cleared successfully");
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing data:", error);
            ui.notifications.error("Erro ao limpar dados: " + error.message);
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
    _sendViaChat(actionDetails = null) {
        console.log("Cyberpunk Agent | Sending contact update notification via chat message (fallback)");
        this.broadcastContactUpdate({
            type: 'contactUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id
            }
        }, actionDetails);
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
    async notifyContactUpdate(actionDetails = null) {
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
                    action: 'contactModified',
                    actionDetails: actionDetails
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
                this._sendViaChat(actionDetails);
            }
        } else if (communicationMethod === 'socket') {
            this._sendViaNativeSocket();
        } else if (communicationMethod === 'chat') {
            this._sendViaChat(actionDetails);
        } else {
            console.log("Cyberpunk Agent | No communication method available, skipping notification.");
        }
    }

    /**
     * Broadcast contact update via chat message (fallback method)
     * This method creates a system message visible only to the GM
     */
    broadcastContactUpdate(data, actionDetails = null) {
        try {
            // Validate data before broadcasting
            if (!data || !data.type || !data.data) {
                console.error("Cyberpunk Agent | Invalid data for broadcast:", data);
                return;
            }

            // Use the new event system for contact updates
            if (actionDetails) {
                return this._sendContactUpdateViaChat(actionDetails);
            }

            // Fallback to old system for backward compatibility
            let actionDescription = "Lista de contatos atualizada";
            if (actionDetails) {
                if (actionDetails.action === 'add') {
                    actionDescription = `Contato <strong>${actionDetails.contactName}</strong> adicionado`;
                } else if (actionDetails.action === 'remove') {
                    actionDescription = `Contato <strong>${actionDetails.contactName}</strong> removido`;
                } else if (actionDetails.action === 'modify') {
                    actionDescription = `Contato <strong>${actionDetails.contactName}</strong> modificado`;
                } else if (actionDetails.action === 'bulk') {
                    if (actionDetails.description) {
                        actionDescription = actionDetails.description;
                    } else if (actionDetails.count) {
                        actionDescription = `${actionDetails.count} contato(s) atualizado(s)`;
                    } else {
                        actionDescription = "Múltiplos contatos atualizados";
                    }
                } else if (actionDetails.action === 'test') {
                    actionDescription = `Teste de atualização - Contato <strong>${actionDetails.contactName}</strong>`;
                }
            }

            // Create a system message to broadcast the update
            const messageData = {
                user: game.user.id,
                speaker: {
                    User: game.user.id
                },
                content: `<div class="cyberpunk-agent-update" data-update='${JSON.stringify(data)}'>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0, 0, 0, 0.1); border-radius: 4px; border-left: 3px solid #ff6b35;">
                        <i class="fas fa-users" style="color: #ff6b35;"></i>
                        <div>
                            <strong style="color: #ff6b35;">Cyberpunk Agent</strong><br>
                            <span style="font-size: 0.9em; color: #666;">
                                ${actionDescription} por <strong>${data.data.userName}</strong>
                            </span>
                        </div>
                    </div>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: game.users.filter(u => u.isGM).map(u => u.id), // Only visible to GMs
                blind: false,
                flags: {
                    'cyberpunk-agent': {
                        isSystemMessage: true,
                        updateType: 'contactUpdate',
                        actionDetails: actionDetails
                    }
                }
            };

            ChatMessage.create(messageData);
            console.log("Cyberpunk Agent | Contact update broadcasted via system message");
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
 * Handle message update notifications from other clients
 */
    handleMessageUpdate(data) {
        console.log("Cyberpunk Agent | Received message update notification from:", data.userName);

        // Prevent processing our own updates
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own message update notification");
            return;
        }

        // Check if this is a recent update to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore updates older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old message update notification (age:", timeDiff, "ms)");
            return;
        }

        // Reload message data from settings
        this.loadAgentData();

        // Update all open chat interfaces immediately
        this._updateChatInterfacesImmediately();

        // Also update other interfaces that might show contact lists
        this.updateOpenInterfaces();

        // Show notification to user
        const sender = game.actors.get(data.senderId);
        const receiver = game.actors.get(data.receiverId);
        const senderName = sender ? sender.name : "Desconhecido";
        const receiverName = receiver ? receiver.name : "Desconhecido";

        const message = `Nova mensagem de ${senderName} para ${receiverName}`;
        ui.notifications.info(message);

        console.log("Cyberpunk Agent | Message update processed successfully");
    }

    /**
     * Handle message deletion
     */
    handleMessageDeletion(data) {
        console.log("Cyberpunk Agent | Received message deletion notification from:", data.userName);
        console.log("Cyberpunk Agent | Deletion data:", data);

        // Prevent processing our own deletions
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own message deletion notification");
            return;
        }

        // Check if this is a recent deletion to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore deletions older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old message deletion notification (age:", timeDiff, "ms)");
            return;
        }

        try {
            const { actorId1, actorId2, messageIds } = data.data;
            console.log("Cyberpunk Agent | Processing deletion for actors:", actorId1, actorId2, "messageIds:", messageIds);

            const conversationKey = this._getConversationKey(actorId1, actorId2);
            console.log("Cyberpunk Agent | Conversation key:", conversationKey);

            const existingMessages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Existing messages count:", existingMessages.length);

            // Filter out deleted messages
            const updatedMessages = existingMessages.filter(message => !messageIds.includes(message.id));
            console.log("Cyberpunk Agent | Updated messages count:", updatedMessages.length);

            this.messages.set(conversationKey, updatedMessages);

            // Save messages
            console.log("Cyberpunk Agent | Saving updated messages...");
            this.saveMessages();

            // Update all open chat interfaces immediately
            console.log("Cyberpunk Agent | Updating chat interfaces...");
            this._updateChatInterfacesImmediately();

            // Also update other interfaces that might show contact lists
            console.log("Cyberpunk Agent | Updating other interfaces...");
            this.updateOpenInterfaces();

            // Force a complete refresh of all chat interfaces
            console.log("Cyberpunk Agent | Forcing complete refresh of chat interfaces...");
            this.forceUpdateChatInterfaces();

            // Show notification to user
            const actor1 = game.actors.get(actorId1);
            const actor2 = game.actors.get(actorId2);
            const actor1Name = actor1 ? actor1.name : "Desconhecido";
            const actor2Name = actor2 ? actor2.name : "Desconhecido";

            const message = `${messageIds.length} mensagem${messageIds.length > 1 ? 'ns' : ''} deletada${messageIds.length > 1 ? 's' : ''} da conversa entre ${actor1Name} e ${actor2Name}`;
            ui.notifications.info(message);

            console.log(`Cyberpunk Agent | Successfully processed deletion of ${messageIds.length} messages from conversation ${conversationKey}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error handling message deletion:", error);
        }
    }

    /**
 * Handle save messages request from players
 */
    handleSaveMessagesRequest(data) {
        console.log("Cyberpunk Agent | Received save messages request from:", data.userName);

        // Only GMs can save messages
        if (!game.user.isGM) {
            console.log("Cyberpunk Agent | Non-GM user cannot save messages");
            return;
        }

        // Check if this is a recent request to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore requests older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old save request (age:", timeDiff, "ms)");
            return;
        }

        console.log("Cyberpunk Agent | Processing save request from:", data.userName);

        try {
            // Save the messages to settings
            game.settings.set('cyberpunk-agent', 'messages', data.messages);

            console.log("Cyberpunk Agent | Messages saved successfully for user:", data.userName);

            // Notify the requesting user that save was successful
            if (game.socket) {
                game.socket.emit('module.cyberpunk-agent', {
                    type: 'saveMessagesResponse',
                    data: {
                        success: true,
                        timestamp: Date.now(),
                        userId: game.user.id,
                        userName: game.user.name,
                        requestingUserId: data.userId
                    }
                });
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving messages:", error);

            // Notify the requesting user that save failed
            if (game.socket) {
                game.socket.emit('module.cyberpunk-agent', {
                    type: 'saveMessagesResponse',
                    data: {
                        success: false,
                        error: error.message,
                        timestamp: Date.now(),
                        userId: game.user.id,
                        userName: game.user.name,
                        requestingUserId: data.userId
                    }
                });
            }
        }
    }

    /**
     * Handle save messages response from GM
     */
    handleSaveMessagesResponse(data) {
        console.log("Cyberpunk Agent | Received save messages response from GM:", data);

        // Check if this response is for us
        if (data.requestingUserId !== game.user.id) {
            console.log("Cyberpunk Agent | Save response not for us, ignoring");
            return;
        }

        // Check if this is a recent response to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore responses older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old save response (age:", timeDiff, "ms)");
            return;
        }

        if (data.success) {
            console.log("Cyberpunk Agent | Messages saved successfully by GM");
            ui.notifications.info("Mensagens salvas com sucesso!");
        } else {
            console.error("Cyberpunk Agent | Failed to save messages:", data.error);
            ui.notifications.error("Erro ao salvar mensagens: " + data.error);
        }
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
                    window.constructor.name === 'ChatConversationApplication' ||
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
    * Update all open chat interfaces
    */
    updateOpenChatInterfaces() {
        console.log("Cyberpunk Agent | Updating open chat interfaces...");

        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered) {
                // Check if it's a chat-related application
                if (window.constructor.name === 'ChatConversationApplication') {
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

        console.log(`Cyberpunk Agent | Updated ${updatedCount} chat interfaces`);
    }

    /**
     * Force update all chat interfaces (for debugging)
     */
    forceUpdateChatInterfaces() {
        console.log("Cyberpunk Agent | Force updating all chat interfaces...");
        this._updateChatInterfacesImmediately();
        this.updateOpenChatInterfaces();
        ui.notifications.info("Interfaces de chat atualizadas forçadamente");
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
                } else if (data.type === 'messageUpdate') {
                    console.log("Cyberpunk Agent | Received message notification:", data);
                    this.handleMessageUpdate(data.data);
                } else if (data.type === 'messageDeletion') {
                    console.log("Cyberpunk Agent | Received message deletion notification:", data);
                    this.handleMessageDeletion(data.data);
                } else if (data.type === 'saveMessagesRequest') {
                    console.log("Cyberpunk Agent | Received save messages request:", data);
                    this.handleSaveMessagesRequest(data.data);
                } else if (data.type === 'saveMessagesResponse') {
                    console.log("Cyberpunk Agent | Received save messages response:", data);
                    this.handleSaveMessagesResponse(data.data);
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
                        } else if (updateData && updateData.type === 'messageUpdate' && updateData.data) {
                            console.log("Cyberpunk Agent | Received message notification:", updateData);
                            this.handleMessageUpdate(updateData.data);
                        } else if (updateData && updateData.type === 'messageDeletion' && updateData.data) {
                            console.log("Cyberpunk Agent | Received message deletion notification:", updateData);
                            this.handleMessageDeletion(updateData.data);
                        }
                    }
                } else if (message.content.includes('cyberpunk-agent-save-request')) {
                    // Create a temporary DOM element to parse the content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = message.content;

                    const requestElement = tempDiv.querySelector('.cyberpunk-agent-save-request');
                    if (requestElement && requestElement.dataset.request) {
                        const requestData = JSON.parse(requestElement.dataset.request);
                        if (requestData && requestData.type === 'saveMessagesRequest') {
                            console.log("Cyberpunk Agent | Received save request via chat:", requestData);
                            this.handleSaveMessagesRequest(requestData);
                        }
                    }
                } else if (message.content.includes('cyberpunk-agent-event')) {
                    // Create a temporary DOM element to parse the content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = message.content;

                    const eventElement = tempDiv.querySelector('.cyberpunk-agent-event');
                    if (eventElement && eventElement.dataset.event) {
                        const eventData = JSON.parse(eventElement.dataset.event);
                        if (eventData && eventData.type === 'contactUpdate' && eventData.data) {
                            console.log("Cyberpunk Agent | Received contact update event via chat:", eventData);
                            this.handleContactUpdate(eventData.data);
                        }
                    }
                } else if (message.content.includes('cyberpunk-agent-deletion')) {
                    // Create a temporary DOM element to parse the content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = message.content;

                    const deletionElement = tempDiv.querySelector('.cyberpunk-agent-deletion');
                    if (deletionElement && deletionElement.dataset.deletion) {
                        const deletionData = JSON.parse(deletionElement.dataset.deletion);
                        if (deletionData && deletionData.type === 'messageDeletion' && deletionData.data) {
                            console.log("Cyberpunk Agent | Received message deletion event via chat:", deletionData);
                            this.handleMessageDeletion(deletionData.data);
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
            this.notifyContactUpdate({
                action: 'test',
                contactName: 'Test Contact',
                actorId: 'test-actor',
                contactActorId: 'test-contact'
            });
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
            this.notifyContactUpdate({
                action: 'test',
                contactName: 'Test Contact',
                actorId: 'test-actor',
                contactActorId: 'test-contact'
            });
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
            }, {
                action: 'test',
                contactName: 'Test Contact',
                actorId: 'test-actor',
                contactActorId: 'test-contact'
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
            }, {
                action: 'test',
                contactName: 'Test Contact',
                actorId: 'test-actor',
                contactActorId: 'test-contact'
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
                window.constructor.name === 'ChatConversationApplication' ||
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
                window.constructor.name === 'ChatConversationApplication' ||
                window.constructor.name === 'ContactManagerApplication'
            )
        ).length;
    }

    /**
     * Play sound effect
     * @param {string} soundName - Name of the sound file (without extension)
     */
    playSoundEffect(soundName) {
        try {
            const audio = new Audio(`modules/cyberpunk-agent/assets/sfx/${soundName}.sfx.mp3`);
            audio.volume = 0.3; // Set volume to 30%
            audio.play().catch(error => {
                console.warn("Cyberpunk Agent | Error playing sound effect:", error);
            });
        } catch (error) {
            console.warn("Cyberpunk Agent | Error creating audio element:", error);
        }
    }

    /**
     * Test sound effects
     */
    testSoundEffects() {
        console.log("Cyberpunk Agent | Testing sound effects...");
        this.playSoundEffect('opening-window');
        setTimeout(() => {
            this.playSoundEffect('closing-window');
        }, 1000);
        ui.notifications.info("Testando efeitos sonoros...");
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

window.testSystemMessage = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.broadcastContactUpdate({
            type: 'contactUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id,
                test: true
            }
        }, {
            action: 'test',
            contactName: 'Sistema de Mensagens',
            actorId: 'test-actor',
            contactActorId: 'test-contact'
        });
        console.log("Cyberpunk Agent | System message test completed");
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.testMessageSystem = () => {
    if (CyberpunkAgent.instance) {
        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            // Send a test message
            const success = CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, "Esta é uma mensagem de teste!");

            if (success) {
                console.log("Cyberpunk Agent | Test message sent successfully");
                ui.notifications.info("Mensagem de teste enviada!");
            } else {
                console.error("Cyberpunk Agent | Failed to send test message");
                ui.notifications.error("Erro ao enviar mensagem de teste");
            }
        } else {
            console.error("Cyberpunk Agent | Need at least 2 character actors for message test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar mensagens");
        }
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.getConversationMessages = (actorId1, actorId2) => {
    if (CyberpunkAgent.instance) {
        const messages = CyberpunkAgent.instance.getMessagesForConversation(actorId1, actorId2);
        console.log("Cyberpunk Agent | Conversation messages:", messages);
        return messages;
    } else {
        console.error("Cyberpunk Agent | Instance not available");
        return [];
    }
};

window.testAnonymousContacts = () => {
    if (CyberpunkAgent.instance) {
        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            // Send a message from actor2 to actor1 (simulating anonymous contact)
            const success = CyberpunkAgent.instance.sendMessage(actor2.id, actor1.id, "Olá! Esta é uma mensagem de um contato anônimo.");

            if (success) {
                console.log("Cyberpunk Agent | Anonymous contact test message sent successfully");
                ui.notifications.info("Mensagem de contato anônimo enviada!");

                // Check if actor2 appears as anonymous contact for actor1
                const anonymousContacts = CyberpunkAgent.instance.getAnonymousContactsForActor(actor1.id);
                console.log("Cyberpunk Agent | Anonymous contacts for", actor1.name, ":", anonymousContacts);
            } else {
                console.error("Cyberpunk Agent | Failed to send anonymous contact test message");
                ui.notifications.error("Erro ao enviar mensagem de teste de contato anônimo");
            }
        } else {
            console.error("Cyberpunk Agent | Need at least 2 character actors for anonymous contact test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar contatos anônimos");
        }
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.testRealtimeMessages = () => {
    if (CyberpunkAgent.instance) {
        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            // Send multiple test messages to test real-time updates
            const messages = [
                "Teste de mensagem em tempo real #1",
                "Teste de mensagem em tempo real #2",
                "Teste de mensagem em tempo real #3"
            ];

            let sentCount = 0;
            messages.forEach((msg, index) => {
                setTimeout(() => {
                    const success = CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, msg);
                    if (success) {
                        sentCount++;
                        console.log(`Cyberpunk Agent | Realtime test message ${index + 1} sent successfully`);
                        ui.notifications.info(`Mensagem de teste ${index + 1} enviada!`);
                    }
                }, index * 2000); // Send each message 2 seconds apart
            });

            console.log("Cyberpunk Agent | Realtime message test started - sending 3 messages over 6 seconds");
        } else {
            console.error("Cyberpunk Agent | Need at least 2 character actors for realtime message test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar mensagens em tempo real");
        }
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.testFoundryChatIntegration = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== FoundryVTT Chat Integration Test ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing chat integration between ${actor1.name} and ${actor2.name}`);

            // Test 1: Send a message that should appear in FoundryVTT chat
            const testMessage = "Esta é uma mensagem de teste para o chat do FoundryVTT!";
            console.log("📤 Sending test message to FoundryVTT chat...");

            CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, testMessage).then((success) => {
                if (success) {
                    console.log("✅ Test message sent successfully");
                    ui.notifications.info("Mensagem de teste enviada para o chat do FoundryVTT!");

                    // Test 2: Check if message appears in chat
                    setTimeout(() => {
                        const foundryMessages = CyberpunkAgent.instance.getMessagesFromFoundryChat(actor1.id, actor2.id);
                        console.log("📋 Messages found in FoundryVTT chat:", foundryMessages.length);

                        if (foundryMessages.length > 0) {
                            console.log("✅ FoundryVTT chat integration working!");
                            ui.notifications.success("Integração com chat do FoundryVTT funcionando!");
                        } else {
                            console.warn("⚠️ No messages found in FoundryVTT chat");
                            ui.notifications.warn("Nenhuma mensagem encontrada no chat do FoundryVTT");
                        }
                    }, 1000);
                } else {
                    console.error("❌ Failed to send test message");
                    ui.notifications.error("Falha ao enviar mensagem de teste");
                }
            });
        } else {
            console.error("❌ Need at least 2 character actors for chat integration test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar integração com chat");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.syncFoundryChat = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Syncing with FoundryVTT Chat ===");

        try {
            CyberpunkAgent.instance.syncMessagesWithFoundryChat();
            console.log("✅ Message sync completed");
            ui.notifications.info("Sincronização com chat do FoundryVTT concluída!");
        } catch (error) {
            console.error("❌ Error syncing messages:", error);
            ui.notifications.error("Erro ao sincronizar mensagens: " + error.message);
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.getFoundryChatMessages = (actorId1, actorId2) => {
    if (CyberpunkAgent.instance) {
        const messages = CyberpunkAgent.instance.getMessagesFromFoundryChat(actorId1, actorId2);
        console.log("Cyberpunk Agent | FoundryVTT chat messages:", messages);
        return messages;
    } else {
        console.error("Cyberpunk Agent | Instance not available");
        return [];
    }
};

window.testMessageSaving = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Message Saving System ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing message saving between ${actor1.name} and ${actor2.name}`);
            console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

            // Test 1: Send a message
            const testMessage = "Esta é uma mensagem de teste para verificar o salvamento!";
            console.log("📤 Sending test message...");

            CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, testMessage).then((success) => {
                if (success) {
                    console.log("✅ Test message sent successfully");
                    ui.notifications.info("Mensagem de teste enviada e salva!");

                    // Test 2: Check if message was saved
                    setTimeout(() => {
                        const messages = CyberpunkAgent.instance.getMessagesForConversation(actor1.id, actor2.id);
                        console.log("📋 Messages in conversation:", messages.length);

                        if (messages.length > 0) {
                            console.log("✅ Message saving system working!");
                            ui.notifications.success("Sistema de salvamento funcionando!");
                        } else {
                            console.warn("⚠️ No messages found in conversation");
                            ui.notifications.warn("Nenhuma mensagem encontrada na conversa");
                        }
                    }, 1000);
                } else {
                    console.error("❌ Failed to send test message");
                    ui.notifications.error("Falha ao enviar mensagem de teste");
                }
            });
        } else {
            console.error("❌ Need at least 2 character actors for message saving test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar salvamento");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testPrivateMessages = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Private Messages System ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing private messages between ${actor1.name} and ${actor2.name}`);
            console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

            // Check current privacy setting
            const privateMessages = game.settings.get('cyberpunk-agent', 'private-messages');
            console.log(`🔒 Private messages enabled: ${privateMessages}`);

            // Test 1: Send a private message
            const testMessage = "Esta é uma mensagem privada de teste!";
            console.log("📤 Sending private test message...");

            CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, testMessage).then((success) => {
                if (success) {
                    console.log("✅ Private test message sent successfully");
                    ui.notifications.info("Mensagem privada de teste enviada!");

                    // Test 2: Check message visibility
                    setTimeout(() => {
                        const foundryMessages = CyberpunkAgent.instance.getMessagesFromFoundryChat(actor1.id, actor2.id);
                        console.log("📋 Messages in FoundryVTT chat:", foundryMessages.length);

                        if (foundryMessages.length > 0) {
                            const lastMessage = foundryMessages[foundryMessages.length - 1];
                            console.log("📋 Last message flags:", lastMessage);

                            if (privateMessages) {
                                console.log("✅ Private message system working!");
                                ui.notifications.success("Sistema de mensagens privadas funcionando!");
                            } else {
                                console.log("✅ Public message system working!");
                                ui.notifications.success("Sistema de mensagens públicas funcionando!");
                            }
                        } else {
                            console.warn("⚠️ No messages found in FoundryVTT chat");
                            ui.notifications.warn("Nenhuma mensagem encontrada no chat do FoundryVTT");
                        }
                    }, 1000);
                } else {
                    console.error("❌ Failed to send private test message");
                    ui.notifications.error("Falha ao enviar mensagem privada de teste");
                }
            });
        } else {
            console.error("❌ Need at least 2 character actors for private message test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar mensagens privadas");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.togglePrivateMessages = () => {
    if (CyberpunkAgent.instance) {
        const currentSetting = game.settings.get('cyberpunk-agent', 'private-messages');
        const newSetting = !currentSetting;

        game.settings.set('cyberpunk-agent', 'private-messages', newSetting);

        console.log(`🔒 Private messages ${newSetting ? 'enabled' : 'disabled'}`);
        ui.notifications.info(`Mensagens privadas ${newSetting ? 'ativadas' : 'desativadas'}!`);

        return newSetting;
    } else {
        console.error("❌ CyberpunkAgent instance not available");
        return false;
    }
};

window.testMessageLayout = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Message Layout ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing message layout between ${actor1.name} and ${actor2.name}`);

            // Test messages with different lengths
            const testMessages = [
                "Oi!",
                "Esta é uma mensagem de teste com tamanho médio para verificar o layout.",
                "Esta é uma mensagem muito longa que deve ocupar mais espaço horizontal e quebrar linhas adequadamente para testar como o sistema de layout funciona com textos extensos.",
                "Mensagem curta",
                "Outra mensagem com tamanho médio para testar o comportamento do layout responsivo."
            ];

            let sentCount = 0;
            testMessages.forEach((msg, index) => {
                setTimeout(() => {
                    CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, msg).then((success) => {
                        if (success) {
                            sentCount++;
                            console.log(`✅ Test message ${index + 1} sent successfully`);
                            ui.notifications.info(`Mensagem de teste ${index + 1} enviada!`);

                            if (sentCount === testMessages.length) {
                                console.log("✅ All layout test messages sent!");
                                ui.notifications.success("Todas as mensagens de teste de layout enviadas!");
                            }
                        }
                    });
                }, index * 1000); // Send each message 1 second apart
            });

            console.log("Cyberpunk Agent | Layout test started - sending 5 messages with different lengths");
        } else {
            console.error("❌ Need at least 2 character actors for layout test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar layout");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testChatEventSystem = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Chat Event System ===");

        // Get first character actor for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 1) {
            const actor = characterActors[0];

            console.log(`📱 Testing chat event system with actor: ${actor.name}`);
            console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

            // Test different types of contact update events
            const testEvents = [
                {
                    action: 'add',
                    contactName: 'Test Contact 1',
                    actorId: actor.id,
                    contactActorId: 'test-contact-1'
                },
                {
                    action: 'remove',
                    contactName: 'Test Contact 2',
                    actorId: actor.id,
                    contactActorId: 'test-contact-2'
                },
                {
                    action: 'modify',
                    contactName: 'Test Contact 3',
                    actorId: actor.id,
                    contactActorId: 'test-contact-3'
                },
                {
                    action: 'bulk',
                    count: 5,
                    description: 'Importação em lote de contatos',
                    actorId: actor.id
                }
            ];

            let sentCount = 0;
            testEvents.forEach((event, index) => {
                setTimeout(() => {
                    const success = CyberpunkAgent.instance._sendContactUpdateViaChat(event);
                    if (success) {
                        sentCount++;
                        console.log(`✅ Test event ${index + 1} sent successfully`);
                        ui.notifications.info(`Evento de teste ${index + 1} enviado!`);

                        if (sentCount === testEvents.length) {
                            console.log("✅ All chat event tests completed!");
                            ui.notifications.success("Todos os testes de eventos de chat concluídos!");
                        }
                    } else {
                        console.error(`❌ Failed to send test event ${index + 1}`);
                        ui.notifications.error(`Falha ao enviar evento de teste ${index + 1}`);
                    }
                }, index * 2000); // Send each event 2 seconds apart
            });

            console.log("Cyberpunk Agent | Chat event test started - sending 4 different event types");
        } else {
            console.error("❌ Need at least 1 character actor for chat event test");
            ui.notifications.error("Precisa de pelo menos 1 personagem para testar eventos de chat");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testUserSpecificEvents = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing User-Specific Events ===");

        // Get all non-GM users
        const players = game.users.filter(user => !user.isGM && user.active);

        if (players.length > 0) {
            console.log(`📱 Testing user-specific events for ${players.length} players`);

            players.forEach((player, index) => {
                setTimeout(() => {
                    const eventData = {
                        message: `Notificação personalizada para ${player.name}`,
                        actorId: 'test-actor',
                        action: 'notification'
                    };

                    const success = CyberpunkAgent.instance._sendEventToUser(player.id, 'userNotification', eventData);

                    if (success) {
                        console.log(`✅ User-specific event sent to ${player.name}`);
                        ui.notifications.info(`Evento enviado para ${player.name}!`);
                    } else {
                        console.error(`❌ Failed to send event to ${player.name}`);
                        ui.notifications.error(`Falha ao enviar evento para ${player.name}`);
                    }
                }, index * 1000);
            });

            console.log("Cyberpunk Agent | User-specific event test started");
        } else {
            console.log("ℹ️ No active players found for user-specific event test");
            ui.notifications.info("Nenhum jogador ativo encontrado para teste de eventos específicos");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testAutoScroll = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Auto-Scroll Functionality ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing auto-scroll between ${actor1.name} and ${actor2.name}`);

            // Send multiple test messages to test auto-scroll
            const testMessages = [
                "Teste de scroll automático #1",
                "Teste de scroll automático #2 - Esta mensagem é um pouco mais longa para testar o comportamento do scroll",
                "Teste de scroll automático #3 - Mensagem muito longa que deve quebrar linhas e testar se o scroll funciona corretamente com textos extensos",
                "Teste de scroll automático #4",
                "Teste de scroll automático #5 - Última mensagem do teste"
            ];

            let sentCount = 0;
            testMessages.forEach((msg, index) => {
                setTimeout(() => {
                    CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, msg).then((success) => {
                        if (success) {
                            sentCount++;
                            console.log(`✅ Auto-scroll test message ${index + 1} sent successfully`);
                            ui.notifications.info(`Mensagem de teste ${index + 1} enviada!`);

                            if (sentCount === testMessages.length) {
                                console.log("✅ All auto-scroll test messages sent!");
                                ui.notifications.success("Todas as mensagens de teste de auto-scroll enviadas!");
                                console.log("📱 Check if the chat interface automatically scrolls to show new messages");
                            }
                        }
                    });
                }, index * 1500); // Send each message 1.5 seconds apart
            });

            console.log("Cyberpunk Agent | Auto-scroll test started - sending 5 messages over 6 seconds");
        } else {
            console.error("❌ Need at least 2 character actors for auto-scroll test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar auto-scroll");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testDetailedContactUpdates = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Detailed Contact Update Messages ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing detailed contact updates between ${actor1.name} and ${actor2.name}`);

            // Test different types of contact updates
            const testActions = [
                {
                    action: 'add',
                    actorId: actor1.id,
                    contactActorId: actor2.id,
                    contactName: actor2.name,
                    description: `Teste de adição de contato`
                },
                {
                    action: 'remove',
                    actorId: actor1.id,
                    contactActorId: actor2.id,
                    contactName: actor2.name,
                    description: `Teste de remoção de contato`
                },
                {
                    action: 'modify',
                    actorId: actor1.id,
                    contactActorId: actor2.id,
                    contactName: actor2.name,
                    description: `Teste de modificação de contato`
                },
                {
                    action: 'bulk',
                    actorId: actor1.id,
                    count: 3,
                    description: `Teste de operação em lote`
                }
            ];

            testActions.forEach((actionDetails, index) => {
                setTimeout(() => {
                    console.log(`📤 Sending ${actionDetails.action} update...`);
                    CyberpunkAgent.instance.broadcastContactUpdate({}, actionDetails);
                    ui.notifications.info(`Evento de ${actionDetails.action} enviado!`);
                }, index * 2000); // Send each update 2 seconds apart
            });

            console.log("Cyberpunk Agent | Detailed contact update test started - sending 4 updates over 6 seconds");
            console.log("📱 Check the chat log for detailed update messages");
        } else {
            console.error("❌ Need at least 2 character actors for detailed contact update test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar atualizações detalhadas");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testAnonymousContacts = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Anonymous Contacts System ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing anonymous contacts between ${actor1.name} and ${actor2.name}`);

            // Test 1: Generate anonymous contact
            console.log("🔍 Test 1: Generating anonymous contact...");
            const anonymousContact = CyberpunkAgent.instance.getAnonymousContact(actor2.id);
            console.log("Anonymous contact generated:", anonymousContact);
            ui.notifications.info(`Contato anônimo gerado: ${anonymousContact.name}`);

            // Test 2: Generate another anonymous contact (should be consistent)
            setTimeout(() => {
                console.log("🔍 Test 2: Generating same anonymous contact (should be consistent)...");
                const sameAnonymousContact = CyberpunkAgent.instance.getAnonymousContact(actor2.id);
                console.log("Same anonymous contact:", sameAnonymousContact);
                ui.notifications.info(`Contato anônimo consistente: ${sameAnonymousContact.name}`);
            }, 2000);

            // Test 3: Generate different anonymous contact
            setTimeout(() => {
                console.log("🔍 Test 3: Generating different anonymous contact...");
                const differentAnonymousContact = CyberpunkAgent.instance.getAnonymousContact(actor1.id);
                console.log("Different anonymous contact:", differentAnonymousContact);
                ui.notifications.info(`Contato anônimo diferente: ${differentAnonymousContact.name}`);
            }, 4000);

            // Test 4: Get anonymous contacts for actor
            setTimeout(() => {
                console.log("🔍 Test 4: Getting anonymous contacts for actor...");
                const anonymousContacts = CyberpunkAgent.instance.getAnonymousContactsForActor(actor1.id);
                console.log("Anonymous contacts for actor:", anonymousContacts);
                ui.notifications.info(`${anonymousContacts.length} contato(s) anônimo(s) encontrado(s)`);
            }, 6000);

            console.log("Cyberpunk Agent | Anonymous contacts test started - running 4 tests over 6 seconds");
            console.log("📱 Check the console for detailed results");
        } else {
            console.error("❌ Need at least 2 character actors for anonymous contacts test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar contatos anônimos");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testAnonymousContactChat = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Anonymous Contact Chat ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing anonymous contact chat between ${actor1.name} and ${actor2.name}`);

            // Test 1: Send message from actor2 to actor1 (creates anonymous contact)
            console.log("🔍 Test 1: Sending message to create anonymous contact...");
            CyberpunkAgent.instance.sendMessage(actor2.id, actor1.id, "Olá! Esta é uma mensagem de teste para criar um contato anônimo.").then((success) => {
                if (success) {
                    console.log("✅ Message sent successfully, anonymous contact should be created");
                    ui.notifications.success("Mensagem enviada! Contato anônimo criado.");

                    // Test 2: Check if anonymous contact appears in actor1's list
                    setTimeout(() => {
                        console.log("🔍 Test 2: Checking anonymous contacts list...");
                        const anonymousContacts = CyberpunkAgent.instance.getAnonymousContactsForActor(actor1.id);
                        console.log("Anonymous contacts found:", anonymousContacts);

                        if (anonymousContacts.length > 0) {
                            ui.notifications.info(`✅ ${anonymousContacts.length} contato(s) anônimo(s) encontrado(s)!`);
                            console.log("📱 Open Chat7 for actor1 to see the anonymous contact");
                        } else {
                            ui.notifications.warn("⚠️ Nenhum contato anônimo encontrado");
                        }
                    }, 2000);
                } else {
                    console.error("❌ Failed to send message");
                    ui.notifications.error("Falha ao enviar mensagem");
                }
            });

            console.log("Cyberpunk Agent | Anonymous contact chat test started");
            console.log("📱 Check if the anonymous contact appears in the Chat7 interface");
        } else {
            console.error("❌ Need at least 2 character actors for anonymous contact chat test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar chat anônimo");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.forceUpdateChatInterfaces = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.forceUpdateChatInterfaces();
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

window.testDeleteMessages = () => {
    if (CyberpunkAgent.instance && game.user.isGM) {
        console.log("=== Testing Message Deletion ===");

        // Get first two character actors for testing
        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`🗑️ Testing message deletion between ${actor1.name} and ${actor2.name}`);

            // Test 1: Send multiple messages to create conversation
            console.log("🔍 Test 1: Sending test messages...");
            const messages = [
                "Primeira mensagem de teste",
                "Segunda mensagem de teste",
                "Terceira mensagem de teste",
                "Quarta mensagem de teste"
            ];

            let messageCount = 0;
            const sendNextMessage = () => {
                if (messageCount < messages.length) {
                    CyberpunkAgent.instance.sendMessage(actor1.id, actor2.id, messages[messageCount]).then((success) => {
                        if (success) {
                            messageCount++;
                            console.log(`✅ Message ${messageCount} sent`);

                            if (messageCount < messages.length) {
                                setTimeout(sendNextMessage, 1000);
                            } else {
                                // Test 2: Get messages and delete some
                                setTimeout(() => {
                                    console.log("🔍 Test 2: Getting messages for deletion test...");
                                    const conversationMessages = CyberpunkAgent.instance.getMessagesForConversation(actor1.id, actor2.id);
                                    console.log("Messages found:", conversationMessages);

                                    if (conversationMessages.length >= 2) {
                                        // Delete first two messages
                                        const messageIdsToDelete = conversationMessages.slice(0, 2).map(msg => msg.id);
                                        console.log("🗑️ Deleting messages:", messageIdsToDelete);

                                        CyberpunkAgent.instance.deleteMessages(actor1.id, actor2.id, messageIdsToDelete).then((success) => {
                                            if (success) {
                                                ui.notifications.success(`✅ ${messageIdsToDelete.length} mensagem(ns) deletada(s) com sucesso!`);
                                                console.log("🗑️ Messages deleted successfully");

                                                // Test 3: Verify deletion
                                                setTimeout(() => {
                                                    const remainingMessages = CyberpunkAgent.instance.getMessagesForConversation(actor1.id, actor2.id);
                                                    console.log("Remaining messages:", remainingMessages);
                                                    ui.notifications.info(`📱 ${remainingMessages.length} mensagem(ns) restante(s)`);
                                                }, 1000);
                                            } else {
                                                ui.notifications.error("❌ Failed to delete messages");
                                            }
                                        });
                                    } else {
                                        ui.notifications.warn("⚠️ Not enough messages for deletion test");
                                    }
                                }, 2000);
                            }
                        } else {
                            console.error("❌ Failed to send message");
                        }
                    });
                }
            };

            sendNextMessage();
            console.log("Cyberpunk Agent | Message deletion test started");
        } else {
            console.error("❌ Need at least 2 character actors for message deletion test");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar deleção de mensagens");
        }
    } else {
        console.error("❌ Cyberpunk Agent instance not available or user is not GM");
        ui.notifications.error("Sistema não disponível ou usuário não é GM");
    }
};

window.testSimpleDelete = () => {
    console.log("=== Testing Simple Delete System ===");
    console.log("User is GM:", game.user.isGM);

    // Check if there are any open chat conversation windows
    const openWindows = Object.values(ui.windows).filter(window =>
        window instanceof ChatConversationApplication ||
        window.constructor.name === 'ChatConversationApplication'
    );

    console.log("Open chat conversation windows:", openWindows.length);

    if (openWindows.length > 0) {
        const chatWindow = openWindows[0];

        // Check if delete buttons exist in messages
        const deleteButtons = chatWindow.element.find('.cp-message-delete');
        console.log("Delete buttons found:", deleteButtons.length);

        if (deleteButtons.length > 0) {
            console.log("Delete button HTML:", deleteButtons[0].outerHTML);
            ui.notifications.info(`✅ ${deleteButtons.length} botão(ões) de deleção encontrado(s)!`);

            // Test hovering over a message to show delete button
            const firstMessage = chatWindow.element.find('.cp-message').first();
            if (firstMessage.length > 0) {
                firstMessage.trigger('mouseenter');
                console.log("Triggered hover on first message");

                setTimeout(() => {
                    const visibleDeleteButton = firstMessage.find('.cp-message-delete');
                    console.log("Delete button visible on hover:", visibleDeleteButton.is(':visible'));

                    if (visibleDeleteButton.is(':visible')) {
                        ui.notifications.success("✅ Botão de deleção aparece no hover!");
                    } else {
                        ui.notifications.warn("⚠️ Botão de deleção não aparece no hover");
                    }
                }, 100);
            }
        } else {
            console.log("No delete buttons found");
            ui.notifications.warn("⚠️ Botões de deleção não encontrados");
        }
    } else {
        console.log("No open chat conversation windows found");
        ui.notifications.info("📱 Abra uma conversa de chat primeiro");
    }
};

window.testMessageDeletionSync = () => {
    console.log("=== Testing Message Deletion Synchronization ===");

    // Check if CyberpunkAgent instance exists
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error("Cyberpunk Agent instance not found");
        ui.notifications.error("❌ Instância do Cyberpunk Agent não encontrada");
        return;
    }

    const agent = window.CyberpunkAgent.instance;

    // Check communication method
    const communicationMethod = agent._getCommunicationMethod();
    console.log("Current communication method:", communicationMethod);

    // Check if SocketLib is available
    const socketLibAvailable = agent._isSocketLibAvailable();
    console.log("SocketLib available:", socketLibAvailable);

    // Check if socket is working
    const socketWorking = agent._isSocketWorking();
    console.log("Socket working:", socketWorking);

    // Show current status
    ui.notifications.info(`📡 Método de comunicação: ${communicationMethod}`);
    ui.notifications.info(`🔌 SocketLib disponível: ${socketLibAvailable}`);
    ui.notifications.info(`🌐 Socket funcionando: ${socketWorking}`);

    // Test sending a fake deletion notification
    console.log("Testing fake deletion notification...");
    agent._notifyMessageDeletion('test-actor-1', 'test-actor-2', ['test-message-1']);

    console.log("Test completed");
};

window.testRealTimeDeletion = () => {
    console.log("=== Testing Real-Time Message Deletion ===");

    // Check if there are any open chat conversation windows
    const openWindows = Object.values(ui.windows).filter(window =>
        window instanceof ChatConversationApplication ||
        window.constructor.name === 'ChatConversationApplication'
    );

    console.log("Open chat conversation windows:", openWindows.length);

    if (openWindows.length === 0) {
        ui.notifications.warn("⚠️ Nenhuma conversa de chat aberta");
        return;
    }

    const chatWindow = openWindows[0];
    const messages = chatWindow.element.find('.cp-message');

    console.log("Messages found:", messages.length);

    if (messages.length === 0) {
        ui.notifications.warn("⚠️ Nenhuma mensagem encontrada para testar");
        return;
    }

    // Get the first message ID
    const firstMessage = messages.first();
    const messageId = firstMessage.data('message-id');

    console.log("Testing deletion of message ID:", messageId);

    if (!messageId) {
        ui.notifications.error("❌ Não foi possível obter o ID da mensagem");
        return;
    }

    // Simulate the deletion process
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        const agent = window.CyberpunkAgent.instance;

        // Get actor and contact IDs from the chat window
        const actorId = chatWindow.actor?.id;
        const contactId = chatWindow.contact?.id;

        console.log("Actor ID:", actorId, "Contact ID:", contactId);

        if (actorId && contactId) {
            ui.notifications.info("🧪 Simulando deleção de mensagem...");

            // Test the deletion process
            agent.deleteMessages(actorId, contactId, [messageId]).then(success => {
                if (success) {
                    ui.notifications.success("✅ Deleção simulada com sucesso!");
                    console.log("Deletion simulation completed successfully");
                } else {
                    ui.notifications.error("❌ Falha na simulação de deleção");
                    console.log("Deletion simulation failed");
                }
            }).catch(error => {
                console.error("Error in deletion simulation:", error);
                ui.notifications.error("❌ Erro na simulação: " + error.message);
            });
        } else {
            ui.notifications.error("❌ Não foi possível obter IDs do ator/contato");
        }
    } else {
        ui.notifications.error("❌ Instância do Cyberpunk Agent não encontrada");
    }
};

console.log("Cyberpunk Agent | CyberpunkAgent class and test functions made globally available");
console.log("Cyberpunk Agent | New test functions:");
console.log("  - testSystemMessage() - Test the new system message fallback");
console.log("  - testMessageSystem() - Test the messaging system");
console.log("  - getConversationMessages(actorId1, actorId2) - Get messages between two actors");
console.log("  - testAnonymousContacts() - Test the anonymous contacts system");
console.log("  - testRealtimeMessages() - Test real-time message updates");
console.log("  - testFoundryChatIntegration() - Test FoundryVTT chat integration");
console.log("  - testMessageSaving() - Test message saving system");
console.log("  - testPrivateMessages() - Test private messages system");
console.log("  - togglePrivateMessages() - Toggle private messages setting");
console.log("  - testMessageLayout() - Test message layout and sizing");
console.log("  - testChatEventSystem() - Test chat event system");
console.log("  - testUserSpecificEvents() - Test user-specific events");
console.log("  - testAutoScroll() - Test auto-scroll functionality");
console.log("  - testDetailedContactUpdates() - Test detailed contact update messages");
console.log("  - testAnonymousContacts() - Test anonymous contacts system");
console.log("  - testAnonymousContactChat() - Test anonymous contact chat functionality");
console.log("  - testDeleteMessages() - Test message deletion functionality");
console.log("  - testSimpleDelete() - Test simple delete system");
console.log("  - testMessageDeletionSync() - Test message deletion synchronization");
console.log("  - testRealTimeDeletion() - Test real-time message deletion");
console.log("  - syncFoundryChat() - Sync with FoundryVTT chat");
console.log("  - forceUpdateChatInterfaces() - Force update all chat interfaces"); 