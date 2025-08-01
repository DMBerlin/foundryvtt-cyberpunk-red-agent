/**
 * Cyberpunk Agent Module
 * Real-time chat and communication system for FoundryVTT
 */

console.log("Cyberpunk Agent | Loading module.js...");

/**
 * Global UI Controller - Flutter-like state management
 * Manages UI components and their update states
 */
class UIController {
    constructor() {
        this.components = new Map(); // componentId -> component
        this.dirtyComponents = new Set(); // componentIds that need rebuild
        this.updateCallbacks = new Map(); // componentId -> update callbacks
        this.isUpdating = false;
        this.updateQueue = [];

        console.log("UIController | Initialized");
    }

    /**
     * Register a UI component
     */
    registerComponent(componentId, component, updateCallback) {
        this.components.set(componentId, component);
        this.updateCallbacks.set(componentId, updateCallback);
        console.log(`UIController | Registered component: ${componentId}`);
    }

    /**
     * Unregister a UI component
     */
    unregisterComponent(componentId) {
        this.components.delete(componentId);
        this.updateCallbacks.delete(componentId);
        this.dirtyComponents.delete(componentId);
        console.log(`UIController | Unregistered component: ${componentId}`);
    }

    /**
     * Mark a component as dirty (needs rebuild)
     */
    markDirty(componentId) {
        this.dirtyComponents.add(componentId);
        console.log(`UIController | Marked component as dirty: ${componentId}`);
        this.scheduleUpdate();
    }

    /**
     * Mark multiple components as dirty
     */
    markDirtyMultiple(componentIds) {
        const validComponentIds = [];
        const invalidComponentIds = [];

        componentIds.forEach(id => {
            if (this.components.has(id)) {
                this.dirtyComponents.add(id);
                validComponentIds.push(id);
            } else {
                invalidComponentIds.push(id);
            }
        });

        if (validComponentIds.length > 0) {
            console.log(`UIController | Marked valid components as dirty:`, validComponentIds);
        }

        if (invalidComponentIds.length > 0) {
            console.log(`UIController | Skipped invalid components (not registered):`, invalidComponentIds);
        }

        this.scheduleUpdate();
    }

    /**
     * Mark all components as dirty
     */
    markAllDirty() {
        const componentIds = Array.from(this.components.keys());
        componentIds.forEach(componentId => {
            this.dirtyComponents.add(componentId);
        });
        console.log(`UIController | Marked all ${componentIds.length} components as dirty:`, componentIds);
        this.scheduleUpdate();
    }

    /**
     * Schedule an update cycle
     */
    scheduleUpdate() {
        if (this.isUpdating) {
            return; // Already updating
        }

        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            this.performUpdate();
        });
    }

    /**
     * Perform the actual update cycle
     */
    performUpdate() {
        if (this.isUpdating || this.dirtyComponents.size === 0) {
            return;
        }

        this.isUpdating = true;
        console.log(`UIController | Starting update cycle for ${this.dirtyComponents.size} components`);

        // Clean up orphaned components before processing
        const orphanedCount = this.cleanupOrphanedComponents();

        const componentsToUpdate = Array.from(this.dirtyComponents);
        this.dirtyComponents.clear();

        // Update each dirty component
        componentsToUpdate.forEach(componentId => {
            const component = this.components.get(componentId);
            const updateCallback = this.updateCallbacks.get(componentId);

            if (component && updateCallback) {
                try {
                    console.log(`UIController | Updating component: ${componentId}`);
                    updateCallback(component);
                } catch (error) {
                    console.error(`UIController | Error updating component ${componentId}:`, error);
                }
            } else {
                // Component was removed or never existed - clean up dirty state
                console.log(`UIController | Component not found for: ${componentId} - cleaning up dirty state`);
                this.dirtyComponents.delete(componentId);
            }
        });

        this.isUpdating = false;
        console.log(`UIController | Update cycle completed (cleaned up ${orphanedCount} orphaned components)`);

        // Check if more updates were queued during this cycle
        if (this.dirtyComponents.size > 0) {
            this.scheduleUpdate();
        }
    }

    /**
     * Get all registered component IDs
     */
    getComponentIds() {
        return Array.from(this.components.keys());
    }

    /**
     * Check if a component is registered
     */
    hasComponent(componentId) {
        return this.components.has(componentId);
    }

    /**
     * Get component by ID
     */
    getComponent(componentId) {
        return this.components.get(componentId);
    }

    /**
     * Clean up orphaned components and dirty states
     */
    cleanupOrphanedComponents() {
        const orphanedDirtyComponents = [];

        // Find dirty components that no longer exist
        this.dirtyComponents.forEach(componentId => {
            if (!this.components.has(componentId)) {
                orphanedDirtyComponents.push(componentId);
            }
        });

        // Remove orphaned components from dirty state
        orphanedDirtyComponents.forEach(componentId => {
            this.dirtyComponents.delete(componentId);
        });

        if (orphanedDirtyComponents.length > 0) {
            console.log(`UIController | Cleaned up ${orphanedDirtyComponents.length} orphaned dirty components:`, orphanedDirtyComponents);
        }

        return orphanedDirtyComponents.length;
    }

    /**
     * Get status information for debugging
     */
    getStatus() {
        return {
            totalComponents: this.components.size,
            dirtyComponents: this.dirtyComponents.size,
            isUpdating: this.isUpdating,
            componentIds: Array.from(this.components.keys()),
            dirtyComponentIds: Array.from(this.dirtyComponents)
        };
    }
}

/**
 * Global UI Controller instance
 */
window.CyberpunkAgentUIController = new UIController();

class CyberpunkAgent {
    constructor() {
        this.id = "cyberpunk-agent";
        this.title = "Cyberpunk Agent";
        this.version = "2.0.0";

        // Device-based system properties
        this.devices = new Map(); // Map: deviceId -> deviceData
        this.deviceMappings = new Map(); // Map: actorId -> [deviceIds]

        // Phone number system
        this.phoneNumberDictionary = new Map(); // Map: phoneNumber -> deviceId
        this.devicePhoneNumbers = new Map(); // Map: deviceId -> phoneNumber

        // Messages and settings per device
        this.messages = new Map(); // deviceId -> conversationKey -> [messages]
        this._userMuteSettings = new Map(); // userId -> deviceId -> {contactDeviceId -> muted}
        this.lastReadTimestamps = new Map(); // deviceId -> conversationKey -> timestamp
        this.unreadCounts = new Map(); // deviceId -> conversationKey -> count

        // UI and system management
        this.uiController = new UIController();
        this._agentSystemSetupComplete = false;
        this._openInterfaces = new Set();
        this._openChatInterfaces = new Set();

        // SocketLib integration
        this.socketLibIntegration = null;
        this._socketLibAvailable = false;
        this._socketLibReadyHookSet = false;

        // Store instance for global access
        CyberpunkAgent.instance = this;
    }

    /**
     * Register module settings
     */
    static registerSettings() {
        console.log("Cyberpunk Agent | Registering settings...");

        // Register device data setting for the device-based system
        game.settings.register('cyberpunk-agent', 'device-data', {
            name: 'Device Data',
            hint: 'Internal storage for device-based agent system',
            scope: 'world',
            config: false,
            type: Object,
            default: { devices: {}, deviceMappings: {} }
        });

        // Register phone number data setting
        game.settings.register('cyberpunk-agent', 'phone-number-data', {
            name: 'Phone Number Data',
            hint: 'Internal storage for phone number mappings',
            scope: 'world',
            config: false,
            type: Object,
            default: { phoneNumberDictionary: {}, devicePhoneNumbers: {} }
        });

        // Register a custom settings menu for Cyberpunk Agent (Contact Manager only)
        game.settings.registerMenu('cyberpunk-agent', 'contact-manager-menu', {
            name: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON'),
            hint: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_HINT'),
            label: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON'),
            icon: 'fas fa-users',
            type: ContactManagerMenu,
            restricted: true
        });

        // Register a custom settings menu for GM Data Management
        game.settings.registerMenu('cyberpunk-agent', 'gm-data-management-menu', {
            name: 'GM Data Management',
            hint: 'Manage all chat messages and contact connections for all actors',
            label: 'GM Data Management',
            icon: 'fas fa-database',
            type: GMDataManagementMenu,
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

        // Setup chat command and character sheet integration
        setTimeout(() => {
            this.setupChatCommand();
            this.setupCharacterSheetIntegration();
        }, 1000);
    }

    /**
     * Setup FoundryVTT chat integration
     */
    setupFoundryChatIntegration() {
        console.log("Cyberpunk Agent | FoundryVTT chat integration disabled - using SocketLib only");
        // Chat integration removed - all communication now goes through SocketLib
    }

    /**
     * Setup chat command for /agent
     */
    setupChatCommand() {
        console.log("Cyberpunk Agent | Setting up chat command...");

        // Try to use lib-chatcommands if available
        if (game.modules.get('lib-chatcommands')?.active) {
            console.log("Cyberpunk Agent | Using lib-chatcommands for /agent command");
            // This would be handled by lib-chatcommands
        } else {
            // Fallback: use Hooks.on('chatMessage')
            console.log("Cyberpunk Agent | Using fallback chat message hook for /agent command");
            Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
                if (messageText.startsWith('/agent')) {
                    // Prevent the message from being sent to chat
                    return false;
                }
            });
        }
    }

    /**
     * Setup character sheet integration
     */
    setupCharacterSheetIntegration() {
        console.log("Cyberpunk Agent | Setting up character sheet integration...");

        Hooks.on('renderActorSheet', (app, html, data) => {
            // Only add button for owned characters
            if (data.actor.isOwner) {
                const header = html.find('.sheet-header');
                if (header.length > 0) {
                    // Check if button already exists
                    if (header.find('.agent-button').length === 0) {
                        const button = $(`
                            <button class="agent-button" title="Open Agent Interface">
                                <i class="fas fa-mobile-alt"></i>
                                <span>Agent</span>
                            </button>
                        `);

                        button.on('click', () => {
                            this.openAgentInterface();
                        });

                        header.append(button);
                    }
                }
            }
        });
    }

    /**
     * Internal setup method
     */
    _setupAgentSystemInternal() {
        // Only set up if not already done
        if (this._agentSystemSetupComplete) {
            console.log("Cyberpunk Agent | Agent system already set up, skipping");
            return;
        }

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

        // Load device data
        this.loadDeviceData();
        console.log('Cyberpunk Agent | After loadDeviceData, this.devices.size:', this.devices?.size);

        // Initialize device discovery for existing agent items
        this.initializeDeviceDiscovery();

        // Load user's mute settings
        this._loadUserMuteSettings(game.user.id);

        // Setup SocketLib integration if available
        this.setupSocketLibIntegration();

        // Setup SocketLib when it's ready
        this.setupSocketLibWhenReady();

        // Additional SocketLib initialization check after a delay
        setTimeout(() => {
            console.log("Cyberpunk Agent | Checking SocketLib status after delay...");
            if (!this._isSocketLibAvailable()) {
                console.warn("Cyberpunk Agent | SocketLib not available after delay, attempting manual initialization...");

                // Try to initialize SocketLib manually
                if (typeof window.initializeSocketLib === 'function') {
                    const success = window.initializeSocketLib();
                    if (success && this.socketLibIntegration) {
                        this.socketLibIntegration.updateSocket(window.socket);
                        console.log("Cyberpunk Agent | SocketLib manually initialized successfully");
                    } else {
                        console.error("Cyberpunk Agent | Manual SocketLib initialization failed");
                    }
                } else {
                    console.error("Cyberpunk Agent | Manual SocketLib initialization not possible - function not available");
                }
            } else {
                console.log("Cyberpunk Agent | SocketLib is available after delay");
            }
        }, 2000); // Check after 2 seconds

        // Setup FoundryVTT chat integration
        this.setupFoundryChatIntegration();

        // Setup hooks only if methods exist
        if (this.handleActorUpdate) {
            Hooks.on('updateActor', this.handleActorUpdate.bind(this));
        }

        // Setup settings change hook to reload device data when it changes
        Hooks.on('updateSetting', (moduleId, settingKey, value, options) => {
            if (moduleId === 'cyberpunk-agent' && settingKey === 'device-data') {
                console.log("Cyberpunk Agent | Device data setting updated, reloading data...");
                this.loadDeviceData();
                this.updateOpenInterfaces();
            }
        });

        // Setup item update hooks for equipment changes
        this.setupItemUpdateHooks();

        this._agentSystemSetupComplete = true;
        console.log("Cyberpunk Agent | Agent system setup complete");
    }

    /**
 * Initialize device discovery for existing agent items
 */
    initializeDeviceDiscovery() {
        // Only run device discovery for GM
        if (!game.user.isGM) {
            console.log("Cyberpunk Agent | Skipping device discovery for non-GM user");
            return;
        }

        console.log("Cyberpunk Agent | Initializing device discovery...");

        // Run device discovery after a short delay to ensure everything is loaded
        setTimeout(async () => {
            try {
                await this.discoverAndCreateDevices();
            } catch (error) {
                console.error("Cyberpunk Agent | Device discovery failed:", error);
            }
        }, 1000);
    }

    /**
     * Discover existing agent items and create devices
     */
    async discoverAndCreateDevices() {
        console.log("Cyberpunk Agent | Discovering existing agent items...");

        const actors = game.actors.filter(actor => actor.type === 'character');
        let devicesCreated = 0;

        for (const actor of actors) {
            try {
                if (!actor.items) continue;

                // Look for agent items in the actor's inventory
                const agentItems = actor.items.filter(item =>
                    item.type === 'gear' &&
                    item.name.toLowerCase().includes('agent')
                );

                for (const item of agentItems) {
                    const deviceId = `device-${actor.id}-${item.id}`;

                    // Check if device already exists
                    if (this.devices.has(deviceId)) {
                        console.log(`Cyberpunk Agent | Device ${deviceId} already exists, skipping`);
                        continue;
                    }

                    const deviceName = item.name || `Agent ${item.id.slice(-4)}`;

                    // Create device data
                    const deviceData = {
                        id: deviceId,
                        ownerActorId: actor.id,
                        itemId: item.id,
                        deviceName: deviceName,
                        contacts: [],
                        settings: {
                            muteAll: false,
                            notificationSounds: true,
                            autoOpen: false
                        },
                        createdAt: Date.now(),
                        lastUsed: Date.now()
                    };

                    // Add to devices map
                    this.devices.set(deviceId, deviceData);

                    // Update device mappings
                    if (!this.deviceMappings.has(actor.id)) {
                        this.deviceMappings.set(actor.id, []);
                    }
                    this.deviceMappings.get(actor.id).push(deviceId);

                    devicesCreated++;
                    console.log(`Cyberpunk Agent | Created device: ${deviceName} for actor ${actor.name}`);
                }
            } catch (error) {
                console.error(`Cyberpunk Agent | Error discovering agent items for actor ${actor.id}:`, error);
            }
        }

        // Save the new device data if any devices were created
        if (devicesCreated > 0) {
            await this.saveDeviceData();
            console.log(`Cyberpunk Agent | Device discovery created ${devicesCreated} new devices`);
        } else {
            console.log("Cyberpunk Agent | No new devices discovered");
        }
    }

    /**
     * Add control button to the scene controls based on equipped agents
     */
    addControlButton(controls) {
        // Safety check: ensure controls is an array
        if (!Array.isArray(controls)) {
            console.warn("Cyberpunk Agent | addControlButton: controls is not an array:", controls);
            return;
        }

        // Find the token controls
        const tokenControl = controls.find(control => control.name === "token");

        if (tokenControl) {
            // Safety check: ensure tools array exists
            if (!Array.isArray(tokenControl.tools)) {
                tokenControl.tools = [];
            }

            // Remove any existing agent tools first
            tokenControl.tools = tokenControl.tools.filter(tool => tool.name !== "agent");

            // Get equipped agents for the current user (works for both GM and players)
            const equippedAgents = this.getEquippedAgentsForUser();

            if (equippedAgents.length > 0) {
                // If only one equipped agent, show it directly
                if (equippedAgents.length === 1) {
                    const agent = equippedAgents[0];
                    tokenControl.tools.push({
                        name: "agent",
                        title: `Agent: ${agent.actorName}`,
                        icon: "fas fa-mobile-alt",
                        onClick: () => {
                            this.openSpecificAgent(agent.deviceId);
                        }
                    });
                } else {
                    // If multiple equipped agents, show a menu
                    tokenControl.tools.push({
                        name: "agent",
                        title: `Agent (${equippedAgents.length} equipped)`,
                        icon: "fas fa-mobile-alt",
                        onClick: () => {
                            this.showEquippedAgentMenu(equippedAgents);
                        }
                    });
                }
                console.log(`Cyberpunk Agent | Added agent button for ${equippedAgents.length} equipped agent(s)`);
            }
        } else {
            console.warn("Cyberpunk Agent | Token control not found in controls array");
        }
    }

    /**
     * Setup hooks to monitor item equipment changes
     */
    setupItemUpdateHooks() {
        // Monitor item updates to detect equipment changes
        Hooks.on('updateItem', (item, changes, options, userId) => {
            // Check if this is an agent item and if equipped status changed
            if (item.type === 'gear' &&
                item.name.toLowerCase().includes('agent') &&
                changes.system?.equipped !== undefined) {

                console.log(`Cyberpunk Agent | Agent equipment status changed for ${item.name}: ${changes.system.equipped}`);

                // Update token controls after a short delay to ensure the change is processed
                setTimeout(() => {
                    this.updateTokenControls();
                }, 100);
            }
        });

        // Monitor actor updates that might affect equipment
        Hooks.on('updateActor', (actor, changes, options, userId) => {
            // Check if items were updated
            if (changes.items) {
                console.log("Cyberpunk Agent | Actor items updated, checking for equipment changes");

                // Check for new agent items and create devices automatically
                this.checkAndCreateDevicesForActor(actor);

                // Update token controls after a short delay
                setTimeout(() => {
                    this.updateTokenControls();
                }, 100);
            }
        });

        // Monitor item creation to catch new agent items
        Hooks.on('createItem', (item, options, userId) => {
            if (item.type === 'gear' && item.name.toLowerCase().includes('agent')) {
                console.log(`Cyberpunk Agent | New agent item created: ${item.name}`);

                // Find the actor that owns this item
                const actor = item.parent;
                if (actor) {
                    console.log(`Cyberpunk Agent | Agent item belongs to actor: ${actor.name}`);

                    // Check and create devices for this actor
                    setTimeout(() => {
                        this.checkAndCreateDevicesForActor(actor);
                        this.updateTokenControls();
                    }, 100);
                }
            }
        });

        // Monitor item deletion to clean up devices
        Hooks.on('deleteItem', (item, options, userId) => {
            if (item.type === 'gear' && item.name.toLowerCase().includes('agent')) {
                console.log(`Cyberpunk Agent | Agent item deleted: ${item.name}`);

                // Find the actor that owned this item
                const actor = item.parent;
                if (actor) {
                    console.log(`Cyberpunk Agent | Agent item belonged to actor: ${actor.name}`);

                    // Clean up devices for this actor
                    setTimeout(() => {
                        this.cleanupDevicesForActor(actor);
                        this.updateTokenControls();
                    }, 100);
                }
            }
        });

        console.log("Cyberpunk Agent | Item update hooks configured");
    }

    /**
     * Check and create devices for an actor's agent items
     * @param {Actor} actor - The actor to check
     */
    async checkAndCreateDevicesForActor(actor) {
        try {
            if (!actor.items) return;

            // Look for agent items in the actor's inventory
            const agentItems = actor.items.filter(item =>
                item.type === 'gear' &&
                item.name.toLowerCase().includes('agent')
            );

            let devicesCreated = 0;

            for (const item of agentItems) {
                const deviceId = `device-${actor.id}-${item.id}`;

                // Check if device already exists
                if (this.devices.has(deviceId)) {
                    console.log(`Cyberpunk Agent | Device ${deviceId} already exists, skipping`);
                    continue;
                }

                const deviceName = item.name || `Agent ${item.id.slice(-4)}`;

                // Create device data
                const deviceData = {
                    id: deviceId,
                    ownerActorId: actor.id,
                    itemId: item.id,
                    deviceName: deviceName,
                    contacts: [],
                    settings: {
                        muteAll: false,
                        notificationSounds: true,
                        autoOpen: false
                    },
                    createdAt: Date.now(),
                    lastUsed: Date.now()
                };

                // Add to devices map
                this.devices.set(deviceId, deviceData);

                // Update device mappings
                if (!this.deviceMappings.has(actor.id)) {
                    this.deviceMappings.set(actor.id, []);
                }
                this.deviceMappings.get(actor.id).push(deviceId);

                devicesCreated++;
                console.log(`Cyberpunk Agent | Auto-created device: ${deviceName} for actor ${actor.name}`);
            }

            // Save the new device data if any devices were created
            if (devicesCreated > 0) {
                await this.saveDeviceData();
                console.log(`Cyberpunk Agent | Auto-created ${devicesCreated} new devices for actor ${actor.name}`);
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error checking/creating devices for actor ${actor.id}:`, error);
        }
    }

    /**
     * Clean up devices for an actor when agent items are removed
     * @param {Actor} actor - The actor to check
     */
    async cleanupDevicesForActor(actor) {
        try {
            if (!actor.items) return;

            // Get current agent items
            const currentAgentItems = actor.items.filter(item =>
                item.type === 'gear' &&
                item.name.toLowerCase().includes('agent')
            );

            // Get all devices for this actor
            const actorDevices = this.deviceMappings.get(actor.id) || [];
            let devicesRemoved = 0;

            for (const deviceId of actorDevices) {
                const device = this.devices.get(deviceId);
                if (!device) continue;

                // Check if the corresponding item still exists
                const itemStillExists = currentAgentItems.some(item =>
                    `device-${actor.id}-${item.id}` === deviceId
                );

                if (!itemStillExists) {
                    // Remove the device
                    this.devices.delete(deviceId);

                    // Remove from phone number mappings if exists
                    const phoneNumber = this.devicePhoneNumbers.get(deviceId);
                    if (phoneNumber) {
                        this.phoneNumberDictionary.delete(phoneNumber);
                        this.devicePhoneNumbers.delete(deviceId);
                    }

                    devicesRemoved++;
                    console.log(`Cyberpunk Agent | Removed orphaned device: ${deviceId}`);
                }
            }

            // Update device mappings
            if (devicesRemoved > 0) {
                this.deviceMappings.set(actor.id, actorDevices.filter(deviceId =>
                    this.devices.has(deviceId)
                ));

                await this.saveDeviceData();
                await this.savePhoneNumberData();
                console.log(`Cyberpunk Agent | Cleaned up ${devicesRemoved} orphaned devices for actor ${actor.name}`);
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error cleaning up devices for actor ${actor.id}:`, error);
        }
    }

    /**
     * Update token controls to reflect current equipment state
     */
    updateTokenControls() {
        // Force refresh of scene controls
        if (game.scenes.active) {
            // Trigger a refresh of the scene controls
            const controls = ui.controls.controls;
            if (controls) {
                this.addControlButton(controls);
                console.log("Cyberpunk Agent | Token controls updated for equipment changes");
            }
        }
    }

    /**
     * Debug method to check item structure
     */
    debugItemStructure() {
        console.log("=== Cyberpunk Agent Debug: Item Structure ===");

        const userActors = this.getUserActors();
        console.log(`Found ${userActors.length} user actors`);

        for (const actor of userActors) {
            console.log(`\n--- Actor: ${actor.name} ---`);
            console.log(`Actor ID: ${actor.id}`);
            console.log(`Actor type: ${actor.type}`);
            console.log(`Actor items count: ${actor.items?.length || 0}`);

            if (actor.items) {
                for (const item of actor.items) {
                    if (item.type === 'gear' && item.name.toLowerCase().includes('agent')) {
                        console.log(`\nAgent Item: ${item.name}`);
                        console.log(`Item ID: ${item.id}`);
                        console.log(`Item type: ${item.type}`);
                        console.log(`Full item object:`, item);
                        console.log(`Item system:`, item.system);
                        console.log(`Item flags:`, item.flags);
                        console.log(`Item data:`, item.data);

                        // Check all possible equipped states
                        console.log(`\nEquipped status checks:`);
                        console.log(`- item.system?.equipped:`, item.system?.equipped);
                        console.log(`- item.flags?.equipped:`, item.flags?.equipped);
                        console.log(`- item.system?.equippedState:`, item.system?.equippedState);
                        console.log(`- item.data?.equipped:`, item.data?.equipped);
                        console.log(`- item.system?.equipped === true:`, item.system?.equipped === true);
                        console.log(`- item.system?.equipped === 'equipped':`, item.system?.equipped === 'equipped');
                    }
                }
            }
        }

        console.log("=== End Debug ===");
    }

    /**
     * Get equipped agents for the current user
     */
    getEquippedAgentsForUser() {
        const equippedAgents = [];

        try {
            // Get user's actors
            const userActors = this.getUserActors();

            for (const actor of userActors) {
                if (!actor.items) continue;

                console.log(`Cyberpunk Agent | Checking items for actor: ${actor.name}`);
                console.log(`Cyberpunk Agent | Actor has ${actor.items.length} items`);

                // Look for agent items
                const agentItems = actor.items.filter(item =>
                    item.type === 'gear' &&
                    item.name.toLowerCase().includes('agent')
                );

                console.log(`Cyberpunk Agent | Found ${agentItems.length} agent items for ${actor.name}`);

                for (const item of agentItems) {
                    console.log(`Cyberpunk Agent | Checking agent item: ${item.name}`);
                    console.log(`Cyberpunk Agent | Item system:`, item.system);
                    console.log(`Cyberpunk Agent | Item equipped status:`, item.system?.equipped);
                    console.log(`Cyberpunk Agent | Item flags:`, item.flags);

                    // Check multiple possible equipped states (Foundry V10 compatible)
                    const isEquipped =
                        item.system?.equipped === true ||
                        item.system?.equipped === 'equipped' ||
                        item.flags?.equipped === true ||
                        item.system?.equippedState === 'equipped' ||
                        item.system?.equippedState === true ||
                        item.system?.equipped === 1 ||
                        item.system?.equipped === '1' ||
                        item.system?.equipped === 'true';

                    // Additional debugging for equipped status
                    console.log(`Cyberpunk Agent | Detailed equipped check for ${item.name}:`);
                    console.log(`  - item.system?.equipped: "${item.system?.equipped}" (type: ${typeof item.system?.equipped})`);
                    console.log(`  - item.system?.equipped === 'equipped': ${item.system?.equipped === 'equipped'}`);
                    console.log(`  - item.flags?.equipped: ${item.flags?.equipped}`);
                    console.log(`  - item.system?.equippedState: ${item.system?.equippedState}`);
                    console.log(`  - Final isEquipped result: ${isEquipped}`);

                    console.log(`Cyberpunk Agent | Is equipped: ${isEquipped}`);

                    if (isEquipped) {
                        const deviceId = this.generateDeviceId(actor.id, item.id);
                        equippedAgents.push({
                            deviceId: deviceId,
                            actorId: actor.id,
                            actorName: actor.name,
                            itemId: item.id,
                            itemName: item.name
                        });
                        console.log(`Cyberpunk Agent | Added equipped agent: ${item.name} for ${actor.name}`);
                    }
                }
            }

            console.log(`Cyberpunk Agent | Found ${equippedAgents.length} equipped agents for user`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting equipped agents:", error);
        }

        return equippedAgents;
    }

    /**
     * Open a specific agent device
     */
    async openSpecificAgent(deviceId) {
        try {
            console.log("Cyberpunk Agent | openSpecificAgent called with deviceId:", deviceId);
            console.log("Cyberpunk Agent | this.devices:", this.devices);
            console.log("Cyberpunk Agent | this.devices type:", typeof this.devices);
            console.log("Cyberpunk Agent | this.devices size:", this.devices?.size);

            if (!this.devices) {
                console.error("Cyberpunk Agent | this.devices is undefined! Loading device data...");
                this.loadDeviceData();
            }

            const device = this.devices.get(deviceId);
            if (!device) {
                console.error(`Cyberpunk Agent | Device ${deviceId} not found`);
                console.log("Cyberpunk Agent | Available devices:", Array.from(this.devices.keys()));
                ui.notifications.error("Agent device not found");
                return;
            }

            // Load messages for this device
            await this.loadMessagesForDevice(deviceId);
            await this.synchronizeMessagesWithServer(deviceId);

            // Show the agent interface for this specific device
            await this.showAgentHome(device);

        } catch (error) {
            console.error("Cyberpunk Agent | Error opening specific agent:", error);
            ui.notifications.error("Failed to open agent");
        }
    }

    /**
     * Show menu for multiple equipped agents
     */
    async showEquippedAgentMenu(equippedAgents) {
        console.log("Cyberpunk Agent | showEquippedAgentMenu called with:", equippedAgents);
        console.log("Cyberpunk Agent | equippedAgents length:", equippedAgents.length);
        console.log("Cyberpunk Agent | equippedAgents type:", typeof equippedAgents);

        if (!equippedAgents || equippedAgents.length === 0) {
            console.error("Cyberpunk Agent | No equipped agents provided to showEquippedAgentMenu");
            ui.notifications.error("Nenhum Agent equipado encontrado para seleção.");
            return;
        }

        const options = equippedAgents.map(agent => ({
            label: `${agent.actorName} - ${agent.itemName}`,
            value: agent.deviceId
        }));

        console.log("Cyberpunk Agent | Generated options:", options);

        const selectedDeviceId = await new Promise((resolve) => {
            new Dialog({
                title: game.user.isGM ? "Selecionar Dispositivo Agent (GM)" : "Selecionar Dispositivo Agent",
                content: `
                    <div style="margin-bottom: 1em;">
                        <p>${game.user.isGM ? 'Você tem múltiplos Agents equipados nos seus personagens. Escolha qual abrir:' : 'Você tem múltiplos Agents equipados. Escolha qual abrir:'}</p>
                    </div>
                    <div style="margin-bottom: 1em;">
                        <select id="agent-device-select" style="width: 100%;">
                            ${options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
                        </select>
                    </div>
                `,
                buttons: {
                    select: {
                        label: "Selecionar",
                        callback: (html) => {
                            const selectedValue = html.find('#agent-device-select').val();
                            resolve(selectedValue);
                        }
                    },
                    cancel: {
                        label: "Cancelar",
                        callback: () => resolve(null)
                    }
                },
                render: (html) => {
                    console.log("Cyberpunk Agent | Dialog render called");
                    console.log("Cyberpunk Agent | Dialog render - options:", options);
                    console.log("Cyberpunk Agent | Dialog render - html.find('.dialog-content'):", html.find('.dialog-content'));

                    // Verify the select element exists in the DOM
                    const selectElement = html.find('#agent-device-select');
                    console.log("Cyberpunk Agent | Select element found in DOM:", selectElement);
                    console.log("Cyberpunk Agent | Select element length:", selectElement.length);
                    console.log("Cyberpunk Agent | Select element HTML:", selectElement.html());

                    // Force a reflow to ensure the select is visible
                    setTimeout(() => {
                        console.log("Cyberpunk Agent | Checking select visibility after timeout");
                        const selectInDOM = document.getElementById('agent-device-select');
                        console.log("Cyberpunk Agent | Select element in DOM:", selectInDOM);
                        if (selectInDOM) {
                            console.log("Cyberpunk Agent | Select computed style:", window.getComputedStyle(selectInDOM));
                            console.log("Cyberpunk Agent | Select offsetHeight:", selectInDOM.offsetHeight);
                            console.log("Cyberpunk Agent | Select offsetWidth:", selectInDOM.offsetWidth);
                        }
                    }, 100);
                }
            }).render(true);
        });

        if (selectedDeviceId) {
            await this.openSpecificAgent(selectedDeviceId);
        }
    }

    /**
     * Get user's accessible devices
     */
    getUserAccessibleDevices() {
        const accessibleDevices = [];

        try {
            if (game.user.isGM) {
                // GM has access to all devices
                accessibleDevices.push(...Array.from(this.devices.values()));
            } else {
                // Regular users only have access to their owned devices
                const userActors = this.getUserActors();

                for (const actor of userActors) {
                    const actorDevices = this.getDevicesForActor(actor.id);
                    accessibleDevices.push(...actorDevices);
                }
            }

            console.log(`Cyberpunk Agent | User has access to ${accessibleDevices.length} devices`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting accessible devices:", error);
        }

        return accessibleDevices;
    }

    /**
     * Get devices for a specific actor
     */
    getDevicesForActor(actorId) {
        const deviceIds = this.deviceMappings.get(actorId) || [];
        return deviceIds.map(deviceId => this.devices.get(deviceId)).filter(Boolean);
    }

    /**
     * Generate device ID from actor and item IDs
     */
    generateDeviceId(actorId, itemId) {
        return `device-${actorId}-${itemId}`;
    }

    /**
     * Get user's accessible actors
     */
    getUserActors() {
        // Ensure game.user exists
        if (!game.user) {
            console.log("Cyberpunk Agent | No user data available");
            return [];
        }

        console.log("Cyberpunk Agent | Checking actors for user:", game.user.name);
        console.log("Cyberpunk Agent | User ID:", game.user.id);
        console.log("Cyberpunk Agent | Is GM:", game.user.isGM);

        // If user is GM, return all character actors
        if (game.user.isGM) {
            if (game.actors) {
                const allCharacterActors = game.actors.filter(actor => actor.type === 'character');
                console.log(`Cyberpunk Agent | GM access - returning all ${allCharacterActors.length} character actors`);
                return allCharacterActors;
            } else {
                console.log("Cyberpunk Agent | GM access - no actors collection available");
                return [];
            }
        }

        // For regular users, get character actors they have access to
        let userActors = [];

        // Method 1: Get character actors from the user's owned tokens
        try {
            if (game.scenes && game.scenes.active && game.scenes.active.tokens) {
                const ownedTokens = game.scenes.active.tokens.filter(token =>
                    token.actor &&
                    token.actor.type === 'character' &&
                    token.actor.ownership &&
                    game.user.id &&
                    token.actor.ownership[game.user.id] === 1
                );
                userActors = ownedTokens.map(token => token.actor);
                console.log(`Cyberpunk Agent | Found ${userActors.length} character actors from owned tokens`);
            } else {
                console.log("Cyberpunk Agent | No active scene or tokens available");
            }
        } catch (error) {
            console.log("Cyberpunk Agent | Error getting owned tokens:", error);
        }

        // Method 2: Get character actors from the user's character list
        try {
            if (game.actors) {
                const characterActors = game.actors.filter(actor =>
                    actor.type === 'character' &&
                    actor.ownership &&
                    game.user.id &&
                    actor.ownership[game.user.id] === 1
                );
                console.log(`Cyberpunk Agent | Found ${characterActors.length} character actors from character list`);
                userActors = [...userActors, ...characterActors];
            } else {
                console.log("Cyberpunk Agent | No actors collection available");
            }
        } catch (error) {
            console.log("Cyberpunk Agent | Error getting character actors:", error);
        }

        // Method 3: Get all character actors that the user has any permission to
        try {
            if (game.actors) {
                const accessibleActors = game.actors.filter(actor => {
                    if (actor.type !== 'character') return false;
                    if (!actor.ownership) return false;
                    if (!game.user.id) return false;
                    return actor.ownership[game.user.id] !== undefined;
                });
                console.log(`Cyberpunk Agent | Found ${accessibleActors.length} accessible character actors`);
                userActors = [...userActors, ...accessibleActors];
            } else {
                console.log("Cyberpunk Agent | No actors collection available");
            }
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
        console.log("Cyberpunk Agent | openAgentInterface called");

        // For both GM and players: Show equipped agents
        const equippedAgents = this.getEquippedAgentsForUser();
        console.log("Cyberpunk Agent | openAgentInterface - equippedAgents:", equippedAgents);
        console.log("Cyberpunk Agent | openAgentInterface - equippedAgents.length:", equippedAgents.length);

        if (equippedAgents.length === 0) {
            if (game.user.isGM) {
                ui.notifications.warn("Nenhum Agent equipado encontrado nos personagens que você possui.");
            } else {
                ui.notifications.warn("Você não tem nenhum Agent equipado. Equipe um Agent para usá-lo.");
            }
            return;
        }

        // If only one equipped agent, open it directly
        if (equippedAgents.length === 1) {
            console.log("Cyberpunk Agent | openAgentInterface - Opening single agent:", equippedAgents[0]);
            await this.openSpecificAgent(equippedAgents[0].deviceId);
        } else {
            // If multiple equipped agents, show selection menu
            console.log("Cyberpunk Agent | openAgentInterface - Showing menu for multiple agents:", equippedAgents);
            await this.showEquippedAgentMenu(equippedAgents);
        }
    }

    /**
     * Show the agent home screen
     */
    async showAgentHome(device) {
        console.log("Cyberpunk Agent | Attempting to show agent home for device:", device);
        console.log("Cyberpunk Agent | Device ID:", device?.id);
        console.log("Cyberpunk Agent | Device Name:", device?.deviceName);
        console.log("Cyberpunk Agent | AgentApplication available:", typeof AgentApplication);
        console.log("Cyberpunk Agent | Window AgentApplication:", typeof window.AgentApplication);

        // Check if classes are loaded
        if (typeof AgentApplication === 'undefined' && typeof window.AgentApplication === 'undefined') {
            console.error("Cyberpunk Agent | AgentApplication is not defined!");
            console.log("Cyberpunk Agent | Available global objects:", Object.keys(window).filter(key => key.includes('Agent')));

            // Try to reload the module
            ui.notifications.warn("Recarregando módulo Cyberpunk Agent...");
            game.modules.get('cyberpunk-agent').api?.reload?.();

            ui.notifications.error("Erro ao carregar a interface do Agent. Tente recarregar a página (F5).");
            return;
        }

        try {
            // Load device-specific messages before opening the interface
            console.log("Cyberpunk Agent | Loading messages for device:", device.id);
            await this.loadMessagesForDevice(device.id);

            // Synchronize messages with server to get any new messages from other clients
            console.log("Cyberpunk Agent | Synchronizing messages with server for device:", device.id);
            await this.synchronizeMessagesWithServer(device.id);

            console.log("Cyberpunk Agent | Creating AgentApplication instance...");
            const AgentClass = AgentApplication || window.AgentApplication;
            const agentApp = new AgentClass(device);
            console.log("Cyberpunk Agent | AgentApplication instance created successfully");

            // Play opening sound effect
            this.playSoundEffect('opening-window');

            // Render the application
            agentApp.render(true);
        } catch (error) {
            console.error("Cyberpunk Agent | Error creating AgentApplication:", error);
            ui.notifications.error("Erro ao criar a interface do Agent: " + error.message);
        }
    }

    /**
     * Synchronize messages with server to get any new messages from other clients
     * This ensures that when an agent is opened, it receives all messages that may have been sent
     * by other clients while the agent was closed
     */
    async synchronizeMessagesWithServer(actorId) {
        try {
            console.log("Cyberpunk Agent | Starting message synchronization for actor:", actorId);

            // Only synchronize if there are multiple users and SocketLib is available
            if (!this._needsCrossClientCommunication()) {
                console.log("Cyberpunk Agent | Single user session, skipping message synchronization");
                return;
            }

            if (!this._isSocketLibAvailable()) {
                console.log("Cyberpunk Agent | SocketLib not available, skipping message synchronization");
                return;
            }

            // Get all users in the session
            const users = Array.from(game.users.values()).filter(user => user.active);
            console.log("Cyberpunk Agent | Active users for synchronization:", users.map(u => u.name));

            // Request message synchronization from all other users
            const syncPromises = users
                .filter(user => user.id !== game.user.id) // Exclude current user
                .map(async (user) => {
                    try {
                        console.log(`Cyberpunk Agent | Requesting message sync from user: ${user.name}`);

                        const syncData = {
                            requestingUserId: game.user.id,
                            requestingUserName: game.user.name,
                            actorId: actorId,
                            timestamp: Date.now()
                        };

                        // Send sync request to specific user
                        const success = await this.socketLibIntegration.sendMessageToUser(
                            user.id,
                            'requestMessageSync',
                            syncData
                        );

                        if (success) {
                            console.log(`Cyberpunk Agent | Message sync request sent to ${user.name}`);
                            return { user: user.name, success: true };
                        } else {
                            console.warn(`Cyberpunk Agent | Failed to send sync request to ${user.name}`);
                            return { user: user.name, success: false };
                        }
                    } catch (error) {
                        console.error(`Cyberpunk Agent | Error requesting sync from ${user.name}:`, error);
                        return { user: user.name, success: false, error: error.message };
                    }
                });

            // Wait for all sync requests to complete
            const syncResults = await Promise.all(syncPromises);

            const successfulSyncs = syncResults.filter(result => result.success);
            const failedSyncs = syncResults.filter(result => !result.success);

            console.log("Cyberpunk Agent | Message synchronization results:", {
                successful: successfulSyncs.length,
                failed: failedSyncs.length,
                total: syncResults.length
            });

            if (successfulSyncs.length > 0) {
                console.log("Cyberpunk Agent | Message synchronization completed successfully");
                ui.notifications.info(`Sincronização de mensagens concluída com ${successfulSyncs.length} usuário(s)`);
            }

            if (failedSyncs.length > 0) {
                console.warn("Cyberpunk Agent | Some message sync requests failed:", failedSyncs);
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error during message synchronization:", error);
            // Don't show error notification to user as this is a background sync operation
        }
    }

    /**
     * Handle message synchronization request from other clients
     * This function is called when another client requests our messages for synchronization
     */
    async handleMessageSyncRequest(data) {
        try {
            console.log("Cyberpunk Agent | Received message sync request from:", data.requestingUserName);

            // Prevent processing our own requests
            if (data.requestingUserId === game.user.id) {
                console.log("Cyberpunk Agent | Ignoring own message sync request");
                return;
            }

            // Check if this is a recent request to avoid duplicates
            const now = Date.now();
            const timeDiff = now - data.timestamp;
            if (timeDiff > 30000) { // Ignore requests older than 30 seconds
                console.log("Cyberpunk Agent | Ignoring old message sync request (age:", timeDiff, "ms)");
                return;
            }

            const actorId = data.actorId;
            console.log("Cyberpunk Agent | Processing message sync request for actor:", actorId);

            // Get all messages for the requested actor from our local storage
            const userActors = this.getUserActors();
            const hasAccessToActor = userActors.some(actor => actor.id === actorId);

            if (!hasAccessToActor) {
                console.log("Cyberpunk Agent | User doesn't have access to actor:", actorId);
                return;
            }

            // Collect all messages for this actor
            const messagesToSync = [];

            // Get messages from localStorage for this user and actor
            const storageKey = `cyberpunk-agent-messages-${game.user.id}-${actorId}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                try {
                    const messagesData = JSON.parse(storedData);

                    // Convert messages to sync format
                    Object.entries(messagesData).forEach(([conversationKey, conversation]) => {
                        if (Array.isArray(conversation)) {
                            conversation.forEach(message => {
                                // Only include messages that are not older than 24 hours
                                const messageAge = now - message.timestamp;
                                if (messageAge < 24 * 60 * 60 * 1000) { // 24 hours
                                    messagesToSync.push({
                                        conversationKey: conversationKey,
                                        message: message
                                    });
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error("Cyberpunk Agent | Error parsing stored messages for sync:", error);
                }
            }

            console.log(`Cyberpunk Agent | Sending ${messagesToSync.length} messages for synchronization`);

            // Send the messages back to the requesting user
            if (messagesToSync.length > 0) {
                const syncResponseData = {
                    respondingUserId: game.user.id,
                    respondingUserName: game.user.name,
                    requestingUserId: data.requestingUserId,
                    actorId: actorId,
                    messages: messagesToSync,
                    timestamp: Date.now()
                };

                const success = await this.socketLibIntegration.sendMessageToUser(
                    data.requestingUserId,
                    'messageSyncResponse',
                    syncResponseData
                );

                if (success) {
                    console.log("Cyberpunk Agent | Message sync response sent successfully");
                } else {
                    console.error("Cyberpunk Agent | Failed to send message sync response");
                }
            } else {
                console.log("Cyberpunk Agent | No messages to sync");
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error handling message sync request:", error);
        }
    }

    /**
     * Handle message synchronization response from other clients
     * This function is called when another client responds to our sync request
     */
    async handleMessageSyncResponse(data) {
        try {
            console.log("Cyberpunk Agent | Received message sync response from:", data.respondingUserName);

            // Check if this response is for us
            if (data.requestingUserId !== game.user.id) {
                console.log("Cyberpunk Agent | Message sync response not for us, ignoring");
                return;
            }

            // Check if this is a recent response to avoid duplicates
            const now = Date.now();
            const timeDiff = now - data.timestamp;
            if (timeDiff > 30000) { // Ignore responses older than 30 seconds
                console.log("Cyberpunk Agent | Ignoring old message sync response (age:", timeDiff, "ms)");
                return;
            }

            const actorId = data.actorId;
            const messages = data.messages || [];

            console.log(`Cyberpunk Agent | Processing ${messages.length} synchronized messages for actor:`, actorId);

            let newMessagesCount = 0;

            // Process each synchronized message
            for (const syncData of messages) {
                try {
                    const { conversationKey, message } = syncData;

                    // Get or create conversation
                    if (!this.messages.has(conversationKey)) {
                        this.messages.set(conversationKey, []);
                    }

                    const conversation = this.messages.get(conversationKey);

                    // Check if message already exists to avoid duplicates
                    const messageExists = conversation.some(msg => msg.id === message.id);
                    if (!messageExists) {
                        // Add the message
                        conversation.push(message);
                        newMessagesCount++;

                        console.log("Cyberpunk Agent | Added synchronized message:", message.id);
                    } else {
                        console.log("Cyberpunk Agent | Synchronized message already exists, skipping:", message.id);
                    }
                } catch (error) {
                    console.error("Cyberpunk Agent | Error processing synchronized message:", error);
                }
            }

            // Save the updated messages
            if (newMessagesCount > 0) {
                await this.saveMessagesForActor(actorId);
                console.log(`Cyberpunk Agent | Saved ${newMessagesCount} new synchronized messages for actor:`, actorId);

                // Update interfaces to show new messages
                this._updateChatInterfacesImmediately();
                this.updateOpenInterfaces();

                // Show notification to user
                ui.notifications.info(`Recebidas ${newMessagesCount} nova(s) mensagem(ns) sincronizada(s)`);
            } else {
                console.log("Cyberpunk Agent | No new messages found during synchronization");
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error handling message sync response:", error);
        }
    }



    /**
     * Load device data from game settings
     */
    loadDeviceData() {
        try {
            console.log("Cyberpunk Agent | Loading device data...");

            // Load devices and mappings from game settings
            const deviceData = game.settings.get('cyberpunk-agent', 'device-data') || {};
            console.log("Cyberpunk Agent | Raw device data from settings:", deviceData);

            // Clear existing data
            this.devices.clear();
            this.deviceMappings.clear();

            // Load devices
            if (deviceData.devices) {
                Object.entries(deviceData.devices).forEach(([deviceId, deviceInfo]) => {
                    this.devices.set(deviceId, deviceInfo);
                });
                console.log(`Cyberpunk Agent | Loaded ${this.devices.size} devices`);
            } else {
                console.log("Cyberpunk Agent | No devices found in device data");
            }

            // Load device mappings
            if (deviceData.deviceMappings) {
                Object.entries(deviceData.deviceMappings).forEach(([actorId, deviceIds]) => {
                    this.deviceMappings.set(actorId, deviceIds);
                });
                console.log(`Cyberpunk Agent | Loaded ${this.deviceMappings.size} device mappings`);
            } else {
                console.log("Cyberpunk Agent | No device mappings found in device data");
            }

            console.log("Cyberpunk Agent | Device data loaded successfully");
            console.log("Cyberpunk Agent | Final this.devices.size:", this.devices.size);
            console.log("Cyberpunk Agent | Final this.deviceMappings.size:", this.deviceMappings.size);

            // Load phone number data
            this.loadPhoneNumberData();
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading device data:", error);
        }
    }

    /**
     * Save device data to game settings
     */
    async saveDeviceData() {
        try {
            console.log("Cyberpunk Agent | Saving device data...");

            // Convert Maps to objects for storage
            const devicesObject = Object.fromEntries(this.devices);
            const mappingsObject = Object.fromEntries(this.deviceMappings);

            const deviceData = {
                devices: devicesObject,
                deviceMappings: mappingsObject
            };

            // If user is GM, save directly
            if (game.user.isGM) {
                game.settings.set('cyberpunk-agent', 'device-data', deviceData);
                console.log(`Cyberpunk Agent | GM saved ${this.devices.size} devices and ${this.deviceMappings.size} mappings`);
                return;
            }

            // If user is not GM, request GM to save via SocketLib
            console.log("Cyberpunk Agent | Non-GM user, requesting GM to save device data");

            if (this._isSocketLibAvailable() && this.socketLibIntegration) {
                const success = await this.socketLibIntegration.requestGMDeviceDataSave(deviceData);
                if (success) {
                    console.log("Cyberpunk Agent | Device data save request sent to GM successfully");
                    ui.notifications.info("Device data save request sent to GM");
                } else {
                    console.warn("Cyberpunk Agent | Failed to send device data save request to GM");
                    ui.notifications.warn("Failed to send device data save request to GM");
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available, cannot request GM save");
                ui.notifications.warn("Cannot save device data - GM action required");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving device data:", error);
        }
    }



    /**
     * Save messages to settings
     */
    /**
     * Save messages to localStorage (all users)
     */
    async saveMessages() {
        try {
            const messagesObject = Object.fromEntries(this.messages);
            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;

            localStorage.setItem(storageKey, JSON.stringify(messagesObject));
            console.log("Cyberpunk Agent | Messages saved to localStorage for user:", game.user.name);

        } catch (error) {
            console.error("Cyberpunk Agent | Error saving messages:", error);
        }
    }

    /**
     * Save messages for a specific actor
     */
    async saveMessagesForActor(actorId) {
        try {
            const userId = game.user.id;
            const actorMessages = new Map();

            // Filter messages that involve this actor
            for (const [conversationKey, messages] of this.messages.entries()) {
                if (conversationKey.includes(actorId)) {
                    actorMessages.set(conversationKey, messages);
                }
            }

            const messagesObject = Object.fromEntries(actorMessages);
            const storageKey = `cyberpunk-agent-messages-${userId}-${actorId}`;

            localStorage.setItem(storageKey, JSON.stringify(messagesObject));
            console.log(`Cyberpunk Agent | Messages saved to localStorage for user ${game.user.name} and actor ${actorId}`);

        } catch (error) {
            console.error("Cyberpunk Agent | Error saving messages for actor:", error);
        }
    }

    /**
     * Load messages from localStorage (all users)
     */
    async loadMessages() {
        try {
            let messagesData = {};
            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;

            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                try {
                    messagesData = JSON.parse(storedData);
                    console.log("Cyberpunk Agent | Messages loaded from localStorage for user:", game.user.name);
                } catch (error) {
                    console.error("Cyberpunk Agent | Error parsing localStorage messages:", error);
                }
            }

            this.messages.clear();
            Object.entries(messagesData).forEach(([conversationKey, conversation]) => {
                this.messages.set(conversationKey, conversation);
            });

            console.log("Cyberpunk Agent | Messages loaded successfully");
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading messages:", error);
        }
    }

    /**
     * Load messages for a specific device
     */
    async loadMessagesForDevice(deviceId) {
        try {
            const storageKey = `cyberpunk-agent-messages-${game.user.id}-${deviceId}`;
            const storedMessages = localStorage.getItem(storageKey);

            if (storedMessages) {
                const messages = JSON.parse(storedMessages);
                this.messages.set(deviceId, messages);
                console.log(`Cyberpunk Agent | Loaded ${messages.length} messages for device ${deviceId}`);
            } else {
                this.messages.set(deviceId, []);
                console.log(`Cyberpunk Agent | No messages found for device ${deviceId}, initialized empty array`);
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error loading messages for device ${deviceId}:`, error);
            this.messages.set(deviceId, []);
        }
    }

    /**
     * Save messages for a specific device
     */
    async saveMessagesForDevice(deviceId) {
        try {
            const messages = this.messages.get(deviceId) || [];
            const storageKey = `cyberpunk-agent-messages-${game.user.id}-${deviceId}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
            console.log(`Cyberpunk Agent | Saved ${messages.length} messages for device ${deviceId}`);
        } catch (error) {
            console.error(`Cyberpunk Agent | Error saving messages for device ${deviceId}:`, error);
        }
    }

    /**
     * Synchronize messages with server for a specific device
     */
    async synchronizeMessagesWithServer(deviceId) {
        // This method would handle cross-client synchronization for the device
        // For now, it's a placeholder that can be expanded later
        console.log(`Cyberpunk Agent | Synchronizing messages for device ${deviceId}`);
    }

    /**
     * Get conversation key for two device IDs
     */
    _getDeviceConversationKey(deviceId1, deviceId2) {
        // Sort device IDs to ensure consistent conversation key
        const sortedIds = [deviceId1, deviceId2].sort();
        return `${sortedIds[0]}-${sortedIds[1]}`;
    }

    /**
     * Get messages for a conversation between two devices
     */
    getMessagesForDeviceConversation(deviceId1, deviceId2) {
        const conversationKey = this._getDeviceConversationKey(deviceId1, deviceId2);
        return this.messages.get(conversationKey) || [];
    }

    /**
     * Get contacts for a specific device
     */
    getContactsForDevice(deviceId) {
        const device = this.devices.get(deviceId);
        return device?.contacts || [];
    }

    /**
     * Get anonymous contacts for a device
     */
    getAnonymousContactsForDevice(deviceId) {
        // For now, return an empty array since anonymous contacts are not implemented in the device system
        // This can be expanded later if needed
        return [];
    }

    /**
     * Add a contact to a device by phone number
     * @param {string} deviceId - The device ID to add contact to
     * @param {string} phoneNumber - The phone number to add
     * @returns {object} Result object with success status and message
     */
    addContactByPhoneNumber(deviceId, phoneNumber) {
        try {
            // Normalize phone number format
            const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

            // Check if phone number exists in the system
            const contactDeviceId = this.getDeviceIdFromPhoneNumber(normalizedPhone);
            if (!contactDeviceId) {
                const displayNumber = this.formatPhoneNumberForDisplay(normalizedPhone) || phoneNumber;
                return {
                    success: false,
                    message: `Nenhum contato encontrado para o número ${displayNumber}`
                };
            }

            // Check if trying to add self
            if (contactDeviceId === deviceId) {
                return {
                    success: false,
                    message: "Você não pode adicionar seu próprio número aos contatos"
                };
            }

            // Add contact to the device
            const added = this.addContactToDevice(deviceId, contactDeviceId);
            if (added) {
                // Add reciprocal contact (add the current device to the contact's list)
                this.addContactToDevice(contactDeviceId, deviceId);

                // Notify real-time updates
                this.notifyContactUpdate({
                    action: 'add',
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId,
                    phoneNumber: normalizedPhone
                });

                return {
                    success: true,
                    message: `Contato adicionado com sucesso!`,
                    contactDeviceId: contactDeviceId
                };
            } else {
                return {
                    success: false,
                    message: "Contato já existe na lista"
                };
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error adding contact by phone number:`, error);
            return {
                success: false,
                message: "Erro ao adicionar contato"
            };
        }
    }

    /**
     * Normalize phone number format
     * @param {string} phoneNumber - The phone number to normalize
     * @returns {string} Normalized phone number
     */
    normalizePhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');

        // If it's 10 digits, add 1 prefix
        if (digits.length === 10) {
            return `1${digits}`;
        }

        // If it's 11 digits and starts with 1, return as is
        if (digits.length === 11 && digits.startsWith('1')) {
            return digits;
        }

        // Return as is if it doesn't match expected patterns
        return phoneNumber;
    }

    /**
     * Add a contact to a device
     */
    async addContactToDevice(deviceId, contactDeviceId) {
        try {
            const device = this.devices.get(deviceId);
            if (!device) {
                console.error(`Cyberpunk Agent | Device ${deviceId} not found`);
                return false;
            }

            if (!device.contacts) {
                device.contacts = [];
            }

            if (!device.contacts.includes(contactDeviceId)) {
                device.contacts.push(contactDeviceId);
                console.log(`Cyberpunk Agent | Added contact ${contactDeviceId} to device ${deviceId}`);
                await this.saveDeviceData();
                return true;
            } else {
                console.log(`Cyberpunk Agent | Contact ${contactDeviceId} already exists in device ${deviceId}`);
                return false;
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error adding contact to device:`, error);
            return false;
        }
    }

    /**
     * Remove a contact from a device
     * Note: This only removes the contact from this device's list, not from the other device's list
     */
    async removeContactFromDevice(deviceId, contactDeviceId) {
        try {
            const device = this.devices.get(deviceId);
            if (!device) {
                console.error(`Cyberpunk Agent | Device ${deviceId} not found`);
                return false;
            }

            if (!device.contacts) {
                return false;
            }

            const index = device.contacts.indexOf(contactDeviceId);
            if (index > -1) {
                device.contacts.splice(index, 1);
                console.log(`Cyberpunk Agent | Removed contact ${contactDeviceId} from device ${deviceId}`);
                await this.saveDeviceData();

                // Notify real-time updates
                this.notifyContactUpdate({
                    action: 'remove',
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId
                });

                return true;
            } else {
                console.log(`Cyberpunk Agent | Contact ${contactDeviceId} not found in device ${deviceId}`);
                return false;
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error removing contact from device:`, error);
            return false;
        }
    }

    /**
     * Check if a device is a contact of another device
     * @param {string} deviceId - The device to check
     * @param {string} contactDeviceId - The potential contact device
     * @returns {boolean} True if the contact exists
     */
    isDeviceContact(deviceId, contactDeviceId) {
        const device = this.devices.get(deviceId);
        return device && device.contacts && device.contacts.includes(contactDeviceId);
    }

    /**
     * Load messages for a specific actor from localStorage
     */
    async loadMessagesForActor(actorId) {
        try {
            const userId = game.user.id;
            const storageKey = `cyberpunk-agent-messages-${userId}-${actorId}`;
            let messagesData = {};

            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                try {
                    messagesData = JSON.parse(storedData);
                    console.log(`Cyberpunk Agent | Messages loaded from localStorage for user ${game.user.name} and actor ${actorId}`);
                } catch (error) {
                    console.error("Cyberpunk Agent | Error parsing localStorage messages for actor:", error);
                }
            }

            // Load actor-specific messages into the main messages map
            Object.entries(messagesData).forEach(([conversationKey, conversation]) => {
                this.messages.set(conversationKey, conversation);
            });

            console.log(`Cyberpunk Agent | Messages loaded successfully for actor ${actorId}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading messages for actor:", error);
        }
    }

    /**
     * Send save request via chat message
     */
    async _sendSaveRequestViaSocketLib(messagesObject) {
        console.log("Cyberpunk Agent | Sending save request via SocketLib");

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            return false; // Return false if SocketLib is not available
        }

        try {
            const success = await this.socketLibIntegration.sendMessageToGM('saveMessages', {
                messages: messagesObject,
                userId: game.user.id,
                userName: game.user.name,
                timestamp: Date.now()
            });

            if (success) {
                console.log("Cyberpunk Agent | Save request sent via SocketLib successfully");
                return true;
            } else {
                console.warn("Cyberpunk Agent | SocketLib save request failed");
                return false;
            }
        } catch (error) {
            console.warn("Cyberpunk Agent | SocketLib save request error:", error);
            return false;
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

        // Mark messages as own/other based on sender (localStorage only)
        return conversation.map(message => ({
            ...message,
            isOwn: message.senderId === actorId1
        }));
    }

    /**
     * Mark a conversation as read (when user opens the chat)
     */
    markConversationAsRead(actorId1, actorId2) {
        const conversationKey = this._getConversationKey(actorId1, actorId2);
        const now = Date.now();

        console.log(`Cyberpunk Agent | Marking conversation ${conversationKey} as read for actor ${actorId1}`);

        // Update the last read timestamp
        this.lastReadTimestamps.set(conversationKey, now);

        // Mark all messages in this conversation as read
        if (this.messages.has(conversationKey)) {
            const conversation = this.messages.get(conversationKey);
            let hasChanges = false;

            conversation.forEach(message => {
                // Mark message as read if the current user is the receiver
                if (message.receiverId === actorId1 && !message.read) {
                    message.read = true;
                    hasChanges = true;
                    console.log(`Cyberpunk Agent | Marked message ${message.id} as read`);
                }
            });

            // Save messages if there were changes
            if (hasChanges) {
                this.saveMessages();
                console.log(`Cyberpunk Agent | Marked messages in conversation ${conversationKey} as read`);
            } else {
                console.log(`Cyberpunk Agent | No messages to mark as read in conversation ${conversationKey}`);
            }
        } else {
            console.log(`Cyberpunk Agent | No conversation found for key ${conversationKey}`);
        }

        // Clear the unread count cache for this conversation
        this.unreadCounts.delete(conversationKey);
        console.log(`Cyberpunk Agent | Cleared unread count cache for conversation ${conversationKey}`);

        // Save the read timestamps to settings
        this._saveReadTimestamps();

        // Force immediate UI updates using multiple strategies
        console.log("Cyberpunk Agent | Triggering immediate UI updates for conversation read");

        // Strategy 1: Use UI Controller if available
        if (window.CyberpunkAgentUIController) {
            const conversationComponentId = `agent-conversation-${actorId1}-${actorId2}`;
            const reverseConversationComponentId = `agent-conversation-${actorId2}-${actorId1}`;
            const chat7ComponentIds = [
                `agent-chat7-${actorId1}`,
                `agent-chat7-${actorId2}`
            ];

            // Mark conversation components as dirty
            window.CyberpunkAgentUIController.markDirtyMultiple([
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);

            console.log("Cyberpunk Agent | Marked components as dirty via UI Controller for conversation read:", [
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);
        }

        // Strategy 2: Force Chat7 interfaces to refresh unread counts specifically
        this._forceChat7UnreadCountUpdate(actorId1, actorId2);

        // Strategy 3: Dispatch custom event for backward compatibility
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                timestamp: Date.now(),
                type: 'conversationRead',
                actorId1: actorId1,
                actorId2: actorId2
            }
        }));

        console.log(`Cyberpunk Agent | Marked conversation ${conversationKey} as read at ${new Date(now).toISOString()}`);
    }

    /**
     * Mark a conversation between two devices as read
     */
    markDeviceConversationAsRead(deviceId1, deviceId2) {
        const conversationKey = this._getDeviceConversationKey(deviceId1, deviceId2);
        const now = Date.now();

        console.log(`Cyberpunk Agent | Marking device conversation ${conversationKey} as read for device ${deviceId1}`);

        // Update the last read timestamp
        this.lastReadTimestamps.set(conversationKey, now);

        // Mark all messages in this conversation as read
        if (this.messages.has(conversationKey)) {
            const conversation = this.messages.get(conversationKey);
            let hasChanges = false;

            conversation.forEach(message => {
                // Mark message as read if the current user is the receiver
                if (message.receiverId === deviceId1 && !message.read) {
                    message.read = true;
                    hasChanges = true;
                    console.log(`Cyberpunk Agent | Marked device message ${message.id} as read`);
                }
            });

            // Save messages if there were changes
            if (hasChanges) {
                this.saveMessages();
                console.log(`Cyberpunk Agent | Marked device messages in conversation ${conversationKey} as read`);
            } else {
                console.log(`Cyberpunk Agent | No device messages to mark as read in conversation ${conversationKey}`);
            }
        } else {
            console.log(`Cyberpunk Agent | No device conversation found for key ${conversationKey}`);
        }

        // Clear the unread count cache for this conversation
        this.unreadCounts.delete(conversationKey);
        console.log(`Cyberpunk Agent | Cleared unread count cache for device conversation ${conversationKey}`);

        // Save the read timestamps to settings
        this._saveReadTimestamps();

        // Force immediate UI updates using multiple strategies
        console.log("Cyberpunk Agent | Triggering immediate UI updates for device conversation read");

        // Strategy 1: Use UI Controller if available
        if (window.CyberpunkAgentUIController) {
            const conversationComponentId = `agent-conversation-${deviceId1}-${deviceId2}`;
            const reverseConversationComponentId = `agent-conversation-${deviceId2}-${deviceId1}`;
            const chat7ComponentIds = [
                `agent-chat7-${deviceId1}`,
                `agent-chat7-${deviceId2}`
            ];

            // Mark conversation components as dirty
            window.CyberpunkAgentUIController.markDirtyMultiple([
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);

            console.log("Cyberpunk Agent | Marked device components as dirty via UI Controller for conversation read:", [
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);
        }

        // Strategy 2: Force Chat7 interfaces to refresh unread counts specifically
        this._forceChat7UnreadCountUpdate(deviceId1, deviceId2);

        // Strategy 3: Dispatch custom event for backward compatibility
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                timestamp: Date.now(),
                type: 'deviceConversationRead',
                deviceId1: deviceId1,
                deviceId2: deviceId2
            }
        }));

        console.log(`Cyberpunk Agent | Marked device conversation ${conversationKey} as read at ${new Date(now).toISOString()}`);
    }

    /**
     * Get unread message count for a conversation
     */
    getUnreadCount(actorId1, actorId2) {
        const conversationKey = this._getConversationKey(actorId1, actorId2);

        // Check cache first
        if (this.unreadCounts.has(conversationKey)) {
            const cachedCount = this.unreadCounts.get(conversationKey);
            console.log(`Cyberpunk Agent | Using cached unread count for ${conversationKey}: ${cachedCount}`);
            return cachedCount;
        }

        // Get all messages for this conversation
        const messages = this.getMessagesForConversation(actorId1, actorId2);

        // Count messages that are unread for the current user
        const unreadCount = messages.filter(message =>
            message.receiverId === actorId1 &&
            !message.read
        ).length;

        // Cache the result
        this.unreadCounts.set(conversationKey, unreadCount);

        console.log(`Cyberpunk Agent | Calculated unread count for ${conversationKey}: ${unreadCount} (${messages.length} total messages)`);

        return unreadCount;
    }

    /**
     * Get unread counts for all contacts of an actor
     */
    getUnreadCountsForActor(actorId) {
        const unreadCounts = {};

        // Get all contacts for this actor
        const contacts = this.getContactsForActor(actorId);

        // Calculate unread count for each contact
        contacts.forEach(contact => {
            const unreadCount = this.getUnreadCount(actorId, contact.id);
            if (unreadCount > 0) {
                unreadCounts[contact.id] = unreadCount;
            }
        });

        return unreadCounts;
    }

    /**
     * Save read timestamps to settings
     */
    _saveReadTimestamps() {
        try {
            const timestampsData = {};
            this.lastReadTimestamps.forEach((timestamp, conversationKey) => {
                timestampsData[conversationKey] = timestamp;
            });

            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(timestampsData));
            console.log("Cyberpunk Agent | Read timestamps saved to localStorage for user:", game.user.name);
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving read timestamps to localStorage:", error);
        }
    }

    /**
     * Load read timestamps from settings
     */
    _loadReadTimestamps() {
        try {
            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                const timestampsData = JSON.parse(storedData);
                this.lastReadTimestamps.clear();
                Object.entries(timestampsData).forEach(([conversationKey, timestamp]) => {
                    this.lastReadTimestamps.set(conversationKey, timestamp);
                });
                console.log("Cyberpunk Agent | Read timestamps loaded from localStorage for user:", game.user.name);
            } else {
                console.log("Cyberpunk Agent | No read timestamps found in localStorage for user:", game.user.name);
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading read timestamps from localStorage:", error);
        }
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
            }),
            read: false // New message is always unread
        };

        conversation.push(message);

        // Save messages for both sender and receiver actors
        await this.saveMessagesForActor(senderId);
        if (senderId !== receiverId) {
            await this.saveMessagesForActor(receiverId);
        }

        // Clear unread count cache for this conversation
        this.unreadCounts.delete(this._getConversationKey(senderId, receiverId));

        // Foundry chat integration removed - using SocketLib only

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            // Don't return false here since SocketLib might still be working
            // The availability check was too strict
        } else {
            // Send message via SocketLib
            try {
                console.log("Cyberpunk Agent | Sending message via SocketLib");
                const success = await this.socketLibIntegration.sendMessage(senderId, receiverId, text.trim(), messageId);
                if (success) {
                    console.log("Cyberpunk Agent | Message sent successfully via SocketLib");
                } else {
                    console.warn("Cyberpunk Agent | SocketLib message sending failed, but message was saved locally");
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib message sending error, but message was saved locally:", error);
            }
        }

        // Update local interfaces immediately for better UX (only once)
        this._updateChatInterfacesImmediately();

        console.log("Cyberpunk Agent | Message sent:", message);
        return true;
    }

    /**
     * Send a message from one device to another
     */
    async sendDeviceMessage(senderDeviceId, receiverDeviceId, text) {
        if (!text || !text.trim()) {
            return false;
        }

        // Check if receiver is in sender's contacts, if not, add them
        if (!this.isDeviceContact(senderDeviceId, receiverDeviceId)) {
            console.log(`Cyberpunk Agent | Adding ${receiverDeviceId} to ${senderDeviceId} contacts automatically`);
            this.addContactToDevice(senderDeviceId, receiverDeviceId);
        }

        // Check if sender is in receiver's contacts, if not, add them
        if (!this.isDeviceContact(receiverDeviceId, senderDeviceId)) {
            console.log(`Cyberpunk Agent | Adding ${senderDeviceId} to ${receiverDeviceId} contacts automatically`);
            this.addContactToDevice(receiverDeviceId, senderDeviceId);

            // Notify real-time updates for the receiver
            this.notifyContactUpdate({
                action: 'auto-add',
                deviceId: receiverDeviceId,
                contactDeviceId: senderDeviceId,
                reason: 'message-received'
            });
        }

        const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);

        if (!this.messages.has(conversationKey)) {
            this.messages.set(conversationKey, []);
        }

        const conversation = this.messages.get(conversationKey);
        const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const message = {
            id: messageId,
            senderId: senderDeviceId,
            receiverId: receiverDeviceId,
            text: text.trim(),
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            read: false // New message is always unread
        };

        conversation.push(message);

        // Save messages for both sender and receiver devices
        await this.saveMessagesForDevice(senderDeviceId);
        if (senderDeviceId !== receiverDeviceId) {
            await this.saveMessagesForDevice(receiverDeviceId);
        }

        // Clear unread count cache for this conversation
        this.unreadCounts.delete(this._getDeviceConversationKey(senderDeviceId, receiverDeviceId));

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            // Don't return false here since SocketLib might still be working
            // The availability check was too strict
        } else {
            // Send message via SocketLib
            try {
                console.log("Cyberpunk Agent | Sending device message via SocketLib");
                const success = await this.socketLibIntegration.sendMessage(senderDeviceId, receiverDeviceId, text.trim(), messageId);
                if (success) {
                    console.log("Cyberpunk Agent | Device message sent successfully via SocketLib");
                } else {
                    console.warn("Cyberpunk Agent | SocketLib device message sending failed, but message was saved locally");
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib device message sending error, but message was saved locally:", error);
            }
        }

        // Update local interfaces immediately for better UX (only once)
        this._updateChatInterfacesImmediately();

        console.log("Cyberpunk Agent | Device message sent:", message);
        return true;
    }

    /**
     * Create a FoundryVTT chat message for real chat integration
     * This serves only as a notification - deleting these messages should not affect Chat7 state
     */
    // Foundry chat message creation methods removed - using SocketLib only

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
    // Foundry chat sync methods removed - using SocketLib only

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
    /**
     * Generate a deterministic phone number from an agent key
     * @param {string} agentKey - The agent key to generate phone number from
     * @returns {string} Phone number in US format +1 (XXX) XXX-XXXX
     */
    async generatePhoneNumberFromKey(agentKey) {
        // Create a hash from the agent key for deterministic generation
        let hash = 0;
        for (let i = 0; i < agentKey.length; i++) {
            const char = agentKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Use the hash to generate consistent area code, prefix, and line number
        const areaCode = Math.abs(hash % 900) + 100; // 100-999
        const prefix = Math.abs((hash >> 8) % 900) + 100; // 100-999
        const lineNumber = Math.abs((hash >> 16) % 9000) + 1000; // 1000-9999

        // Return unformatted number (e.g., "14152120002")
        return `1${areaCode}${prefix}${lineNumber}`;
    }

    /**
     * Generate a random phone number (legacy function)
     */
    _generateRandomPhoneNumber() {
        // Format: (XXX) XXX-XXXX
        const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
        const prefix = Math.floor(Math.random() * 900) + 100;   // 100-999
        const lineNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

        return `(${areaCode}) ${prefix}-${lineNumber}`;
    }

    /**
     * Format phone number for display
     * @param {string} phoneNumber - Unformatted phone number (e.g., "14152120002")
     * @returns {string} Formatted phone number (e.g., "+1 (415) 212-0002")
     */
    formatPhoneNumberForDisplay(phoneNumber) {
        if (!phoneNumber || phoneNumber.length !== 11) {
            return phoneNumber;
        }

        // Format: +1 (XXX) XXX-XXXX
        const areaCode = phoneNumber.substring(1, 4);
        const prefix = phoneNumber.substring(4, 7);
        const lineNumber = phoneNumber.substring(7);

        return `+1 (${areaCode}) ${prefix}-${lineNumber}`;
    }

    /**
     * Get or generate phone number for a device
     * @param {string} deviceId - The device ID
     * @returns {string} Phone number for the device (unformatted)
     */
    async getDevicePhoneNumber(deviceId) {
        // Check if device already has a phone number
        if (this.devicePhoneNumbers.has(deviceId)) {
            return this.devicePhoneNumbers.get(deviceId);
        }

        // Generate phone number from device ID
        const phoneNumber = await this.generatePhoneNumberFromKey(deviceId);

        // Store the mapping
        this.devicePhoneNumbers.set(deviceId, phoneNumber);
        this.phoneNumberDictionary.set(phoneNumber, deviceId);

        // Save the phone number data
        await this.savePhoneNumberData();

        return phoneNumber;
    }

    /**
     * Get device ID from phone number
     * @param {string} phoneNumber - The phone number to look up
     * @returns {string|null} Device ID or null if not found
     */
    getDeviceIdFromPhoneNumber(phoneNumber) {
        return this.phoneNumberDictionary.get(phoneNumber) || null;
    }

    /**
     * Check if a phone number exists in the system
     * @param {string} phoneNumber - The phone number to check
     * @returns {boolean} True if the phone number exists
     */
    phoneNumberExists(phoneNumber) {
        return this.phoneNumberDictionary.has(phoneNumber);
    }

    /**
     * Load phone number data from settings
     */
    loadPhoneNumberData() {
        try {
            const phoneData = game.settings.get('cyberpunk-agent', 'phone-number-data') || {};

            // Load phone number dictionary
            if (phoneData.phoneNumberDictionary) {
                Object.entries(phoneData.phoneNumberDictionary).forEach(([phoneNumber, deviceId]) => {
                    this.phoneNumberDictionary.set(phoneNumber, deviceId);
                });
            }

            // Load device phone numbers
            if (phoneData.devicePhoneNumbers) {
                Object.entries(phoneData.devicePhoneNumbers).forEach(([deviceId, phoneNumber]) => {
                    this.devicePhoneNumbers.set(deviceId, phoneNumber);
                });
            }

            console.log(`Cyberpunk Agent | Loaded ${this.phoneNumberDictionary.size} phone number mappings`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading phone number data:", error);
        }
    }

    /**
     * Save phone number data to settings
     */
    async savePhoneNumberData() {
        try {
            const phoneData = {
                phoneNumberDictionary: Object.fromEntries(this.phoneNumberDictionary),
                devicePhoneNumbers: Object.fromEntries(this.devicePhoneNumbers)
            };

            // If user is GM, save directly
            if (game.user.isGM) {
                game.settings.set('cyberpunk-agent', 'phone-number-data', phoneData);
                console.log(`Cyberpunk Agent | GM saved ${this.phoneNumberDictionary.size} phone number mappings`);
                return;
            }

            // If user is not GM, request GM to save via SocketLib
            console.log("Cyberpunk Agent | Non-GM user, requesting GM to save phone number data");

            if (this._isSocketLibAvailable() && this.socketLibIntegration) {
                const success = await this.socketLibIntegration.requestGMPhoneNumberSave(phoneData);
                if (success) {
                    console.log("Cyberpunk Agent | Phone number save request sent to GM successfully");
                    ui.notifications.info("Phone number data save request sent to GM");
                } else {
                    console.warn("Cyberpunk Agent | Failed to send phone number save request to GM");
                    ui.notifications.warn("Failed to send phone number save request to GM");
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available, cannot request GM save");
                ui.notifications.warn("Cannot save phone number data - GM action required");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving phone number data:", error);
        }
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

        // Prevent duplicate notifications for the same message
        const messageKey = `${senderId}-${receiverId}-${message.id}`;
        const now = Date.now();
        if (this._lastMessageNotifications && this._lastMessageNotifications[messageKey] &&
            (now - this._lastMessageNotifications[messageKey]) < 2000) {
            console.log("Cyberpunk Agent | Skipping duplicate message notification");
            return;
        }

        if (!this._lastMessageNotifications) {
            this._lastMessageNotifications = {};
        }
        this._lastMessageNotifications[messageKey] = now;

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            return;
        }

        console.log("Cyberpunk Agent | Sending message notification via SocketLib");

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

        try {
            if (this.socketLibIntegration && this.socketLibIntegration.sendMessageUpdate) {
                const success = await this.socketLibIntegration.sendMessageUpdate(notificationData);
                if (success) {
                    console.log("Cyberpunk Agent | SocketLib message notification sent successfully");
                } else {
                    console.error("Cyberpunk Agent | SocketLib message notification failed");
                    ui.notifications.error("Falha ao enviar notificação de mensagem via SocketLib");
                }
            } else {
                console.error("Cyberpunk Agent | SocketLib integration not available");
                ui.notifications.error("Integração SocketLib não disponível");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | SocketLib message notification failed:", error);
            ui.notifications.error("Erro na comunicação SocketLib: " + error.message);
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
        try {
            const contactNetworks = this.contactNetworks.get(actorId);
            if (!contactNetworks) {
                return [];
            }

            // Contact networks are stored as arrays of contact objects with {id, name, img}
            // Return them directly since they already have the correct structure
            return contactNetworks;
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting contacts for actor:", error);
            return [];
        }
    }

    /**
     * Toggle contact mute status
     */
    toggleContactMute(actorId, contactId) {
        try {
            const userId = game.user.id;

            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            // Load user's mute settings if not already loaded
            if (!this._userMuteSettings.has(userId)) {
                this._loadUserMuteSettings(userId);
            }

            let userMuteSettings = this._userMuteSettings.get(userId);
            if (!userMuteSettings) {
                userMuteSettings = new Map();
                this._userMuteSettings.set(userId, userMuteSettings);
            }

            // Create actor-specific mute key: userId-actorId-contactId
            const muteKey = `${userId}-${actorId}-${contactId}`;
            const currentMuteStatus = userMuteSettings.get(muteKey) || false;
            const newMuteStatus = !currentMuteStatus;

            userMuteSettings.set(muteKey, newMuteStatus);
            this._saveUserMuteSettings(userId, userMuteSettings);

            console.log(`Cyberpunk Agent | Contact ${contactId} ${newMuteStatus ? 'muted' : 'unmuted'} for actor ${actorId} by user ${userId}`);

            // Dispatch custom event for immediate UI updates
            document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
                detail: {
                    timestamp: Date.now(),
                    type: 'contactMuteToggle',
                    actorId: actorId,
                    contactId: contactId,
                    muteStatus: newMuteStatus,
                    userId: game.user.id,
                    userName: game.user.name
                }
            }));

            return newMuteStatus;
        } catch (error) {
            console.error("Cyberpunk Agent | Error toggling contact mute:", error);
            return false;
        }
    }

    /**
     * Toggle contact mute status for a device
     */
    toggleContactMuteForDevice(deviceId, contactDeviceId) {
        try {
            const userId = game.user.id;

            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            // Load user's mute settings if not already loaded
            if (!this._userMuteSettings.has(userId)) {
                this._loadUserMuteSettings(userId);
            }

            let userMuteSettings = this._userMuteSettings.get(userId);
            if (!userMuteSettings) {
                userMuteSettings = new Map();
                this._userMuteSettings.set(userId, userMuteSettings);
            }

            // Create device-specific mute key: userId-deviceId-contactDeviceId
            const muteKey = `${userId}-${deviceId}-${contactDeviceId}`;
            const currentMuteStatus = userMuteSettings.get(muteKey) || false;
            const newMuteStatus = !currentMuteStatus;

            userMuteSettings.set(muteKey, newMuteStatus);
            this._saveUserMuteSettings(userId, userMuteSettings);

            console.log(`Cyberpunk Agent | Device contact ${contactDeviceId} ${newMuteStatus ? 'muted' : 'unmuted'} for device ${deviceId} by user ${userId}`);

            // Dispatch custom event for immediate UI updates
            document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
                detail: {
                    timestamp: Date.now(),
                    type: 'deviceContactMuteToggle',
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId,
                    muteStatus: newMuteStatus,
                    userId: game.user.id,
                    userName: game.user.name
                }
            }));

            return newMuteStatus;
        } catch (error) {
            console.error("Cyberpunk Agent | Error toggling device contact mute:", error);
            return false;
        }
    }

    /**
     * Save user's mute settings to localStorage
     */
    _saveUserMuteSettings(userId, userMuteSettings) {
        try {
            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            // Convert Map to object for localStorage
            const muteData = Object.fromEntries(userMuteSettings);
            localStorage.setItem(`cyberpunk-agent-mutes-${userId}`, JSON.stringify(muteData));

            // Update the in-memory Map
            this._userMuteSettings.set(userId, userMuteSettings);
        } catch (error) {
            console.warn("Cyberpunk Agent | Error saving user mute settings:", error);
        }
    }

    /**
     * Load user's mute settings from localStorage
     */
    _loadUserMuteSettings(userId) {
        try {
            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            const muteData = localStorage.getItem(`cyberpunk-agent-mutes-${userId}`);
            if (muteData) {
                const mutes = new Map(Object.entries(JSON.parse(muteData)));
                this._userMuteSettings.set(userId, mutes);
            }
        } catch (error) {
            console.warn("Cyberpunk Agent | Error loading user mute settings:", error);
        }
    }

    /**
     * Initialize mute system (fallback method)
     */
    _initializeMuteSystem() {
        try {
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
                console.log("Cyberpunk Agent | Mute system initialized");
            }

            // Load current user's settings
            this._loadUserMuteSettings(game.user.id);

            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error initializing mute system:", error);
            return false;
        }
    }

    /**
 * Check if a contact is muted for the current user
 */
    isContactMuted(actorId, contactId) {
        try {
            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            const userId = game.user.id;
            if (!this._userMuteSettings.has(userId)) {
                this._loadUserMuteSettings(userId);
            }

            const userMutes = this._userMuteSettings.get(userId);
            if (userMutes) {
                // Use actor-specific mute key: userId-actorId-contactId
                const muteKey = `${userId}-${actorId}-${contactId}`;
                return userMutes.get(muteKey) || false;
            }

            return false;
        } catch (error) {
            console.error("Cyberpunk Agent | Error checking contact mute status:", error);
            return false;
        }
    }

    /**
     * Check if a contact is muted for a device
     */
    isContactMutedForDevice(deviceId, contactDeviceId) {
        try {
            // Ensure _userMuteSettings exists
            if (!this._userMuteSettings) {
                this._userMuteSettings = new Map();
            }

            const userId = game.user.id;
            if (!this._userMuteSettings.has(userId)) {
                this._loadUserMuteSettings(userId);
            }

            const userMutes = this._userMuteSettings.get(userId);
            if (userMutes) {
                // Use device-specific mute key: userId-deviceId-contactDeviceId
                const muteKey = `${userId}-${deviceId}-${contactDeviceId}`;
                return userMutes.get(muteKey) || false;
            }

            return false;
        } catch (error) {
            console.error("Cyberpunk Agent | Error checking device contact mute status:", error);
            return false;
        }
    }

    /**
     * Add contact to actor's network
     */
    async addContactToActor(actorId, contactActorId) {
        // Only GMs can add contacts since contact-networks is a world-scoped setting
        if (!game.user.isGM) {
            console.error("Cyberpunk Agent | Only GMs can add contacts to actors");
            return false;
        }

        const contact = game.actors.get(contactActorId);
        if (!contact) {
            console.error("Cyberpunk Agent | Contact actor not found:", contactActorId);
            return false;
        }

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

            try {
                await this.saveContactNetworks(actionDetails);
                console.log(`Cyberpunk Agent | Contact ${contact.name} added to ${actorId} successfully`);

                // Update any existing messages from this contact to show their real name
                this._updateMessagesForContact(actorId, contactActorId, contact.name);

                return true;
            } catch (error) {
                console.error("Cyberpunk Agent | Error saving contact networks:", error);
                return false;
            }
        }

        console.log(`Cyberpunk Agent | Contact ${contact.name} already exists for ${actorId}`);
        return true; // Return true since the contact is already there
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
            // Foundry chat deletion removed - using SocketLib only

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
    // Foundry chat deletion methods removed - using SocketLib only

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

            // Check if SocketLib is available
            if (!this._isSocketLibAvailable()) {
                this._handleSocketLibUnavailable();
                return;
            }

            console.log("Cyberpunk Agent | Sending message deletion notification via SocketLib");
            try {
                if (this.socketLibIntegration && this.socketLibIntegration.sendMessageDeletion) {
                    const success = await this.socketLibIntegration.sendMessageDeletion(notificationData);
                    if (success) {
                        console.log("Cyberpunk Agent | SocketLib message deletion notification sent successfully");
                    } else {
                        console.error("Cyberpunk Agent | SocketLib message deletion notification failed");
                        ui.notifications.error("Falha ao enviar notificação de deleção via SocketLib");
                    }
                } else {
                    console.error("Cyberpunk Agent | SocketLib integration not available");
                    ui.notifications.error("Integração SocketLib não disponível");
                }
            } catch (error) {
                console.error("Cyberpunk Agent | SocketLib message deletion notification failed:", error);
                ui.notifications.error("Erro na comunicação SocketLib: " + error.message);
            }

            // Also trigger immediate update for local interfaces
            this._updateChatInterfacesImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying message deletion:", error);
        }
    }

    /**
     * Clear conversation history for a specific actor
     * This only affects the current actor's view of the conversation
     * The other contact's state remains intact
     */
    async clearConversationHistory(actorId, contactId) {
        try {
            console.log("Cyberpunk Agent | Starting conversation history clear process");
            console.log("Cyberpunk Agent | Actor:", actorId, "Contact:", contactId);

            const conversationKey = this._getConversationKey(actorId, contactId);
            console.log("Cyberpunk Agent | Conversation key:", conversationKey);

            // Get current messages for this conversation
            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original messages count:", messages.length);

            if (messages.length === 0) {
                console.log("Cyberpunk Agent | No messages to clear");
                return true;
            }

            // Clear all messages for this conversation
            this.messages.set(conversationKey, []);
            console.log("Cyberpunk Agent | Cleared all messages for conversation");

            // Clear unread count cache for this conversation
            const unreadCacheKey = `${actorId}-${contactId}`;
            this.unreadCounts.delete(unreadCacheKey);
            console.log("Cyberpunk Agent | Cleared unread count cache for conversation");

            // Enhanced save process to ensure persistence
            console.log("Cyberpunk Agent | Enhanced saving of cleared messages...");

            // Save to localStorage for the specific actor
            await this.saveMessagesForActor(actorId);
            console.log("Cyberpunk Agent | Saved cleared messages to localStorage for actor:", actorId);

            // Notify all clients about the conversation clear
            console.log("Cyberpunk Agent | Notifying clients about conversation clear...");
            await this._notifyConversationClear(actorId, contactId);

            console.log(`Cyberpunk Agent | Successfully cleared conversation history for ${conversationKey}`);
            ui.notifications.info("Histórico de conversa limpo com sucesso!");
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing conversation history:", error);
            ui.notifications.error("Erro ao limpar histórico de conversa: " + error.message);
            return false;
        }
    }

    /**
     * Clear conversation history between two devices
     */
    async clearDeviceConversationHistory(deviceId, contactDeviceId) {
        try {
            console.log("Cyberpunk Agent | Starting device conversation history clear process");
            console.log("Cyberpunk Agent | Device:", deviceId, "Contact Device:", contactDeviceId);

            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
            console.log("Cyberpunk Agent | Device conversation key:", conversationKey);

            // Get current messages for this conversation
            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original device messages count:", messages.length);

            if (messages.length === 0) {
                console.log("Cyberpunk Agent | No device messages to clear");
                return true;
            }

            // Clear all messages for this conversation
            this.messages.set(conversationKey, []);
            console.log("Cyberpunk Agent | Cleared all device messages for conversation");

            // Clear unread count cache for this conversation
            const unreadCacheKey = `${deviceId}-${contactDeviceId}`;
            this.unreadCounts.delete(unreadCacheKey);
            console.log("Cyberpunk Agent | Cleared unread count cache for device conversation");

            // Enhanced save process to ensure persistence
            console.log("Cyberpunk Agent | Enhanced saving of cleared device messages...");

            // Save to localStorage for the specific device
            await this.saveMessagesForDevice(deviceId);
            console.log("Cyberpunk Agent | Saved cleared device messages to localStorage for device:", deviceId);

            // Notify all clients about the conversation clear
            console.log("Cyberpunk Agent | Notifying clients about device conversation clear...");
            await this._notifyDeviceConversationClear(deviceId, contactDeviceId);

            console.log(`Cyberpunk Agent | Successfully cleared device conversation history for ${conversationKey}`);
            ui.notifications.info("Histórico de conversa do dispositivo limpo com sucesso!");
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing device conversation history:", error);
            ui.notifications.error("Erro ao limpar histórico de conversa do dispositivo: " + error.message);
            return false;
        }
    }

    /**
     * Notify all clients about conversation clear
     */
    async _notifyConversationClear(actorId, contactId) {
        try {
            const notificationData = {
                type: 'conversationClear',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id,
                    actorId: actorId,
                    contactId: contactId
                }
            };

            // Check if SocketLib is available
            if (!this._isSocketLibAvailable()) {
                this._handleSocketLibUnavailable();
                return;
            }

            console.log("Cyberpunk Agent | Sending conversation clear notification via SocketLib");
            try {
                if (this.socketLibIntegration && this.socketLibIntegration.sendConversationClear) {
                    const success = await this.socketLibIntegration.sendConversationClear(notificationData);
                    if (success) {
                        console.log("Cyberpunk Agent | SocketLib conversation clear notification sent successfully");
                    } else {
                        console.warn("Cyberpunk Agent | SocketLib conversation clear notification failed");
                        console.log("Cyberpunk Agent | Falha ao enviar notificação de limpeza via SocketLib");
                    }
                } else {
                    console.warn("Cyberpunk Agent | SocketLib integration not available");
                    console.log("Cyberpunk Agent | Integração SocketLib não disponível");
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib conversation clear notification failed:", error);
                console.log("Cyberpunk Agent | Erro na comunicação SocketLib: " + error.message);
            }

            // Also trigger immediate update for local interfaces
            this._updateChatInterfacesImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying conversation clear:", error);
        }
    }

    /**
     * Notify all clients about device conversation clear
     */
    async _notifyDeviceConversationClear(deviceId, contactDeviceId) {
        try {
            const notificationData = {
                type: 'deviceConversationClear',
                data: {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    sessionId: game.data.id,
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId
                }
            };

            // Check if SocketLib is available
            if (!this._isSocketLibAvailable()) {
                this._handleSocketLibUnavailable();
                return;
            }

            console.log("Cyberpunk Agent | Sending device conversation clear notification via SocketLib");
            try {
                if (this.socketLibIntegration && this.socketLibIntegration.sendConversationClear) {
                    const success = await this.socketLibIntegration.sendConversationClear(notificationData);
                    if (success) {
                        console.log("Cyberpunk Agent | SocketLib device conversation clear notification sent successfully");
                    } else {
                        console.warn("Cyberpunk Agent | SocketLib device conversation clear notification failed");
                        console.log("Cyberpunk Agent | Falha ao enviar notificação de limpeza de dispositivo via SocketLib");
                    }
                } else {
                    console.warn("Cyberpunk Agent | SocketLib integration not available");
                    console.log("Cyberpunk Agent | Integração SocketLib não disponível");
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib device conversation clear notification failed:", error);
                console.log("Cyberpunk Agent | Erro na comunicação SocketLib: " + error.message);
            }

            // Also trigger immediate update for local interfaces
            this._updateChatInterfacesImmediately();
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying device conversation clear:", error);
        }
    }

    /**
     * Send message deletion via native socket
     */


    /**
     * Send message deletion via chat
     */


    /**
     * Update chat interfaces immediately when new messages arrive
     * Now uses the Flutter-like UI controller for better performance
     */
    _updateChatInterfacesImmediately() {
        console.log("Cyberpunk Agent | Starting immediate chat interface update using UI Controller");

        // Prevent duplicate updates within a short time window
        const now = Date.now();
        if (this._lastChatUpdateTime && (now - this._lastChatUpdateTime) < 500) {
            console.log("Cyberpunk Agent | Skipping duplicate chat interface update (too soon)");
            return;
        }
        this._lastChatUpdateTime = now;

        // Use the UI Controller to mark relevant components as dirty
        const componentsToUpdate = [];

        // Find and mark conversation components as dirty
        const openWindows = Object.values(ui.windows);
        openWindows.forEach(window => {
            if (window && window.rendered && window.element && window.element.is(':visible')) {
                if (window.constructor.name === 'ChatConversationApplication') {
                    const componentId = `conversation-${window.actor?.id}-${window.currentContact?.id}`;
                    componentsToUpdate.push(componentId);
                    console.log("Cyberpunk Agent | Marking conversation component as dirty:", componentId);
                } else if (window.constructor.name === 'Chat7Application') {
                    const componentId = `chat7-${window.actor?.id}`;
                    componentsToUpdate.push(componentId);
                    console.log("Cyberpunk Agent | Marking Chat7 component as dirty:", componentId);
                } else if (window.constructor.name === 'AgentApplication') {
                    // Handle unified AgentApplication
                    if (window.currentView === 'conversation' && window.currentContact) {
                        const componentId = `agent-conversation-${window.actor?.id}-${window.currentContact.id}`;
                        componentsToUpdate.push(componentId);
                        console.log("Cyberpunk Agent | Marking agent conversation component as dirty:", componentId);
                    } else if (window.currentView === 'chat7') {
                        const componentId = `agent-chat7-${window.actor?.id}`;
                        componentsToUpdate.push(componentId);
                        console.log("Cyberpunk Agent | Marking agent Chat7 component as dirty:", componentId);
                    }
                }
            }
        });

        // Mark components as dirty using the UI Controller
        if (componentsToUpdate.length > 0) {
            if (window.CyberpunkAgentUIController) {
                window.CyberpunkAgentUIController.markDirtyMultiple(componentsToUpdate);
            } else {
                console.warn("Cyberpunk Agent | UI Controller not available, falling back to manual updates");
                this._fallbackUpdateChatInterfaces();
            }
        } else {
            console.log("Cyberpunk Agent | No chat components found to update");
        }

        // Also dispatch the custom event for backward compatibility
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                type: 'messageUpdate',
                timestamp: Date.now()
            }
        }));
    }

    /**
     * Fallback method for when UI Controller is not available
     */
    _fallbackUpdateChatInterfaces() {
        console.log("Cyberpunk Agent | Using fallback chat interface update");

        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'ChatConversationApplication') {
                try {
                    if (window._isUpdating) {
                        return;
                    }

                    window._isUpdating = true;
                    window.render(true);

                    setTimeout(() => {
                        window._isUpdating = false;
                    }, 100);

                    updatedCount++;
                } catch (error) {
                    console.warn("Cyberpunk Agent | Error in fallback update:", error);
                    if (window._isUpdating) {
                        window._isUpdating = false;
                    }
                }
            }
        });

        console.log(`Cyberpunk Agent | Fallback updated ${updatedCount} chat conversation interfaces`);
    }

    /**
     * Update Chat7 interfaces (contact lists) to refresh unread counts
     */
    _updateChat7Interfaces() {
        console.log("Cyberpunk Agent | Updating Chat7 interfaces for unread counts");

        // Find and update any open Chat7Application
        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'Chat7Application') {
                console.log("Cyberpunk Agent | Found Chat7Application, re-rendering for unread count updates...");
                try {
                    // Force a re-render of the Chat7 interface to update unread counts
                    // This is more reliable than manually updating DOM elements
                    window.render(true);
                    updatedCount++;
                    console.log("Cyberpunk Agent | Chat7Application re-rendered successfully for unread count updates");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Error re-rendering Chat7Application:", error);
                }
            }
        });

        console.log(`Cyberpunk Agent | Re-rendered ${updatedCount} Chat7 interfaces for unread count updates`);
    }

    /**
 * Remove contact from actor's network
 */
    async removeContactFromActor(actorId, contactActorId) {
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

                await this.saveContactNetworks(actionDetails);
                return true;
            }
        }
        return false;
    }

    /**
     * Update multiple contacts in bulk (for operations that affect multiple contacts)
     */
    async updateContactsBulk(actorId, action, count = null, description = null) {
        const actionDetails = {
            action: 'bulk',
            count: count,
            description: description,
            actorId: actorId
        };

        await this.saveContactNetworks(actionDetails);
    }

    /**
     * Save contact networks to settings
     */
    async saveContactNetworks(actionDetails = null) {
        try {
            const networksObject = Object.fromEntries(this.contactNetworks);

            // Verify the setting is registered before trying to set it
            const setting = game.settings.settings.get('cyberpunk-agent.contact-networks');
            if (!setting) {
                throw new Error("Contact networks setting not registered");
            }

            // If user is GM, save directly
            if (game.user.isGM) {
                game.settings.set('cyberpunk-agent', 'contact-networks', networksObject);
                console.log("Cyberpunk Agent | GM saved contact networks to settings:", networksObject);

                // Notify all clients about the contact update
                this.notifyContactUpdate(actionDetails);

                // Also trigger immediate update for local interfaces
                this._updateContactManagerImmediately();

                // Force reload of agent data to ensure consistency
                this.loadAgentData();
                return;
            }

            // If user is not GM, request GM to save via SocketLib
            console.log("Cyberpunk Agent | Non-GM user, requesting GM to save contact networks");

            if (this._isSocketLibAvailable() && this.socketLibIntegration) {
                const success = await this.socketLibIntegration.requestGMContactNetworkSave(networksObject);
                if (success) {
                    console.log("Cyberpunk Agent | Contact networks save request sent to GM successfully");
                    ui.notifications.info("Contact networks save request sent to GM");

                    // Notify all clients about the contact update (this will work for local updates)
                    this.notifyContactUpdate(actionDetails);
                    this._updateContactManagerImmediately();
                } else {
                    console.warn("Cyberpunk Agent | Failed to send contact networks save request to GM");
                    ui.notifications.warn("Failed to send contact networks save request to GM");
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available, cannot request GM save");
                ui.notifications.warn("Cannot save contact networks - GM action required");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving contact networks:", error);
            throw error; // Re-throw to allow calling code to handle it
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

            // Clear messages from localStorage
            this.messages.clear();
            const messagesStorageKey = `cyberpunk-agent-messages-${game.user.id}`;
            localStorage.removeItem(messagesStorageKey);

            // Clear agent data from localStorage
            this.agentData.clear();
            const agentDataStorageKey = `cyberpunk-agent-data-${game.user.id}`;
            localStorage.removeItem(agentDataStorageKey);

            // Clear read timestamps from localStorage
            this.lastReadTimestamps.clear();
            const timestampsStorageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            localStorage.removeItem(timestampsStorageKey);

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
     * Clear all messages for all devices (GM only)
     */
    async clearAllMessages() {
        if (!game.user.isGM) {
            throw new Error("Only GMs can clear all messages");
        }

        try {
            console.log("Cyberpunk Agent | Clearing all messages for all devices...");

            // Clear messages from localStorage for all users
            this.messages.clear();

            // Remove all message-related localStorage items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cyberpunk-agent-messages-')) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`Cyberpunk Agent | Removed messages from localStorage: ${key}`);
            });

            // Clear read timestamps for all users
            this.lastReadTimestamps.clear();
            const timestampKeysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cyberpunk-agent-read-timestamps-')) {
                    timestampKeysToRemove.push(key);
                }
            }

            timestampKeysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`Cyberpunk Agent | Removed read timestamps from localStorage: ${key}`);
            });

            // Clear unread counts for all users
            this.unreadCounts.clear();
            const unreadKeysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cyberpunk-agent-unread-counts-')) {
                    unreadKeysToRemove.push(key);
                }
            }

            unreadKeysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`Cyberpunk Agent | Removed unread counts from localStorage: ${key}`);
            });

            // Notify all clients about the message clearing
            if (this._isSocketLibAvailable()) {
                try {
                    await this.socketLibIntegration.socket.executeAsGM('broadcastUpdate', {
                        type: 'allMessagesCleared',
                        timestamp: Date.now()
                    });
                    console.log("Cyberpunk Agent | Notified all clients about message clearing");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Failed to notify clients about message clearing:", error);
                }
            }

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this.updateOpenInterfaces();

            console.log("Cyberpunk Agent | All messages cleared successfully");
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing all messages:", error);
            throw error;
        }
    }

    /**
     * Clear all contacts for all devices (GM only)
     */
    async clearAllContacts() {
        if (!game.user.isGM) {
            throw new Error("Only GMs can clear all contacts");
        }

        try {
            console.log("Cyberpunk Agent | Clearing all contacts for all devices...");

            // Clear contacts from all devices
            if (this.devices && this.devices.size > 0) {
                for (const [deviceId, deviceData] of this.devices) {
                    if (deviceData.contacts) {
                        deviceData.contacts = [];
                        console.log(`Cyberpunk Agent | Cleared contacts for device: ${deviceId}`);
                    }
                }

                // Save the updated device data
                await this.saveDeviceData();
                console.log("Cyberpunk Agent | Saved updated device data after clearing contacts");
            }

            // Clear all messages (since contacts are being removed)
            await this.clearAllMessages();

            // Notify all clients about the contact clearing
            if (this._isSocketLibAvailable()) {
                try {
                    await this.socketLibIntegration.socket.executeAsGM('broadcastUpdate', {
                        type: 'allContactsCleared',
                        timestamp: Date.now()
                    });
                    console.log("Cyberpunk Agent | Notified all clients about contact clearing");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Failed to notify clients about contact clearing:", error);
                }
            }

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this._updateContactManagerImmediately();
            this.updateOpenInterfaces();

            console.log("Cyberpunk Agent | All contacts cleared successfully");
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing all contacts:", error);
            throw error;
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
        // Only set up if not already done
        if (this._socketLibIntegrationSet) {
            console.log("Cyberpunk Agent | SocketLib integration already set up, skipping");
            return;
        }

        try {
            console.log("Cyberpunk Agent | Setting up SocketLib integration...");
            console.log("Cyberpunk Agent | SocketLibIntegration available:", typeof window.SocketLibIntegration);
            console.log("Cyberpunk Agent | socketlib available:", typeof socketlib);

            // Check if SocketLib integration is available
            if (typeof window.SocketLibIntegration !== 'undefined') {
                this.socketLibIntegration = new window.SocketLibIntegration();
                console.log("Cyberpunk Agent | SocketLib integration initialized successfully");
            } else {
                console.warn("Cyberpunk Agent | SocketLib integration not available - window.SocketLibIntegration is undefined");
            }

            this._socketLibIntegrationSet = true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error setting up SocketLib integration:", error);
        }
    }

    /**
     * Setup SocketLib when it's ready
     */
    setupSocketLibWhenReady() {
        // Only set up the hook once
        if (this._socketLibReadyHookSet) {
            return;
        }

        console.log("Cyberpunk Agent | Setting up SocketLib ready hook...");

        // Hook for when SocketLib is ready - THIS IS MANDATORY according to documentation
        Hooks.once("socketlib.ready", () => {
            console.log("Cyberpunk Agent | SocketLib ready hook triggered, initializing integration...");
            console.log("Cyberpunk Agent | User:", game.user.name, "IsGM:", game.user.isGM);
            console.log("Cyberpunk Agent | SocketLib version:", socketlib ? socketlib.version : 'unknown');

            try {
                // Initialize SocketLib integration following official documentation
                if (typeof window.initializeSocketLib === 'function') {
                    console.log("Cyberpunk Agent | Calling initializeSocketLib...");
                    const success = window.initializeSocketLib();
                    if (success) {
                        console.log("Cyberpunk Agent | SocketLib integration initialized successfully");

                        // Update the SocketLibIntegration instance with the socket
                        if (this.socketLibIntegration) {
                            this.socketLibIntegration.updateSocket(window.socket);
                            console.log("Cyberpunk Agent | SocketLib integration socket updated");
                        } else {
                            console.warn("Cyberpunk Agent | SocketLib integration instance not available for socket update");
                        }

                        // Test setup immediately after initialization
                        setTimeout(() => {
                            this._checkSocketLibStatus();
                        }, 1000);
                    } else {
                        console.error("Cyberpunk Agent | SocketLib integration initialization failed");
                    }
                } else {
                    console.error("Cyberpunk Agent | initializeSocketLib function not available");
                    console.log("Cyberpunk Agent | Available window functions:", Object.keys(window).filter(key => key.includes('Socket') || key.includes('socket')));
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error initializing SocketLib integration:", error);
            }
        });

        this._socketLibReadyHookSet = true;
        console.log("Cyberpunk Agent | SocketLib ready hook set up successfully");
    }

    /**
     * Test SocketLib setup and functionality
     */
    _testSocketLibSetup() {
        try {
            if (window.socket && typeof socketlib !== 'undefined') {
                console.log("Cyberpunk Agent | Testing SocketLib setup...");
                console.log("Cyberpunk Agent | Socket available:", !!window.socket);
                console.log("Cyberpunk Agent | SocketLib methods:", Object.keys(socketlib).filter(key => typeof socketlib[key] === 'function'));

                // Check if our module is properly registered
                const modules = socketlib && socketlib.modules && Array.isArray(socketlib.modules) ? socketlib.modules : [];
                const isRegistered = modules.includes('cyberpunk-agent');
                console.log("Cyberpunk Agent | Module registered:", isRegistered);

                if (!isRegistered) {
                    console.warn("Cyberpunk Agent | Module not properly registered with SocketLib");
                }

                // Test socket methods
                if (window.socket) {
                    const socketMethods = Object.keys(window.socket).filter(key => typeof window.socket[key] === 'function');
                    console.log("Cyberpunk Agent | Socket methods:", socketMethods);

                    const requiredMethods = ['executeForEveryone', 'executeForOthers', 'executeAsGM', 'executeAsUser'];
                    const missingMethods = requiredMethods.filter(method => !socketMethods.includes(method));

                    if (missingMethods.length > 0) {
                        console.warn("Cyberpunk Agent | Missing required socket methods:", missingMethods);
                    } else {
                        console.log("Cyberpunk Agent | All required socket methods available");
                    }
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available for setup test");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error testing SocketLib setup:", error);
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
 * Check if SocketLib is available and working
 */
    _isSocketLibAvailable() {
        const hasIntegration = !!this.socketLibIntegration;
        const integrationAvailable = this.socketLibIntegration ? this.socketLibIntegration.isAvailable : false;
        const socketlibGlobal = typeof socketlib !== 'undefined';
        const socketAvailable = !!window.socket;

        // Simplified check following SocketLib documentation
        // SocketLib doesn't have a persistent "connected" state like traditional WebSockets
        // If we have the socket object and SocketLib is available, we consider it available
        const isAvailable = socketlibGlobal && socketAvailable && hasIntegration && integrationAvailable;

        console.log("Cyberpunk Agent | SocketLib availability check:", {
            hasIntegration,
            integrationAvailable,
            socketlibGlobal,
            socketAvailable,
            isAvailable,
            user: game.user.name,
            isGM: game.user.isGM,
            socketlibVersion: socketlib ? socketlib.version : 'unknown'
        });

        return isAvailable;
    }

    /**
     * Handle SocketLib unavailability with appropriate notifications
     */
    _handleSocketLibUnavailable() {
        console.warn("Cyberpunk Agent | SocketLib availability check failed, but communication may still work");
        console.log("Cyberpunk Agent | SocketLib status:", {
            socketLibIntegration: !!this.socketLibIntegration,
            integrationAvailable: this.socketLibIntegration ? this.socketLibIntegration.isAvailable : false,
            socketlibGlobal: typeof socketlib !== 'undefined',
            socketAvailable: !!window.socket
        });

        // Don't show notifications since SocketLib is actually working
        // The availability check was too strict, but the communication is functional
        console.log("Cyberpunk Agent | SocketLib communication is working despite availability check failure");
    }

    /**
 * Simplified SocketLib connection check
 * SocketLib doesn't have a persistent connection state like traditional WebSockets
 */
    _checkSocketLibStatus() {
        console.log("Cyberpunk Agent | Checking SocketLib status...");

        const status = {
            socketlibAvailable: typeof socketlib !== 'undefined',
            socketAvailable: !!window.socket,
            integrationAvailable: this.socketLibIntegration ? this.socketLibIntegration.isAvailable : false,
            socketMethods: window.socket ? Object.keys(window.socket).filter(key => typeof window.socket[key] === 'function') : []
        };

        console.log("Cyberpunk Agent | SocketLib status:", status);
        return status;
    }





    /**
     * Notify all clients about contact updates via SocketLib
     */
    async notifyContactUpdate(actionDetails = null) {
        // Always update local interfaces immediately for better UX
        this._updateContactManagerImmediately();

        // Only send cross-client notifications if there are multiple users
        if (!this._needsCrossClientCommunication()) {
            console.log("Cyberpunk Agent | Single user session, skipping cross-client notification");
            return;
        }

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            // Don't return here since SocketLib might still be working
            // The availability check was too strict
        }

        console.log("Cyberpunk Agent | Sending contact update notification via SocketLib");

        try {
            const success = await this.socketLibIntegration.sendContactUpdate({
                type: 'contactUpdate',
                action: 'contactModified',
                actionDetails: actionDetails
            });

            if (success) {
                console.log("Cyberpunk Agent | SocketLib notification sent successfully");
            } else {
                console.warn("Cyberpunk Agent | SocketLib notification failed, but communication is working");
            }
        } catch (error) {
            console.warn("Cyberpunk Agent | SocketLib error, but communication is working:", error);
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
        console.log("Cyberpunk Agent | Reloading contact networks from settings...");
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
    async handleMessageUpdate(data) {
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

        // If we have message data, add it to the conversation locally
        if (data.message && data.senderId && data.receiverId) {
            console.log("Cyberpunk Agent | Adding message to local conversation:", data.message);

            try {
                // Get the conversation key
                const conversationKey = this._getConversationKey(data.senderId, data.receiverId);

                // Get or create conversation
                if (!this.messages.has(conversationKey)) {
                    this.messages.set(conversationKey, []);
                }

                const conversation = this.messages.get(conversationKey);

                // Check if message already exists to avoid duplicates
                const messageExists = conversation.some(msg => msg.id === data.message.id);
                if (!messageExists) {
                    // Add the message
                    conversation.push(data.message);

                    // Save messages for both sender and receiver actors
                    await this.saveMessagesForActor(data.senderId);
                    if (data.senderId !== data.receiverId) {
                        await this.saveMessagesForActor(data.receiverId);
                    }
                    console.log("Cyberpunk Agent | Message added to local conversation successfully");
                } else {
                    console.log("Cyberpunk Agent | Message already exists in conversation, skipping");
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error adding message to local conversation:", error);
            }
        } else {
            // Fallback: reload message data from settings
            console.log("Cyberpunk Agent | No message data provided, reloading from settings");
            this.loadAgentData();
        }

        // Clear unread count cache for this conversation to force recalculation
        this.unreadCounts.delete(this._getConversationKey(data.senderId, data.receiverId));

        // Force immediate UI updates using multiple strategies
        console.log("Cyberpunk Agent | Triggering immediate UI updates for message update");

        // Strategy 1: Use UI Controller if available
        if (window.CyberpunkAgentUIController) {
            const conversationComponentId = `agent-conversation-${data.senderId}-${data.receiverId}`;
            const reverseConversationComponentId = `agent-conversation-${data.receiverId}-${data.senderId}`;
            const chat7ComponentIds = [
                `agent-chat7-${data.senderId}`,
                `agent-chat7-${data.receiverId}`
            ];

            // Mark conversation components as dirty
            window.CyberpunkAgentUIController.markDirtyMultiple([
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);

            console.log("Cyberpunk Agent | Marked components as dirty via UI Controller:", [
                conversationComponentId,
                reverseConversationComponentId,
                ...chat7ComponentIds
            ]);
        }

        // Strategy 2: Force immediate chat interface updates
        this._updateChatInterfacesImmediately();

        // Strategy 3: Update all open interfaces
        this.updateOpenInterfaces();

        // Strategy 4: Force Chat7 interfaces to refresh unread counts specifically
        this._forceChat7UnreadCountUpdate(data.senderId, data.receiverId);

        // Strategy 5: Dispatch custom event for backward compatibility
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                timestamp: Date.now(),
                type: 'messageUpdate',
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: data.message
            }
        }));

        // Show notification to user - only "Nova mensagem no Chat7"
        ui.notifications.info("Nova mensagem no Chat7");

        // Play notification sound if the current user is the receiver and sender is not muted
        if (data.receiverId) {
            const userActors = this.getUserActors();
            const isReceiver = userActors.some(actor => actor.id === data.receiverId);
            if (isReceiver) {
                // Check if the sender is muted for this receiver
                const isSenderMuted = this.isContactMuted(data.receiverId, data.senderId);
                if (!isSenderMuted) {
                    this.playNotificationSound();
                } else {
                    console.log(`Cyberpunk Agent | Notification sound skipped - contact ${data.senderId} is muted for ${data.receiverId}`);
                }
            }
        }

        console.log("Cyberpunk Agent | Message update processed successfully");
    }

    /**
     * Force Chat7 interfaces to refresh their unread count data and re-render
     * This ensures that when a new message arrives, the unread count chip appears immediately
     */
    _forceChat7UnreadCountUpdate(senderId, receiverId) {
        console.log("Cyberpunk Agent | Forcing Chat7 unread count update for message from", senderId, "to", receiverId);

        // Find all open AgentApplication windows that are showing Chat7 view
        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'AgentApplication') {
                // Check if this is a Chat7 view for the receiver
                if (window.currentView === 'chat7' && window.actor && window.actor.id === receiverId) {
                    console.log("Cyberpunk Agent | Found Chat7 view for receiver, forcing re-render for unread count update");
                    try {
                        // Force a complete re-render to refresh the unread count data
                        window.render(true);
                        updatedCount++;
                        console.log("Cyberpunk Agent | Chat7 view re-rendered successfully for unread count update");
                    } catch (error) {
                        console.warn("Cyberpunk Agent | Error re-rendering Chat7 view:", error);
                    }
                }
            }
        });

        // Also check for legacy Chat7Application windows
        openWindows.forEach(window => {
            if (window && window.rendered && window.constructor.name === 'Chat7Application') {
                if (window.actor && window.actor.id === receiverId) {
                    console.log("Cyberpunk Agent | Found legacy Chat7Application for receiver, forcing re-render");
                    try {
                        window.render(true);
                        updatedCount++;
                        console.log("Cyberpunk Agent | Legacy Chat7Application re-rendered successfully");
                    } catch (error) {
                        console.warn("Cyberpunk Agent | Error re-rendering legacy Chat7Application:", error);
                    }
                }
            }
        });

        console.log(`Cyberpunk Agent | Re-rendered ${updatedCount} Chat7 interfaces for unread count updates`);
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
     * Handle conversation clear
     */
    handleConversationClear(data) {
        console.log("Cyberpunk Agent | Received conversation clear notification from:", data.userName);
        console.log("Cyberpunk Agent | Clear data:", data);

        // Prevent processing our own conversation clear
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own conversation clear notification");
            return;
        }

        // Check if this is a recent clear to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore clears older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old conversation clear notification (age:", timeDiff, "ms)");
            return;
        }

        try {
            const { actorId, contactId } = data.data;
            console.log("Cyberpunk Agent | Processing conversation clear for actor:", actorId, "contact:", contactId);

            const conversationKey = this._getConversationKey(actorId, contactId);
            console.log("Cyberpunk Agent | Conversation key:", conversationKey);

            // Clear the conversation for the current user's view
            this.messages.set(conversationKey, []);
            console.log("Cyberpunk Agent | Cleared conversation messages");

            // Clear unread count cache for this conversation
            const unreadCacheKey = `${actorId}-${contactId}`;
            this.unreadCounts.delete(unreadCacheKey);
            console.log("Cyberpunk Agent | Cleared unread count cache");

            // Enhanced save process to ensure persistence
            console.log("Cyberpunk Agent | Enhanced saving of cleared messages from notification...");

            // Save to localStorage for all users (GM and non-GM)
            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
            const messagesObject = Object.fromEntries(this.messages);
            localStorage.setItem(storageKey, JSON.stringify(messagesObject));
            console.log("Cyberpunk Agent | Saved cleared messages to localStorage from notification for user:", game.user.name);

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
            const actor = game.actors.get(actorId);
            const contact = game.actors.get(contactId);
            const actorName = actor ? actor.name : "Desconhecido";
            const contactName = contact ? contact.name : "Desconhecido";

            const message = `Histórico de conversa limpo por ${actorName} na conversa com ${contactName}`;
            ui.notifications.info(message);

            console.log(`Cyberpunk Agent | Successfully processed conversation clear by ${actorName} with ${contactName}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error handling conversation clear:", error);
        }
    }

    /**
     * Handle save messages request from players
     * Note: This function is deprecated as messages are now stored in localStorage only
     */
    handleSaveMessagesRequest(data) {
        console.log("Cyberpunk Agent | Received save messages request from:", data.userName, "- DEPRECATED (using localStorage only)");

        // Since messages are now stored in localStorage only, this function is no longer needed
        // All users save their own messages to their localStorage
        console.log("Cyberpunk Agent | Save messages request ignored - using localStorage only architecture");
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
            console.log("Cyberpunk Agent | Mensagens salvas com sucesso!");
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

        // Prevent duplicate updates within a short time window
        const now = Date.now();
        if (this._lastUpdateTime && (now - this._lastUpdateTime) < 500) {
            console.log("Cyberpunk Agent | Skipping duplicate interface update (too soon)");
            return;
        }
        this._lastUpdateTime = now;

        // Check if there are any open interfaces first
        if (!this.hasOpenInterfaces()) {
            console.log("Cyberpunk Agent | No open interfaces to update");
            return;
        }

        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered && window.element && window.element.is(':visible')) {
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

        // Log interface updates to console (only once per update cycle)
        if (updatedCount > 0 && !this._lastInterfaceUpdateTime || (Date.now() - this._lastInterfaceUpdateTime) > 1000) {
            console.log(`Cyberpunk Agent | Interface update: ${updatedCount} interface(s) do Agent atualizadas`);
            this._lastInterfaceUpdateTime = Date.now();
        }
    }

    /**
    * Update all open chat interfaces
    */
    updateOpenChatInterfaces() {
        console.log("Cyberpunk Agent | Updating open chat interfaces...");

        // Prevent duplicate updates within a short time window
        const now = Date.now();
        if (this._lastChatInterfaceUpdateTime && (now - this._lastChatInterfaceUpdateTime) < 500) {
            console.log("Cyberpunk Agent | Skipping duplicate chat interface update (too soon)");
            return;
        }
        this._lastChatInterfaceUpdateTime = now;

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
        console.log("Cyberpunk Agent | Interfaces de chat atualizadas forçadamente");
    }

    /**
 * Setup socket communication for real-time updates
 */




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
 * Test SocketLib communication
 */
    testCrossClientCommunication() {
        console.log("Cyberpunk Agent | Testing SocketLib communication...");

        if (!game.user.isGM) {
            console.log("Cyberpunk Agent | Cross-client test requires GM permissions");
            return;
        }

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            return;
        }

        console.log("Cyberpunk Agent | Testing SocketLib communication...");
        this.notifyContactUpdate({
            action: 'test',
            contactName: 'Test Contact',
            actorId: 'test-actor',
            contactActorId: 'test-contact'
        });

        console.log("Cyberpunk Agent | SocketLib test completed");
    }

    /**
 * Test SocketLib following official documentation pattern
 */
    testSocketLibOfficial() {
        console.log("=== SocketLib Official Test ===");

        if (!game.user.isGM) {
            console.log("❌ Test requires GM permissions");
            return;
        }

        try {
            // Check SocketLib availability
            if (typeof socketlib === 'undefined') {
                console.error("❌ SocketLib is undefined");
                return;
            }

            console.log("✅ SocketLib found, version:", socketlib.version);
            console.log("✅ SocketLib methods:", Object.keys(socketlib).filter(key => typeof socketlib[key] === 'function'));
            console.log("✅ SocketLib properties:", Object.keys(socketlib).filter(key => typeof socketlib[key] !== 'function'));

            // Check if our socket is available
            if (!window.socket) {
                console.error("❌ Socket not available");
                return;
            }

            console.log("✅ Socket available");

            // Check if module is registered
            const modules = socketlib.modules && Array.isArray(socketlib.modules) ? socketlib.modules : [];
            const isRegistered = modules.includes('cyberpunk-agent');
            console.log("✅ Module registered:", isRegistered);

            // Test connection - SocketLib doesn't have a persistent connection state
            const socketAvailable = !!window.socket;
            console.log("✅ Socket available:", socketAvailable);

            if (socketAvailable && isRegistered) {
                console.log("✅ All checks passed - SocketLib should be working");

                // Test a simple broadcast
                window.socket.executeForEveryone("ping", {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    test: true
                }).then(() => {
                    console.log("✅ Broadcast test sent successfully");
                }).catch(error => {
                    console.error("❌ Broadcast test failed:", error);
                });
            } else {
                console.error("❌ SocketLib not properly configured");
                console.log("❌ Socket availability:", socketAvailable);
                console.log("❌ Registration status:", isRegistered);
            }

        } catch (error) {
            console.error("❌ Error during SocketLib test:", error);
        }
    }

    /**
     * Debug SocketLib availability and methods
     */
    debugSocketLib() {
        console.log("=== SocketLib Debug ===");

        console.log("🔍 SocketLib global:", typeof socketlib);
        console.log("🔍 SocketLib object:", socketlib);

        if (typeof socketlib !== 'undefined') {
            console.log("🔍 SocketLib keys:", Object.keys(socketlib));
            console.log("🔍 SocketLib methods:", Object.keys(socketlib).filter(key => typeof socketlib[key] === 'function'));
            console.log("🔍 SocketLib properties:", Object.keys(socketlib).filter(key => typeof socketlib[key] !== 'function'));

            // Check specific methods
            console.log("🔍 registerModule method:", typeof socketlib.registerModule);
            console.log("🔍 modules property:", socketlib.modules);
            console.log("🔍 socket object:", !!window.socket);
        }

        console.log("🔍 Window socket:", window.socket);
        console.log("🔍 SocketLib integration:", this.socketLibIntegration);
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
     * Play notification sound if enabled and contact is not muted
     */
    playNotificationSound(senderId = null, receiverId = null) {
        try {
            // Check if notification sounds are enabled in localStorage (default to true)
            const soundEnabled = localStorage.getItem('cyberpunk-agent-notification-sound') !== 'false';

            if (!soundEnabled) {
                console.log("Cyberpunk Agent | Notification sounds disabled by user");
                return;
            }

            // If we have sender and receiver IDs, check if the contact is muted
            if (senderId && receiverId) {
                const isMuted = this.isContactMuted(receiverId, senderId);
                if (isMuted) {
                    console.log("Cyberpunk Agent | Contact is muted, skipping notification sound");
                    return;
                }
            }

            // Play the notification sound
            this.playSoundEffect('notification-message');
            console.log("Cyberpunk Agent | Notification sound played");
        } catch (error) {
            console.error("Cyberpunk Agent | Error playing notification sound:", error);
        }
    }

    /**
     * Toggle notification sounds on/off
     */
    toggleNotificationSounds() {
        try {
            const currentSetting = localStorage.getItem('cyberpunk-agent-notification-sound') !== 'false';
            const newSetting = !currentSetting;

            localStorage.setItem('cyberpunk-agent-notification-sound', newSetting.toString());

            console.log(`Cyberpunk Agent | Notification sounds ${newSetting ? 'enabled' : 'disabled'}`);
            ui.notifications.info(`Notificações sonoras ${newSetting ? 'ativadas' : 'desativadas'}!`);

            return newSetting;
        } catch (error) {
            console.error("Cyberpunk Agent | Error toggling notification sounds:", error);
            return false;
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

    // ========================================
    // DIAGNOSTIC TEST FUNCTIONS
    // ========================================

    /**
 * Test function to verify contact network persistence
 * Run this in GM console, then refresh (F5), then run verifyContactNetworkPersistence
 */
    testContactNetworkPersistence() {
        try {
            console.log("=== TESTING CONTACT NETWORK PERSISTENCE ===");

            // Check user permissions
            console.log("User role:", game.user.role);
            console.log("User can modify world settings:", game.user.can('SETTINGS_MODIFY'));

            // Check if setting is registered
            const setting = game.settings.settings.get('cyberpunk-agent.contact-networks');
            console.log("Setting registration:", setting);

            // Get current setting
            const currentSetting = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
            console.log("Current contact-networks setting:", currentSetting);

            // Add a test contact
            const testContact = {
                id: 'test-contact-' + Date.now(),
                name: 'Test Contact',
                actorId: 'test-actor-id',
                isActive: true
            };

            const updatedSetting = {
                ...currentSetting,
                [testContact.id]: testContact
            };

            console.log("Setting contact-networks to:", updatedSetting);

            // Try to save the setting with error handling
            try {
                const result = game.settings.set('cyberpunk-agent', 'contact-networks', updatedSetting);
                console.log("game.settings.set() result:", result);
            } catch (setError) {
                console.error("❌ ERROR during game.settings.set():", setError);
            }

            // Wait a moment and then verify it was saved
            setTimeout(() => {
                try {
                    const savedSetting = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
                    console.log("Retrieved setting after delay:", savedSetting);

                    if (savedSetting[testContact.id]) {
                        console.log("✅ SUCCESS: Test contact was saved and retrieved after delay");
                        console.log("🔄 Now please refresh your FoundryVTT client (F5) and run: window.verifyContactNetworkPersistence()");
                    } else {
                        console.log("❌ FAILED: Test contact was not saved properly after delay");
                        console.log("Expected test contact ID:", testContact.id);
                        console.log("Available keys:", Object.keys(savedSetting));
                    }
                } catch (getError) {
                    console.error("❌ ERROR during game.settings.get():", getError);
                }
            }, 100);

        } catch (error) {
            console.error("❌ ERROR in testContactNetworkPersistence:", error);
        }
    }

    /**
     * Verify function to check if contact networks persist after refresh
     * Run this after refreshing (F5) following testContactNetworkPersistence
     */
    verifyContactNetworkPersistence() {
        try {
            console.log("=== VERIFYING CONTACT NETWORK PERSISTENCE AFTER REFRESH ===");

            // Get the setting after refresh
            const setting = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
            console.log("Contact-networks setting after refresh:", setting);

            // Look for test contacts
            const testContacts = Object.entries(setting).filter(([key, value]) =>
                key.startsWith('test-contact-')
            );

            if (testContacts.length > 0) {
                console.log("✅ SUCCESS: Test contacts found after refresh:", testContacts);
                console.log("🔄 Contact Manager settings are persisting correctly");
            } else {
                console.log("❌ FAILED: No test contacts found after refresh");
                console.log("🔄 Contact Manager settings are NOT persisting");
            }

            // Also check if the CyberpunkAgent instance can load the data
            if (CyberpunkAgent.instance) {
                console.log("Reloading agent data...");
                CyberpunkAgent.instance.loadAgentData();
                console.log("Agent contact networks:", Object.fromEntries(CyberpunkAgent.instance.contactNetworks));
            }

        } catch (error) {
            console.error("❌ ERROR in verifyContactNetworkPersistence:", error);
        }
    }

    /**
 * Test function to verify player propagation
 * Run this in player console to check if they can see GM's contact networks
 */
    testPlayerContactNetworkAccess() {
        try {
            console.log("=== TESTING PLAYER CONTACT NETWORK ACCESS ===");

            // Check if player can access the setting
            const setting = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
            console.log("Player can access contact-networks setting:", setting);

            // Check if CyberpunkAgent instance exists and has contact networks
            if (CyberpunkAgent.instance) {
                console.log("Agent instance contact networks:", Object.fromEntries(CyberpunkAgent.instance.contactNetworks));

                // Try to reload agent data
                CyberpunkAgent.instance.loadAgentData();
                console.log("After reload - Agent contact networks:", Object.fromEntries(CyberpunkAgent.instance.contactNetworks));
            } else {
                console.log("❌ CyberpunkAgent instance not found");
            }

        } catch (error) {
            console.error("❌ ERROR in testPlayerContactNetworkAccess:", error);
        }
    }

    /**
     * Test function to verify Contact Manager save functionality
     * Run this in GM console to test the actual Contact Manager save method
     */
    async testContactManagerSave() {
        try {
            console.log("=== TESTING CONTACT MANAGER SAVE FUNCTIONALITY ===");

            // Get current contact networks
            const currentNetworks = Object.fromEntries(this.contactNetworks);
            console.log("Current contact networks in memory:", currentNetworks);

            // Add a test contact using the Contact Manager method
            const testActorId = 'test-actor-' + Date.now();
            const testContactId = 'test-contact-' + Date.now();

            // Add to memory first
            if (!this.contactNetworks.has(testActorId)) {
                this.contactNetworks.set(testActorId, []);
            }

            const testContact = {
                id: testContactId,
                name: 'Test Contact via Manager',
                actorId: testContactId,
                isActive: true
            };

            this.contactNetworks.get(testActorId).push(testContact);
            console.log("Added test contact to memory:", testContact);

            // Save using the Contact Manager method
            await this.saveContactNetworks({ action: 'test', actorId: testActorId, contactId: testContactId });

            // Check if it was saved to settings
            const savedSetting = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
            console.log("Settings after save:", savedSetting);

            if (savedSetting[testActorId] && savedSetting[testActorId].find(c => c.id === testContactId)) {
                console.log("✅ SUCCESS: Contact Manager save method works correctly");
            } else {
                console.log("❌ FAILED: Contact Manager save method did not persist the contact");
            }

        } catch (error) {
            console.error("❌ ERROR in testContactManagerSave:", error);
        }
    }

    /**
     * Get unread count for a conversation between two devices
     */
    getUnreadCountForDevices(deviceId1, deviceId2) {
        const conversationKey = this._getDeviceConversationKey(deviceId1, deviceId2);

        // Check cache first
        if (this.unreadCounts.has(conversationKey)) {
            const cachedCount = this.unreadCounts.get(conversationKey);
            console.log(`Cyberpunk Agent | Using cached unread count for devices ${conversationKey}: ${cachedCount}`);
            return cachedCount;
        }

        // Get all messages for this conversation
        const messages = this.getMessagesForDeviceConversation(deviceId1, deviceId2);

        // Count messages that are unread for the current user
        const unreadCount = messages.filter(message =>
            message.receiverId === deviceId1 &&
            !message.read
        ).length;

        // Cache the result
        this.unreadCounts.set(conversationKey, unreadCount);

        console.log(`Cyberpunk Agent | Calculated unread count for devices ${conversationKey}: ${unreadCount} (${messages.length} total messages)`);

        return unreadCount;
    }
}

// Make test functions globally available
window.testContactNetworkPersistence = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testContactNetworkPersistence();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.verifyContactNetworkPersistence = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.verifyContactNetworkPersistence();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testPlayerContactNetworkAccess = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testPlayerContactNetworkAccess();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testContactManagerSave = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testContactManagerSave();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

/**
 * Toggle notification sounds on/off
 * Run this in console: window.toggleNotificationSounds()
 */
window.toggleNotificationSounds = function () {
    if (CyberpunkAgent.instance) {
        return CyberpunkAgent.instance.toggleNotificationSounds();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
        return false;
    }
};

window.debugUIController = function () {
    if (window.CyberpunkAgentUIController) {
        const status = window.CyberpunkAgentUIController.getStatus();
        console.log("=== UIController Status ===");
        console.log("Total Components:", status.totalComponents);
        console.log("Dirty Components:", status.dirtyComponents);
        console.log("Is Updating:", status.isUpdating);
        console.log("Component IDs:", status.componentIds);
        console.log("Dirty Component IDs:", status.dirtyComponentIds);

        // Clean up orphaned components
        const orphanedCount = window.CyberpunkAgentUIController.cleanupOrphanedComponents();
        console.log("Orphaned components cleaned up:", orphanedCount);
    } else {
        console.error("❌ UIController not available");
    }
};

window.testMessagePersistence = function () {
    if (CyberpunkAgent.instance) {
        console.log("=== TESTING MESSAGE PERSISTENCE ===");

        // Get current messages
        const currentMessages = Object.fromEntries(CyberpunkAgent.instance.messages);
        console.log("Current messages in memory:", currentMessages);

        // Test sending a message
        const testMessage = "Test message " + Date.now();
        console.log("Sending test message:", testMessage);

        // This will be called from the chat interface
        console.log("🔄 Please send this message in the chat interface:", testMessage);
        console.log("🔄 Then check if it appears immediately and persists after refresh");

    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testRealtimeCommunication = function () {
    if (CyberpunkAgent.instance) {
        console.log("=== TESTING REALTIME COMMUNICATION ===");

        // Test SocketLib connection
        console.log("🔍 Testing SocketLib connection...");
        const socketStatus = CyberpunkAgent.instance.socketLibIntegration.getConnectionStatus();
        console.log("SocketLib Status:", socketStatus);

        // Test if we can send a message via SocketLib
        console.log("🔍 Testing SocketLib message sending...");
        const testMessage = "Realtime test " + Date.now();

        // Get user actors for testing
        const userActors = CyberpunkAgent.instance.getUserActors();
        if (userActors.length >= 2) {
            const actor1 = userActors[0];
            const actor2 = userActors[1];

            console.log(`🔄 Testing message from ${actor1.name} to ${actor2.name}:`, testMessage);

            // Send test message via SocketLib directly
            CyberpunkAgent.instance.socketLibIntegration.sendMessage(actor1.id, actor2.id, testMessage, `test-${Date.now()}`)
                .then(success => {
                    console.log("✅ SocketLib message sending result:", success);
                    if (success) {
                        console.log("🔄 Message sent via SocketLib - check if it appears in the other client");
                    } else {
                        console.log("❌ SocketLib message sending failed");
                    }
                })
                .catch(error => {
                    console.error("❌ SocketLib message sending error:", error);
                });
        } else {
            console.log("⚠️ Need at least 2 user actors to test realtime communication");
            console.log("Available actors:", userActors.map(a => a.name));
        }

    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.checkSocketLibStatus = function () {
    if (CyberpunkAgent.instance) {
        console.log("=== CHECKING SOCKETLIB STATUS ===");
        CyberpunkAgent.instance._checkSocketLibStatus();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

window.testSocketLibSetup = function () {
    if (CyberpunkAgent.instance) {
        console.log("=== TESTING SOCKETLIB SETUP ===");
        CyberpunkAgent.instance._testSocketLibSetup();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};

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

    // Additional hook to ensure button appears on UI render
    Hooks.on('renderSceneControls', (controls, html) => {
        if (CyberpunkAgent.instance && Array.isArray(controls)) {
            // Force a small delay to ensure controls are fully rendered
            setTimeout(() => {
                CyberpunkAgent.instance.addControlButton(controls);
            }, 100);
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

window.testSocketLibOfficial = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.testSocketLibOfficial();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

window.debugSocketLib = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.debugSocketLib();
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

            // Test messages with different lengths and alternating senders
            const testMessages = [
                { sender: actor1, text: "Oi!" },
                { sender: actor1, text: "Como você está?" },
                { sender: actor1, text: "Tudo bem?" },
                { sender: actor2, text: "Oi! Tudo bem sim!" },
                { sender: actor2, text: "E você?" },
                { sender: actor1, text: "Ótimo!" },
                { sender: actor1, text: "Vamos conversar mais?" },
                { sender: actor2, text: "Claro!" },
                { sender: actor2, text: "Adoraria!" },
                { sender: actor2, text: "O que você tem em mente?" }
            ];

            let sentCount = 0;
            testMessages.forEach((msgData, index) => {
                setTimeout(() => {
                    CyberpunkAgent.instance.sendMessage(msgData.sender.id,
                        msgData.sender.id === actor1.id ? actor2.id : actor1.id,
                        msgData.text).then((success) => {
                            if (success) {
                                sentCount++;
                                console.log(`✅ Test message ${index + 1} sent successfully`);
                                ui.notifications.info(`Mensagem de teste ${index + 1} enviada!`);

                                if (sentCount === testMessages.length) {
                                    console.log("✅ All layout test messages sent!");
                                    ui.notifications.success("Todas as mensagens de teste de layout enviadas!");
                                    console.log("📱 Verifique o espaçamento entre mensagens do mesmo tipo (menor) vs tipos diferentes (normal)");
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

// Test function specifically for message spacing
window.testMessageSpacing = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Message Spacing ===");

        const characterActors = game.actors.filter(actor => actor.type === 'character');
        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing message spacing between ${actor1.name} and ${actor2.name}`);

            // Test sequence: own-own-other-other-own-other-own-own-other
            const testSequence = [
                { sender: actor1, text: "Primeira mensagem minha" },
                { sender: actor1, text: "Segunda mensagem minha (espaçamento reduzido)" },
                { sender: actor2, text: "Primeira mensagem dele" },
                { sender: actor2, text: "Segunda mensagem dele (espaçamento reduzido)" },
                { sender: actor1, text: "Minha resposta (espaçamento normal)" },
                { sender: actor2, text: "Resposta dele (espaçamento normal)" },
                { sender: actor1, text: "Outra minha" },
                { sender: actor1, text: "E mais uma minha (espaçamento reduzido)" },
                { sender: actor2, text: "Última dele (espaçamento normal)" }
            ];

            let sentCount = 0;
            testSequence.forEach((msgData, index) => {
                setTimeout(() => {
                    CyberpunkAgent.instance.sendMessage(msgData.sender.id,
                        msgData.sender.id === actor1.id ? actor2.id : actor1.id,
                        msgData.text).then((success) => {
                            if (success) {
                                sentCount++;
                                console.log(`✅ Spacing test message ${index + 1} sent`);

                                if (sentCount === testSequence.length) {
                                    console.log("✅ All spacing test messages sent!");
                                    ui.notifications.success("Teste de espaçamento concluído!");
                                    console.log("📱 Verifique:");
                                    console.log("  - Mensagens consecutivas do mesmo tipo: espaçamento reduzido (4px)");
                                    console.log("  - Mensagens de tipos diferentes: espaçamento normal (12px)");
                                }
                            }
                        });
                }, index * 800); // Send each message 800ms apart
            });
        } else {
            console.error("❌ Need at least 2 character actors to test message spacing");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar o espaçamento!");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not found");
        ui.notifications.error("Instância do CyberpunkAgent não encontrada!");
    }
};

// Test function for contact mute functionality
window.testContactMute = () => {
    if (CyberpunkAgent.instance) {
        console.log("=== Testing Contact Mute Functionality ===");

        // Force initialize mute system
        console.log("0. Forcing mute system initialization...");
        CyberpunkAgent.instance._initializeMuteSystem();

        // Test _userMuteSettings initialization
        console.log("1. Testing _userMuteSettings initialization...");
        console.log(`✅ _userMuteSettings exists: ${!!CyberpunkAgent.instance._userMuteSettings}`);
        console.log(`✅ _userMuteSettings type: ${typeof CyberpunkAgent.instance._userMuteSettings}`);
        console.log(`✅ _userMuteSettings instanceof Map: ${CyberpunkAgent.instance._userMuteSettings instanceof Map}`);

        // Test game objects availability
        console.log("2. Testing game objects availability...");
        console.log(`✅ game exists: ${!!game}`);
        console.log(`✅ game.user exists: ${!!game.user}`);
        console.log(`✅ game.actors exists: ${!!game.actors}`);
        console.log(`✅ game.scenes exists: ${!!game.scenes}`);
        console.log(`✅ game.scenes.active exists: ${!!(game.scenes && game.scenes.active)}`);

        const characterActors = game.actors ? game.actors.filter(actor => actor.type === 'character') : [];
        const userActors = CyberpunkAgent.instance.getUserActors();

        console.log(`👤 Current user: ${game.user ? game.user.name : 'Unknown'} (GM: ${game.user ? game.user.isGM : 'Unknown'})`);
        console.log(`🎭 User actors: ${userActors.map(a => a.name).join(', ')}`);
        console.log(`🎭 All character actors: ${characterActors.map(a => a.name).join(', ')}`);

        if (characterActors.length >= 2) {
            const actor1 = characterActors[0];
            const actor2 = characterActors[1];

            console.log(`📱 Testing contact mute between ${actor1.name} and ${actor2.name}`);

            // Test access permissions
            console.log("3. Testing access permissions...");
            const hasAccess1 = userActors.some(actor => actor.id === actor1.id);
            const hasAccess2 = userActors.some(actor => actor.id === actor2.id);
            console.log(`✅ Access to ${actor1.name}: ${hasAccess1 ? 'YES' : 'NO'}`);
            console.log(`✅ Access to ${actor2.name}: ${hasAccess2 ? 'YES' : 'NO'}`);

            // Test mute functionality for accessible actor
            if (hasAccess1) {
                console.log("4. Testing mute toggle for accessible actor...");
                const isMuted1 = CyberpunkAgent.instance.toggleContactMute(actor1.id, actor2.id);
                console.log(`✅ Contact ${actor2.name} mute status: ${isMuted1 ? 'MUTED' : 'UNMUTED'}`);

                // Test mute check
                console.log("5. Testing mute check...");
                const isMutedCheck = CyberpunkAgent.instance.isContactMuted(actor1.id, actor2.id);
                console.log(`✅ Mute check result: ${isMutedCheck ? 'MUTED' : 'UNMUTED'}`);

                // Test localStorage persistence
                console.log("6. Testing localStorage persistence...");
                const muteKey = `cyberpunk-agent-mutes-${game.user.id}`;
                const storedData = localStorage.getItem(muteKey);
                console.log(`✅ localStorage data: ${storedData}`);

                // Test toggle back
                console.log("7. Testing mute toggle back...");
                const isMuted2 = CyberpunkAgent.instance.toggleContactMute(actor1.id, actor2.id);
                console.log(`✅ Contact ${actor2.name} mute status: ${isMuted2 ? 'MUTED' : 'UNMUTED'}`);

                console.log("✅ Contact mute test completed!");
                ui.notifications.success("Teste de mute de contatos concluído!");
            } else {
                console.log("4. Testing mute toggle for inaccessible actor...");
                const isMuted1 = CyberpunkAgent.instance.toggleContactMute(actor1.id, actor2.id);
                console.log(`❌ Expected failure for inaccessible actor: ${isMuted1 === false ? 'SUCCESS' : 'FAILED'}`);
            }

            // Test sending a message to verify sound is muted
            if (hasAccess1) {
                console.log("8. Testing message with muted contact...");
                setTimeout(() => {
                    CyberpunkAgent.instance.sendMessage(actor2.id, actor1.id, "Teste de mensagem com contato mutado").then(() => {
                        console.log("✅ Message sent to muted contact - sound should be suppressed");
                        ui.notifications.info("Mensagem enviada para contato mutado - som deve estar suprimido");
                    });
                }, 1000);
            }

        } else {
            console.error("❌ Need at least 2 character actors to test contact mute");
            ui.notifications.error("Precisa de pelo menos 2 personagens para testar o mute de contatos!");
        }
    } else {
        console.error("❌ CyberpunkAgent instance not found");
        ui.notifications.error("Instância do CyberpunkAgent não encontrada!");
    }
};

console.log("Cyberpunk Agent | CyberpunkAgent class and test functions made globally available");
console.log("Cyberpunk Agent | New test functions:");
console.log("  - testSystemMessage() - Test the new system message fallback");
console.log("  - testMessageSystem() - Test the messaging system");
console.log("  - getConversationMessages(actorId1, actorId2) - Get messages between two actors");

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


console.log("  - testDeleteMessages() - Test message deletion functionality");
console.log("  - testSimpleDelete() - Test simple delete system");
console.log("  - testMessageDeletionSync() - Test message deletion synchronization");
console.log("  - testRealTimeDeletion() - Test real-time message deletion");
console.log("  - testMessageSpacing() - Test message spacing between same/different types");
console.log("  - testContactMute() - Test contact mute functionality");
console.log("  - syncFoundryChat() - Sync with FoundryVTT chat");
console.log("  - forceUpdateChatInterfaces() - Force update all chat interfaces");
console.log("  - debugAgentEquipment() - Debug equipment structure for Agent items");
console.log("  - triggerDeviceDiscovery() - Manually trigger device discovery");
console.log("  - checkDeviceStatus() - Check device status and details");

// Debug function for equipment issues
window.debugAgentEquipment = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.debugItemStructure();
    } else {
        console.error("Cyberpunk Agent instance not found");
    }
};

// Global function to manually trigger device discovery
window.triggerDeviceDiscovery = () => {
    if (CyberpunkAgent.instance) {
        console.log("Cyberpunk Agent | Manually triggering device discovery...");
        CyberpunkAgent.instance.discoverAndCreateDevices();
    } else {
        console.error("Cyberpunk Agent | Instance not available");
    }
};

// Global function to check device status
window.checkDeviceStatus = () => {
    console.log("Cyberpunk Agent | Device status:");
    console.log("  - Current devices count:", CyberpunkAgent.instance?.devices?.size || 0);
    console.log("  - Current mappings count:", CyberpunkAgent.instance?.deviceMappings?.size || 0);

    if (CyberpunkAgent.instance) {
        console.log("  - Devices:", Array.from(CyberpunkAgent.instance.devices.keys()));
        console.log("  - Mappings:", Object.fromEntries(CyberpunkAgent.instance.deviceMappings));

        // Show device details
        for (const [deviceId, device] of CyberpunkAgent.instance.devices) {
            console.log(`    Device ${deviceId}:`, device);
        }
    }
}; 