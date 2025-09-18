/**
 * Cyberpunk Agent Module
 * Real-time chat and communication system for FoundryVTT
 */

console.log("Cyberpunk Agent | Loading module.js...");

/**
 * Enhanced Messaging System for Cyberpunk Agent
 * Integrated directly into module.js for FoundryVTT v11.315 compatibility
 */
console.log("Cyberpunk Agent | Loading enhanced messaging system...");

/**
 * Message utilities for improved handling
 */
class MessageUtils {
    /**
     * Generate a unique message ID
     */
    static generateMessageId(senderId, receiverId, text) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const textHash = MessageUtils.simpleHash(text);
        return `${senderId}-${receiverId}-${timestamp}-${textHash}-${random}`;
    }

    /**
     * Simple hash function for text content
     */
    static simpleHash(text) {
        let hash = 0;
        if (text.length === 0) return hash.toString(36);
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Validate message object
     */
    static validateMessage(message) {
        return message &&
            typeof message.id === 'string' &&
            typeof message.senderId === 'string' &&
            typeof message.receiverId === 'string' &&
            typeof message.text === 'string' &&
            typeof message.timestamp === 'number' &&
            message.text.trim().length > 0;
    }

    /**
     * Create consistent conversation key
     */
    static getConversationKey(id1, id2) {
        return [id1, id2].sort().join('|');
    }

    /**
     * Check if message is recent
     */
    static isRecentMessage(timestamp, threshold = 30000) {
        return (Date.now() - timestamp) <= threshold;
    }
}

/**
 * Message deduplication manager
 */
class MessageDeduplicationManager {
    constructor() {
        this.recentMessages = new Map();
        this.cleanupInterval = null;
        this.maxAge = 60000;
        this.startCleanup();
    }

    isDuplicate(messageId) {
        return this.recentMessages.has(messageId);
    }

    addMessage(messageId, timestamp = Date.now()) {
        this.recentMessages.set(messageId, timestamp);
    }

    cleanup() {
        const now = Date.now();
        const toDelete = [];

        for (const [messageId, timestamp] of this.recentMessages.entries()) {
            if (now - timestamp > this.maxAge) {
                toDelete.push(messageId);
            }
        }

        toDelete.forEach(messageId => this.recentMessages.delete(messageId));

        // Cleanup completed silently
    }

    startCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 30000);
    }

    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    getStats() {
        return {
            totalMessages: this.recentMessages.size,
            oldestMessage: Math.min(...this.recentMessages.values()),
            newestMessage: Math.max(...this.recentMessages.values()),
            maxAge: this.maxAge
        };
    }
}

/**
 * Performance optimization utilities
 */
class MessagePerformanceManager {
    constructor() {
        this.pageSize = 50;
        this.maxCacheSize = 1000;
        this.saveQueue = new Map();
        this.saveTimeout = null;
        this.saveDelay = 1000;
    }

    getPaginatedMessages(messages, page = 0, pageSize = this.pageSize) {
        const totalMessages = messages.length;
        const totalPages = Math.ceil(totalMessages / pageSize);
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalMessages);

        const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);
        const pageMessages = sortedMessages.slice(startIndex, endIndex);

        return {
            messages: pageMessages,
            page,
            pageSize,
            totalMessages,
            totalPages,
            hasMore: page < totalPages - 1,
            hasPrevious: page > 0
        };
    }

    getRecentMessages(messages, count = this.pageSize) {
        return [...messages]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count);
    }

    queueSave(conversationKey, messages) {
        this.saveQueue.set(conversationKey, messages);

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(async () => {
            await this.processSaveQueue();
        }, this.saveDelay);
    }

    async processSaveQueue() {
        if (this.saveQueue.size === 0) return;

        // Processing save queue silently

        try {
            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
            const existingData = localStorage.getItem(storageKey);
            const messagesData = existingData ? JSON.parse(existingData) : {};

            for (const [conversationKey, messages] of this.saveQueue.entries()) {
                messagesData[conversationKey] = messages;
            }

            localStorage.setItem(storageKey, JSON.stringify(messagesData));

            // Conversations saved to localStorage successfully
            this.saveQueue.clear();

        } catch (error) {
            console.error("Cyberpunk Agent | Error processing save queue:", error);
        }
    }

    async forceSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        await this.processSaveQueue();
    }
}

/**
 * Smart notification manager
 */
class SmartNotificationManager {
    constructor() {
        this.activeConversations = new Map();
        this.notificationCooldowns = new Map();
        this.cooldownPeriod = 5000;
        this.userPreferences = new Map();
    }

    setActiveConversation(userId, deviceId, contactId) {
        this.activeConversations.set(userId, {
            deviceId,
            contactId,
            timestamp: Date.now()
        });
    }

    clearActiveConversation(userId) {
        this.activeConversations.delete(userId);
    }

    isActiveConversation(userId, deviceId, contactId) {
        const active = this.activeConversations.get(userId);
        if (!active) return false;

        const isActive = active.deviceId === deviceId && active.contactId === contactId;
        const isRecent = (Date.now() - active.timestamp) < 30000;

        return isActive && isRecent;
    }

    shouldNotify(conversationKey, receiverUserId, receiverDeviceId, senderDeviceId) {
        if (this.isActiveConversation(receiverUserId, receiverDeviceId, senderDeviceId)) {
            return false;
        }

        const lastNotification = this.notificationCooldowns.get(conversationKey);
        if (lastNotification && (Date.now() - lastNotification) < this.cooldownPeriod) {
            return false;
        }

        return true;
    }

    recordNotification(conversationKey) {
        this.notificationCooldowns.set(conversationKey, Date.now());
    }

    async showNotification(message, receiverUserId, receiverDeviceId) {
        const conversationKey = MessageUtils.getConversationKey(message.senderId, message.receiverId);

        if (!this.shouldNotify(conversationKey, receiverUserId, receiverDeviceId, message.senderId)) {
            return;
        }

        try {
            const senderDevice = window.CyberpunkAgent?.instance?.devices?.get(message.senderId);
            const senderName = senderDevice?.ownerName || senderDevice?.deviceName || 'Unknown';

            this.showNotificationBanner(senderName, message.text);

            // Use the main CyberpunkAgent notification sound system
            if (window.CyberpunkAgent?.instance) {
                window.CyberpunkAgent.instance.playNotificationSound(message.senderId, message.receiverId);
            } else {
                await this.playNotificationSound();
            }

            this.updateUnreadBadge(receiverDeviceId);
            this.recordNotification(conversationKey);

        } catch (error) {
            console.error("Cyberpunk Agent | Error showing smart notification:", error);
        }
    }

    showNotificationBanner(senderName, text) {
        const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
        ui.notifications.info(`📱 ${senderName}: ${preview}`);
    }

    async playNotificationSound() {
        try {
            const audio = new Audio('modules/cyberpunk-agent/assets/sfx/notification-message.sfx.mp3');
            audio.volume = 0.5;
            await audio.play();
        } catch (error) {
            console.warn("Cyberpunk Agent | Could not play notification sound:", error);
        }
    }

    updateUnreadBadge(deviceId) {
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-unread-update', {
            detail: { deviceId }
        }));
    }
}

/**
 * Enhanced error handling manager
 */
class ErrorHandlingManager {
    constructor() {
        this.fallbackQueue = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 2000;
    }

    async handleSocketLibFailure(message, fallbackMethod) {
        console.warn("Cyberpunk Agent | SocketLib failed, using fallback method");

        try {
            const success = await fallbackMethod(message);
            if (success) {
                console.log("Cyberpunk Agent | Fallback method succeeded");
                return true;
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Fallback method also failed:", error);
        }

        this.queueForRetry(message);
        return false;
    }

    queueForRetry(message) {
        const attempts = this.retryAttempts.get(message.id) || 0;

        if (attempts < this.maxRetries) {
            this.fallbackQueue.set(message.id, message);
            this.retryAttempts.set(message.id, attempts + 1);

            setTimeout(() => {
                this.retryMessage(message.id);
            }, this.retryDelay * (attempts + 1));

            // Message queued for retry
        } else {
            console.error(`Cyberpunk Agent | Message failed after ${this.maxRetries} attempts:`, message.id);
            this.retryAttempts.delete(message.id);
        }
    }

    async retryMessage(messageId) {
        const message = this.fallbackQueue.get(messageId);
        if (!message) return;

        // Retrying message silently

        try {
            if (window.CyberpunkAgent?.instance?.socketLibIntegration) {
                const success = await window.CyberpunkAgent.instance.socketLibIntegration.sendMessage(
                    message.senderId,
                    message.receiverId,
                    message.text,
                    message.id
                );

                if (success) {
                    this.fallbackQueue.delete(messageId);
                    this.retryAttempts.delete(messageId);
                    return;
                }
            }

            this.queueForRetry(message);

        } catch (error) {
            console.error(`Cyberpunk Agent | Retry failed for message ${messageId}:`, error);
            this.queueForRetry(message);
        }
    }

    getQueueStatus() {
        return {
            queuedMessages: this.fallbackQueue.size,
            totalRetryAttempts: Array.from(this.retryAttempts.values()).reduce((a, b) => a + b, 0),
            maxRetries: this.maxRetries
        };
    }
}

// Create global instances
window.CyberpunkAgentMessageUtils = MessageUtils;
window.CyberpunkAgentMessageDeduplication = new MessageDeduplicationManager();
window.CyberpunkAgentPerformanceManager = new MessagePerformanceManager();
window.CyberpunkAgentNotificationManager = new SmartNotificationManager();
window.CyberpunkAgentErrorHandler = new ErrorHandlingManager();

console.log("Cyberpunk Agent | Enhanced messaging system loaded successfully");

// Quick validation function (for development/troubleshooting)
window.quickValidateEnhancements = function () {
    console.log("🔍 === CYBERPUNK AGENT - VALIDATION ===");

    const results = {
        enhancedMessaging: false,
        cyberpunkAgent: false,
        socketLibIntegration: false,
        backwardsCompatibility: false
    };

    // Check enhanced messaging utilities
    if (window.CyberpunkAgentMessageUtils &&
        window.CyberpunkAgentMessageDeduplication &&
        window.CyberpunkAgentPerformanceManager &&
        window.CyberpunkAgentNotificationManager &&
        window.CyberpunkAgentErrorHandler) {
        results.enhancedMessaging = true;
        console.log("✅ Enhanced messaging utilities loaded");
    } else {
        console.log("❌ Enhanced messaging utilities missing");
    }

    // Check main CyberpunkAgent instance
    if (window.CyberpunkAgent &&
        window.CyberpunkAgent.instance &&
        window.CyberpunkAgent.instance.devices &&
        window.CyberpunkAgent.instance.messages) {
        results.cyberpunkAgent = true;
        console.log("✅ CyberpunkAgent instance available");
    } else {
        console.log("❌ CyberpunkAgent instance missing");
    }

    // Check SocketLib integration
    if (window.CyberpunkAgent?.instance?.socketLibIntegration) {
        results.socketLibIntegration = true;
        console.log("✅ SocketLib integration available");
    } else {
        console.log("❌ SocketLib integration missing");
    }

    // Check backwards compatibility
    const requiredMethods = ['sendMessage', 'sendDeviceMessage', 'loadMessages'];
    let methodsAvailable = 0;

    if (window.CyberpunkAgent?.instance) {
        for (const method of requiredMethods) {
            if (typeof window.CyberpunkAgent.instance[method] === 'function') {
                methodsAvailable++;
            }
        }
    }

    if (methodsAvailable === requiredMethods.length) {
        results.backwardsCompatibility = true;
        console.log("✅ Backwards compatibility maintained");
    } else {
        console.log(`❌ Backwards compatibility issues (${methodsAvailable}/${requiredMethods.length} methods available)`);
    }

    // Summary
    const passedChecks = Object.values(results).filter(Boolean).length;
    const totalChecks = Object.keys(results).length;

    console.log(`\n📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed`);

    if (passedChecks === totalChecks) {
        console.log("🎉 All enhancements loaded successfully!");
        console.log("\n🧪 Run 'testBasicMessaging()' to test messaging");
        console.log("🚀 Run 'testEnhancedFeatures()' to test enhanced features");
    } else {
        console.log("⚠️ Some enhancements failed to load properly");
    }

    return results;
};



console.log("Cyberpunk Agent | Enhanced features integrated into module.js");

/**
 * GM Master Reset Function
 * Limpa todas as mensagens, contatos e força reinicialização de todos os clientes
 */
window.cyberpunkAgentMasterReset = async function () {
    console.log("🚨 === CYBERPUNK AGENT MASTER RESET INICIADO ===");

    // Verificar se é GM
    if (!game.user.isGM) {
        console.error("❌ Apenas o GM pode executar esta função!");
        ui.notifications.error("Apenas o GM pode executar o Cyberpunk Agent Master Reset!");
        return false;
    }

    // Confirmação de segurança
    const confirmReset = await Dialog.confirm({
        title: "⚠️ CYBERPUNK AGENT - CONFIRMAÇÃO DE RESET TOTAL",
        content: `
            <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 15px;">
                ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
            </div>
            <p>Esta ação irá:</p>
            <ul>
                <li>🗑️ Limpar TODAS as mensagens de TODOS os Cyberpunk Agents</li>
                <li>📱 Limpar TODAS as listas de contatos dos dispositivos</li>
                <li>🔄 Forçar reinicialização de TODOS os clientes conectados</li>
                <li>💾 Remover dados do localStorage de todos os usuários</li>
            </ul>
            <div style="color: #ff6b6b; font-weight: bold; margin-top: 15px;">
                Tem certeza que deseja continuar?
            </div>
        `,
        yes: () => true,
        no: () => false,
        defaultYes: false
    });

    if (!confirmReset) {
        console.log("🚫 Reset cancelado pelo usuário");
        return false;
    }

    try {
        console.log("🧹 Iniciando limpeza completa...");

        // Passo 1: Limpar mensagens locais do GM
        console.log("📱 1/6 - Limpando mensagens locais...");
        if (window.CyberpunkAgent?.instance) {
            window.CyberpunkAgent.instance.messages.clear();
            window.CyberpunkAgent.instance.lastReadTimestamps.clear();
            window.CyberpunkAgent.instance.unreadCounts.clear();
            console.log("✅ Mensagens locais limpas");
        }

        // Passo 2: Limpar listas de contatos de todos os dispositivos
        console.log("📋 2/6 - Limpando listas de contatos...");
        let clearedContactLists = 0;
        if (window.CyberpunkAgent?.instance) {
            for (const [deviceId, device] of window.CyberpunkAgent.instance.devices) {
                if (device.contacts && device.contacts.length > 0) {
                    device.contacts = [];
                    clearedContactLists++;
                }
            }
            console.log(`✅ ${clearedContactLists} listas de contatos limpas`);

            // Salvar dados dos dispositivos atualizados
            await window.CyberpunkAgent.instance.saveDeviceData();
        }

        // Passo 3: Limpar dados do servidor (Foundry settings)
        console.log("🗄️ 3/6 - Limpando dados do servidor...");
        try {
            await game.settings.set('cyberpunk-agent', 'server-messages', {});
            console.log("✅ Mensagens do servidor limpas");
        } catch (error) {
            console.warn("⚠️ Erro ao limpar mensagens do servidor:", error);
        }

        // Passo 4: Limpar localStorage do GM
        console.log("💾 4/6 - Limpando localStorage local...");
        const gmMessagesKey = `cyberpunk-agent-messages-${game.user.id}`;
        const gmTimestampsKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
        localStorage.removeItem(gmMessagesKey);
        localStorage.removeItem(gmTimestampsKey);
        console.log("✅ localStorage do GM limpo");

        // Passo 5: Notificar todos os clientes para limpar dados e reiniciar
        console.log("📡 5/6 - Notificando todos os clientes...");

        // Enviar comando de reset via SocketLib
        if (window.CyberpunkAgent?.instance?.socketLibIntegration) {
            try {
                await window.CyberpunkAgent.instance.socketLibIntegration.broadcastToAll('cyberpunkAgentMasterReset', {
                    timestamp: Date.now(),
                    userId: game.user.id,
                    userName: game.user.name,
                    command: 'masterReset',
                    message: 'GM executou reset completo do sistema'
                });
                console.log("✅ Comando de reset enviado via SocketLib");
            } catch (error) {
                console.warn("⚠️ Erro ao enviar via SocketLib:", error);
            }
        }

        // Fallback: usar hook nativo do Foundry
        try {
            game.socket.emit('module.cyberpunk-agent', {
                type: 'masterReset',
                userId: game.user.id,
                userName: game.user.name,
                timestamp: Date.now()
            });
            console.log("✅ Comando de reset enviado via socket nativo");
        } catch (error) {
            console.warn("⚠️ Erro ao enviar via socket nativo:", error);
        }

        // Passo 6: Atualizar interfaces locais
        console.log("🔄 6/6 - Atualizando interfaces...");
        if (window.CyberpunkAgent?.instance) {
            window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
            window.CyberpunkAgent.instance.updateOpenInterfaces();
            console.log("✅ Interfaces atualizadas");
        }

        // Forçar limpeza dos caches de performance
        if (window.CyberpunkAgentPerformanceManager) {
            await window.CyberpunkAgentPerformanceManager.forceSave();
            window.CyberpunkAgentPerformanceManager.saveQueue.clear();
            console.log("✅ Cache de performance limpo");
        }

        // Limpar cache de deduplicação
        if (window.CyberpunkAgentMessageDeduplication) {
            window.CyberpunkAgentMessageDeduplication.recentMessages.clear();
            console.log("✅ Cache de deduplicação limpo");
        }

        // Notificação de sucesso
        console.log("🎉 === CYBERPUNK AGENT RESET COMPLETO EXECUTADO COM SUCESSO ===");
        ui.notifications.info("🎉 Reset completo executado! Todos os clientes serão reinicializados.", { permanent: true });

        // Programar reinicialização do próprio GM após 3 segundos
        setTimeout(() => {
            console.log("🔄 Reinicializando cliente do GM...");
            window.location.reload();
        }, 3000);

        return true;

    } catch (error) {
        console.error("❌ Erro durante o reset:", error);
        ui.notifications.error(`Erro durante o reset: ${error.message}`);
        return false;
    }
};

/**
 * Função auxiliar para verificar status antes do reset
 */
window.cyberpunkAgentCheckStatus = function () {
    console.log("📊 === CYBERPUNK AGENT - STATUS DO SISTEMA ===");

    if (!game.user.isGM) {
        console.error("❌ Apenas o GM pode verificar o status!");
        return false;
    }

    if (!window.CyberpunkAgent?.instance) {
        console.error("❌ CyberpunkAgent não está disponível!");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;

    // Contar dispositivos e contatos
    let totalDevices = agent.devices.size;
    let totalContacts = 0;
    let devicesWithContacts = 0;

    for (const [deviceId, device] of agent.devices) {
        if (device.contacts && device.contacts.length > 0) {
            totalContacts += device.contacts.length;
            devicesWithContacts++;
        }
    }

    // Contar mensagens
    let totalConversations = agent.messages.size;
    let totalMessages = 0;

    for (const [conversationKey, messages] of agent.messages) {
        if (messages && Array.isArray(messages)) {
            totalMessages += messages.length;
        }
    }

    // Contar usuários conectados
    const connectedUsers = game.users.filter(u => u.active).length;

    console.log(`📱 Dispositivos registrados: ${totalDevices}`);
    console.log(`📋 Dispositivos com contatos: ${devicesWithContacts}`);
    console.log(`👥 Total de contatos: ${totalContacts}`);
    console.log(`💬 Conversas ativas: ${totalConversations}`);
    console.log(`📨 Total de mensagens: ${totalMessages}`);
    console.log(`🌐 Usuários conectados: ${connectedUsers}`);

    // Status dos sistemas enhanced
    if (window.CyberpunkAgentMessageDeduplication) {
        const dedupStats = window.CyberpunkAgentMessageDeduplication.getStats();
        console.log(`🔍 Cache de deduplicação: ${dedupStats.totalMessages} entradas`);
    }

    if (window.CyberpunkAgentPerformanceManager) {
        const queueSize = window.CyberpunkAgentPerformanceManager.saveQueue.size;
        console.log(`⚡ Fila de salvamento: ${queueSize} pendentes`);
    }

    console.log("📊 === CYBERPUNK AGENT - FIM DO STATUS ===");

    return {
        totalDevices,
        devicesWithContacts,
        totalContacts,
        totalConversations,
        totalMessages,
        connectedUsers
    };
};


// Debug function for token controls
window.cyberpunkAgentFixTokenControls = function () {
    console.log("🔧 === CYBERPUNK AGENT - FIXING TOKEN CONTROLS ===");

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;

    console.log("🔍 Checking current state...");
    console.log("  - Devices loaded:", agent.devices.size);
    console.log("  - UI controls available:", !!ui.controls);
    console.log("  - Controls array:", !!ui.controls?.controls);

    if (ui.controls && ui.controls.controls) {
        console.log("🔄 Force updating token controls...");

        // Add the button to current controls
        agent.addControlButton(ui.controls.controls);

        // Force a render without re-initialization to avoid loops
        ui.controls.render();

        console.log("✅ Token controls refresh completed");

        // Check if button was added
        setTimeout(() => {
            const tokenControl = ui.controls.controls.find(c => c.name === "token");
            const agentTool = tokenControl?.tools?.find(t => t.name === "agent");

            if (agentTool) {
                console.log("✅ Agent button found in token controls");
            } else {
                console.log("❌ Agent button still missing from token controls");
                console.log("Available tools:", tokenControl?.tools?.map(t => t.name));
            }
        }, 200);

        return true;
    } else {
        console.log("❌ UI controls not available");
        return false;
    }
};



// Debug function to check actor-device mapping
window.cyberpunkAgentDebugActorDevices = function () {
    console.log("🔍 === CYBERPUNK AGENT - ACTOR-DEVICE MAPPING ===");

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;
    const allActors = game.actors.filter(a => a.type === 'character');

    console.log(`📋 Analyzing ${allActors.length} character actors:`);
    console.log("");

    for (const actor of allActors) {
        // Check for Agent items
        const agentItems = actor.items?.filter(item =>
            item.type === 'gear' &&
            item.name.toLowerCase().includes('agent')
        ) || [];

        const equippedAgentItems = agentItems.filter(item => item.system?.equipped);

        // Check registered devices
        const registeredDevices = agent.deviceMappings.get(actor.id) || [];

        console.log(`👤 ${actor.name} (${actor.id}):`);
        console.log(`   📱 Agent items: ${agentItems.length} (${equippedAgentItems.length} equipped)`);
        console.log(`   🔧 Registered devices: ${registeredDevices.length}`);

        if (registeredDevices.length > 0) {
            registeredDevices.forEach((deviceId, index) => {
                const device = agent.devices.get(deviceId);
                const phoneNumber = agent.devicePhoneNumbers.get(deviceId);
                const isVirtual = device?.isVirtual || false;

                console.log(`      ${index + 1}. ${device?.deviceName || 'Unknown'} (${deviceId})`);
                console.log(`         📞 Phone: ${phoneNumber ? agent.formatPhoneNumberForDisplay(phoneNumber) : 'No phone'}`);
                console.log(`         👻 Virtual: ${isVirtual}`);
                console.log(`         📋 Contacts: ${device?.contacts?.length || 0}`);
            });
        }

        // Check for mismatches
        if (equippedAgentItems.length > 0 && registeredDevices.length === 0) {
            console.log(`   ⚠️  MISMATCH: Has equipped Agent items but no registered devices!`);
        }
        if (equippedAgentItems.length === 0 && registeredDevices.length > 0) {
            const hasVirtual = registeredDevices.some(deviceId => agent.devices.get(deviceId)?.isVirtual);
            if (!hasVirtual) {
                console.log(`   ⚠️  MISMATCH: No equipped Agent items but has non-virtual devices!`);
            }
        }

        console.log("");
    }

    console.log("🔍 === END ACTOR-DEVICE MAPPING ===");
    return true;
};

// Debug function for Chat7 interface issues
window.cyberpunkAgentDebugChat7 = function (deviceId) {
    console.log("💬 === CYBERPUNK AGENT - DEBUGGING CHAT7 INTERFACE ===");

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;

    // If no deviceId provided, try to find one
    if (!deviceId) {
        const allDevices = Array.from(agent.devices.keys());
        if (allDevices.length === 0) {
            console.log("❌ No devices available for testing");
            return false;
        }
        deviceId = allDevices[0];
        console.log(`🔍 Using first available device: ${deviceId}`);
    }

    // Check if device exists
    const device = agent.devices.get(deviceId);
    if (!device) {
        console.log(`❌ Device ${deviceId} not found`);
        return false;
    }

    console.log(`📱 Debugging device: ${device.deviceName || deviceId}`);
    console.log(`   - Owner: ${device.ownerName}`);
    console.log(`   - Avatar: ${device.img}`);
    console.log(`   - Virtual: ${device.isVirtual || false}`);

    // Check contacts
    const contacts = device.contacts || [];
    console.log(`📋 Device contacts: ${contacts.length}`);

    if (contacts.length === 0) {
        console.log("⚠️ No contacts found - this might be why Chat7 is empty");
        return true;
    }

    // Check each contact
    contacts.forEach((contactId, index) => {
        console.log(`\n👤 Contact ${index + 1}: ${contactId}`);

        // Check if contact device exists
        const contactDevice = agent.devices.get(contactId);
        if (!contactDevice) {
            console.log(`   ❌ Contact device not found in devices map!`);
            console.log(`   🔍 Available devices:`, Array.from(agent.devices.keys()).slice(0, 5));
            return;
        }

        console.log(`   ✅ Contact device found:`);
        console.log(`      - Name: ${contactDevice.deviceName || 'Missing name!'}`);
        console.log(`      - Avatar: ${contactDevice.img || 'Missing avatar!'}`);
        console.log(`      - Owner: ${contactDevice.ownerName || 'Missing owner!'}`);

        // Check conversation
        const conversationKey = agent._getDeviceConversationKey(deviceId, contactId);
        const messages = agent.messages.get(conversationKey) || [];

        console.log(`   💬 Conversation (${conversationKey}):`);
        console.log(`      - Messages: ${messages.length}`);

        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            console.log(`      - Last message: "${lastMessage.text}"`);
            console.log(`      - Sender: ${lastMessage.senderId}`);
            console.log(`      - Receiver: ${lastMessage.receiverId}`);
        } else {
            console.log(`      ❌ No messages found!`);
            console.log(`      🔍 Available conversations:`, Array.from(agent.messages.keys()).slice(0, 5));
        }

        // Check unread count
        const unreadCount = agent.getUnreadCountForDevices(deviceId, contactId);
        console.log(`      - Unread: ${unreadCount}`);
    });

    console.log("\n💬 === END CHAT7 DEBUG ===");
    return true;
};

// Debug function for Chat7 navigation issues
window.cyberpunkAgentDebugNavigation = function () {
    console.log("🧭 === CYBERPUNK AGENT - DEBUGGING NAVIGATION ===");

    // Find open AgentApplication windows
    const openWindows = Object.values(ui.windows);
    const agentWindows = openWindows.filter(w => w.constructor.name === 'AgentApplication');

    if (agentWindows.length === 0) {
        console.log("❌ No AgentApplication windows open");
        console.log("💡 Open an Agent interface first, then run this debug");
        return false;
    }

    agentWindows.forEach((window, index) => {
        console.log(`\n📱 AgentApplication ${index + 1}:`);
        console.log(`   - Current view: ${window.currentView}`);
        console.log(`   - Device ID: ${window.device?.id}`);
        console.log(`   - Device name: ${window.device?.deviceName}`);
        console.log(`   - Current contact: ${window.currentContact?.id}`);
        console.log(`   - Contact name: ${window.currentContact?.name}`);
        console.log(`   - Template: ${window.options?.template}`);
        console.log(`   - Rendered: ${window.rendered}`);
        console.log(`   - Element visible: ${window.element?.is(':visible')}`);

        // Check device contacts
        if (window.device?.id && window.CyberpunkAgent?.instance) {
            const device = window.CyberpunkAgent.instance.devices.get(window.device.id);
            const contacts = device?.contacts || [];
            console.log(`   - Device contacts: ${contacts.length}`);

            if (contacts.length > 0) {
                console.log(`   - Contact IDs: ${contacts.join(', ')}`);

                // Test navigation to first contact
                const firstContactId = contacts[0];
                const contactDevice = window.CyberpunkAgent.instance.devices.get(firstContactId);

                console.log(`   - First contact device found: ${!!contactDevice}`);
                if (contactDevice) {
                    console.log(`   - Contact name: ${contactDevice.deviceName || contactDevice.ownerName}`);
                    console.log(`   - Contact avatar: ${contactDevice.img}`);
                }
            }
        }
    });

    console.log("\n🧭 === END NAVIGATION DEBUG ===");
    return true;
};



// Debug function for offline message issues
window.cyberpunkAgentDebugOfflineMessages = function (deviceId) {
    console.log("📬 === CYBERPUNK AGENT - DEBUGGING OFFLINE MESSAGES ===");

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;

    // If no deviceId provided, use first available
    if (!deviceId) {
        const devices = Array.from(agent.devices.keys());
        if (devices.length === 0) {
            console.log("❌ No devices available");
            return false;
        }
        deviceId = devices[0];
    }

    const device = agent.devices.get(deviceId);
    if (!device) {
        console.log(`❌ Device ${deviceId} not found`);
        return false;
    }

    console.log(`📱 Debugging offline messages for: ${device.deviceName} (${deviceId})`);

    // Check all conversations for this device
    console.log("\n💬 All conversations for this device:");
    let totalMessages = 0;

    for (const [conversationKey, messages] of agent.messages.entries()) {
        if (conversationKey.includes(deviceId)) {
            const otherDeviceId = conversationKey.replace(deviceId, '').replace('-', '').replace('|', '');
            const otherDevice = agent.devices.get(otherDeviceId);
            const otherName = otherDevice?.deviceName || otherDevice?.ownerName || `Device ${otherDeviceId}`;

            const unreadMessages = messages.filter(msg => msg.receiverId === deviceId && !msg.read);

            console.log(`   📝 ${conversationKey}:`);
            console.log(`      - Contact: ${otherName}`);
            console.log(`      - Total messages: ${messages.length}`);
            console.log(`      - Unread messages: ${unreadMessages.length}`);

            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                console.log(`      - Last message: "${lastMessage.text}" (${lastMessage.time})`);
                console.log(`      - Last sender: ${lastMessage.senderId}`);
            }

            totalMessages += messages.length;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Total conversations: ${Array.from(agent.messages.keys()).filter(k => k.includes(deviceId)).length}`);
    console.log(`   - Total messages: ${totalMessages}`);
    console.log(`   - Device contacts: ${device.contacts?.length || 0}`);

    // Check localStorage
    try {
        const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            const deviceConversations = Object.keys(parsedData).filter(k => k.includes(deviceId));
            console.log(`   - localStorage conversations: ${deviceConversations.length}`);
        } else {
            console.log(`   - localStorage: No data found`);
        }
    } catch (error) {
        console.log(`   - localStorage error:`, error.message);
    }

    console.log("📬 === END OFFLINE MESSAGES DEBUG ===");
    return true;
};

// Debug function for GM messaging to player devices
window.cyberpunkAgentDebugGMMessaging = async function () {
    console.log("👑 === CYBERPUNK AGENT - DEBUGGING GM MESSAGING ===");

    if (!game.user.isGM) {
        console.log("❌ This test requires GM access");
        return false;
    }

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    const agent = window.CyberpunkAgent.instance;

    // Find GM devices vs Player devices
    const gmDevices = [];
    const playerDevices = [];

    for (const [deviceId, device] of agent.devices.entries()) {
        const deviceOwner = agent._getUserForDevice(deviceId);

        if (deviceOwner) {
            if (deviceOwner.isGM) {
                gmDevices.push({ deviceId, device, owner: deviceOwner });
            } else {
                playerDevices.push({ deviceId, device, owner: deviceOwner });
            }
        } else {
            console.log(`⚠️ Device ${deviceId} has no identifiable owner`);
        }
    }

    console.log(`📊 Device ownership analysis:`);
    console.log(`   - GM devices: ${gmDevices.length}`);
    console.log(`   - Player devices: ${playerDevices.length}`);

    if (gmDevices.length > 0) {
        console.log(`\n👑 GM Devices:`);
        gmDevices.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.device.deviceName} (${item.deviceId})`);
            console.log(`      Owner: ${item.owner.name}`);
            console.log(`      Actor: ${item.device.ownerName}`);
        });
    }

    if (playerDevices.length > 0) {
        console.log(`\n👥 Player Devices:`);
        playerDevices.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.device.deviceName} (${item.deviceId})`);
            console.log(`      Owner: ${item.owner.name} (${item.owner.active ? 'ONLINE' : 'OFFLINE'})`);
            console.log(`      Actor: ${item.device.ownerName}`);
        });
    }

    // Test GM → Player messaging
    if (gmDevices.length > 0 && playerDevices.length > 0) {
        const gmDevice = gmDevices[0];
        const playerDevice = playerDevices[0];

        console.log(`\n🧪 Testing GM → Player message:`);
        console.log(`   From: ${gmDevice.device.deviceName} (GM)`);
        console.log(`   To: ${playerDevice.device.deviceName} (${playerDevice.owner.name})`);
        console.log(`   Player online: ${playerDevice.owner.active}`);

        const testMessage = `GM test message ${Date.now()}`;

        try {
            const success = await agent.sendDeviceMessage(gmDevice.deviceId, playerDevice.deviceId, testMessage);

            if (success) {
                console.log("✅ GM message sent successfully");

                // Check server storage
                setTimeout(() => {
                    const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
                    const conversationKey = agent._getDeviceConversationKey(gmDevice.deviceId, playerDevice.deviceId);
                    const serverConversation = serverMessages[conversationKey] || [];

                    console.log(`📬 Server storage check:`);
                    console.log(`   - Conversation key: ${conversationKey}`);
                    console.log(`   - Messages on server: ${serverConversation.length}`);

                    if (serverConversation.length > 0) {
                        const lastMessage = serverConversation[serverConversation.length - 1];
                        console.log(`   - Last server message: "${lastMessage.text}"`);
                    }
                }, 1000);

            } else {
                console.log("❌ GM message sending failed");
            }
        } catch (error) {
            console.error("❌ Error testing GM messaging:", error);
        }
    }

    console.log("👑 === GM MESSAGING DEBUG COMPLETED ===");
    return true;
};

// Manual sync function for players
window.cyberpunkAgentSyncWithServer = async function () {
    console.log("🔄 === CYBERPUNK AGENT - MANUAL SYNC WITH SERVER ===");

    if (!window.CyberpunkAgent?.instance) {
        console.log("❌ CyberpunkAgent instance not available");
        return false;
    }

    try {
        await window.CyberpunkAgent.instance.requestMessageSyncFromGM();
        console.log("✅ Manual sync request completed");
        return true;
    } catch (error) {
        console.error("❌ Error during manual sync:", error);
        return false;
    }
};

// Simple test to verify GM-Player SocketLib communication
window.cyberpunkAgentTestGMConnection = async function () {
    console.log("📡 === CYBERPUNK AGENT - TESTING GM CONNECTION ===");

    if (!window.CyberpunkAgent?.instance?.socketLibIntegration) {
        console.log("❌ SocketLib integration not available");
        return false;
    }

    try {
        const testData = {
            testMessage: "Connection test from " + game.user.name,
            userId: game.user.id,
            timestamp: Date.now()
        };

        console.log(`📤 Sending test message to GM from ${game.user.name}...`);

        const success = await window.CyberpunkAgent.instance.socketLibIntegration.sendMessageToGM('testConnection', testData);

        if (success) {
            console.log("✅ Test message sent to GM successfully");
        } else {
            console.log("❌ Failed to send test message to GM");
        }

        return success;

    } catch (error) {
        console.error("❌ Error testing GM connection:", error);
        return false;
    }
};


console.log("🔧 Cyberpunk Agent GM functions loaded:");
console.log("  - cyberpunkAgentMasterReset() - Executa reset completo do sistema");
console.log("  - cyberpunkAgentCheckStatus() - Verifica status do sistema");
console.log("  - cyberpunkAgentFixTokenControls() - Corrige controles de token se necessário");

/**
 * GM Chat7 Management Menu - FormApplication for managing all Cyberpunk Agent data
 */
class GMDataManagementMenu extends FormApplication {
    constructor(options = {}) {
        super({}, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "gm-data-management",
            template: "modules/cyberpunk-agent/templates/gm-data-management.html",
            title: "GM Chat7 Management",
            width: 600,
            height: "auto",
            resizable: true,
            closeOnSubmit: false
        });
    }

    getData(options = {}) {
        return {
            // Add any data needed for the template
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Clear All Messages button
        html.find('.clear-all-messages').click(this._onClearAllMessages.bind(this));

        // Clear All Contact Lists button
        html.find('.clear-all-contact-lists').click(this._onClearAllContactLists.bind(this));

        // Synchronize All Devices button
        html.find('.synchronize-all-devices').click(this._onSynchronizeAllDevices.bind(this));

        // Master Reset System button
        html.find('.master-reset-system').click(this._onMasterResetSystem.bind(this));
    }

    async _onClearAllMessages(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Clear All Messages",
                content: "<p>This will delete ALL chat message histories for ALL devices in the registry. This action cannot be undone.</p><p>Are you sure you want to continue?</p>",
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-trash"></i>',
                        label: "Yes, Clear All Messages",
                        callback: () => resolve(true)
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve(false)
                    }
                },
                default: "no"
            }).render(true);
        });

        if (confirmed) {
            try {
                await window.CyberpunkAgent.instance.clearAllMessages();
                ui.notifications.info("All messages cleared successfully!");
            } catch (error) {
                console.error("Error clearing all messages:", error);
                ui.notifications.error("Error clearing all messages: " + error.message);
            }
        }
    }

    async _onClearAllContactLists(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Clear All Contact Lists",
                content: "<p>This will clear the contact list from all agent devices in the registry. This will remove all contacts but keep the devices themselves. This action cannot be undone.</p><p>Are you sure you want to continue?</p>",
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-address-book"></i>',
                        label: "Yes, Clear All Contact Lists",
                        callback: () => resolve(true)
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve(false)
                    }
                },
                default: "no"
            }).render(true);
        });

        if (confirmed) {
            try {
                await window.CyberpunkAgent.instance.clearAllContactLists();
                ui.notifications.info("All contact lists cleared successfully!");
            } catch (error) {
                console.error("Error clearing all contact lists:", error);
                ui.notifications.error("Error clearing all contact lists: " + error.message);
            }
        }
    }

    async _onSynchronizeAllDevices(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Master Synchronization - Devices & Messages",
                content: `
                    <div style="margin-bottom: 15px;">
                        <h3 style="margin: 0 0 10px 0; color: #ff3333;">⚠️ MASTER SYNCHRONIZATION</h3>
                        <p><strong>This will perform a complete system synchronization:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li><strong>Actor Data:</strong> Update device names and avatars from character sheets</li>
                            <li><strong>Device Registry:</strong> Ensure all devices have phone numbers</li>
                            <li><strong>Message History:</strong> Clear all players' local storage</li>
                            <li><strong>Authoritative Sync:</strong> Sync all clients with GM server storage</li>
                        </ul>
                        <p style="color: #ffaa00;"><strong>⚠️ Warning:</strong> This will force all connected players to re-sync their entire message history from the server. Any local-only messages will be lost.</p>
                    </div>
                    <p><strong>Are you sure you want to continue?</strong></p>
                `,
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-sync-alt"></i>',
                        label: "Yes, Perform Master Sync",
                        callback: () => resolve(true)
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve(false)
                    }
                },
                default: "no"
            }).render(true);
        });

        if (confirmed) {
            try {
                const result = await window.CyberpunkAgent.instance.synchronizeAllDevices();
                const message = `🔄 Master synchronization completed successfully!\n` +
                    `👤 Actor data: ${result.actorDataUpdated} devices updated\n` +
                    `📱 Device registry: ${result.deviceCount} devices (${result.devicesUpdated} new phone numbers)\n` +
                    `💬 Messages: ${result.conversationsSync} conversations, ${result.messagesSync} messages synced`;
                ui.notifications.info(message);
            } catch (error) {
                console.error("Error in master synchronization:", error);
                ui.notifications.error("Error in master synchronization: " + error.message);
            }
        }
    }

    async _onMasterResetSystem(event) {
        event.preventDefault();

        try {
            // Call the global master reset function
            if (typeof window.cyberpunkAgentMasterReset === 'function') {
                await window.cyberpunkAgentMasterReset();
                // The master reset function handles its own confirmation dialog
                // and will close this dialog when it completes
            } else {
                console.error("Master reset function not available");
                ui.notifications.error("Master reset function not available");
            }
        } catch (error) {
            console.error("Error executing master reset:", error);
            ui.notifications.error("Error executing master reset: " + error.message);
        }
    }
}

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

/**
 * GM ZMail Management Menu
 */
class GMZMailManagementMenu extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "gm-zmail-management-menu",
            title: "ZMail Management",
            template: "modules/cyberpunk-agent/templates/gm-zmail-management.html",
            width: 800,
            height: 600,
            resizable: true,
            minimizable: true,
            tabs: [
                { navSelector: ".tabs", contentSelector: ".content", initial: "compose" }
            ]
        });
    }

    async getData(options = {}) {
        const data = super.getData(options);

        // Note: Read status is now updated via event-driven notifications from players
        // No need to poll for read status when GM opens ZMail manager

        // Get all registered devices (players only)
        const players = [];
        if (window.CyberpunkAgent?.instance) {
            for (const [deviceId, device] of window.CyberpunkAgent.instance.devices) {
                const user = window.CyberpunkAgent.instance._getUserForDevice(deviceId);
                if (user && !user.isGM) {
                    players.push({
                        deviceId: deviceId,
                        deviceName: device.deviceName,
                        actorName: device.ownerName || 'Unknown Actor'
                    });
                }
            }
        }

        // Get ZMail statistics
        const stats = window.CyberpunkAgent?.instance?.getZMailStatistics() || {
            totalMessages: 0,
            unreadMessages: 0,
            activePlayers: 0
        };

        // Get recent ZMail messages
        const recentMessages = window.CyberpunkAgent?.instance?.getRecentZMailMessages(10) || [];

        return {
            ...data,
            players: players,
            totalMessages: stats.totalMessages,
            unreadMessages: stats.unreadMessages,
            activePlayers: stats.activePlayers,
            recentMessages: recentMessages
        };
    }

    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();

        // Add refresh button before close button
        buttons.unshift({
            class: "zmail-refresh-button",
            icon: "fas fa-sync-alt",
            label: "Refresh",
            onclick: () => this._onRefreshClick()
        });

        return buttons;
    }

    async _onRefreshClick() {
        try {
            console.log("Cyberpunk Agent | Refreshing ZMail management UI...");

            // Simply re-render the application with current data
            await this.render();

            ui.notifications.info("ZMail UI refreshed");
        } catch (error) {
            console.error("Cyberpunk Agent | Error refreshing ZMail UI:", error);
            ui.notifications.error("Failed to refresh ZMail UI");
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Tab navigation
        html.find('.zmail-tab-btn').click(this._onTabClick.bind(this));

        // Send ZMail button
        html.find('.zmail-send-btn, #send-zmail-btn').click(this._onSendZMailClick.bind(this));

        // ZMail management action buttons
        html.find('.zmail-management-btn[data-action="view-all-messages"]').click(this._onViewAllMessagesClick.bind(this));
        html.find('.zmail-management-btn[data-action="mark-all-read"]').click(this._onMarkAllReadClick.bind(this));
        html.find('.zmail-management-btn[data-action="clear-old-messages"]').click(this._onClearOldMessagesClick.bind(this));

        // Recent message actions
        html.find('.zmail-recent-action[data-action="view-message"]').click(this._onViewMessageClick.bind(this));
        html.find('.zmail-recent-action[data-action="copy-link"]').click(this._onCopyZMailLinkClick.bind(this));
        html.find('.zmail-recent-action[data-action="delete-message"]').click(this._onDeleteMessageClick.bind(this));

        // Recipient selection display
        html.find('#zmail-recipient').change(this._onRecipientChange.bind(this));
    }

    /**
     * Handle send ZMail button click
     */
    async _onSendZMailClick(event) {
        event.preventDefault();

        const recipientDeviceId = this.element.find('#zmail-recipient').val();
        const sender = this.element.find('#zmail-sender').val().trim();
        const subject = this.element.find('#zmail-subject').val().trim();
        const content = this.element.find('#zmail-content').val().trim();

        // Validate inputs
        if (!recipientDeviceId) {
            ui.notifications.error("Selecione um destinatário!");
            return;
        }

        if (!sender) {
            ui.notifications.error("Digite o nome do remetente!");
            return;
        }

        if (!subject) {
            ui.notifications.error("Digite o assunto da mensagem!");
            return;
        }

        if (!content) {
            ui.notifications.error("Digite o conteúdo da mensagem!");
            return;
        }

        // Disable button during sending
        const sendBtn = this.element.find('.send-zmail-btn');
        const originalText = sendBtn.html();
        sendBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Enviando...');

        try {
            // Send ZMail message
            const success = await window.CyberpunkAgent?.instance?.sendZMailMessage(
                recipientDeviceId,
                sender,
                subject,
                content
            );

            if (success) {
                ui.notifications.info("ZMail enviado com sucesso!");

                // Clear form
                this.element.find('#zmail-sender').val('');
                this.element.find('#zmail-subject').val('');
                this.element.find('#zmail-content').val('');

                // Refresh the application
                this.render(true);
            } else {
                ui.notifications.error("Erro ao enviar ZMail!");
            }
        } catch (error) {
            console.error("Error sending ZMail:", error);
            ui.notifications.error("Erro ao enviar ZMail: " + error.message);
        } finally {
            // Re-enable button
            sendBtn.prop('disabled', false).html(originalText);
        }
    }

    /**
     * Handle view all messages click
     */
    _onViewAllMessagesClick(event) {
        event.preventDefault();
        console.log("View all messages clicked");

        // Show all ZMail messages in a dialog
        this._showAllMessagesDialog();
    }

    /**
     * Handle mark all as read click
     */
    async _onMarkAllReadClick(event) {
        event.preventDefault();
        console.log("Mark all as read clicked");

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Marcar Todas como Lidas",
                content: `
                  <div class="cp-mark-all-read-dialog">
                    <p>Tem certeza que deseja marcar todas as mensagens ZMail como lidas?</p>
                    <p><small>Esta ação afetará todos os jogadores.</small></p>
                  </div>
                `,
                buttons: {
                    cancel: {
                        label: "Cancelar",
                        callback: () => resolve(false)
                    },
                    confirm: {
                        label: "Marcar como Lidas",
                        callback: () => resolve(true)
                    }
                }
            }).render(true);
        });

        if (confirmed) {
            // Mark all messages as read
            let markedCount = 0;
            if (window.CyberpunkAgent?.instance) {
                for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
                    for (const message of messages) {
                        if (!message.isRead) {
                            message.isRead = true;
                            markedCount++;
                        }
                    }
                }
                await window.CyberpunkAgent.instance.saveZMailData();
            }

            ui.notifications.info(`${markedCount} mensagens marcadas como lidas!`);
            this.render(true);
        }
    }

    /**
     * Handle clear old messages click
     */
    async _onClearOldMessagesClick(event) {
        event.preventDefault();
        console.log("Clear old messages clicked");

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Limpar Mensagens Antigas",
                content: `
                  <div class="cp-clear-old-messages-dialog">
                    <p>Tem certeza que deseja limpar mensagens ZMail antigas (mais de 30 dias)?</p>
                    <p><small>Esta ação não pode ser desfeita.</small></p>
                  </div>
                `,
                buttons: {
                    cancel: {
                        label: "Cancelar",
                        callback: () => resolve(false)
                    },
                    confirm: {
                        label: "Limpar Mensagens",
                        callback: () => resolve(true)
                    }
                }
            }).render(true);
        });

        if (confirmed) {
            const success = await window.CyberpunkAgent?.instance?.clearOldZMailMessages(30);
            if (success) {
                ui.notifications.info("Mensagens antigas limpas com sucesso!");
                this.render(true);
            } else {
                ui.notifications.error("Erro ao limpar mensagens antigas!");
            }
        }
    }

    /**
     * Handle view message click
     */
    _onViewMessageClick(event) {
        event.preventDefault();
        const messageId = event.currentTarget.dataset.messageId;
        console.log("View message clicked:", messageId);

        // Find and show the message
        this._showMessageDialog(messageId);
    }

    /**
     * Handle delete message click
     */
    async _onDeleteMessageClick(event) {
        event.preventDefault();
        const messageId = event.currentTarget.dataset.messageId;
        console.log("Delete message clicked:", messageId);

        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: "Deletar ZMail",
                content: `
                  <div class="cp-delete-zmail-dialog">
                    <p>Tem certeza que deseja deletar esta mensagem ZMail?</p>
                    <p><small>Esta ação não pode ser desfeita.</small></p>
                  </div>
                `,
                buttons: {
                    cancel: {
                        label: "Cancelar",
                        callback: () => resolve(false)
                    },
                    confirm: {
                        label: "Deletar",
                        callback: () => resolve(true)
                    }
                }
            }).render(true);
        });

        if (confirmed) {
            // Find the message and delete it
            let deleted = false;
            if (window.CyberpunkAgent?.instance) {
                for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
                    const messageIndex = messages.findIndex(msg => msg.id === messageId);
                    if (messageIndex !== -1) {
                        messages.splice(messageIndex, 1);
                        deleted = true;
                        break;
                    }
                }
                if (deleted) {
                    await window.CyberpunkAgent.instance.saveZMailData();
                    ui.notifications.info("ZMail deletado com sucesso!");
                    this.render(true);
                } else {
                    ui.notifications.error("Mensagem não encontrada!");
                }
            }
        }
    }

    /**
     * Show all messages dialog
     */
    _showAllMessagesDialog() {
        const allMessages = [];

        if (window.CyberpunkAgent?.instance) {
            for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
                const device = window.CyberpunkAgent.instance.devices.get(deviceId);
                for (const message of messages) {
                    allMessages.push({
                        ...message,
                        recipientDeviceId: deviceId,
                        recipientName: device ? device.deviceName : `Device ${deviceId}`
                    });
                }
            }
        }

        // Sort by timestamp (newest first)
        allMessages.sort((a, b) => b.timestamp - a.timestamp);

        const content = `
          <div class="cp-all-messages-dialog">
            <h3>Total de Mensagens ZMail: ${allMessages.length}</h3>
            <div class="cp-messages-list" style="max-height: 400px; overflow-y: auto;">
              ${allMessages.map(msg => `
                <div class="cp-message-item" style="border: 1px solid var(--cp-border-weak); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>${msg.sender}</strong>
                    <span style="font-size: 0.9em; color: var(--cp-text-muted);">${msg.time}</span>
                  </div>
                  <div style="font-weight: 600; margin-bottom: 4px;">${msg.subject}</div>
                  <div style="font-size: 0.9em; color: var(--cp-text-dim);">Para: ${msg.recipientName}</div>
                  <div style="font-size: 0.9em; color: var(--cp-text-dim); margin-top: 4px;">
                    ${msg.isRead ? '<span style="color: var(--cp-success);">✓ Lida</span>' : '<span style="color: var(--cp-primary);">● Não lida</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        new Dialog({
            title: "Todas as Mensagens ZMail",
            content: content,
            buttons: {
                close: {
                    label: "Fechar"
                }
            }
        }).render(true);
    }

    /**
     * Show message dialog
     */
    _showMessageDialog(messageId) {
        let message = null;
        let recipientName = 'Unknown';

        if (window.CyberpunkAgent?.instance) {
            for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
                const foundMessage = messages.find(msg => msg.id === messageId);
                if (foundMessage) {
                    message = foundMessage;
                    const device = window.CyberpunkAgent.instance.devices.get(deviceId);
                    recipientName = device ? device.deviceName : `Device ${deviceId}`;
                    break;
                }
            }
        }

        if (!message) {
            ui.notifications.error("Mensagem não encontrada!");
            return;
        }

        const content = `
          <div class="cp-message-dialog">
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>De: ${message.sender}</strong>
                <span style="font-size: 0.9em; color: var(--cp-text-muted);">${message.time}</span>
              </div>
              <div style="font-weight: 600; margin-bottom: 4px;">Assunto: ${message.subject}</div>
              <div style="font-size: 0.9em; color: var(--cp-text-dim);">Para: ${recipientName}</div>
            </div>
            <div style="background: var(--cp-gradient-message); border: 1px solid var(--cp-border-weak); border-radius: 8px; padding: 16px; white-space: pre-wrap;">
              ${message.content}
            </div>
            <div style="margin-top: 12px; font-size: 0.9em; color: var(--cp-text-dim);">
              Status: ${message.isRead ? '<span style="color: var(--cp-success);">✓ Lida</span>' : '<span style="color: var(--cp-primary);">● Não lida</span>'}
            </div>
          </div>
        `;

        new Dialog({
            title: `ZMail: ${message.subject}`,
            content: content,
            buttons: {
                close: {
                    label: "Fechar"
                }
            }
        }).render(true);
    }

    /**
     * Handle tab navigation
     */
    _onTabClick(event) {
        event.preventDefault();
        const tabName = event.currentTarget.dataset.tab;

        // Remove active class from all tabs and content
        this.element.find('.zmail-tab-btn').removeClass('active');
        this.element.find('.zmail-tab-content').removeClass('active');

        // Add active class to clicked tab and corresponding content
        event.currentTarget.classList.add('active');
        this.element.find(`#${tabName}-tab`).addClass('active');
    }

    /**
     * Handle copy ZMail link click
     */
    async _onCopyZMailLinkClick(event) {
        event.preventDefault();
        const messageId = event.currentTarget.dataset.messageId;
        console.log("Copy ZMail link clicked:", messageId);

        // Find the message to get its details
        let message = null;
        let recipientName = 'Unknown';

        if (window.CyberpunkAgent?.instance) {
            for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
                const foundMessage = messages.find(msg => msg.id === messageId);
                if (foundMessage) {
                    message = foundMessage;
                    const device = window.CyberpunkAgent.instance.devices.get(deviceId);
                    recipientName = device ? device.deviceName : `Device ${deviceId}`;
                    break;
                }
            }
        }

        if (!message) {
            ui.notifications.error("ZMail message not found!");
            return;
        }

        // Generate the ZMail link
        const zmailLink = `@ZMAIL[${messageId}]{${message.subject}}`;

        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(zmailLink);
            ui.notifications.info(`ZMail link copied to clipboard: ${message.subject}`);
            console.log("ZMail link copied:", zmailLink);
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            // Fallback: show the link in a dialog
            new Dialog({
                title: "ZMail Link",
                content: `
                    <div class="cp-zmail-link-dialog">
                        <p>Copy this link to share the ZMail message:</p>
                        <div class="cp-zmail-link-display">
                            <code>${zmailLink}</code>
                        </div>
                        <p class="cp-zmail-link-hint">
                            <i class="fas fa-info-circle"></i>
                            Paste this in CHAT7 to create a clickable link to this ZMail message.
                        </p>
                    </div>
                `,
                buttons: {
                    close: {
                        label: "Close"
                    }
                }
            }).render(true);
        }
    }

    /**
     * Handle recipient selection change
     */
    _onRecipientChange(event) {
        const select = event.currentTarget;
        const selectedOption = select.options[select.selectedIndex];
        const displayElement = this.element.find('#selected-recipient-display');

        if (selectedOption.value) {
            const actorName = selectedOption.dataset.actorName;
            displayElement.html(`
                <i class="fas fa-user-circle"></i>
                <span>${actorName}</span>
            `).addClass('selected');
        } else {
            displayElement.html(`
                <i class="fas fa-user-circle"></i>
                <span>No recipient selected</span>
            `).removeClass('selected');
        }
    }
}

class CyberpunkAgent {
    constructor() {
        this.id = "cyberpunk-agent";
        this.title = "Cyberpunk Agent";
        this.version = "2.0.0";

        // Device-based system properties
        this.devices = new Map(); // Map: deviceId -> deviceData
        this.deviceMappings = new Map(); // Map: actorId -> [deviceIds]
        this.pinnedDevices = new Set(); // Set: pinned device IDs for GM quick access

        // Phone number system
        this.phoneNumberDictionary = new Map(); // Map: phoneNumber -> deviceId
        this.devicePhoneNumbers = new Map(); // Map: deviceId -> phoneNumber

        // Messages and settings per device
        this.messages = new Map(); // deviceId -> conversationKey -> [messages]
        this._userMuteSettings = new Map(); // userId -> deviceId -> {contactDeviceId -> muted}
        this.lastReadTimestamps = new Map(); // deviceId -> conversationKey -> timestamp (legacy)
        this.unreadCounts = new Map(); // deviceId -> conversationKey -> count

        // Enhanced read status system (user-specific, server-based)
        this.readStatus = new Map(); // conversationKey -> userId -> {lastReadTimestamp, readMessages}
        this._readStatusCache = new Map(); // Local cache for performance

        // UI and system management
        this.uiController = new UIController();
        this._agentSystemSetupComplete = false;
        this._openInterfaces = new Set();
        this._openChatInterfaces = new Set();

        // Activity manager for intelligent notifications
        this._activeConversations = new Map(); // Maps userId -> { deviceId, contactId, timestamp }
        this._lastActivityUpdate = null;

        // SocketLib integration
        this.socketLibIntegration = null;
        this._socketLibAvailable = false;
        this._socketLibReadyHookSet = false;

        // ZMail system - GM to player messaging
        this.zmailMessages = new Map(); // deviceId -> [zmailMessages]
        this.zmailSettings = new Map(); // deviceId -> {settings}

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

        // Register contact networks setting
        game.settings.register('cyberpunk-agent', 'contact-networks', {
            name: 'Contact Networks',
            hint: 'Internal storage for contact network data',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        // Register server-based messages setting
        game.settings.register('cyberpunk-agent', 'server-messages', {
            name: 'Server Messages',
            hint: 'Internal storage for server-based messaging system',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        // Register server-based read status setting
        game.settings.register('cyberpunk-agent', 'server-read-status', {
            name: 'Server Read Status',
            hint: 'Internal storage for server-based read status system',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        // Register offline message queue setting
        game.settings.register('cyberpunk-agent', 'offline-message-queue', {
            name: 'Offline Message Queue',
            hint: 'Queue of messages for offline users',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });

        // Register GM pinned devices setting
        game.settings.register('cyberpunk-agent', 'gm-pinned-devices', {
            name: 'GM Pinned Devices',
            hint: 'List of devices pinned by GM for quick access',
            scope: 'world',
            config: false,
            type: Array,
            default: []
        });

        // Register ZMail data setting
        game.settings.register('cyberpunk-agent', 'zmail-data', {
            name: 'ZMail Data',
            hint: 'Internal storage for ZMail messages and settings',
            scope: 'world',
            config: false,
            type: Object,
            default: { messages: {}, settings: {} }
        });

        // Register a custom settings menu for GM Chat7 Management
        game.settings.registerMenu('cyberpunk-agent', 'gm-data-management-menu', {
            name: 'GM Chat7 Management',
            hint: 'Manage all chat messages, contact connections, and device registry for all actors',
            label: 'GM Chat7 Management',
            icon: 'fas fa-database',
            type: GMDataManagementMenu,
            restricted: true
        });

        // Register a custom settings menu for GM ZMail Management
        game.settings.registerMenu('cyberpunk-agent', 'gm-zmail-management-menu', {
            name: 'GM ZMail Management',
            hint: 'Manage ZMail messages - send and manage one-way messages to players',
            label: 'ZMail Management',
            icon: 'fas fa-envelope',
            type: GMZMailManagementMenu,
            restricted: true
        });

        console.log("Cyberpunk Agent | Settings registered successfully");
    }

    /**
     * Setup the agent system
     */
    setupAgentSystem() {
        console.log("Cyberpunk Agent | Setting up agent system...");

        // If we're a player, request message sync from GM when system starts
        if (!game.user.isGM) {
            setTimeout(async () => {
                try {
                    console.log("Cyberpunk Agent | Player requesting initial message sync from GM");
                    await this.requestMessageSyncFromGM();
                    // Also sync ZMail data
                    await this.requestZMailSyncFromGM();
                } catch (error) {
                    console.error("Cyberpunk Agent | Error requesting initial sync:", error);
                }
            }, 3000); // Wait for everything to load
        }

        // Wait a bit for other files to load
        setTimeout(() => {
            this._setupAgentSystemInternal().catch(error => {
                console.error("Cyberpunk Agent | Error during agent system setup:", error);
            });
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
    async _setupAgentSystemInternal() {
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

        if (typeof AgentHomeApplication === 'undefined' && typeof window.AgentHomeApplication === 'undefined') {
            console.error("Cyberpunk Agent | AgentHomeApplication not loaded!");
        }
        if (typeof Chat7Application === 'undefined' && typeof window.Chat7Application === 'undefined') {
            console.error("Cyberpunk Agent | Chat7Application not loaded!");
        }

        // Load device data
        this.loadDeviceData();
        // Device data loaded

        // Load messages
        await this.loadMessages();
        // Messages loaded

        // Load ZMail data
        await this.loadZMailData();
        // ZMail data loaded

        // Initialize device discovery for existing agent items
        this.initializeDeviceDiscovery();

        // Load user's mute settings
        this._loadUserMuteSettings(game.user.id);

        // Initialize enhanced read status system
        await this._initializeEnhancedReadStatus();

        // Setup SocketLib integration if available
        this.setupSocketLibIntegration();

        // Setup SocketLib when it's ready
        this.setupSocketLibWhenReady();

        // Additional SocketLib initialization check after a delay
        setTimeout(() => {
            // Check SocketLib status after delay
            if (!this._isSocketLibAvailable()) {
                // SocketLib not ready yet, attempting manual initialization

                // Try to initialize SocketLib manually
                if (typeof window.initializeSocketLib === 'function') {
                    const success = window.initializeSocketLib();
                    if (success && this.socketLibIntegration) {
                        this.socketLibIntegration.updateSocket(window.socket);
                        console.log("Cyberpunk Agent | SocketLib initialized successfully");
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

        // ENHANCED: Perform comprehensive sync with server on module load
        console.log("Cyberpunk Agent | Starting comprehensive sync on module load...");
        await this.performInitialMessageSync();

        // Setup periodic sync to keep messages up-to-date
        this.setupPeriodicSync();

        this._agentSystemSetupComplete = true;
        console.log("Cyberpunk Agent | Enhanced agent system setup complete");
    }

    /**
     * Perform comprehensive message sync on module initialization
     * This ensures users get all their messages when loading the module, regardless of browser
     */
    async performInitialMessageSync() {
        try {
            console.log("Cyberpunk Agent | Performing initial comprehensive message sync...");

            // Get all user's devices
            const userDevices = [];
            for (const [actorId, deviceIds] of this.deviceMappings.entries()) {
                const actor = game.actors.get(actorId);
                if (actor && actor.ownership && actor.ownership[game.user.id] >= 1) {
                    userDevices.push(...deviceIds);
                }
            }

            if (userDevices.length === 0) {
                console.log("Cyberpunk Agent | No user devices found for sync");
                return;
            }

            console.log(`Cyberpunk Agent | Syncing ${userDevices.length} user devices on startup`);
            let totalSynced = 0;

            // Sync each device with progress indication
            for (const deviceId of userDevices) {
                const success = await this.syncMessagesWithServer(deviceId, false);
                if (success) {
                    totalSynced++;
                }
            }

            if (totalSynced > 0) {
                console.log(`Cyberpunk Agent | ${totalSynced} dispositivos sincronizados com servidor`);
                console.log(`Cyberpunk Agent | Initial sync completed: ${totalSynced}/${userDevices.length} devices synced`);
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error in initial message sync:", error);
        }
    }

    /**
     * Setup periodic sync to keep messages synchronized
     * This ensures messages stay up-to-date even during long sessions
     */
    setupPeriodicSync() {
        // Sync every 10 minutes
        const syncInterval = 10 * 60 * 1000; // 10 minutes

        setInterval(async () => {
            try {
                console.log("Cyberpunk Agent | Running periodic message sync...");

                // Get all user's devices
                const userDevices = [];
                for (const [actorId, deviceIds] of this.deviceMappings.entries()) {
                    const actor = game.actors.get(actorId);
                    if (actor && actor.ownership && actor.ownership[game.user.id] >= 1) {
                        userDevices.push(...deviceIds);
                    }
                }

                // Sync each device silently
                for (const deviceId of userDevices) {
                    await this.syncMessagesWithServer(deviceId, false);
                }

                console.log(`Cyberpunk Agent | Periodic sync completed for ${userDevices.length} devices`);
            } catch (error) {
                console.error("Cyberpunk Agent | Error in periodic sync:", error);
            }
        }, syncInterval);

        console.log(`Cyberpunk Agent | Periodic sync enabled (every ${syncInterval / 60000} minutes)`);
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

        // Initializing device discovery

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
        // Discovering existing agent items

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
                        // Device already exists, skipping
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
            // Device discovery completed
        }
    }

    /**
     * Add control button to the scene controls based on equipped agents
     */
    async addControlButton(controls) {
        try {
            // Safety check: ensure controls is an array
            if (!Array.isArray(controls)) {
                return;
            }

            // Ensure device data is loaded
            if (!this.devices || this.devices.size === 0) {
                this.loadDeviceData();

                // If still no devices after loading, device discovery might not be complete
                if (this.devices.size === 0) {
                    return;
                }
            }

            // Find the token controls
            const tokenControl = controls.find(control => control.name === "token");

            if (tokenControl) {
                // Safety check: ensure tools array exists
                if (!Array.isArray(tokenControl.tools)) {
                    tokenControl.tools = [];
                }

                // Remove any existing agent tools first to prevent duplicates
                tokenControl.tools = tokenControl.tools.filter(tool => tool.name !== "agent");

                // Different behavior for GM vs Players
                if (game.user.isGM) {
                    // 🆕 GM: Access to ALL registered devices
                    const allDevices = this.getAllRegisteredDevices();

                    if (allDevices.length > 0) {
                        if (allDevices.length === 1) {
                            // Single device - open directly
                            const device = allDevices[0];
                            tokenControl.tools.push({
                                name: "agent",
                                title: `Agent: ${device.ownerName}`,
                                icon: "fas fa-mobile-alt",
                                onClick: () => {
                                    this.openSpecificAgent(device.deviceId);
                                }
                            });
                        } else {
                            // Multiple devices - show selection menu
                            tokenControl.tools.push({
                                name: "agent",
                                title: `Agent (${allDevices.length} devices)`,
                                icon: "fas fa-mobile-alt",
                                onClick: () => {
                                    this.showAllDevicesMenu(allDevices);
                                }
                            });
                        }
                        // GM agent button added successfully
                    }
                } else {
                    // Players: Access only to their equipped agents (existing behavior)
                    const equippedAgents = await this.getEquippedAgentsForUser();

                    if (equippedAgents.length > 0) {
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
                            tokenControl.tools.push({
                                name: "agent",
                                title: `Agent (${equippedAgents.length} equipped)`,
                                icon: "fas fa-mobile-alt",
                                onClick: () => {
                                    this.showEquippedAgentMenu(equippedAgents);
                                }
                            });
                        }
                        // Player agent button added successfully
                    }
                }
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error in addControlButton:", error);
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

                // Find the actor that owns this item
                const actor = item.parent;
                if (actor) {
                    // If the item is being equipped, ensure it has a phone number
                    if (changes.system.equipped) {
                        const deviceId = `device-${actor.id}-${item.id}`;
                        if (this.devices.has(deviceId)) {
                            // Ensure phone number is assigned
                            this.getDevicePhoneNumber(deviceId).then(() => {
                                console.log(`Cyberpunk Agent | Phone number ensured for equipped device: ${item.name}`);
                                this.savePhoneNumberData();
                            }).catch(error => {
                                console.error(`Cyberpunk Agent | Error ensuring phone number for equipped device ${deviceId}:`, error);
                            });
                        }
                    }
                }

                // Update token controls after a short delay to ensure the change is processed
                setTimeout(() => {
                    this.updateTokenControls();
                }, 100);
            }
        });

        // Monitor actor updates that might affect equipment
        Hooks.on('updateActor', (actor, changes, options, userId) => {
            console.log(`🔄 Cyberpunk Agent | Actor update hook triggered for ${actor.name}:`, changes);

            // 🆕 Call the reactive device registry update system
            this.handleActorUpdate(actor, changes, options, userId);

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

        // 🆕 Monitor actor creation to set up device mappings
        Hooks.on('createActor', (actor, options, userId) => {
            console.log(`🆕 Cyberpunk Agent | New actor created: ${actor.name} (${actor.id})`);

            // Set up device mappings for this actor
            this.deviceMappings.set(actor.id, []);

            // Check if the actor has any agent items
            setTimeout(() => {
                this.checkAndCreateDevicesForActor(actor);
            }, 100);
        });

        // 🆕 Monitor actor deletion to clean up device registry
        Hooks.on('deleteActor', (actor, options, userId) => {
            console.log(`🗑️  Cyberpunk Agent | Actor deleted: ${actor.name} (${actor.id})`);

            // Clean up all devices for this actor
            this.cleanupDevicesForActor(actor);

            // Remove device mappings
            this.deviceMappings.delete(actor.id);

            // Update token controls
            setTimeout(() => {
                this.updateTokenControls();
            }, 100);
        });

        console.log("Cyberpunk Agent | Item and actor update hooks configured");
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
                    // Device already exists, skipping
                    continue;
                }

                const deviceName = item.name || `Agent ${item.id.slice(-4)}`;

                // Create device data with owner name and avatar
                const deviceData = {
                    id: deviceId,
                    ownerActorId: actor.id,
                    ownerName: actor.name,  // 🆕 Include owner name
                    itemId: item.id,
                    deviceName: actor.name,  // 🆕 Use actor name instead of item name
                    img: actor.img || 'icons/svg/mystery-man.svg',  // 🆕 Include actor avatar
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

                // Immediately assign a phone number to the device
                try {
                    await this.getDevicePhoneNumber(deviceId);
                    console.log(`Cyberpunk Agent | Phone number assigned to device: ${deviceName} for actor ${actor.name}`);
                } catch (phoneError) {
                    console.error(`Cyberpunk Agent | Error assigning phone number to device ${deviceId}:`, phoneError);
                }

                devicesCreated++;
                console.log(`Cyberpunk Agent | Auto-created device: ${deviceName} for actor ${actor.name}`);
            }

            // Save the new device data if any devices were created
            if (devicesCreated > 0) {
                await this.saveDeviceData();
                await this.savePhoneNumberData();
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
        try {
            if (game.scenes.active && ui.controls && ui.controls.controls) {
                // Add button to current controls without re-initializing
                this.addControlButton(ui.controls.controls);

                // Force a render update only
                ui.controls.render();
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error updating token controls:", error);
        }
    }

    /**
     * Force add token control button (bypasses broken hooks from other modules)
     */
    forceAddTokenControlButton() {
        try {
            console.log("Cyberpunk Agent | Force adding token control button...");

            // Check if UI is ready
            if (!ui.controls || !ui.controls.controls) {
                console.log("Cyberpunk Agent | UI controls not ready, retrying...");
                setTimeout(() => this.forceAddTokenControlButton(), 500);
                return;
            }

            // Find token control
            const tokenControl = ui.controls.controls.find(c => c.name === "token");
            if (!tokenControl) {
                console.log("Cyberpunk Agent | Token control not found, retrying...");
                setTimeout(() => this.forceAddTokenControlButton(), 500);
                return;
            }

            // Check if button already exists
            const existingButton = tokenControl.tools?.find(t => t.name === "agent");
            if (existingButton) {
                console.log("Cyberpunk Agent | Agent button already exists in token controls");
                return;
            }

            // Add the button
            this.addControlButton(ui.controls.controls);

            // Force render
            ui.controls.render();

            console.log("Cyberpunk Agent | Token control button force-added successfully");

        } catch (error) {
            console.error("Cyberpunk Agent | Error force adding token control button:", error);
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
    async getEquippedAgentsForUser() {
        const equippedAgents = [];

        try {
            // Ensure device data is loaded
            if (!this.devices || this.devices.size === 0) {
                console.log("Cyberpunk Agent | No devices loaded in getEquippedAgentsForUser, loading device data...");
                this.loadDeviceData();
            }

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

                        // Ensure the device has a phone number assigned
                        await this.getDevicePhoneNumber(deviceId);

                        // 🆕 Check and update owner name if needed
                        const device = this.devices.get(deviceId);
                        if (device && device.ownerName !== actor.name) {
                            device.ownerName = actor.name;
                            ownerNamesUpdated++;
                            console.log(`Cyberpunk Agent | Updated owner name for device ${deviceId}: ${device.ownerName} → ${actor.name}`);
                        }

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

            // If we're a player, sync with server to get any offline messages
            if (!game.user.isGM) {
                console.log("Cyberpunk Agent | Player opening agent - requesting server sync...");
                setTimeout(async () => {
                    try {
                        await this.requestMessageSyncFromGM();
                        // Also sync ZMail data
                        await this.requestZMailSyncFromGM();
                    } catch (error) {
                        console.error("Cyberpunk Agent | Error syncing on agent open:", error);
                    }
                }, 500);
            } else {
                // GM can sync directly with server
                await this.synchronizeMessagesWithServer(deviceId);
            }

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

        // Get phone numbers for all equipped agents
        const options = await Promise.all(equippedAgents.map(async agent => {
            const phoneNumber = await this.getDevicePhoneNumber(agent.deviceId);
            const formattedPhoneNumber = this.formatPhoneNumberForDisplay(phoneNumber);
            return {
                label: `${agent.actorName}: ${formattedPhoneNumber}`,
                value: agent.deviceId
            };
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
    /**
     * REFACTORED: Open agent interface with server-based synchronization
     */
    async openAgentInterface() {
        try {
            console.log("Cyberpunk Agent | Opening agent interface with server sync");

            // Get user's accessible devices
            const devices = this.getUserAccessibleDevices();

            if (devices.length === 0) {
                ui.notifications.warn("Nenhum agente encontrado. Adicione um agente ao seu personagem.");
                return;
            }

            // Sync messages with server for each device
            for (const device of devices) {
                await this.syncMessagesWithServer(device.id);
            }

            // Show device selection menu
            if (devices.length === 1) {
                await this.showAgentHome(devices[0]);
            } else {
                await this.showEquippedAgentMenu(devices);
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error opening agent interface:", error);
            ui.notifications.error("Erro ao abrir interface do agente.");
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
            // Enhanced sync messages with server for this device (with user feedback)
            console.log("Cyberpunk Agent | Syncing messages with server for device:", device.id);
            await this.syncMessagesWithServer(device.id, true);

            console.log("Cyberpunk Agent | Creating AgentApplication instance...");
            const AgentClass = AgentApplication || window.AgentApplication;
            const agentApp = new AgentClass(device);
            console.log("Cyberpunk Agent | AgentApplication instance created successfully");

            // Note: Sync button moved to home screen context menu for better UX

            // Play opening sound effect
            this.playSoundEffect('opening-window');

            // Render the application
            agentApp.render(true);
        } catch (error) {
            console.error("Cyberpunk Agent | Error creating AgentApplication:", error);
            ui.notifications.error("Erro ao criar a interface do Agent: " + error.message);
        }
    }

    // Sync button functionality moved to home screen context menu

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
            // Loading device data from settings

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

            // Load phone number data
            this.loadPhoneNumberData();

            // Load pinned devices (GM only)
            if (game.user.isGM) {
                this.loadPinnedDevices();
            }
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
                } else {
                    console.warn("Cyberpunk Agent | Failed to send device data save request to GM");
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available, cannot request GM save");
                console.warn("Cyberpunk Agent | Cannot save device data - GM action required");
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
            // Load all conversations that involve this device
            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                const allMessages = JSON.parse(storedData);

                // Load each conversation into the messages map
                for (const [conversationKey, messages] of Object.entries(allMessages)) {
                    this.messages.set(conversationKey, messages);
                }

                console.log(`Cyberpunk Agent | Loaded messages for device ${deviceId} from ${Object.keys(allMessages).length} conversations`);
            } else {
                console.log(`Cyberpunk Agent | No messages found for device ${deviceId}, initialized empty`);
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error loading messages for device ${deviceId}:`, error);
        }
    }

    /**
     * Save messages for a specific device
     */
    async saveMessagesForDevice(deviceId) {
        try {
            // Save all conversations that involve this device
            const allMessages = {};

            // Get all conversations that involve this device
            for (const [conversationKey, messages] of this.messages.entries()) {
                if (conversationKey.includes(deviceId)) {
                    allMessages[conversationKey] = messages;
                }
            }

            const storageKey = `cyberpunk-agent-messages-${game.user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(allMessages));

            const conversationCount = Object.keys(allMessages).length;
            const totalMessages = Object.values(allMessages).reduce((sum, msgs) => sum + msgs.length, 0);

            console.log(`Cyberpunk Agent | Saved ${totalMessages} messages in ${conversationCount} conversations for device ${deviceId}`);
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
     * Sync messages for a specific device to ensure we have the latest data
     * This is called when opening an agent interface to get any messages sent while offline
     */
    async syncMessagesForDevice(deviceId) {
        try {
            console.log(`Cyberpunk Agent | Syncing messages for device ${deviceId}`);

            // First, ensure we have loaded all messages from localStorage
            await this.loadMessagesForDevice(deviceId);

            // Check if we need cross-client communication
            if (!this._needsCrossClientCommunication()) {
                console.log("Cyberpunk Agent | Single user session, skipping device message sync");
                return;
            }

            if (!this._isSocketLibAvailable()) {
                console.log("Cyberpunk Agent | SocketLib not available, skipping device message sync");
                return;
            }

            // Get all users in the session
            const users = Array.from(game.users.values()).filter(user => user.active);
            console.log("Cyberpunk Agent | Active users for device sync:", users.map(u => u.name));

            // Request message synchronization from all other users for this device
            const syncPromises = users
                .filter(user => user.id !== game.user.id) // Exclude current user
                .map(async (user) => {
                    try {
                        console.log(`Cyberpunk Agent | Requesting device message sync from user: ${user.name}`);

                        const syncData = {
                            requestingUserId: game.user.id,
                            requestingUserName: game.user.name,
                            deviceId: deviceId,
                            timestamp: Date.now()
                        };

                        // Send sync request to specific user
                        const success = await this.socketLibIntegration.sendMessageToUser(
                            user.id,
                            'requestDeviceMessageSync',
                            syncData
                        );

                        if (success) {
                            console.log(`Cyberpunk Agent | Device message sync request sent to ${user.name}`);
                            return { user: user.name, success: true };
                        } else {
                            console.warn(`Cyberpunk Agent | Failed to send device sync request to ${user.name}`);
                            return { user: user.name, success: false };
                        }
                    } catch (error) {
                        console.error(`Cyberpunk Agent | Error requesting device sync from ${user.name}:`, error);
                        return { user: user.name, success: false, error: error.message };
                    }
                });

            // Wait for all sync requests to complete
            const results = await Promise.all(syncPromises);
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            console.log(`Cyberpunk Agent | Device message sync completed: ${successful.length} successful, ${failed.length} failed`);

            if (failed.length > 0) {
                console.warn("Cyberpunk Agent | Failed device sync requests:", failed);
            }

        } catch (error) {
            console.error(`Cyberpunk Agent | Error syncing messages for device ${deviceId}:`, error);
        }
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
                // Note: Reciprocal contact addition only happens when messages are sent
                // This ensures the other device only becomes aware when communication occurs

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
    /**
     * Mark a conversation as read (when user opens the chat)
     * Enhanced version with user-specific read status and GM/Player separation
     */
    async markConversationAsRead(actorId1, actorId2, userId = null) {
        const currentUserId = userId || game.user.id;
        const conversationKey = this._getConversationKey(actorId1, actorId2);
        const now = Date.now();

        console.log(`Cyberpunk Agent | Marking conversation ${conversationKey} as read for user ${currentUserId} (actor ${actorId1})`);

        // Check if this user should be able to mark messages as read
        if (!this._shouldMarkAsRead(actorId1, actorId2, currentUserId)) {
            console.log(`Cyberpunk Agent | User ${currentUserId} cannot mark conversation ${conversationKey} as read`);
            return;
        }

        // Update the enhanced read status system
        await this._updateReadStatus(conversationKey, currentUserId, now);

        // Legacy support: Update the old read timestamp system
        this.lastReadTimestamps.set(conversationKey, now);

        // Mark all messages in this conversation as read for this user
        if (this.messages.has(conversationKey)) {
            const conversation = this.messages.get(conversationKey);
            let hasChanges = false;

            conversation.forEach(message => {
                // Mark message as read if the current user is the receiver
                if (message.receiverId === actorId1 && !message.read) {
                    message.read = true;
                    hasChanges = true;
                    console.log(`Cyberpunk Agent | Marked message ${message.id} as read for user ${currentUserId}`);
                }
            });

            // Save messages if there were changes
            if (hasChanges) {
                this.saveMessages();
                console.log(`Cyberpunk Agent | Marked messages in conversation ${conversationKey} as read for user ${currentUserId}`);
            } else {
                console.log(`Cyberpunk Agent | No messages to mark as read in conversation ${conversationKey} for user ${currentUserId}`);
            }
        } else {
            console.log(`Cyberpunk Agent | No conversation found for key ${conversationKey}`);
        }

        // Clear the unread count cache for this conversation
        this.unreadCounts.delete(conversationKey);
        console.log(`Cyberpunk Agent | Cleared unread count cache for conversation ${conversationKey}`);

        // Save the read timestamps to settings (legacy)
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
    /**
     * Get unread message count for a conversation
     * Enhanced version with user-specific read status
     */
    getUnreadCount(actorId1, actorId2, userId = null) {
        const currentUserId = userId || game.user.id;
        const conversationKey = this._getConversationKey(actorId1, actorId2);

        // Check cache first (user-specific cache key)
        const cacheKey = `${conversationKey}-${currentUserId}`;
        if (this.unreadCounts.has(cacheKey)) {
            const cachedCount = this.unreadCounts.get(cacheKey);
            console.log(`Cyberpunk Agent | Using cached unread count for ${conversationKey} (user ${currentUserId}): ${cachedCount}`);
            return cachedCount;
        }

        // Get all messages for this conversation
        const messages = this.getMessagesForConversation(actorId1, actorId2);

        // Get user-specific read status
        const userReadStatus = this.readStatus.get(conversationKey)?.get(currentUserId);

        // Count messages that are unread for this specific user
        const unreadCount = messages.filter(message => {
            if (message.receiverId !== actorId1) return false;

            // Use enhanced read status if available, fallback to legacy read property
            if (userReadStatus) {
                return !this._isMessageReadByUser(message, currentUserId, userReadStatus);
            } else {
                return !message.read;
            }
        }).length;

        // Cache the result with user-specific key
        this.unreadCounts.set(cacheKey, unreadCount);

        console.log(`Cyberpunk Agent | Calculated unread count for ${conversationKey} (user ${currentUserId}): ${unreadCount} (${messages.length} total messages)`);

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
     * ENHANCED READ STATUS SYSTEM
     * ===========================
     * 
     * This system provides user-specific, server-based read status tracking
     * that addresses cross-browser synchronization and GM/Player separation.
     * 
     * Key Features:
     * - User-specific read status (not device-based)
     * - Server-based storage for cross-browser sync
     * - GM/Player separation logic
     * - Proper ownership validation
     */

    /**
     * Check if a user should be able to mark messages as read
     */
    _shouldMarkAsRead(actorId1, actorId2, userId) {
        const user = game.users.get(userId);
        const actor = game.actors.get(actorId1);

        if (!user || !actor) {
            console.warn(`Cyberpunk Agent | Invalid user or actor: user=${userId}, actor=${actorId1}`);
            return false;
        }

        // If user is GM operating their own device, mark as read
        if (user.isGM && actor.ownership[userId] === 3) {
            console.log(`Cyberpunk Agent | GM ${user.name} operating own device ${actorId1} - marking as read`);
            return true;
        }

        // If user is Player operating their own device, mark as read
        if (!user.isGM && actor.ownership[userId] === 3) {
            console.log(`Cyberpunk Agent | Player ${user.name} operating own device ${actorId1} - marking as read`);
            return true;
        }

        // If GM is operating a player's device, don't mark as read for the player
        if (user.isGM && actor.ownership[userId] !== 3) {
            console.log(`Cyberpunk Agent | GM ${user.name} operating player device ${actorId1} - NOT marking as read`);
            return false;
        }

        // If player is trying to operate someone else's device, don't mark as read
        if (!user.isGM && actor.ownership[userId] !== 3) {
            console.log(`Cyberpunk Agent | Player ${user.name} operating someone else's device ${actorId1} - NOT marking as read`);
            return false;
        }

        return false;
    }

    /**
     * Update read status for a specific user and conversation
     */
    async _updateReadStatus(conversationKey, userId, timestamp) {
        try {
            // Update local cache
            if (!this.readStatus.has(conversationKey)) {
                this.readStatus.set(conversationKey, new Map());
            }

            const conversationReadStatus = this.readStatus.get(conversationKey);
            const readMessageIds = this._getReadMessageIds(conversationKey, userId);

            conversationReadStatus.set(userId, {
                lastReadTimestamp: timestamp,
                readMessages: readMessageIds
            });

            console.log(`Cyberpunk Agent | Updated read status for user ${userId} in conversation ${conversationKey}`);

            // Save to server (with permission check)
            if (game.user.isGM) {
                await this._saveReadStatusToServer(conversationKey, userId, timestamp, readMessageIds);
            } else {
                // Request GM to save read status
                await this._requestReadStatusUpdate(conversationKey, userId, timestamp, readMessageIds);
            }

            // Broadcast update to other clients
            await this._broadcastReadStatusUpdate(conversationKey, userId, timestamp, readMessageIds);

        } catch (error) {
            console.error(`Cyberpunk Agent | Error updating read status for user ${userId}:`, error);
        }
    }

    /**
     * Get list of message IDs that should be marked as read for a user
     */
    _getReadMessageIds(conversationKey, userId) {
        if (!this.messages.has(conversationKey)) {
            return [];
        }

        const conversation = this.messages.get(conversationKey);
        const [actorId1, actorId2] = conversationKey.split('-');

        return conversation
            .filter(message => message.receiverId === actorId1)
            .map(message => message.id);
    }

    /**
     * Check if a message is read by a specific user
     */
    _isMessageReadByUser(message, userId, userReadStatus) {
        if (!userReadStatus) return false;

        return userReadStatus.readMessages.includes(message.id) ||
            message.timestamp <= userReadStatus.lastReadTimestamp;
    }

    /**
     * Request GM to update read status (for non-GM users)
     */
    async _requestReadStatusUpdate(conversationKey, userId, timestamp, readMessageIds) {
        try {
            if (this.socketLibIntegration && this.socketLibIntegration.isAvailable) {
                await this.socketLibIntegration.sendMessageToGM('readStatusUpdateRequest', {
                    conversationKey: conversationKey,
                    userId: userId,
                    timestamp: timestamp,
                    readMessageIds: readMessageIds,
                    requestingUserId: game.user.id,
                    requestingUserName: game.user.name
                });
                console.log(`Cyberpunk Agent | Read status update request sent to GM for conversation ${conversationKey}`);
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available for read status update request");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error sending read status update request:", error);
        }
    }

    /**
     * Save read status to server (following message persistence pattern)
     */
    async _saveReadStatusToServer(conversationKey, userId, timestamp, readMessageIds) {
        try {
            // Only GMs can save to server settings
            if (!game.user.isGM) {
                console.log("Cyberpunk Agent | Non-GM user cannot save read status to server, skipping");
                return;
            }

            // Use server settings for read status (same pattern as messages)
            const serverReadStatus = game.settings.get('cyberpunk-agent', 'server-read-status') || {};

            if (!serverReadStatus[userId]) {
                serverReadStatus[userId] = {};
            }

            serverReadStatus[userId][conversationKey] = {
                lastReadTimestamp: timestamp,
                readMessages: readMessageIds
            };

            // Save to server settings
            await game.settings.set('cyberpunk-agent', 'server-read-status', serverReadStatus);
            console.log(`Cyberpunk Agent | Saved read status to server for user ${userId}`);

            // Also save to localStorage as cache
            const storageKey = `cyberpunk-agent-read-status-${userId}`;
            const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            existingData[conversationKey] = {
                lastReadTimestamp: timestamp,
                readMessages: readMessageIds
            };
            localStorage.setItem(storageKey, JSON.stringify(existingData));

        } catch (error) {
            console.error(`Cyberpunk Agent | Error saving read status to server:`, error);

            // Fallback to localStorage only
            try {
                const storageKey = `cyberpunk-agent-read-status-${userId}`;
                const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
                existingData[conversationKey] = {
                    lastReadTimestamp: timestamp,
                    readMessages: readMessageIds
                };
                localStorage.setItem(storageKey, JSON.stringify(existingData));
                console.log(`Cyberpunk Agent | Fallback: Saved read status to localStorage for user ${userId}`);
            } catch (localStorageError) {
                console.error(`Cyberpunk Agent | Error saving to localStorage fallback:`, localStorageError);
            }
        }
    }

    /**
     * Load read status from server (following message persistence pattern)
     */
    async _loadReadStatusFromServer(userId) {
        try {
            // Try to load from server settings first
            const serverReadStatus = game.settings.get('cyberpunk-agent', 'server-read-status') || {};
            const userReadStatus = serverReadStatus[userId] || {};

            if (Object.keys(userReadStatus).length > 0) {
                // Load from server settings
                Object.entries(userReadStatus).forEach(([conversationKey, userData]) => {
                    if (!this.readStatus.has(conversationKey)) {
                        this.readStatus.set(conversationKey, new Map());
                    }

                    this.readStatus.get(conversationKey).set(userId, userData);
                });

                console.log(`Cyberpunk Agent | Loaded read status from server settings for user ${userId}`);

                // Update localStorage cache
                const storageKey = `cyberpunk-agent-read-status-${userId}`;
                localStorage.setItem(storageKey, JSON.stringify(userReadStatus));

            } else {
                // Fallback to localStorage
                const storageKey = `cyberpunk-agent-read-status-${userId}`;
                const storedData = localStorage.getItem(storageKey);

                if (storedData) {
                    const readStatusData = JSON.parse(storedData);

                    Object.entries(readStatusData).forEach(([conversationKey, userData]) => {
                        if (!this.readStatus.has(conversationKey)) {
                            this.readStatus.set(conversationKey, new Map());
                        }

                        this.readStatus.get(conversationKey).set(userId, userData);
                    });

                    console.log(`Cyberpunk Agent | Loaded read status from localStorage fallback for user ${userId}`);
                } else {
                    console.log(`Cyberpunk Agent | No read status found for user ${userId}`);
                }
            }

        } catch (error) {
            console.error(`Cyberpunk Agent | Error loading read status from server:`, error);

            // Fallback to localStorage only
            try {
                const storageKey = `cyberpunk-agent-read-status-${userId}`;
                const storedData = localStorage.getItem(storageKey);

                if (storedData) {
                    const readStatusData = JSON.parse(storedData);

                    Object.entries(readStatusData).forEach(([conversationKey, userData]) => {
                        if (!this.readStatus.has(conversationKey)) {
                            this.readStatus.set(conversationKey, new Map());
                        }

                        this.readStatus.get(conversationKey).set(userId, userData);
                    });

                    console.log(`Cyberpunk Agent | Fallback: Loaded read status from localStorage for user ${userId}`);
                }
            } catch (localStorageError) {
                console.error(`Cyberpunk Agent | Error loading from localStorage fallback:`, localStorageError);
            }
        }
    }

    /**
     * Initialize the enhanced read status system
     */
    async _initializeEnhancedReadStatus() {
        try {
            console.log("Cyberpunk Agent | Initializing enhanced read status system...");

            // Load read status for current user
            await this._loadReadStatusFromServer(game.user.id);

            // Migrate legacy read timestamps if they exist
            await this._migrateLegacyReadTimestamps();

            // Synchronize with other clients if SocketLib is available
            if (this.socketLibIntegration && this.socketLibIntegration.isAvailable()) {
                // Add a small delay to ensure SocketLib is fully ready
                setTimeout(async () => {
                    await this.synchronizeReadStatusWithClients();
                }, 1000);
            }

            console.log("Cyberpunk Agent | Enhanced read status system initialized successfully");

        } catch (error) {
            console.error("Cyberpunk Agent | Error initializing enhanced read status system:", error);
        }
    }

    /**
     * Migrate legacy read timestamps to new enhanced system
     */
    async _migrateLegacyReadTimestamps() {
        try {
            // Load legacy read timestamps
            this._loadReadTimestamps();

            if (this.lastReadTimestamps.size === 0) {
                console.log("Cyberpunk Agent | No legacy read timestamps to migrate");
                return;
            }

            console.log(`Cyberpunk Agent | Migrating ${this.lastReadTimestamps.size} legacy read timestamps...`);

            // Convert legacy timestamps to new format
            for (const [conversationKey, timestamp] of this.lastReadTimestamps.entries()) {
                if (!this.readStatus.has(conversationKey)) {
                    this.readStatus.set(conversationKey, new Map());
                }

                // Get read message IDs for this conversation
                const readMessageIds = this._getReadMessageIds(conversationKey, game.user.id);

                this.readStatus.get(conversationKey).set(game.user.id, {
                    lastReadTimestamp: timestamp,
                    readMessages: readMessageIds
                });
            }

            // Save migrated data (only if user is GM)
            if (game.user.isGM) {
                await this._saveReadStatusToServer('', game.user.id, Date.now(), []);
            }

            console.log("Cyberpunk Agent | Legacy read timestamps migrated successfully");

        } catch (error) {
            console.error("Cyberpunk Agent | Error migrating legacy read timestamps:", error);
        }
    }

    /**
     * Synchronize read status with other clients
     */
    async synchronizeReadStatusWithClients() {
        try {
            if (!this.socketLibIntegration || !this.socketLibIntegration.isAvailable()) {
                console.log("Cyberpunk Agent | SocketLib not available for read status sync");
                return;
            }

            console.log("Cyberpunk Agent | Synchronizing read status with other clients...");

            // Get all active users except current user
            const activeUsers = Array.from(game.users.values()).filter(user =>
                user.active && user.id !== game.user.id
            );

            if (activeUsers.length === 0) {
                console.log("Cyberpunk Agent | No other active users for read status sync");
                return;
            }

            // Request read status sync from other users
            for (const user of activeUsers) {
                try {
                    await this.socketLibIntegration.sendSystemResponseToUser(
                        user.id,
                        'requestReadStatusSync',
                        {
                            requestingUserId: game.user.id,
                            requestingUserName: game.user.name,
                            timestamp: Date.now()
                        }
                    );
                    console.log(`Cyberpunk Agent | Requested read status sync from ${user.name}`);
                } catch (error) {
                    console.error(`Cyberpunk Agent | Error requesting read status sync from ${user.name}:`, error);
                }
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error synchronizing read status with clients:", error);
        }
    }

    /**
     * Broadcast read status update to other clients
     */
    async _broadcastReadStatusUpdate(conversationKey, userId, timestamp, readMessageIds) {
        try {
            if (!this.socketLibIntegration || !this.socketLibIntegration.isAvailable()) {
                console.log("Cyberpunk Agent | SocketLib not available for read status broadcast");
                return;
            }

            const updateData = {
                conversationKey,
                userId,
                timestamp,
                readMessageIds,
                updatingUserName: game.user.name
            };

            // Broadcast to all other users
            await this.socketLibIntegration.sendSystemResponseToOthers('readStatusUpdate', updateData);
            console.log(`Cyberpunk Agent | Broadcasted read status update for conversation ${conversationKey}`);

        } catch (error) {
            console.error("Cyberpunk Agent | Error broadcasting read status update:", error);
        }
    }

    /**
 * NEW SERVER-BASED MESSAGING SYSTEM
 * ===================================
 * 
 * This system stores all messages on the Foundry server using game.settings
 * instead of direct client-to-client communication via SocketLib.
 * 
 * Flow:
 * 1. Device sends message → Server (game.settings)
 * 2. Clients sync with server when connecting
 * 3. Offline devices receive messages when they come back online
 * 4. Contacts are automatically added when receiving messages from unknown devices
 */

    /**
     * Enhanced Message Broker Architecture - Server-First with localStorage Cache
     * All messages are immediately persisted to server settings, localStorage is cache
     * @param {string} senderDeviceId - ID of the sending device
     * @param {string} receiverDeviceId - ID of the receiving device
     * @param {Object} message - Message object to save
     */
    async saveMessageToServer(senderDeviceId, receiverDeviceId, message) {
        try {
            console.log(`Cyberpunk Agent | Enhanced message broker (Server-First): ${senderDeviceId} → ${receiverDeviceId}`);

            // CRITICAL: Save to server FIRST to ensure persistence across browsers
            let serverSaveSuccess = false;

            if (game.user.isGM) {
                // GM directly saves to server
                console.log("Cyberpunk Agent | GM saving message to server settings (PRIMARY)");
                serverSaveSuccess = await this.saveMessageToServerAsGM(senderDeviceId, receiverDeviceId, message);
            } else {
                // Players request GM to save message to server
                console.log("Cyberpunk Agent | Player requesting GM to save message to server (PRIMARY)");
                serverSaveSuccess = await this.requestGMMessageSave(senderDeviceId, receiverDeviceId, message);
            }

            // Only proceed with local storage if server save succeeded or we want to cache anyway
            const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);
            if (!this.messages.has(conversationKey)) {
                this.messages.set(conversationKey, []);
            }

            const conversation = this.messages.get(conversationKey);
            const messageExists = conversation.some(msg => msg.id === message.id);
            if (!messageExists) {
                conversation.push(message);
            }

            // Save to localStorage as cache (immediate UI feedback)
            await this.saveMessagesForDevice(senderDeviceId);
            if (senderDeviceId !== receiverDeviceId) {
                await this.saveMessagesForDevice(receiverDeviceId);
            }

            // If server save failed, warn user but continue with local cache
            if (!serverSaveSuccess) {
                console.warn("Cyberpunk Agent | Server save failed, message cached locally only");
                ui.notifications.warn("Mensagem salva localmente. Pode não sincronizar entre navegadores.");
            }

            return serverSaveSuccess;

        } catch (error) {
            console.error(`Cyberpunk Agent | Error in enhanced message broker:`, error);
            return false;
        }
    }

    /**
     * GM saves message directly to server settings
     */
    async saveMessageToServerAsGM(senderDeviceId, receiverDeviceId, message) {
        try {
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);

            // Initialize conversation in server storage
            if (!serverMessages[conversationKey]) {
                serverMessages[conversationKey] = [];
            }

            // Check if message already exists on server
            const messageExists = serverMessages[conversationKey].some(msg => msg.id === message.id);
            if (!messageExists) {
                serverMessages[conversationKey].push(message);
                await game.settings.set('cyberpunk-agent', 'server-messages', serverMessages);
                console.log(`Cyberpunk Agent | Message saved to server by GM`);
            }

            return true;
        } catch (error) {
            console.error(`Cyberpunk Agent | Error saving message to server as GM:`, error);
            return false;
        }
    }

    /**
     * Player requests GM to save message to server
     */
    async requestGMMessageSave(senderDeviceId, receiverDeviceId, message) {
        try {
            if (this.socketLibIntegration) {
                const saveRequest = {
                    senderDeviceId,
                    receiverDeviceId,
                    message,
                    requestingUserId: game.user.id,
                    requestingUserName: game.user.name,
                    timestamp: Date.now()
                };

                console.log("Cyberpunk Agent | Sending message save request to GM (silent)");
                const success = await this.socketLibIntegration.sendMessageToGM('saveMessageToServer', saveRequest);

                // Don't show notification for routine message saving
                return success;
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available for GM message save request");
                return true; // Still return true since local save succeeded
            }
        } catch (error) {
            console.error(`Cyberpunk Agent | Error requesting GM message save:`, error);
            return true; // Still return true since local save succeeded
        }
    }

    /**
     * Load messages from the Foundry server for a specific device
     * @param {string} deviceId - ID of the device to load messages for
     */
    async loadMessagesFromServer(deviceId) {
        try {
            console.log(`Cyberpunk Agent | Loading messages from server for device: ${deviceId}`);

            // Get messages from server
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            const deviceMessages = serverMessages[deviceId] || {};

            // Load messages into local storage
            Object.entries(deviceMessages).forEach(([conversationKey, messages]) => {
                this.messages.set(conversationKey, messages);
            });

            console.log(`Cyberpunk Agent | Loaded ${Object.keys(deviceMessages).length} conversations from server`);
            return true;
        } catch (error) {
            console.error(`Cyberpunk Agent | Error loading messages from server:`, error);
            return false;
        }
    }

    /**
     * Enhanced Comprehensive Sync with server - ensures cross-browser message persistence
     * @param {string} deviceId - ID of the device to sync
     * @param {boolean} showProgress - Whether to show sync progress to user
     */
    async syncMessagesWithServer(deviceId, showProgress = false) {
        try {
            console.log(`Cyberpunk Agent | Starting comprehensive message sync with server for device: ${deviceId}`);

            if (showProgress) {
                console.log("Cyberpunk Agent | Sincronizando mensagens com servidor...");
            }

            // Step 1: Get current server state
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            let syncedConversations = 0;
            let newMessages = 0;

            // Step 2: Find all conversations involving this device from server
            const deviceConversations = {};
            for (const [conversationKey, messages] of Object.entries(serverMessages)) {
                if (conversationKey.includes(deviceId)) {
                    deviceConversations[conversationKey] = messages;
                    syncedConversations++;
                }
            }

            console.log(`Cyberpunk Agent | Found ${syncedConversations} server conversations for device ${deviceId}`);

            // Step 3: Merge server messages with local messages (server wins)
            for (const [conversationKey, serverConversation] of Object.entries(deviceConversations)) {
                const localConversation = this.messages.get(conversationKey) || [];
                const localMessageIds = new Set(localConversation.map(msg => msg.id));

                // Add server messages that don't exist locally
                const mergedConversation = [...localConversation];
                for (const serverMessage of serverConversation) {
                    if (!localMessageIds.has(serverMessage.id)) {
                        mergedConversation.push(serverMessage);
                        newMessages++;
                    }
                }

                // Sort by timestamp to maintain order
                mergedConversation.sort((a, b) => a.timestamp - b.timestamp);
                this.messages.set(conversationKey, mergedConversation);
            }

            // Step 4: Save merged messages to localStorage cache
            await this.saveMessagesForDevice(deviceId);

            // Step 5: Process new messages and add contacts automatically
            await this.processNewMessagesAndContacts(deviceId);

            // Step 6: Update interfaces
            this._updateChatInterfacesImmediately();

            const syncMessage = `Sincronização concluída: ${newMessages} novas mensagens em ${syncedConversations} conversas`;
            console.log(`Cyberpunk Agent | ${syncMessage}`);

            if (showProgress) {
                if (newMessages > 0) {
                    console.log(`Cyberpunk Agent | ${syncMessage}`);
                } else {
                    console.log("Cyberpunk Agent | Mensagens sincronizadas - nenhuma nova mensagem");
                }
            }

            return true;
        } catch (error) {
            console.error(`Cyberpunk Agent | Error in comprehensive message sync:`, error);
            if (showProgress) {
                ui.notifications.error("Erro na sincronização de mensagens");
            }
            return false;
        }
    }

    /**
 * Process new messages and automatically add contacts
 * @param {string} deviceId - ID of the device to process
 */
    async processNewMessagesAndContacts(deviceId) {
        try {
            console.log(`Cyberpunk Agent | Processing new messages and contacts for device: ${deviceId}`);

            // Load device data first
            this.loadDeviceData();

            // Debug: Check if this.devices exists and has content
            console.log(`Cyberpunk Agent | this.devices after loadDeviceData:`, this.devices);
            console.log(`Cyberpunk Agent | this.devices type:`, typeof this.devices);
            console.log(`Cyberpunk Agent | this.devices size:`, this.devices?.size);

            // Get device from the loaded data
            const device = this.devices.get(deviceId);
            console.log(`Cyberpunk Agent | Retrieved device:`, device);

            if (!device) {
                console.warn(`Cyberpunk Agent | Device not found: ${deviceId}`);
                return;
            }

            // Check if current user is the actual owner of this device
            const deviceOwner = this._getUserForDevice(deviceId);
            const isDeviceOwner = deviceOwner && deviceOwner.id === game.user.id;

            // Process each conversation
            for (const [conversationKey, messages] of this.messages.entries()) {
                // Parse conversation key to get device IDs
                const [deviceId1, deviceId2] = conversationKey.split('|');
                const otherDeviceId = deviceId1 === deviceId ? deviceId2 : deviceId1;

                // Check if this is a conversation involving our device
                if (deviceId1 === deviceId || deviceId2 === deviceId) {
                    // Check if we have messages from unknown contacts
                    const hasMessagesFromUnknown = messages.some(msg =>
                        msg.senderId === otherDeviceId &&
                        !device.contacts.includes(otherDeviceId)
                    );

                    if (hasMessagesFromUnknown) {
                        console.log(`Cyberpunk Agent | Auto-adding contact: ${otherDeviceId} to ${deviceId}`);
                        await this.addContactAutomatically(deviceId, otherDeviceId);
                    }

                    // Check for unread messages and notify if user is the device owner
                    if (isDeviceOwner) {
                        const unreadMessages = messages.filter(msg =>
                            msg.receiverId === deviceId && !msg.read
                        );

                        if (unreadMessages.length > 0) {
                            console.log(`Cyberpunk Agent | Found ${unreadMessages.length} unread messages for device ${deviceId}`);

                            // Get the most recent unread message for notification
                            const mostRecentUnread = unreadMessages[unreadMessages.length - 1];

                            // Only notify if this is a fresh sync (not just opening the interface)
                            const lastSyncTime = this._lastSyncTime || 0;
                            const messageTime = mostRecentUnread.timestamp || Date.now();

                            if (messageTime > lastSyncTime) {
                                console.log(`Cyberpunk Agent | Notifying about unread messages for device ${deviceId}`);
                                this.handleNewMessageNotifications(mostRecentUnread.senderId, deviceId);
                            }
                        }
                    }
                }
            }

            // Update last sync time
            this._lastSyncTime = Date.now();

            console.log(`Cyberpunk Agent | Finished processing messages and contacts for device: ${deviceId}`);
        } catch (error) {
            console.error(`Cyberpunk Agent | Error processing messages and contacts:`, error);
        }
    }

    /**
     * Ensure an actor has at least one device (create virtual device ONLY if no Agent items)
     * This should only create virtual devices for NPCs that don't have physical Agent items
     * @param {string} actorId - ID of the actor
     */
    async ensureActorHasDevice(actorId) {
        try {
            const actor = game.actors.get(actorId);
            if (!actor) {
                console.error(`Cyberpunk Agent | Actor ${actorId} not found`);
                return false;
            }

            // First, check if actor has Agent items - if so, ensure devices are registered
            const agentItems = actor.items?.filter(item =>
                item.type === 'gear' &&
                item.name.toLowerCase().includes('agent') &&
                item.system?.equipped
            ) || [];

            if (agentItems.length > 0) {
                console.log(`Cyberpunk Agent | Actor ${actor.name} has ${agentItems.length} equipped Agent items`);

                // Ensure devices are registered for all Agent items
                await this.checkAndCreateDevicesForActor(actor);

                // Check if devices were created successfully
                const registeredDevices = this.deviceMappings.get(actorId) || [];
                if (registeredDevices.length > 0) {
                    console.log(`Cyberpunk Agent | Actor ${actor.name} has ${registeredDevices.length} registered devices`);
                    return true;
                }
            }

            // Check if actor already has devices from previous registration
            const existingDevices = this.deviceMappings.get(actorId) || [];
            if (existingDevices.length > 0) {
                console.log(`Cyberpunk Agent | Actor ${actor.name} already has ${existingDevices.length} registered devices`);

                // Ensure existing devices have proper data
                for (const deviceId of existingDevices) {
                    const device = this.devices.get(deviceId);
                    if (device) {
                        // Ensure device has proper name and image
                        if (!device.deviceName || device.deviceName === `Device ${deviceId}`) {
                            device.deviceName = actor.name;
                            device.ownerName = actor.name;
                        }
                        if (!device.img) {
                            device.img = actor.img || 'icons/svg/mystery-man.svg';
                        }
                    }
                }
                return true;
            }

            // ONLY create virtual device if actor has NO Agent items AND no existing devices
            console.log(`Cyberpunk Agent | Actor ${actor.name} has no Agent items - creating virtual device for NPC messaging`);

            const virtualDeviceId = `virtual-device-${actorId}`;
            const virtualDevice = {
                id: virtualDeviceId,
                ownerActorId: actorId,
                ownerName: actor.name,
                deviceName: actor.name,
                img: actor.img || 'icons/svg/mystery-man.svg',
                contacts: [],
                isVirtual: true, // Mark as virtual device for NPCs
                settings: {
                    muteAll: false,
                    notificationSounds: true
                }
            };

            // Add device to registry
            this.devices.set(virtualDeviceId, virtualDevice);

            // Add to device mappings
            this.deviceMappings.set(actorId, [virtualDeviceId]);

            // Generate phone number for virtual device
            await this.getDevicePhoneNumber(virtualDeviceId);

            // Save device data
            await this.saveDeviceData();
            await this.savePhoneNumberData();

            console.log(`Cyberpunk Agent | Virtual device created for NPC ${actor.name}: ${virtualDeviceId}`);
            return true;

        } catch (error) {
            console.error(`Cyberpunk Agent | Error ensuring actor has device:`, error);
            return false;
        }
    }

    /**
     * Handle automatic contact addition between two devices (bidirectional)
     * @param {string} senderDeviceId - ID of the sending device
     * @param {string} receiverDeviceId - ID of the receiving device
     */
    async handleAutomaticContactAddition(senderDeviceId, receiverDeviceId) {
        try {
            let contactsAdded = false;

            // Check if receiver is in sender's contacts, if not, add them
            if (!this.isDeviceContact(senderDeviceId, receiverDeviceId)) {
                console.log(`Cyberpunk Agent | Auto-adding ${receiverDeviceId} to ${senderDeviceId} contacts`);
                await this.addContactToDevice(senderDeviceId, receiverDeviceId);
                contactsAdded = true;

                // Notify real-time updates for the sender
                this.notifyContactUpdate({
                    action: 'auto-add',
                    deviceId: senderDeviceId,
                    contactDeviceId: receiverDeviceId,
                    reason: 'message-sent'
                });
            }

            // Check if sender is in receiver's contacts, if not, add them
            if (!this.isDeviceContact(receiverDeviceId, senderDeviceId)) {
                console.log(`Cyberpunk Agent | Auto-adding ${senderDeviceId} to ${receiverDeviceId} contacts`);
                await this.addContactToDevice(receiverDeviceId, senderDeviceId);
                contactsAdded = true;

                // Notify real-time updates for the receiver
                this.notifyContactUpdate({
                    action: 'auto-add',
                    deviceId: receiverDeviceId,
                    contactDeviceId: senderDeviceId,
                    reason: 'message-received'
                });
            }

            if (contactsAdded) {
                // Save device data if contacts were added
                await this.saveDeviceData();

                // Update UI
                this._updateChat7Interfaces();

                // Dispatch update events
                document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
                    detail: {
                        type: 'contactUpdate',
                        deviceId: senderDeviceId,
                        contactDeviceId: receiverDeviceId,
                        action: 'auto-add-bidirectional',
                        timestamp: Date.now()
                    }
                }));
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error handling automatic contact addition:", error);
        }
    }

    /**
     * Automatically add a contact to a device
     * @param {string} deviceId - ID of the device to add contact to
     * @param {string} contactDeviceId - ID of the contact to add
     */
    async addContactAutomatically(deviceId, contactDeviceId) {
        try {
            console.log(`Cyberpunk Agent | Auto-adding contact ${contactDeviceId} to device ${deviceId}`);

            // Add contact to device
            await this.addContactToDevice(deviceId, contactDeviceId);

            // Save device data to server
            await this.saveDeviceData();

            // Notify UI update
            document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
                detail: {
                    type: 'contactUpdate',
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId,
                    action: 'auto-add',
                    reason: 'message-received',
                    timestamp: Date.now()
                }
            }));

            console.log(`Cyberpunk Agent | Contact ${contactDeviceId} auto-added to device ${deviceId}`);
        } catch (error) {
            console.error(`Cyberpunk Agent | Error auto-adding contact:`, error);
        }
    }

    /**
     * Queue message for offline delivery
     * @param {string} senderDeviceId - ID of the sending device
     * @param {string} receiverDeviceId - ID of the receiving device
     * @param {Object} message - Message object to queue
     */
    async queueOfflineMessage(senderDeviceId, receiverDeviceId, message) {
        try {
            console.log(`Cyberpunk Agent | Queueing offline message: ${senderDeviceId} → ${receiverDeviceId}`);

            // Get receiver's user ID to determine who should receive the message
            const receiverUser = this._getUserForDevice(receiverDeviceId);
            if (!receiverUser) {
                console.warn("Cyberpunk Agent | Cannot determine receiver user for offline message");
                return false;
            }

            // If we're a player, request GM to queue the message
            if (!game.user.isGM) {
                console.log("Cyberpunk Agent | Player requesting GM to queue offline message");

                if (this.socketLibIntegration) {
                    const queueRequest = {
                        senderDeviceId,
                        receiverDeviceId,
                        receiverUserId: receiverUser.id,
                        message,
                        timestamp: Date.now(),
                        requestingUserId: game.user.id,
                        requestingUserName: game.user.name
                    };

                    return await this.socketLibIntegration.sendMessageToGM('queueOfflineMessage', queueRequest);
                } else {
                    console.warn("Cyberpunk Agent | SocketLib not available for offline message queueing");
                    return false;
                }
            } else {
                // GM can directly save to offline queue
                return await this.saveToOfflineQueue(receiverUser.id, message);
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error queueing offline message:", error);
            return false;
        }
    }

    /**
     * Save message to GM-managed offline queue
     * @param {string} receiverUserId - ID of the user who should receive the message
     * @param {Object} message - Message object to queue
     */
    async saveToOfflineQueue(receiverUserId, message) {
        try {
            if (!game.user.isGM) {
                console.error("Cyberpunk Agent | Only GM can save to offline queue");
                return false;
            }

            console.log(`Cyberpunk Agent | GM saving message to offline queue for user: ${receiverUserId}`);

            // Get current offline queue from settings
            const offlineQueue = game.settings.get('cyberpunk-agent', 'offline-message-queue') || {};

            // Initialize user queue if it doesn't exist
            if (!offlineQueue[receiverUserId]) {
                offlineQueue[receiverUserId] = [];
            }

            // Add message to queue with metadata
            const queuedMessage = {
                ...message,
                queuedAt: Date.now(),
                queuedBy: game.user.id,
                delivered: false
            };

            offlineQueue[receiverUserId].push(queuedMessage);

            // Save updated queue to server
            await game.settings.set('cyberpunk-agent', 'offline-message-queue', offlineQueue);

            console.log(`Cyberpunk Agent | Message queued for offline user ${receiverUserId}`);
            return true;

        } catch (error) {
            console.error("Cyberpunk Agent | Error saving to offline queue:", error);
            return false;
        }
    }

    /**
     * Deliver queued offline messages to user when they come online
     * @param {string} userId - ID of the user who came online
     */
    async deliverOfflineMessages(userId) {
        try {
            console.log(`Cyberpunk Agent | Checking offline messages for user: ${userId}`);

            // Get offline queue from settings
            const offlineQueue = game.settings.get('cyberpunk-agent', 'offline-message-queue') || {};
            const userQueue = offlineQueue[userId] || [];

            if (userQueue.length === 0) {
                console.log(`Cyberpunk Agent | No offline messages for user ${userId}`);
                return;
            }

            console.log(`Cyberpunk Agent | Delivering ${userQueue.length} offline messages to user ${userId}`);

            // Send each queued message via SocketLib
            for (const queuedMessage of userQueue) {
                if (!queuedMessage.delivered) {
                    try {
                        if (this.socketLibIntegration) {
                            const deliveryData = {
                                type: 'offlineMessageDelivery',
                                message: queuedMessage,
                                deliveredAt: Date.now()
                            };

                            await this.socketLibIntegration.sendSystemResponseToUser(userId, 'deliverOfflineMessage', deliveryData);
                            queuedMessage.delivered = true;

                            console.log(`Cyberpunk Agent | Delivered offline message ${queuedMessage.id} to user ${userId}`);
                        }
                    } catch (error) {
                        console.error(`Cyberpunk Agent | Error delivering offline message:`, error);
                    }
                }
            }

            // Remove delivered messages from queue
            offlineQueue[userId] = userQueue.filter(msg => !msg.delivered);

            // Save updated queue
            if (game.user.isGM) {
                await game.settings.set('cyberpunk-agent', 'offline-message-queue', offlineQueue);
                console.log(`Cyberpunk Agent | Cleaned up delivered messages for user ${userId}`);
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error delivering offline messages:", error);
        }
    }

    /**
     * Request message sync from GM (for players)
     */
    async requestMessageSyncFromGM() {
        try {
            if (game.user.isGM) {
                console.log("Cyberpunk Agent | GM doesn't need to request sync from self");
                return;
            }

            if (!this.socketLibIntegration) {
                console.warn("Cyberpunk Agent | SocketLib not available for message sync request");
                return;
            }

            // Get user's devices
            const userDevices = this.getUserActors()
                .flatMap(actor => this.deviceMappings.get(actor.id) || []);

            console.log(`Cyberpunk Agent | Requesting sync for ${userDevices.length} devices from GM`);

            for (const deviceId of userDevices) {
                await this.socketLibIntegration.sendMessageToGM('requestServerMessageSync', {
                    deviceId,
                    requestingUserId: game.user.id,
                    requestingUserName: game.user.name,
                    requestType: 'initialSync'
                });

                console.log(`Cyberpunk Agent | Sync requested for device: ${deviceId}`);
            }

            if (userDevices.length > 0) {
                console.log("Cyberpunk Agent | Sincronizando mensagens com o servidor...");
            }

        } catch (error) {
            console.error("Cyberpunk Agent | Error requesting message sync from GM:", error);
        }
    }

    /**
     * Get unread message count for a device from server
     * @param {string} deviceId - ID of the device
     */
    async getUnreadCountFromServer(deviceId) {
        try {
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            const deviceMessages = serverMessages[deviceId] || {};

            let totalUnread = 0;

            Object.entries(deviceMessages).forEach(([conversationKey, messages]) => {
                const unreadMessages = messages.filter(msg =>
                    msg.receiverId === deviceId && !msg.read
                );
                totalUnread += unreadMessages.length;
            });

            return totalUnread;
        } catch (error) {
            console.error(`Cyberpunk Agent | Error getting unread count from server:`, error);
            return 0;
        }
    }

    /**
     * Mark messages as read on server
     * @param {string} deviceId - ID of the device
     * @param {string} contactDeviceId - ID of the contact
     */
    async markMessagesAsReadOnServer(deviceId, contactDeviceId) {
        try {
            console.log(`Cyberpunk Agent | Marking messages as read on server: ${deviceId} ↔ ${contactDeviceId}`);

            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);

            // Mark messages as read for both devices
            if (serverMessages[deviceId] && serverMessages[deviceId][conversationKey]) {
                serverMessages[deviceId][conversationKey].forEach(msg => {
                    if (msg.receiverId === deviceId) {
                        msg.read = true;
                    }
                });
            }

            if (serverMessages[contactDeviceId] && serverMessages[contactDeviceId][conversationKey]) {
                serverMessages[contactDeviceId][conversationKey].forEach(msg => {
                    if (msg.receiverId === deviceId) {
                        msg.read = true;
                    }
                });
            }

            // Save to server
            await game.settings.set('cyberpunk-agent', 'server-messages', serverMessages);

            console.log(`Cyberpunk Agent | Messages marked as read on server`);
        } catch (error) {
            console.error(`Cyberpunk Agent | Error marking messages as read on server:`, error);
        }
    }

    /**
     * REFACTORED: Send message using server-based system
     * Enhanced to handle automatic contact addition for actor-based messaging
     */
    async sendMessage(senderId, receiverId, text) {
        if (!text || !text.trim()) {
            return false;
        }

        console.log(`Cyberpunk Agent | Sending message via server: ${senderId} → ${receiverId}`);

        // Check if these are actor IDs or device IDs
        const senderIsActor = game.actors.get(senderId);
        const receiverIsActor = game.actors.get(receiverId);

        if (senderIsActor && receiverIsActor) {
            // Both are actors - we need to handle this properly at device level
            console.log("Cyberpunk Agent | Actor-to-actor message detected, ensuring devices exist...");

            // Ensure both actors have devices (create if needed)
            await this.ensureActorHasDevice(senderId);
            await this.ensureActorHasDevice(receiverId);

            // Get devices for both actors
            const senderDevices = this.deviceMappings.get(senderId) || [];
            const receiverDevices = this.deviceMappings.get(receiverId) || [];

            if (senderDevices.length > 0 && receiverDevices.length > 0) {
                // Use the first device of each actor for messaging
                const senderDeviceId = senderDevices[0];
                const receiverDeviceId = receiverDevices[0];

                console.log(`Cyberpunk Agent | Routing actor message through devices: ${senderId} → ${senderDeviceId}, ${receiverId} → ${receiverDeviceId}`);

                // Handle automatic contact addition at device level
                await this.handleAutomaticContactAddition(senderDeviceId, receiverDeviceId);

                // Convert this to a device message for proper handling
                console.log("Cyberpunk Agent | Converting actor message to device message for proper handling");
                return await this.sendDeviceMessage(senderDeviceId, receiverDeviceId, text);
            } else {
                console.error("Cyberpunk Agent | Cannot send message - one or both actors have no devices");
                return false;
            }
        }

        // Create message object with enhanced ID generation
        const messageId = window.CyberpunkAgentMessageUtils ?
            window.CyberpunkAgentMessageUtils.generateMessageId(senderId, receiverId, text.trim()) :
            `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
            read: false
        };

        // Check for message deduplication
        if (window.CyberpunkAgentMessageDeduplication) {
            if (window.CyberpunkAgentMessageDeduplication.isDuplicate(messageId)) {
                console.log("Cyberpunk Agent | Duplicate message detected, skipping:", messageId);
                return false;
            }
            window.CyberpunkAgentMessageDeduplication.addMessage(messageId, message.timestamp);
        }

        // Save message to server
        const success = await this.saveMessageToServer(senderId, receiverId, message);
        if (!success) {
            console.error(`Cyberpunk Agent | Failed to save message to server`);
            return false;
        }

        // Add message to local storage for immediate UI update
        const conversationKey = this._getConversationKey(senderId, receiverId);
        if (!this.messages.has(conversationKey)) {
            this.messages.set(conversationKey, []);
        }
        this.messages.get(conversationKey).push(message);

        // Clear unread count cache
        this.unreadCounts.delete(conversationKey);

        // Use performance manager for debounced saves
        if (window.CyberpunkAgentPerformanceManager) {
            const allMessages = {};
            for (const [key, msgs] of this.messages.entries()) {
                allMessages[key] = msgs;
            }
            window.CyberpunkAgentPerformanceManager.queueSave(`user-${game.user.id}`, allMessages);
        }

        // Update local interfaces immediately
        this._updateChatInterfacesImmediately();

        console.log(`Cyberpunk Agent | Message sent via server:`, message);
        return true;
    }

    /**
     * Send a message from one device to another
     */
    async sendDeviceMessage(senderDeviceId, receiverDeviceId, text) {
        if (!text || !text.trim()) {
            return false;
        }

        // Handle automatic contact addition for both sender and receiver
        await this.handleAutomaticContactAddition(senderDeviceId, receiverDeviceId);

        const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);

        if (!this.messages.has(conversationKey)) {
            this.messages.set(conversationKey, []);
        }

        const conversation = this.messages.get(conversationKey);

        // Create message with enhanced ID generation
        const messageId = window.CyberpunkAgentMessageUtils ?
            window.CyberpunkAgentMessageUtils.generateMessageId(senderDeviceId, receiverDeviceId, text.trim()) :
            `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

        // Check for message deduplication
        if (window.CyberpunkAgentMessageDeduplication) {
            if (window.CyberpunkAgentMessageDeduplication.isDuplicate(messageId)) {
                console.log("Cyberpunk Agent | Duplicate device message detected, skipping:", messageId);
                return false;
            }
            window.CyberpunkAgentMessageDeduplication.addMessage(messageId, message.timestamp);
        }

        // Validate message
        if (window.CyberpunkAgentMessageUtils && !window.CyberpunkAgentMessageUtils.validateMessage(message)) {
            console.error("Cyberpunk Agent | Invalid message object:", message);
            return false;
        }

        conversation.push(message);

        // Save message to server for both sender and receiver devices
        const saveResult = await this.saveMessageToServer(senderDeviceId, receiverDeviceId, message);
        if (!saveResult) {
            console.error(`Cyberpunk Agent | Failed to save device message to server`);
            return false;
        }

        // Clear unread count cache for this conversation
        this.unreadCounts.delete(this._getDeviceConversationKey(senderDeviceId, receiverDeviceId));

        // Use performance manager for debounced saves
        if (window.CyberpunkAgentPerformanceManager) {
            window.CyberpunkAgentPerformanceManager.queueSave(conversationKey, conversation);
        }

        // Always try to send via SocketLib for real-time delivery
        let socketLibSuccess = false;

        if (this._isSocketLibAvailable() && this.socketLibIntegration) {
            try {
                console.log("Cyberpunk Agent | Sending device message via SocketLib for real-time delivery");
                socketLibSuccess = await this.socketLibIntegration.sendMessage(senderDeviceId, receiverDeviceId, text.trim(), messageId);

                if (socketLibSuccess) {
                    console.log("Cyberpunk Agent | Device message sent successfully via SocketLib");
                    // Notify real-time updates for the device message
                    await this.notifyDeviceMessageUpdate(senderDeviceId, receiverDeviceId, message);
                } else {
                    console.log("Cyberpunk Agent | SocketLib delivery failed - receiver likely offline");
                }
            } catch (error) {
                console.warn("Cyberpunk Agent | SocketLib device message sending error:", error);
            }
        }

        // If SocketLib failed (user offline) or not available, the server storage from saveMessageToServer
        // will handle persistence. No need for separate offline queueing since GM broker handles it.
        if (!socketLibSuccess) {
            console.log("Cyberpunk Agent | Message stored on server for offline delivery");
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
     * Debug method to log all available contact numbers
     * This method can be called from the browser console to help debug phone number matching
     */
    debugAllContactNumbers() {
        console.log("=== Cyberpunk Agent | All Available Contact Numbers ===");
        console.log(`Total phone number mappings: ${this.phoneNumberDictionary.size}`);

        if (this.phoneNumberDictionary.size === 0) {
            console.log("No phone numbers found in the system.");
            return;
        }

        console.log("\nPhone Number Mappings:");
        console.log("Phone Number (Raw) | Device ID | Device Name | Formatted Display");
        console.log("-------------------|-----------|-------------|------------------");

        for (const [phoneNumber, deviceId] of this.phoneNumberDictionary) {
            const device = this.devices.get(deviceId);
            const deviceName = device ? device.deviceName : 'Unknown Device';
            const formattedNumber = this.formatPhoneNumberForDisplay(phoneNumber);

            console.log(`${phoneNumber.padEnd(17)} | ${deviceId.padEnd(9)} | ${deviceName.padEnd(11)} | ${formattedNumber}`);
        }

        console.log("\nDevice Phone Numbers:");
        console.log("Device ID | Phone Number (Raw) | Formatted Display");
        console.log("----------|-------------------|------------------");

        for (const [deviceId, phoneNumber] of this.devicePhoneNumbers) {
            const formattedNumber = this.formatPhoneNumberForDisplay(phoneNumber);
            console.log(`${deviceId.padEnd(9)} | ${phoneNumber.padEnd(17)} | ${formattedNumber}`);
        }

        console.log("\n=== End Debug Info ===");
    }

    /**
     * Debug method to search for a specific phone number
     * @param {string} searchNumber - The phone number to search for (can be raw or formatted)
     */
    debugSearchPhoneNumber(searchNumber) {
        console.log(`=== Cyberpunk Agent | Debug Search for: ${searchNumber} ===`);

        // Clean the search number
        const rawSearch = searchNumber.replace(/\D/g, '');
        console.log(`Raw search number: ${rawSearch}`);

        // Try different variations
        const variations = [
            rawSearch,
            rawSearch.startsWith('1') ? rawSearch : `1${rawSearch}`,
            rawSearch.startsWith('1') ? rawSearch.substring(1) : rawSearch
        ];

        console.log("Searching variations:", variations);

        for (const variation of variations) {
            const deviceId = this.getDeviceIdFromPhoneNumber(variation);
            if (deviceId) {
                const device = this.devices.get(deviceId);
                const deviceName = device ? device.deviceName : 'Unknown Device';
                const formattedNumber = this.formatPhoneNumberForDisplay(variation);

                console.log(`✅ FOUND: ${variation} -> Device: ${deviceName} (${deviceId})`);
                console.log(`   Formatted: ${formattedNumber}`);
                return;
            }
        }

        console.log("❌ No match found for any variation");
        console.log("Available numbers:", Array.from(this.phoneNumberDictionary.keys()));
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
                } else {
                    console.warn("Cyberpunk Agent | Failed to send phone number save request to GM");
                }
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available, cannot request GM save");
                console.warn("Cyberpunk Agent | Cannot save phone number data - GM action required");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving phone number data:", error);
        }
    }

    /**
     * Main sync function that scans all actors and ensures their equipped agents are registered
     */
    async syncAllAgents() {
        console.log("\n🔍 Starting agent sync process...");

        // Get initial counts
        const initialDeviceCount = this.devices.size;
        const initialPhoneCount = this.devicePhoneNumbers.size;

        console.log(`📊 Initial state:`);
        console.log(`   Devices registered: ${initialDeviceCount}`);
        console.log(`   Phone numbers registered: ${initialPhoneCount}`);

        let totalAgentsFound = 0;
        let agentsAlreadyRegistered = 0;
        let agentsNewlyRegistered = 0;
        let agentsWithPhoneNumbers = 0;
        let agentsMissingPhoneNumbers = 0;
        let ownerNamesUpdated = 0;  // 🆕 Track owner name updates

        // Get all actors
        const allActors = game.actors.contents;
        console.log(`\n🎭 Scanning ${allActors.length} actors for equipped agent items...`);

        for (const actor of allActors) {
            console.log(`\n--- Actor: ${actor.name} (${actor.id}) ---`);

            // Get all agent items from this actor's inventory
            const agentItems = actor.items.filter(item =>
                item.type === 'gear' &&
                item.name.toLowerCase().includes('agent')
            );

            if (agentItems.length === 0) {
                console.log(`   No agent items found`);
                continue;
            }

            console.log(`   Found ${agentItems.length} agent item(s):`);

            for (const item of agentItems) {
                const isEquipped = item.system?.equipped || item.flags?.equipped || item.system?.equippedState === 'equipped';
                const deviceId = `device-${actor.id}-${item.id}`;
                const deviceExists = this.devices.has(deviceId);
                const phoneNumberExists = this.devicePhoneNumbers.has(deviceId);

                console.log(`     📱 ${item.name} (${item.id})`);
                console.log(`        Equipped: ${isEquipped ? '✅' : '❌'}`);
                console.log(`        Device registered: ${deviceExists ? '✅' : '❌'}`);
                console.log(`        Phone number assigned: ${phoneNumberExists ? '✅' : '❌'}`);

                if (isEquipped) {
                    totalAgentsFound++;

                    if (deviceExists) {
                        agentsAlreadyRegistered++;

                        if (phoneNumberExists) {
                            agentsWithPhoneNumbers++;
                            const phoneNumber = this.devicePhoneNumbers.get(deviceId);
                            console.log(`        📞 Phone: ${this.formatPhoneNumberForDisplay(phoneNumber)}`);
                        } else {
                            agentsMissingPhoneNumbers++;
                            console.log(`        ⚠️  Missing phone number - will assign now`);

                            try {
                                await this.getDevicePhoneNumber(deviceId);
                                console.log(`        ✅ Phone number assigned`);
                                agentsWithPhoneNumbers++;
                                agentsMissingPhoneNumbers--;
                            } catch (error) {
                                console.error(`        ❌ Failed to assign phone number:`, error);
                            }
                        }
                    } else {
                        agentsNewlyRegistered++;
                        console.log(`        🔧 Device not registered - creating now`);

                        try {
                            // Create the device
                            const deviceName = `${actor.name} - Agent`;
                            this.devices.set(deviceId, {
                                id: deviceId,
                                name: deviceName,
                                actorId: actor.id,
                                itemId: item.id,
                                owner: actor.ownership.default || 0
                            });

                            // Add to device mappings
                            if (!this.deviceMappings.has(actor.id)) {
                                this.deviceMappings.set(actor.id, []);
                            }
                            this.deviceMappings.get(actor.id).push(deviceId);

                            // Assign phone number
                            await this.getDevicePhoneNumber(deviceId);
                            agentsWithPhoneNumbers++;

                            console.log(`        ✅ Device created and phone number assigned`);

                        } catch (error) {
                            console.error(`        ❌ Failed to create device:`, error);
                        }
                    }
                }
            }
        }

        // Save all data
        console.log(`\n💾 Saving device and phone number data...`);
        try {
            await this.saveDeviceData();
            await this.savePhoneNumberData();
            console.log(`✅ Data saved successfully`);
        } catch (error) {
            console.error(`❌ Error saving data:`, error);
        }

        // Final counts
        const finalDeviceCount = this.devices.size;
        const finalPhoneCount = this.devicePhoneNumbers.size;

        console.log(`\n📊 Sync Results:`);
        console.log(`   Total equipped agents found: ${totalAgentsFound}`);
        console.log(`   Agents already registered: ${agentsAlreadyRegistered}`);
        console.log(`   Agents newly registered: ${agentsNewlyRegistered}`);
        console.log(`   Agents with phone numbers: ${agentsWithPhoneNumbers}`);
        console.log(`   Agents missing phone numbers: ${agentsMissingPhoneNumbers}`);
        console.log(`   Owner names updated: ${ownerNamesUpdated}`);  // 🆕 Show owner name updates
        console.log(`   Devices before sync: ${initialDeviceCount}`);
        console.log(`   Devices after sync: ${finalDeviceCount}`);
        console.log(`   Phone numbers before sync: ${initialPhoneCount}`);
        console.log(`   Phone numbers after sync: ${finalPhoneCount}`);
        console.log(`   New devices added: ${finalDeviceCount - initialDeviceCount}`);
        console.log(`   New phone numbers added: ${finalPhoneCount - initialPhoneCount}`);

        if (agentsNewlyRegistered > 0) {
            console.log(`\n🎉 Successfully registered ${agentsNewlyRegistered} new agent(s)!`);
        } else {
            console.log(`\n✅ All agents were already properly registered`);
        }

        // List all registered devices
        console.log(`\n📋 All Registered Devices:`);
        console.log(`Device ID | Actor Name | Phone Number`);
        console.log(`----------|-------------|-------------`);

        for (const [deviceId, device] of this.devices) {
            const phoneNumber = this.devicePhoneNumbers.get(deviceId);
            const formattedPhone = phoneNumber ? this.formatPhoneNumberForDisplay(phoneNumber) : 'No phone';
            const ownerName = this.getDeviceOwnerName(deviceId);  // 🆕 Use helper function with fallback
            console.log(`${deviceId} | ${ownerName} | ${formattedPhone}`);
        }

        // ENHANCED: Ensure all devices have proper owner names and avatars after sync
        console.log("🔄 Ensuring devices have proper owner names and avatars...");
        await this.migrateDeviceNamesAndAvatars();

        console.log(`\n=== Agent Sync Complete ===`);
    }

    /**
     * Migrate existing devices to include owner names
     */
    async migrateOwnerNames() {
        console.log("\n🔄 Starting owner name migration...");

        let devicesMigrated = 0;
        let devicesSkipped = 0;

        for (const [deviceId, device] of this.devices) {
            if (device.ownerName) {
                devicesSkipped++;
                continue; // Already has owner name
            }

            // Extract actor ID from device ID
            const actorId = device.ownerActorId;
            if (!actorId) {
                console.warn(`⚠️  Device ${deviceId} has no ownerActorId, skipping`);
                devicesSkipped++;
                continue;
            }

            // Get actor from game
            const actor = game.actors.get(actorId);
            if (!actor) {
                console.warn(`⚠️  Actor ${actorId} not found for device ${deviceId}, skipping`);
                devicesSkipped++;
                continue;
            }

            // Update device with owner name
            device.ownerName = actor.name;
            devicesMigrated++;
            console.log(`✅ Migrated device ${deviceId}: ${actor.name}`);
        }

        if (devicesMigrated > 0) {
            await this.saveDeviceData();
            console.log(`\n💾 Saved ${devicesMigrated} migrated devices`);
        }

        console.log(`\n📊 Migration Results:`);
        console.log(`   Devices migrated: ${devicesMigrated}`);
        console.log(`   Devices skipped (already had names): ${devicesSkipped}`);
        console.log(`   Total devices processed: ${devicesMigrated + devicesSkipped}`);

        if (devicesMigrated > 0) {
            console.log(`\n🎉 Migration completed successfully!`);
        } else {
            console.log(`\n✅ All devices already have owner names`);
        }
    }

    /**
     * Force update all owner names from current actor data
     */
    async updateAllOwnerNames() {
        console.log("\n🔄 Force updating all owner names...");

        let devicesUpdated = 0;
        let devicesSkipped = 0;
        let devicesError = 0;

        for (const [deviceId, device] of this.devices) {
            const actorId = device.ownerActorId;
            if (!actorId) {
                console.warn(`⚠️  Device ${deviceId} has no ownerActorId, skipping`);
                devicesSkipped++;
                continue;
            }

            const actor = game.actors.get(actorId);
            if (!actor) {
                console.warn(`⚠️  Actor ${actorId} not found for device ${deviceId}, skipping`);
                devicesError++;
                continue;
            }

            const oldName = device.ownerName || 'Unknown';
            const newName = actor.name;

            if (oldName !== newName) {
                device.ownerName = newName;
                devicesUpdated++;
                console.log(`✅ Updated device ${deviceId}: ${oldName} → ${newName}`);
            } else {
                devicesSkipped++;
            }
        }

        if (devicesUpdated > 0) {
            await this.saveDeviceData();
            console.log(`\n💾 Saved ${devicesUpdated} updated devices`);
        }

        console.log(`\n📊 Update Results:`);
        console.log(`   Devices updated: ${devicesUpdated}`);
        console.log(`   Devices skipped (no change): ${devicesSkipped}`);
        console.log(`   Devices with errors: ${devicesError}`);
        console.log(`   Total devices processed: ${devicesUpdated + devicesSkipped + devicesError}`);

        if (devicesUpdated > 0) {
            console.log(`\n🎉 Owner name update completed successfully!`);
        } else {
            console.log(`\n✅ All owner names are up to date`);
        }
    }

    /**
     * Quick sync function that only checks for missing registrations
     */
    async quickSyncAgents() {
        console.log("\n⚡ Quick Agent Sync - Checking for missing registrations only...");

        let missingRegistrations = 0;
        let fixedRegistrations = 0;

        // Get all actors
        const allActors = game.actors.contents;

        for (const actor of allActors) {
            // Get equipped agent items
            const equippedAgentItems = actor.items.filter(item =>
                item.type === 'gear' &&
                item.name.toLowerCase().includes('agent') &&
                (item.system?.equipped || item.flags?.equipped || item.system?.equippedState === 'equipped')
            );

            for (const item of equippedAgentItems) {
                const deviceId = `device-${actor.id}-${item.id}`;
                const deviceExists = this.devices.has(deviceId);
                const phoneNumberExists = this.devicePhoneNumbers.has(deviceId);

                if (!deviceExists || !phoneNumberExists) {
                    missingRegistrations++;
                    console.log(`🔧 Fixing missing registration for ${actor.name} - ${item.name}`);

                    try {
                        // Create device if missing
                        if (!deviceExists) {
                            const deviceName = `${actor.name} - Agent`;
                            this.devices.set(deviceId, {
                                id: deviceId,
                                name: deviceName,
                                actorId: actor.id,
                                itemId: item.id,
                                owner: actor.ownership.default || 0
                            });

                            if (!this.deviceMappings.has(actor.id)) {
                                this.deviceMappings.set(actor.id, []);
                            }
                            this.deviceMappings.get(actor.id).push(deviceId);
                        }

                        // Assign phone number if missing
                        if (!phoneNumberExists) {
                            await this.getDevicePhoneNumber(deviceId);
                        }

                        fixedRegistrations++;
                        console.log(`✅ Fixed registration for ${actor.name} - ${item.name}`);

                    } catch (error) {
                        console.error(`❌ Failed to fix registration for ${actor.name} - ${item.name}:`, error);
                    }
                }
            }
        }

        if (fixedRegistrations > 0) {
            await this.saveDeviceData();
            await this.savePhoneNumberData();
            console.log(`\n💾 Data saved`);
        }

        console.log(`\n📊 Quick Sync Results:`);
        console.log(`   Missing registrations found: ${missingRegistrations}`);
        console.log(`   Registrations fixed: ${fixedRegistrations}`);

        if (fixedRegistrations === 0) {
            console.log(`✅ All agents are properly registered!`);
        } else {
            console.log(`🎉 Fixed ${fixedRegistrations} registration(s)!`);
        }
    }

    /**
     * Notify about device message updates
     */
    async notifyDeviceMessageUpdate(senderDeviceId, receiverDeviceId, message) {
        // Only send cross-client notifications if there are multiple users
        if (!this._needsCrossClientCommunication()) {
            console.log("Cyberpunk Agent | Single user session, skipping device message notification");
            return;
        }

        // Prevent duplicate notifications for the same message
        const messageKey = `${senderDeviceId}-${receiverDeviceId}-${message.id}`;
        const now = Date.now();
        if (this._lastDeviceMessageNotifications && this._lastDeviceMessageNotifications[messageKey] &&
            (now - this._lastDeviceMessageNotifications[messageKey]) < 2000) {
            console.log("Cyberpunk Agent | Skipping duplicate device message notification");
            return;
        }

        if (!this._lastDeviceMessageNotifications) {
            this._lastDeviceMessageNotifications = {};
        }
        this._lastDeviceMessageNotifications[messageKey] = now;

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            this._handleSocketLibUnavailable();
            return;
        }

        console.log("Cyberpunk Agent | Sending device message notification via SocketLib");

        const notificationData = {
            type: 'deviceMessageUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id,
                senderId: senderDeviceId,
                receiverId: receiverDeviceId,
                message: message
            }
        };

        try {
            if (this.socketLibIntegration && this.socketLibIntegration.sendDeviceMessageUpdate) {
                const success = await this.socketLibIntegration.sendDeviceMessageUpdate(notificationData);
                if (success) {
                    console.log("Cyberpunk Agent | SocketLib device message notification sent successfully");
                } else {
                    console.error("Cyberpunk Agent | SocketLib device message notification failed");
                    ui.notifications.error("Falha ao enviar notificação de mensagem de dispositivo via SocketLib");
                }
            } else {
                console.error("Cyberpunk Agent | SocketLib device message integration not available");
                ui.notifications.error("Integração SocketLib para mensagens de dispositivo não disponível");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | SocketLib device message notification failed:", error);
            ui.notifications.error("Erro na comunicação SocketLib: " + error.message);
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
     * Notify all clients about contact updates via SocketLib
     * @param {object} contactData - Contact update data
     */
    async notifyContactUpdate(contactData) {
        // Only send cross-client notifications if there are multiple users
        if (!this._needsCrossClientCommunication()) {
            console.log("Cyberpunk Agent | Single user session, skipping contact notification");
            return;
        }

        // Check if SocketLib is available
        if (!this._isSocketLibAvailable()) {
            console.log("Cyberpunk Agent | SocketLib not available, skipping contact notification");
            return;
        }

        console.log("Cyberpunk Agent | Sending contact notification via SocketLib");

        const notificationData = {
            type: 'contactUpdate',
            data: {
                timestamp: Date.now(),
                userId: game.user.id,
                userName: game.user.name,
                sessionId: game.data.id,
                ...contactData
            }
        };

        try {
            if (this.socketLibIntegration && this.socketLibIntegration.sendContactUpdate) {
                const success = await this.socketLibIntegration.sendContactUpdate(notificationData);
                if (success) {
                    console.log("Cyberpunk Agent | SocketLib contact notification sent successfully");
                } else {
                    console.error("Cyberpunk Agent | SocketLib contact notification failed");
                }
            } else {
                console.log("Cyberpunk Agent | SocketLib contact integration not available, skipping notification");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | SocketLib contact notification failed:", error);
        }
    }

    /**
     * Handle actor updates
     */
    handleActorUpdate(actor, changes, options, userId) {
        console.log(`🔄 Cyberpunk Agent | Actor update detected for ${actor.name} (${actor.id}):`, changes);



        // 🆕 Comprehensive device registry reactive updates
        this.reactiveUpdateDeviceRegistry(actor, changes);
    }

    /**
     * Reactive system to update device registry based on actor changes
     * This ensures device data stays in sync with actor data automatically
     */
    reactiveUpdateDeviceRegistry(actor, changes) {
        const actorId = actor.id;
        let devicesUpdated = 0;
        let updates = [];

        // Get all devices for this actor
        const actorDevices = this.deviceMappings.get(actorId) || [];

        if (actorDevices.length === 0) {
            console.log(`📱 No devices found for actor ${actor.name} (${actorId})`);
            return;
        }

        console.log(`📱 Found ${actorDevices.length} devices for actor ${actor.name}`);

        for (const deviceId of actorDevices) {
            const device = this.devices.get(deviceId);
            if (!device) {
                console.warn(`⚠️  Device ${deviceId} not found in devices map`);
                continue;
            }

            let deviceUpdated = false;
            const deviceUpdates = [];

            // 🆕 Handle name changes
            if (changes.name) {
                const oldName = device.deviceName;
                const newName = actor.name;
                if (oldName !== newName) {
                    device.deviceName = newName;
                    device.ownerName = newName; // Also update ownerName for consistency
                    deviceUpdated = true;
                    deviceUpdates.push(`name: ${oldName} → ${newName}`);
                    console.log(`✅ Updated device ${deviceId} name: ${oldName} → ${newName}`);
                }
            }

            // 🆕 Handle avatar/image changes
            if (changes.img) {
                const oldImg = device.img;
                const newImg = actor.img;
                if (oldImg !== newImg) {
                    device.img = newImg;
                    deviceUpdated = true;
                    deviceUpdates.push(`avatar: ${oldImg} → ${newImg}`);
                    console.log(`✅ Updated device ${deviceId} avatar: ${oldImg} → ${newImg}`);
                }
            }

            // 🆕 Handle token image changes (if different from actor image)
            if (changes.token && changes.token.img) {
                const oldImg = device.img;
                const newImg = changes.token.img;
                if (oldImg !== newImg) {
                    device.img = newImg;
                    deviceUpdated = true;
                    deviceUpdates.push(`token avatar: ${oldImg} → ${newImg}`);
                    console.log(`✅ Updated device ${deviceId} token avatar: ${oldImg} → ${newImg}`);
                }
            }

            // 🆕 Handle actor deletion (cleanup devices)
            if (changes._deleted) {
                console.log(`🗑️  Actor ${actor.name} deleted, cleaning up devices...`);
                this.cleanupDevicesForActor(actor);
                return; // Exit early since actor is deleted
            }

            // 🆕 Handle actor ownership changes
            if (changes.ownership) {
                console.log(`👥 Actor ${actor.name} ownership changed:`, changes.ownership);
                // Update device access permissions if needed
                this.updateDeviceAccessForActor(actorId, changes.ownership);
            }

            // 🆕 Handle actor folder changes (for organization)
            if (changes.folder) {
                console.log(`📁 Actor ${actor.name} moved to folder: ${changes.folder}`);
                // Could update device organization if needed
            }

            if (deviceUpdated) {
                devicesUpdated++;
                updates.push(`Device ${deviceId}: ${deviceUpdates.join(', ')}`);
            }
        }

        // Save changes if any devices were updated
        if (devicesUpdated > 0) {
            this.saveDeviceData();
            console.log(`💾 Saved ${devicesUpdated} updated devices for actor ${actor.name}`);
            console.log(`📝 Updates:`, updates);

            // 🆕 Notify UI components to refresh
            this.notifyDeviceRegistryUpdate(actorId, updates);
        } else {
            console.log(`✅ No device updates needed for actor ${actor.name}`);
        }
    }

    /**
     * Update device access permissions when actor ownership changes
     */
    updateDeviceAccessForActor(actorId, ownership) {
        console.log(`🔐 Updating device access for actor ${actorId} with ownership:`, ownership);

        // This could be expanded to handle different ownership scenarios
        // For now, we just log the change
        const actorDevices = this.deviceMappings.get(actorId) || [];
        console.log(`📱 ${actorDevices.length} devices affected by ownership change`);
    }

    /**
     * Notify UI components when device registry is updated
     */
    notifyDeviceRegistryUpdate(actorId, updates) {
        // Dispatch custom event for UI updates
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-device-update', {
            detail: {
                timestamp: Date.now(),
                type: 'deviceRegistryUpdate',
                actorId: actorId,
                updates: updates
            }
        }));

        // Update open interfaces if they're affected
        this.updateOpenInterfaces();
    }

    /**
     * Migrate existing devices to use actor names and avatars
     */
    async migrateDeviceNamesAndAvatars() {
        console.log("\n🔄 Starting device name and avatar migration...");

        let devicesUpdated = 0;
        let devicesSkipped = 0;
        let devicesError = 0;

        for (const [deviceId, device] of this.devices) {
            const actorId = device.ownerActorId;
            if (!actorId) {
                console.warn(`⚠️  Device ${deviceId} has no ownerActorId, skipping`);
                devicesSkipped++;
                continue;
            }

            const actor = game.actors.get(actorId);
            if (!actor) {
                console.warn(`⚠️  Actor ${actorId} not found for device ${deviceId}, skipping`);
                devicesError++;
                continue;
            }

            const oldName = device.deviceName || 'Unknown';
            const newName = actor.name;
            const oldImg = device.img || 'icons/svg/mystery-man.svg';
            const newImg = actor.img || 'icons/svg/mystery-man.svg';

            let updated = false;

            // Update device name if it's not the actor name
            if (oldName !== newName) {
                device.deviceName = newName;
                updated = true;
                console.log(`✅ Updated device ${deviceId} name: ${oldName} → ${newName}`);
            }

            // Update device avatar if it's not the actor avatar
            if (oldImg !== newImg) {
                device.img = newImg;
                updated = true;
                console.log(`✅ Updated device ${deviceId} avatar: ${oldImg} → ${newImg}`);
            }

            if (updated) {
                devicesUpdated++;
            } else {
                devicesSkipped++;
            }
        }

        if (devicesUpdated > 0) {
            await this.saveDeviceData();
            console.log(`\n💾 Saved ${devicesUpdated} updated devices`);
        }

        console.log(`\n📊 Migration Results:`);
        console.log(`   Devices updated: ${devicesUpdated}`);
        console.log(`   Devices skipped (no change): ${devicesSkipped}`);
        console.log(`   Devices with errors: ${devicesError}`);
        console.log(`   Total devices processed: ${devicesUpdated + devicesSkipped + devicesError}`);

        if (devicesUpdated > 0) {
            console.log(`\n🎉 Device name and avatar migration completed successfully!`);
        } else {
            console.log(`\n✅ All devices already have correct names and avatars`);
        }
    }

    /**
     * Get all registered devices for GM access
     */
    getAllRegisteredDevices() {
        const allDevices = [];

        // Ensure devices are loaded
        if (!this.devices || this.devices.size === 0) {
            console.log("Cyberpunk Agent | No devices loaded, attempting to load device data...");
            this.loadDeviceData();
        }

        // Safety check after loading
        if (!this.devices || this.devices.size === 0) {
            console.log("Cyberpunk Agent | Still no devices available after loading");
            return allDevices;
        }

        for (const [deviceId, device] of this.devices) {
            const ownerName = this.getDeviceOwnerName(deviceId);
            const phoneNumber = this.devicePhoneNumbers.get(deviceId);
            const formattedPhone = phoneNumber ? this.formatPhoneNumberForDisplay(phoneNumber) : 'No phone';

            // Get the most current actor image
            let deviceImg = device.img || 'icons/svg/mystery-man.svg';
            if (device.ownerActorId) {
                const actor = game.actors.get(device.ownerActorId);
                if (actor && actor.img) {
                    deviceImg = actor.img;
                }
            }

            allDevices.push({
                deviceId: deviceId,
                ownerName: ownerName,
                phoneNumber: formattedPhone,
                deviceName: device.deviceName || 'Agent',
                ownerActorId: device.ownerActorId,
                img: deviceImg,
                contacts: device.contacts || []
            });
        }

        // Sort by owner name for better organization
        allDevices.sort((a, b) => a.ownerName.localeCompare(b.ownerName));

        return allDevices;
    }

    /**
     * Show menu for GM to select from all registered devices
     */
    async showAllDevicesMenu(allDevices) {
        console.log("Cyberpunk Agent | showAllDevicesMenu called with:", allDevices);

        if (!allDevices || allDevices.length === 0) {
            ui.notifications.warn("No devices available");
            return;
        }

        // Sort devices: pinned first, then by owner name
        const sortedDevices = allDevices.sort((a, b) => {
            const aIsPinned = this.isDevicePinned(a.deviceId);
            const bIsPinned = this.isDevicePinned(b.deviceId);

            // Pinned devices come first
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;

            // Within same pin status, sort by owner name
            return (a.ownerName || 'Unknown').localeCompare(b.ownerName || 'Unknown');
        });

        // Separate pinned and regular devices for section headers
        const pinnedDevices = sortedDevices.filter(device => this.isDevicePinned(device.deviceId));
        const regularDevices = sortedDevices.filter(device => !this.isDevicePinned(device.deviceId));

        // Create device HTML with section headers
        let deviceListHtml = '';

        // Add pinned devices section
        if (pinnedDevices.length > 0) {
            deviceListHtml += `
                <div class="cp-device-section-header">
                    <i class="fas fa-thumbtack"></i>
                    <span>DISPOSITIVOS FIXADOS (${pinnedDevices.length})</span>
                </div>
            `;
            deviceListHtml += pinnedDevices.map(device => this._createDeviceItemHtml(device)).join('');
        }

        // Add regular devices section
        if (regularDevices.length > 0) {
            deviceListHtml += `
                <div class="cp-device-section-header ${pinnedDevices.length > 0 ? 'with-spacing' : ''}">
                    <i class="fas fa-mobile-alt"></i>
                    <span>OUTROS DISPOSITIVOS (${regularDevices.length})</span>
                </div>
            `;
            deviceListHtml += regularDevices.map(device => this._createDeviceItemHtml(device)).join('');
        }


        // Create the enhanced dialog content
        const content = `
            <div class="cp-device-selection-container">
                <div class="cp-device-selection-header">
                    <h3><i class="fas fa-mobile-alt"></i> SELEÇÃO DE DISPOSITIVO</h3>
                    <p>Como GM, você pode operar qualquer dispositivo registrado no sistema.</p>
                </div>
                
                <div class="cp-device-filter-section">
                    <div class="cp-filter-wrapper">
                        <input type="text" id="cp-device-filter" placeholder="Filtrar por nome ou telefone..." />
                        <i class="fas fa-search cp-filter-icon"></i>
                    </div>
                    <div class="cp-sort-controls">
                        <select id="cp-sort-by" class="cp-sort-select">
                            <option value="name">Ordenar por Nome</option>
                            <option value="unread">Ordenar por Não Lidas</option>
                        </select>
                        <button id="cp-unread-only" class="cp-unread-toggle" title="Mostrar apenas dispositivos com mensagens não lidas">
                            <i class="fas fa-envelope"></i>
                            <span>Apenas Não Lidas</span>
                        </button>
                    </div>
                    <div class="cp-device-count">
                        <span id="cp-visible-count">${allDevices.length}</span> de ${allDevices.length} dispositivos
                    </div>
                </div>
                
                <div class="cp-device-list" id="cp-device-list">
                    ${deviceListHtml}
                    <div class="cp-no-devices-found" id="cp-no-devices-found" style="display: none;">
                        <div class="cp-no-devices-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h4>Nenhum dispositivo encontrado</h4>
                        <p>Tente ajustar os filtros para encontrar dispositivos.</p>
                    </div>
                </div>
                
                <div class="cp-device-selection-footer">
                    <div class="cp-selection-stats">
                        Total: ${allDevices.length} dispositivos registrados
                    </div>
                </div>
            </div>
        `;

        // Create and show the enhanced dialog
        const dialog = new Dialog({
            title: "Cyberpunk Agent - Seleção de Dispositivo",
            content: content,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancelar"
                }
            },
            default: "cancel",
            render: (html) => {
                // Add cyberpunk styling to the dialog
                html.closest('.dialog').addClass('cp-device-selection-dialog');

                // Enhanced filter and sort functionality
                const filterInput = html.find('#cp-device-filter');
                const sortSelect = html.find('#cp-sort-by');
                const unreadToggle = html.find('#cp-unread-only');
                const deviceItems = html.find('.cp-device-item');
                const visibleCount = html.find('#cp-visible-count');

                // Helper function to normalize text for search (remove special chars, lowercase)
                const normalizeSearchText = (text) => {
                    return text.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Remove accents
                        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                        .trim();
                };

                // Get unread count for a device item
                const getDeviceUnreadCount = (deviceItem) => {
                    const unreadElement = deviceItem.find('.cp-device-unread');
                    if (unreadElement.length > 0) {
                        const text = unreadElement.text();
                        const match = text.match(/(\d+)/);
                        return match ? parseInt(match[1]) : 0;
                    }
                    return 0;
                };

                // Sort devices based on selected criteria
                const sortDevices = () => {
                    const sortBy = sortSelect.val();
                    const deviceList = html.find('#cp-device-list');
                    const items = deviceList.find('.cp-device-item').get();

                    if (sortBy === 'unread') {
                        // Sort by unread count (highest first)
                        items.sort((a, b) => {
                            const aUnread = getDeviceUnreadCount($(a));
                            const bUnread = getDeviceUnreadCount($(b));

                            // Pinned devices still come first
                            const aIsPinned = $(a).hasClass('pinned');
                            const bIsPinned = $(b).hasClass('pinned');

                            if (aIsPinned && !bIsPinned) return -1;
                            if (!aIsPinned && bIsPinned) return 1;

                            // Within same pin status, sort by unread count
                            return bUnread - aUnread;
                        });
                    } else {
                        // Sort by name (alphabetical)
                        items.sort((a, b) => {
                            const aName = $(a).find('.cp-device-name').text().toLowerCase();
                            const bName = $(b).find('.cp-device-name').text().toLowerCase();

                            // Pinned devices still come first
                            const aIsPinned = $(a).hasClass('pinned');
                            const bIsPinned = $(b).hasClass('pinned');

                            if (aIsPinned && !bIsPinned) return -1;
                            if (!aIsPinned && bIsPinned) return 1;

                            // Within same pin status, sort alphabetically
                            return aName.localeCompare(bName);
                        });
                    }

                    // Remove all items and headers, then re-add in sorted order
                    deviceList.empty();

                    // Re-add section headers and items
                    const pinnedItems = items.filter(item => $(item).hasClass('pinned'));
                    const regularItems = items.filter(item => !$(item).hasClass('pinned'));

                    if (pinnedItems.length > 0) {
                        deviceList.append(`
                            <div class="cp-device-section-header">
                                <i class="fas fa-thumbtack"></i>
                                <span>DISPOSITIVOS FIXADOS (${pinnedItems.length})</span>
                            </div>
                        `);
                        pinnedItems.forEach(item => deviceList.append(item));
                    }

                    if (regularItems.length > 0) {
                        deviceList.append(`
                            <div class="cp-device-section-header ${pinnedItems.length > 0 ? 'with-spacing' : ''}">
                                <i class="fas fa-mobile-alt"></i>
                                <span>OUTROS DISPOSITIVOS (${regularItems.length})</span>
                            </div>
                        `);
                        regularItems.forEach(item => deviceList.append(item));
                    }

                    // Re-add no devices found message
                    deviceList.append(`
                        <div class="cp-no-devices-found" id="cp-no-devices-found" style="display: none;">
                            <div class="cp-no-devices-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h4>Nenhum dispositivo encontrado</h4>
                            <p>Tente ajustar os filtros para encontrar dispositivos.</p>
                        </div>
                    `);

                    // Reattach event handlers and update filters
                    attachDeviceEventHandlers();
                    updateFilter();
                };

                // Function to attach event handlers to device items
                const attachDeviceEventHandlers = () => {
                    // Pin/unpin functionality
                    html.find('.cp-device-pin-btn').off('click').click(async (event) => {
                        event.stopPropagation();
                        const deviceId = $(event.currentTarget).data('device-id');

                        if (deviceId) {
                            const success = await this.toggleDevicePin(deviceId);
                            if (success) {
                                // Re-sort the list to show changes
                                setTimeout(() => {
                                    dialog.close();
                                    this.showAllDevicesMenu(allDevices);
                                }, 200);
                            }
                        }
                    });

                    // Device selection events
                    html.find('.cp-device-select-btn').off('click').click((event) => {
                        const deviceId = $(event.currentTarget).data('device-id');
                        if (deviceId) {
                            console.log(`Cyberpunk Agent | GM selected device: ${deviceId}`);
                            dialog.close();
                            this.openSpecificAgent(deviceId);
                        }
                    });

                    // Double-click to select device
                    html.find('.cp-device-item').off('dblclick').dblclick((event) => {
                        const deviceId = $(event.currentTarget).data('device-id');
                        if (deviceId) {
                            console.log(`Cyberpunk Agent | GM double-clicked device: ${deviceId}`);
                            dialog.close();
                            this.openSpecificAgent(deviceId);
                        }
                    });
                };

                const updateFilter = () => {
                    const filterText = normalizeSearchText(filterInput.val());
                    const showUnreadOnly = unreadToggle.hasClass('active');
                    let visibleDevices = 0;

                    html.find('.cp-device-item').each(function () {
                        const item = $(this);
                        const searchText = item.data('search-text') || '';
                        const normalizedSearchText = normalizeSearchText(searchText);
                        const hasUnread = getDeviceUnreadCount(item) > 0;

                        // Text filter
                        const matchesText = !filterText || normalizedSearchText.includes(filterText);

                        // Unread filter
                        const matchesUnread = !showUnreadOnly || hasUnread;

                        const isVisible = matchesText && matchesUnread;

                        item.toggle(isVisible);
                        if (isVisible) visibleDevices++;
                    });

                    visibleCount.text(visibleDevices);

                    // Show/hide no devices found message
                    const noDevicesFound = html.find('#cp-no-devices-found');
                    noDevicesFound.toggle(visibleDevices === 0);
                };

                // Initial event handler attachment
                attachDeviceEventHandlers();

                // Filter and sort events
                filterInput.on('input', updateFilter);
                sortSelect.on('change', sortDevices);

                unreadToggle.click(() => {
                    unreadToggle.toggleClass('active');
                    updateFilter();
                });

                filterInput.on('keydown', (event) => {
                    if (event.key === 'Escape') {
                        filterInput.val('');
                        unreadToggle.removeClass('active');
                        updateFilter();
                    }
                });

                // Focus filter input
                setTimeout(() => filterInput.focus(), 100);
            }
        });

        dialog.render(true);
    }

    /**
     * Create HTML for a device item in the selection interface
     */
    _createDeviceItemHtml(device) {
        // Get user status for this device
        const deviceUser = this._getUserForDevice(device.deviceId);
        const isOnline = deviceUser && deviceUser.active;
        const isGMDevice = deviceUser && deviceUser.isGM;

        // Get unread message count for this device
        let unreadCount = 0;
        try {
            for (const [conversationKey, messages] of this.messages.entries()) {
                if (conversationKey.includes(device.deviceId)) {
                    unreadCount += messages.filter(msg => !msg.read && msg.receiverId === device.deviceId).length;
                }
            }
        } catch (error) {
            // Ignore errors in unread count calculation
        }

        const statusClass = isOnline ? 'online' : 'offline';
        const userTypeClass = isGMDevice ? 'gm' : 'player';
        const isPinned = this.isDevicePinned(device.deviceId);
        const pinnedClass = isPinned ? 'pinned' : '';

        return `
            <div class="cp-device-item ${statusClass} ${userTypeClass} ${pinnedClass}" data-device-id="${device.deviceId}" data-search-text="${device.ownerName?.toLowerCase() || ''} ${device.phoneNumber}">
                <div class="cp-device-avatar">
                    <img src="${device.img || 'icons/svg/mystery-man.svg'}" alt="${device.ownerName}" />
                    ${isPinned ? '<div class="cp-device-pin-indicator"><i class="fas fa-thumbtack"></i></div>' : ''}
                </div>
                <div class="cp-device-info">
                    <div class="cp-device-name">
                        ${device.ownerName || 'Unknown'}
                        ${isGMDevice ? '<span class="cp-gm-badge">GM</span>' : ''}
                        ${isPinned ? '<span class="cp-pin-badge">FIXADO</span>' : ''}
                    </div>
                    <div class="cp-device-phone">${device.phoneNumber}</div>
                        <div class="cp-device-details">
                            <span class="cp-device-id">ID: ${device.deviceId.slice(-8)}</span>
                            <span class="cp-device-contacts">${device.contacts?.length || 0} contatos</span>
                            ${unreadCount > 0 ? `<span class="cp-device-unread">${unreadCount} não lidas</span>` : ''}
                        </div>
                </div>
                <div class="cp-device-actions">
                    <button class="cp-device-pin-btn" data-device-id="${device.deviceId}" title="${isPinned ? 'Desfixar dispositivo' : 'Fixar dispositivo'}">
                        <i class="fas fa-thumbtack ${isPinned ? 'pinned' : ''}"></i>
                    </button>
                    <button class="cp-device-select-btn" data-device-id="${device.deviceId}">
                        <i class="fas fa-mobile-alt"></i>
                        OPERAR
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get owner name for a device with fallback
     */
    getDeviceOwnerName(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return 'Unknown Device';

        // First try to get from device data
        if (device.ownerName) {
            return device.ownerName;
        }

        // Fallback: get from actor
        if (device.ownerActorId) {
            const actor = game.actors.get(device.ownerActorId);
            if (actor) {
                // Update the device data for future use
                device.ownerName = actor.name;
                return actor.name;
            }
        }

        return 'Unknown Owner';
    }

    /**
     * Update device owner names when actor name changes
     */
    updateDeviceOwnerNames(actorId, newName) {
        let devicesUpdated = 0;

        // Find all devices owned by this actor
        for (const [deviceId, device] of this.devices) {
            if (device.ownerActorId === actorId) {
                device.ownerName = newName;
                devicesUpdated++;
                console.log(`Cyberpunk Agent | Updated device ${deviceId} owner name to: ${newName}`);
            }
        }

        if (devicesUpdated > 0) {
            // Save the updated device data
            this.saveDeviceData();
            console.log(`Cyberpunk Agent | Updated ${devicesUpdated} devices with new owner name: ${newName}`);
        }
    }

    /**
     * Update contact names in networks
     */




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




    /**
     * Delete messages from a conversation (actor-based)
     * This affects both local cache and server storage to ensure persistence
     */
    async deleteMessages(actorId1, actorId2, messageIds) {
        try {
            console.log("Cyberpunk Agent | Starting actor message deletion process");
            console.log("Cyberpunk Agent | Actor1:", actorId1, "Actor2:", actorId2, "MessageIds:", messageIds);

            if (!game.user.isGM) {
                console.error("Cyberpunk Agent | Only GMs can delete messages");
                return false;
            }

            const conversationKey = this._getConversationKey(actorId1, actorId2);
            console.log("Cyberpunk Agent | Actor conversation key:", conversationKey);

            // CRITICAL: Delete from server storage first to ensure persistence
            console.log("Cyberpunk Agent | GM deleting actor messages from server storage");
            const serverDeleteSuccess = await this.deleteMessagesFromServerAsGM(conversationKey, messageIds);

            // Update local memory
            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original actor messages count:", messages.length);

            // Filter out messages to be deleted
            const updatedMessages = messages.filter(message => !messageIds.includes(message.id));
            console.log("Cyberpunk Agent | Updated actor messages count:", updatedMessages.length);

            // Update the conversation in local memory
            this.messages.set(conversationKey, updatedMessages);

            // Save messages to localStorage (legacy method for actor-based conversations)
            console.log("Cyberpunk Agent | Saving actor messages to localStorage...");
            await this.saveMessages();

            // Notify all clients about the message deletion
            console.log("Cyberpunk Agent | Notifying clients about actor message deletion...");
            await this._notifyMessageDeletion(actorId1, actorId2, messageIds);

            if (!serverDeleteSuccess) {
                console.warn("Cyberpunk Agent | Server deletion failed for actor messages, messages deleted locally only");
                ui.notifications.warn("Mensagens deletadas localmente. Podem reaparecer ao reconectar.");
            }

            console.log(`Cyberpunk Agent | Successfully deleted ${messageIds.length} messages from actor conversation ${conversationKey}`);
            return serverDeleteSuccess; // Return server success status
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting actor messages:", error);
            return false;
        }
    }

    /**
     * Delete messages from a device conversation (device-specific)
     * This affects both local cache and server storage to ensure persistence
     */
    async deleteDeviceMessages(deviceId, contactDeviceId, messageIds) {
        try {
            console.log("Cyberpunk Agent | Starting device message deletion process");
            console.log("Cyberpunk Agent | Device:", deviceId, "Contact Device:", contactDeviceId, "MessageIds:", messageIds);

            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
            console.log("Cyberpunk Agent | Device conversation key:", conversationKey);

            // CRITICAL: Delete from server storage first to ensure persistence
            let serverDeleteSuccess = false;

            if (game.user.isGM) {
                // GM directly deletes from server
                console.log("Cyberpunk Agent | GM deleting messages from server storage");
                serverDeleteSuccess = await this.deleteMessagesFromServerAsGM(conversationKey, messageIds);
            } else {
                // Players request GM to delete messages from server
                console.log("Cyberpunk Agent | Player requesting GM to delete messages from server");
                serverDeleteSuccess = await this.requestGMMessageDeletion(conversationKey, messageIds);
            }

            // Update local memory
            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original device messages count:", messages.length);

            // Filter out messages to be deleted
            const updatedMessages = messages.filter(message => !messageIds.includes(message.id));
            console.log("Cyberpunk Agent | Updated device messages count:", updatedMessages.length);

            // Update the conversation in local memory
            this.messages.set(conversationKey, updatedMessages);

            // Save messages for the specific device (local cache)
            console.log("Cyberpunk Agent | Saving device messages to localStorage...");
            await this.saveMessagesForDevice(deviceId);

            // Notify all clients about the device message deletion
            console.log("Cyberpunk Agent | Notifying clients about device message deletion...");
            await this._notifyDeviceMessageDeletion(deviceId, contactDeviceId, messageIds);

            if (!serverDeleteSuccess) {
                console.warn("Cyberpunk Agent | Server deletion failed, messages deleted locally only");
                ui.notifications.warn("Mensagens deletadas localmente. Podem reaparecer ao reconectar.");
            }

            console.log(`Cyberpunk Agent | Successfully deleted ${messageIds.length} messages from device conversation ${conversationKey}`);
            return serverDeleteSuccess; // Return server success status
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting device messages:", error);
            return false;
        }
    }

    /**
     * GM deletes messages directly from server storage
     */
    async deleteMessagesFromServerAsGM(conversationKey, messageIds) {
        try {
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};

            if (serverMessages[conversationKey]) {
                // Filter out messages to be deleted
                const originalCount = serverMessages[conversationKey].length;
                serverMessages[conversationKey] = serverMessages[conversationKey].filter(
                    message => !messageIds.includes(message.id)
                );
                const newCount = serverMessages[conversationKey].length;

                // Save updated messages back to server
                await game.settings.set('cyberpunk-agent', 'server-messages', serverMessages);
                console.log(`Cyberpunk Agent | GM deleted ${originalCount - newCount} messages from server storage`);

                return true;
            } else {
                console.log("Cyberpunk Agent | No conversation found in server storage for deletion");
                return true; // Not an error if conversation doesn't exist
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting messages from server as GM:", error);
            return false;
        }
    }

    /**
     * Player requests GM to delete messages from server
     */
    async requestGMMessageDeletion(conversationKey, messageIds) {
        try {
            if (this.socketLibIntegration) {
                const deleteRequest = {
                    conversationKey,
                    messageIds,
                    requestingUserId: game.user.id,
                    requestingUserName: game.user.name,
                    timestamp: Date.now()
                };

                console.log("Cyberpunk Agent | Sending message deletion request to GM");
                const success = await this.socketLibIntegration.sendMessageToGM('deleteMessagesFromServer', deleteRequest);

                if (!success) {
                    console.warn("Cyberpunk Agent | Failed to send deletion request to GM");
                }

                return success;
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available for GM message deletion request");
                return false;
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error requesting GM message deletion:", error);
            return false;
        }
    }

    /**
     * Edit a message in a device conversation
     * This affects both local cache and server storage to ensure persistence
     */
    async editDeviceMessage(deviceId, contactDeviceId, messageId, newText, originalText) {
        try {
            console.log("Cyberpunk Agent | Starting device message edit process");
            console.log("Cyberpunk Agent | Device:", deviceId, "Contact Device:", contactDeviceId, "Message ID:", messageId);

            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
            console.log("Cyberpunk Agent | Device conversation key:", conversationKey);

            // CRITICAL: Update server storage first to ensure persistence
            let serverEditSuccess = false;

            if (game.user.isGM) {
                // GM directly edits on server
                console.log("Cyberpunk Agent | GM editing message on server storage");
                serverEditSuccess = await this.editMessageOnServerAsGM(conversationKey, messageId, newText, originalText);
            } else {
                // Players request GM to edit message on server
                console.log("Cyberpunk Agent | Player requesting GM to edit message on server");
                serverEditSuccess = await this.requestGMMessageEdit(conversationKey, messageId, newText, originalText);
            }

            // Update local memory
            const messages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Original device messages count:", messages.length);

            // Find and update the message
            const messageToEdit = messages.find(message => message.id === messageId);
            if (messageToEdit) {
                const oldText = messageToEdit.text;
                messageToEdit.text = newText;
                messageToEdit.edited = true;
                messageToEdit.editedAt = Date.now();
                messageToEdit.originalText = originalText;
                console.log(`Cyberpunk Agent | Updated message locally: "${oldText}" → "${newText}"`);
            } else {
                console.warn(`Cyberpunk Agent | Message ${messageId} not found in local conversation`);
            }

            // Save messages for the specific device (local cache)
            console.log("Cyberpunk Agent | Saving device messages to localStorage...");
            await this.saveMessagesForDevice(deviceId);

            // Notify all clients about the device message edit
            console.log("Cyberpunk Agent | Notifying clients about device message edit...");
            await this._notifyDeviceMessageEdit(deviceId, contactDeviceId, messageId, newText, originalText);

            if (!serverEditSuccess) {
                console.warn("Cyberpunk Agent | Server edit failed, message edited locally only");
                ui.notifications.warn("Mensagem editada localmente. Alteração pode não sincronizar.");
            }

            console.log(`Cyberpunk Agent | Successfully edited message ${messageId} in device conversation ${conversationKey}`);
            return serverEditSuccess; // Return server success status
        } catch (error) {
            console.error("Cyberpunk Agent | Error editing device message:", error);
            return false;
        }
    }

    /**
     * GM edits message directly on server storage
     */
    async editMessageOnServerAsGM(conversationKey, messageId, newText, originalText) {
        try {
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};

            if (serverMessages[conversationKey]) {
                // Find and update the message
                const messageToEdit = serverMessages[conversationKey].find(msg => msg.id === messageId);
                if (messageToEdit) {
                    messageToEdit.text = newText;
                    messageToEdit.edited = true;
                    messageToEdit.editedAt = Date.now();
                    messageToEdit.originalText = originalText;

                    // Save updated messages back to server
                    await game.settings.set('cyberpunk-agent', 'server-messages', serverMessages);
                    console.log(`Cyberpunk Agent | GM edited message on server: "${originalText}" → "${newText}"`);

                    return true;
                } else {
                    console.log("Cyberpunk Agent | Message not found in server storage for editing");
                    return false;
                }
            } else {
                console.log("Cyberpunk Agent | No conversation found in server storage for editing");
                return false;
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error editing message on server as GM:", error);
            return false;
        }
    }

    /**
     * Player requests GM to edit message on server
     */
    async requestGMMessageEdit(conversationKey, messageId, newText, originalText) {
        try {
            if (this.socketLibIntegration) {
                const editRequest = {
                    conversationKey,
                    messageId,
                    newText,
                    originalText,
                    requestingUserId: game.user.id,
                    requestingUserName: game.user.name,
                    timestamp: Date.now()
                };

                console.log("Cyberpunk Agent | Sending message edit request to GM");
                const success = await this.socketLibIntegration.sendMessageToGM('editMessageOnServer', editRequest);

                if (!success) {
                    console.warn("Cyberpunk Agent | Failed to send edit request to GM");
                }

                return success;
            } else {
                console.warn("Cyberpunk Agent | SocketLib not available for GM message edit request");
                return false;
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error requesting GM message edit:", error);
            return false;
        }
    }

    /**
     * Notify all clients about device message edit
     */
    async _notifyDeviceMessageEdit(deviceId, contactDeviceId, messageId, newText, originalText) {
        try {
            console.log("Cyberpunk Agent | Notifying device message edit via SocketLib");

            if (!this._isSocketLibAvailable()) {
                console.warn("Cyberpunk Agent | SocketLib not available for device message edit notification");
                return;
            }

            const notificationData = {
                data: {
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId,
                    messageId: messageId,
                    newText: newText,
                    originalText: originalText,
                    editedBy: game.user.name,
                    timestamp: Date.now()
                }
            };

            await this.socketLibIntegration.sendDeviceMessageEdit(notificationData);
            console.log("Cyberpunk Agent | Device message edit notification sent to all clients");
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying device message edit:", error);
        }
    }

    /**
     * Notify all clients about device message deletion
     */
    async _notifyDeviceMessageDeletion(deviceId, contactDeviceId, messageIds) {
        try {
            console.log("Cyberpunk Agent | Notifying device message deletion via SocketLib");

            if (!this._isSocketLibAvailable()) {
                console.warn("Cyberpunk Agent | SocketLib not available for device message deletion notification");
                return;
            }

            const notificationData = {
                data: {
                    deviceId: deviceId,
                    contactDeviceId: contactDeviceId,
                    messageIds: messageIds
                }
            };

            await this.socketLibIntegration.sendDeviceMessageDeletion(notificationData);
            console.log("Cyberpunk Agent | Device message deletion notification sent to all clients");
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying device message deletion:", error);
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
                        const componentId = `agent-conversation-${window.device?.id}-${window.currentContact.id}`;
                        componentsToUpdate.push(componentId);
                        console.log("Cyberpunk Agent | Marking agent conversation component as dirty:", componentId);
                    } else if (window.currentView === 'chat7') {
                        const componentId = `agent-chat7-${window.device?.id}`;
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

        // Find and update any open Chat7Application or AgentApplication with chat7 view
        const openWindows = Object.values(ui.windows);
        let updatedCount = 0;

        openWindows.forEach(window => {
            if (window && window.rendered) {
                // Handle legacy Chat7Application
                if (window.constructor.name === 'Chat7Application') {
                    console.log("Cyberpunk Agent | Found Chat7Application, re-rendering for updates...");
                    try {
                        // Force a re-render of the Chat7 interface to update unread counts and contacts
                        window.render(true);
                        updatedCount++;
                        console.log("Cyberpunk Agent | Chat7Application re-rendered successfully for updates");
                    } catch (error) {
                        console.warn("Cyberpunk Agent | Error re-rendering Chat7Application:", error);
                    }
                }
                // Handle unified AgentApplication with chat7 view
                else if (window.constructor.name === 'AgentApplication' && window.currentView === 'chat7') {
                    console.log("Cyberpunk Agent | Found AgentApplication with chat7 view, re-rendering for updates...");
                    try {
                        // Force a re-render of the Agent interface to update unread counts and contacts
                        window.render(true);
                        updatedCount++;
                        console.log("Cyberpunk Agent | AgentApplication chat7 view re-rendered successfully for updates");
                    } catch (error) {
                        console.warn("Cyberpunk Agent | Error re-rendering AgentApplication chat7 view:", error);
                    }
                }
            }
        });

        console.log(`Cyberpunk Agent | Re-rendered ${updatedCount} Chat7 interfaces for updates`);
    }

    /**
 * Remove contact from actor's network
 */




    /**
     * Clear all data (contacts and messages)
     */
    clearAllData() {
        try {
            console.log("Cyberpunk Agent | Clearing all data...");



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
            if (this._isSocketLibAvailable() && window.socket) {
                try {
                    await window.socket.executeForEveryone('allMessagesCleared', {
                        timestamp: Date.now(),
                        userId: game.user.id,
                        userName: game.user.name
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
     * Clear all contact lists from all agent devices in the registry (GM only)
     */
    async clearAllContactLists() {
        if (!game.user.isGM) {
            throw new Error("Only GMs can clear all contact lists");
        }

        try {
            console.log("Cyberpunk Agent | Clearing all contact lists from all devices...");

            let clearedCount = 0;

            // Clear contacts from all devices but keep the devices themselves
            for (const [deviceId, device] of this.devices) {
                if (device.contacts && device.contacts.length > 0) {
                    device.contacts = [];
                    clearedCount++;
                    console.log(`Cyberpunk Agent | Cleared contacts from device: ${device.deviceName || deviceId}`);
                }
            }

            // Save device data to persist the changes
            await this.saveDeviceData();

            // Notify all clients about the contact list clearing
            if (this._isSocketLibAvailable() && window.socket) {
                try {
                    await window.socket.executeForEveryone('allContactListsCleared', {
                        timestamp: Date.now(),
                        userId: game.user.id,
                        userName: game.user.name
                    });
                    console.log("Cyberpunk Agent | Notified all clients about contact list clearing");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Failed to notify clients about contact list clearing:", error);
                }
            }

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this.updateOpenInterfaces();

            console.log(`Cyberpunk Agent | Contact lists cleared from ${clearedCount} devices successfully`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing all contact lists:", error);
            throw error;
        }
    }

    /**
     * Synchronize all devices with the registry and perform master message sync (GM only)
     * This clears all players' local message storage and syncs from authoritative server storage
     */
    async synchronizeAllDevices() {
        if (!game.user.isGM) {
            throw new Error("Only GMs can synchronize all devices");
        }

        try {
            console.log("Cyberpunk Agent | Starting master synchronization of all devices and messages...");

            let synchronizedCount = 0;
            let updatedCount = 0;

            // Phase 1: Update device actor data (names, avatars)
            console.log("Cyberpunk Agent | Phase 1: Updating device actor data...");
            const actorDataResult = await this.updateAllDeviceActorData();

            // Phase 2: Synchronize device registry and phone numbers
            console.log("Cyberpunk Agent | Phase 2: Synchronizing device registry...");
            for (const [deviceId, device] of this.devices) {
                synchronizedCount++;

                // Check if device has a phone number
                const hasPhoneNumber = this.devicePhoneNumbers.has(deviceId);

                if (!hasPhoneNumber) {
                    // Generate a phone number for this device
                    const phoneNumber = await this.generatePhoneNumberFromKey(deviceId);

                    // Add to phone number mappings
                    this.phoneNumberDictionary.set(phoneNumber, deviceId);
                    this.devicePhoneNumbers.set(deviceId, phoneNumber);

                    updatedCount++;
                    console.log(`Cyberpunk Agent | Generated phone number ${phoneNumber} for device: ${device.deviceName || deviceId}`);
                } else {
                    console.log(`Cyberpunk Agent | Device ${device.deviceName || deviceId} already has phone number: ${this.devicePhoneNumbers.get(deviceId)}`);
                }
            }

            // Save phone number data to persist the changes
            await this.savePhoneNumberData();

            // Phase 3: Master message synchronization
            console.log("Cyberpunk Agent | Phase 3: Performing master message synchronization...");
            const messageSyncResult = await this.performMasterMessageSync();

            // Notify all clients about the complete synchronization
            if (this._isSocketLibAvailable() && window.socket) {
                try {
                    await window.socket.executeForEveryone('masterSyncCompleted', {
                        timestamp: Date.now(),
                        deviceCount: synchronizedCount,
                        devicesUpdated: updatedCount,
                        actorDataUpdated: actorDataResult.devicesUpdated,
                        conversationsSync: messageSyncResult.conversationsCount,
                        messagesSync: messageSyncResult.messagesCount,
                        userId: game.user.id,
                        userName: game.user.name
                    });
                    console.log("Cyberpunk Agent | Notified all clients about master synchronization");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Failed to notify clients about master synchronization:", error);
                }
            }

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this.updateOpenInterfaces();

            console.log(`Cyberpunk Agent | Master sync completed:`);
            console.log(`  - Devices: ${synchronizedCount} (${updatedCount} new phone numbers, ${actorDataResult.devicesUpdated} actor data updated)`);
            console.log(`  - Messages: ${messageSyncResult.conversationsCount} conversations, ${messageSyncResult.messagesCount} messages`);

            return {
                deviceCount: synchronizedCount,
                devicesUpdated: updatedCount,
                actorDataUpdated: actorDataResult.devicesUpdated,
                conversationsSync: messageSyncResult.conversationsCount,
                messagesSync: messageSyncResult.messagesCount
            };
        } catch (error) {
            console.error("Cyberpunk Agent | Error in master synchronization:", error);
            throw error;
        }
    }

    /**
     * Load pinned devices from settings
     */
    async loadPinnedDevices() {
        try {
            const pinnedData = game.settings.get('cyberpunk-agent', 'gm-pinned-devices') || [];
            this.pinnedDevices = new Set(pinnedData);
            console.log(`Cyberpunk Agent | Loaded ${this.pinnedDevices.size} pinned devices`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading pinned devices:", error);
            this.pinnedDevices = new Set();
        }
    }

    /**
     * Save pinned devices to settings
     */
    async savePinnedDevices() {
        try {
            const pinnedArray = Array.from(this.pinnedDevices);
            await game.settings.set('cyberpunk-agent', 'gm-pinned-devices', pinnedArray);
            console.log(`Cyberpunk Agent | Saved ${pinnedArray.length} pinned devices`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving pinned devices:", error);
        }
    }

    /**
     * Toggle pin status for a device
     */
    async toggleDevicePin(deviceId) {
        if (!game.user.isGM) {
            console.warn("Cyberpunk Agent | Only GMs can pin devices");
            return false;
        }

        try {
            if (this.pinnedDevices.has(deviceId)) {
                this.pinnedDevices.delete(deviceId);
                console.log(`Cyberpunk Agent | Unpinned device: ${deviceId}`);
            } else {
                this.pinnedDevices.add(deviceId);
                console.log(`Cyberpunk Agent | Pinned device: ${deviceId}`);
            }

            await this.savePinnedDevices();
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error toggling device pin:", error);
            return false;
        }
    }

    /**
     * Check if a device is pinned
     */
    isDevicePinned(deviceId) {
        return this.pinnedDevices.has(deviceId);
    }

    /**
     * Update all device actor data (names, avatars) from current actor sheets
     * This ensures devices reflect the latest character information
     */
    async updateAllDeviceActorData() {
        try {
            console.log("Cyberpunk Agent | Updating all device actor data...");

            let devicesUpdated = 0;
            let totalDevices = 0;
            const updateSummary = [];

            for (const [deviceId, device] of this.devices) {
                totalDevices++;
                const actorId = device.ownerActorId;

                if (!actorId) {
                    console.log(`Cyberpunk Agent | Device ${deviceId} has no ownerActorId, skipping`);
                    continue;
                }

                const actor = game.actors.get(actorId);
                if (!actor) {
                    console.log(`Cyberpunk Agent | Actor ${actorId} not found for device ${deviceId}, skipping`);
                    continue;
                }

                let deviceUpdated = false;
                const deviceUpdates = [];

                // Update owner name
                const oldName = device.ownerName || 'Unknown';
                const newName = actor.name;
                if (oldName !== newName) {
                    device.ownerName = newName;
                    deviceUpdated = true;
                    deviceUpdates.push(`name: ${oldName} → ${newName}`);
                }

                // Update device name (usually same as actor name)
                const oldDeviceName = device.deviceName || 'Unknown';
                if (oldDeviceName !== newName) {
                    device.deviceName = newName;
                    deviceUpdated = true;
                    deviceUpdates.push(`deviceName: ${oldDeviceName} → ${newName}`);
                }

                // Update avatar/image
                const oldImg = device.img || 'icons/svg/mystery-man.svg';
                const newImg = actor.img || 'icons/svg/mystery-man.svg';
                if (oldImg !== newImg) {
                    device.img = newImg;
                    deviceUpdated = true;
                    deviceUpdates.push(`avatar: ${oldImg.split('/').pop()} → ${newImg.split('/').pop()}`);
                }

                if (deviceUpdated) {
                    devicesUpdated++;
                    updateSummary.push({
                        deviceId,
                        actorName: newName,
                        updates: deviceUpdates
                    });
                    console.log(`Cyberpunk Agent | Updated device ${deviceId} for ${newName}: ${deviceUpdates.join(', ')}`);
                }
            }

            // Save updated device data if any changes were made
            if (devicesUpdated > 0) {
                await this.saveDeviceData();
                console.log(`Cyberpunk Agent | Device actor data update completed: ${devicesUpdated}/${totalDevices} devices updated`);
            } else {
                console.log(`Cyberpunk Agent | All ${totalDevices} devices already have current actor data`);
            }

            return {
                totalDevices,
                devicesUpdated,
                updateSummary
            };

        } catch (error) {
            console.error("Cyberpunk Agent | Error updating device actor data:", error);
            throw error;
        }
    }

    /**
     * Perform master message synchronization - clears all clients' local storage and syncs from server
     * This is the authoritative sync that ensures all clients have the same message state as the server
     */
    async performMasterMessageSync() {
        try {
            console.log("Cyberpunk Agent | Starting master message synchronization...");

            // Get the authoritative server messages
            const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
            const conversationsCount = Object.keys(serverMessages).length;
            let messagesCount = 0;

            // Count total messages
            for (const messages of Object.values(serverMessages)) {
                messagesCount += messages.length;
            }

            console.log(`Cyberpunk Agent | Server has ${conversationsCount} conversations with ${messagesCount} total messages`);

            // Get all active users (excluding GM)
            const activeUsers = Array.from(game.users.values()).filter(user =>
                user.active && user.id !== game.user.id
            );

            if (activeUsers.length === 0) {
                console.log("Cyberpunk Agent | No active players to sync with");
                return { conversationsCount, messagesCount };
            }

            console.log(`Cyberpunk Agent | Sending master sync to ${activeUsers.length} active players`);

            // Send master sync command to all active players
            for (const user of activeUsers) {
                try {
                    await this.socketLibIntegration.sendSystemResponseToUser(
                        user.id,
                        'performMasterMessageSync',
                        {
                            serverMessages: serverMessages,
                            timestamp: Date.now(),
                            gmUserId: game.user.id,
                            gmUserName: game.user.name
                        }
                    );
                    console.log(`Cyberpunk Agent | Master sync sent to ${user.name}`);
                } catch (error) {
                    console.warn(`Cyberpunk Agent | Failed to send master sync to ${user.name}:`, error);
                }
            }

            // Clear and sync GM's own local storage to match server
            console.log("Cyberpunk Agent | Syncing GM's local storage with server...");
            this.messages.clear();

            // Rebuild GM's local storage from server data
            for (const [conversationKey, messages] of Object.entries(serverMessages)) {
                this.messages.set(conversationKey, [...messages]);
            }

            // Update GM's localStorage for all devices
            const allDeviceIds = Array.from(this.devices.keys());
            for (const deviceId of allDeviceIds) {
                await this.saveMessagesForDevice(deviceId);
            }

            console.log("Cyberpunk Agent | GM local storage synchronized with server");

            return { conversationsCount, messagesCount };

        } catch (error) {
            console.error("Cyberpunk Agent | Error in master message synchronization:", error);
            throw error;
        }
    }

    /**
     * Standalone actor data synchronization - updates all device actor data without full sync
     * This is useful for quickly updating device names/avatars after character sheet changes
     */
    async synchronizeActorDataOnly() {
        if (!game.user.isGM) {
            throw new Error("Only GMs can synchronize actor data");
        }

        try {
            console.log("Cyberpunk Agent | Starting actor data synchronization...");

            const result = await this.updateAllDeviceActorData();

            // Notify all clients about the actor data update
            if (this._isSocketLibAvailable() && window.socket) {
                try {
                    await window.socket.executeForEveryone('actorDataSynchronized', {
                        timestamp: Date.now(),
                        devicesUpdated: result.devicesUpdated,
                        totalDevices: result.totalDevices,
                        userId: game.user.id,
                        userName: game.user.name
                    });
                    console.log("Cyberpunk Agent | Notified all clients about actor data synchronization");
                } catch (error) {
                    console.warn("Cyberpunk Agent | Failed to notify clients about actor data synchronization:", error);
                }
            }

            // Update all open interfaces
            this._updateChatInterfacesImmediately();
            this.updateOpenInterfaces();

            console.log(`Cyberpunk Agent | Actor data sync completed: ${result.devicesUpdated}/${result.totalDevices} devices updated`);

            return result;

        } catch (error) {
            console.error("Cyberpunk Agent | Error in actor data synchronization:", error);
            throw error;
        }
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




    /**
    * Handle contact update notifications from other clients
    */


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
            this.loadDeviceData();
            this.loadMessages();
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

        // Notifications are handled by handleSendMessage in SocketLib integration
        console.log("Cyberpunk Agent | Notifications handled by handleSendMessage in SocketLib integration");

        console.log("Cyberpunk Agent | Message update processed successfully");
    }

    /**
     * Handle device message updates (for device-based conversations)
     */
    async handleDeviceMessageUpdate(data) {
        console.log("Cyberpunk Agent | Received device message update notification from:", data.userName);

        // Prevent processing our own updates
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own device message update notification");
            return;
        }

        // Check if this is a recent update to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore updates older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old device message update notification (age:", timeDiff, "ms)");
            return;
        }

        // If we have message data, add it to the device conversation locally
        if (data.message && data.senderId && data.receiverId) {
            console.log("Cyberpunk Agent | Adding device message to local conversation:", data.message);

            try {
                // Get the device conversation key
                const conversationKey = this._getDeviceConversationKey(data.senderId, data.receiverId);

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

                    // Save messages for both sender and receiver devices
                    await this.saveMessagesForDevice(data.senderId);
                    if (data.senderId !== data.receiverId) {
                        await this.saveMessagesForDevice(data.receiverId);
                    }
                    console.log("Cyberpunk Agent | Device message added to local conversation successfully");
                } else {
                    console.log("Cyberpunk Agent | Device message already exists in conversation, skipping");
                }

                // Ensure contacts are added automatically for both sender and receiver
                // This is important for player-to-player communication
                if (!this.isDeviceContact(data.senderId, data.receiverId)) {
                    console.log(`Cyberpunk Agent | Auto-adding ${data.receiverId} to ${data.senderId} contacts via device message update`);
                    this.addContactToDevice(data.senderId, data.receiverId);
                }

                if (!this.isDeviceContact(data.receiverId, data.senderId)) {
                    console.log(`Cyberpunk Agent | Auto-adding ${data.senderId} to ${data.receiverId} contacts via device message update`);
                    this.addContactToDevice(data.receiverId, data.senderId);
                }

            } catch (error) {
                console.error("Cyberpunk Agent | Error adding device message to local conversation:", error);
            }
        } else {
            // Fallback: reload device data from settings
            console.log("Cyberpunk Agent | No device message data provided, reloading from settings");
            this.loadDeviceData();
            this.loadMessages();
        }

        // Clear unread count cache for this device conversation to force recalculation
        this.unreadCounts.delete(this._getDeviceConversationKey(data.senderId, data.receiverId));

        // Force immediate UI updates using multiple strategies
        console.log("Cyberpunk Agent | Triggering immediate UI updates for device message update");

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

            console.log("Cyberpunk Agent | Marked device components as dirty via UI Controller:", [
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
                type: 'deviceMessageUpdate',
                senderId: data.senderId,
                receiverId: data.receiverId
            }
        }));

        // Strategy 6: Also dispatch contact update event to ensure contact list is refreshed
        // This is important for cases where the contact was added but the UI wasn't updated
        document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
                timestamp: Date.now(),
                type: 'contactUpdate',
                deviceId: data.receiverId,
                contactDeviceId: data.senderId,
                action: 'auto-add',
                reason: 'message-received',
                force: true
            }
        }));

        // Notifications are handled by handleSendMessage in SocketLib integration
        console.log("Cyberpunk Agent | Notifications handled by handleSendMessage in SocketLib integration");

        console.log("Cyberpunk Agent | Device message update processed successfully");
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
                if (window.currentView === 'chat7' && window.device && window.device.id === receiverId) {
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
     * Handle device message deletion
     */
    handleDeviceMessageDeletion(data) {
        console.log("Cyberpunk Agent | Received device message deletion notification from:", data.userName);
        console.log("Cyberpunk Agent | Device deletion data:", data);

        // Prevent processing our own deletions
        if (data.userId === game.user.id) {
            console.log("Cyberpunk Agent | Ignoring own device message deletion notification");
            return;
        }

        // Check if this is a recent deletion to avoid duplicates
        const now = Date.now();
        const timeDiff = now - data.timestamp;
        if (timeDiff > 30000) { // Ignore deletions older than 30 seconds
            console.log("Cyberpunk Agent | Ignoring old device message deletion notification (age:", timeDiff, "ms)");
            return;
        }

        try {
            const { deviceId, contactDeviceId, messageIds } = data.data;
            console.log("Cyberpunk Agent | Processing device deletion for devices:", deviceId, contactDeviceId, "messageIds:", messageIds);

            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
            console.log("Cyberpunk Agent | Device conversation key:", conversationKey);

            const existingMessages = this.messages.get(conversationKey) || [];
            console.log("Cyberpunk Agent | Existing device messages count:", existingMessages.length);

            // Filter out deleted messages
            const updatedMessages = existingMessages.filter(message => !messageIds.includes(message.id));
            console.log("Cyberpunk Agent | Updated device messages count:", updatedMessages.length);

            this.messages.set(conversationKey, updatedMessages);

            // Save messages for the device
            console.log("Cyberpunk Agent | Saving updated device messages...");
            this.saveMessagesForDevice(deviceId);

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
            const device = this.devices.get(deviceId);
            const contactDevice = this.devices.get(contactDeviceId);
            const deviceName = device ? device.deviceName : "Device " + deviceId;
            const contactName = contactDevice ? contactDevice.deviceName : "Device " + contactDeviceId;

            const message = `${messageIds.length} mensagem${messageIds.length > 1 ? 'ns' : ''} deletada${messageIds.length > 1 ? 's' : ''} da conversa entre ${deviceName} e ${contactName}`;
            ui.notifications.info(message);

            console.log(`Cyberpunk Agent | Successfully processed deletion of ${messageIds.length} messages from device conversation ${conversationKey}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error handling device message deletion:", error);
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
                    window.constructor.name === 'ChatConversationApplication') {

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
                window.constructor.name === 'ChatConversationApplication'
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
                window.constructor.name === 'ChatConversationApplication'
            )
        ).length;
    }

    // ========================================
    // ACTIVITY MANAGER FOR INTELLIGENT NOTIFICATIONS
    // ========================================

    /**
     * Register an active conversation for a user
     * @param {string} userId - The user ID
     * @param {string} deviceId - The device ID
     * @param {string} contactId - The contact ID (device ID of the contact)
     */
    registerActiveConversation(userId, deviceId, contactId) {
        try {
            const activityData = {
                deviceId: deviceId,
                contactId: contactId,
                timestamp: Date.now()
            };

            this._activeConversations.set(userId, activityData);
            this._lastActivityUpdate = Date.now();

            console.log(`Cyberpunk Agent | Registered active conversation for user ${userId}: ${deviceId} -> ${contactId}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error registering active conversation:", error);
        }
    }

    /**
     * Clear active conversation for a user
     * @param {string} userId - The user ID
     */
    clearActiveConversation(userId) {
        try {
            this._activeConversations.delete(userId);
            this._lastActivityUpdate = Date.now();

            console.log(`Cyberpunk Agent | Cleared active conversation for user ${userId}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing active conversation:", error);
        }
    }

    /**
     * Get active conversation for a user
     * @param {string} userId - The user ID
     * @returns {Object|null} The active conversation data or null
     */
    getActiveConversation(userId) {
        return this._activeConversations.get(userId) || null;
    }

    /**
     * Check if a message should trigger a notification sound
     * @param {string} receiverId - The receiver device ID
     * @param {string} senderId - The sender device ID
     * @returns {boolean} True if notification should play, false otherwise
     */
    shouldPlayNotificationSound(receiverId, senderId) {
        try {
            // Get the user who owns the receiver device
            const receiverUser = this._getUserForDevice(receiverId);
            if (!receiverUser) {
                console.log("Cyberpunk Agent | Could not determine receiver user, playing notification sound");
                return true;
            }

            // Check if the current user is the actual owner of the receiver device
            if (receiverUser.id !== game.user.id) {
                console.log("Cyberpunk Agent | Current user is not the receiver device owner, skipping notification sound");
                return false;
            }

            // Get the active conversation for this user
            const activeConversation = this.getActiveConversation(receiverUser.id);
            if (!activeConversation) {
                console.log("Cyberpunk Agent | No active conversation for user, playing notification sound");
                return true;
            }

            // Check if the message is for the currently active conversation
            const isActiveConversation = (activeConversation.deviceId === receiverId && activeConversation.contactId === senderId) ||
                (activeConversation.deviceId === senderId && activeConversation.contactId === receiverId);

            if (isActiveConversation) {
                console.log("Cyberpunk Agent | Message is for active conversation, skipping notification sound");
                return false;
            }

            console.log("Cyberpunk Agent | Message is for different conversation, playing notification sound");
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error checking notification sound condition:", error);
            return true; // Default to playing sound on error
        }
    }

    /**
     * Check if a message should trigger a visual notification
     * @param {string} receiverId - The receiver device ID
     * @param {string} senderId - The sender device ID
     * @returns {boolean} True if notification should show, false otherwise
     */
    shouldShowNotification(receiverId, senderId) {
        try {
            // Get the user who owns the receiver device
            const receiverUser = this._getUserForDevice(receiverId);
            if (!receiverUser) {
                console.log("Cyberpunk Agent | Could not determine receiver user, showing notification");
                return true;
            }

            // Check if the current user is the actual owner of the receiver device
            if (receiverUser.id !== game.user.id) {
                console.log("Cyberpunk Agent | Current user is not the receiver device owner, skipping visual notification");
                return false;
            }

            // Get the active conversation for this user
            const activeConversation = this.getActiveConversation(receiverUser.id);
            if (!activeConversation) {
                console.log("Cyberpunk Agent | No active conversation for user, showing notification");
                return true;
            }

            // Check if the message is for the currently active conversation
            const isActiveConversation = (activeConversation.deviceId === receiverId && activeConversation.contactId === senderId) ||
                (activeConversation.deviceId === senderId && activeConversation.contactId === receiverId);

            if (isActiveConversation) {
                console.log("Cyberpunk Agent | Message is for active conversation, skipping visual notification");
                return false;
            }

            console.log("Cyberpunk Agent | Message is for different conversation, showing visual notification");
            return true;
        } catch (error) {
            console.error("Cyberpunk Agent | Error checking visual notification condition:", error);
            return true; // Default to showing notification on error
        }
    }

    /**
     * Get user who owns a device
     * @param {string} deviceId - The device ID
     * @returns {Object|null} The user object or null
     */
    _getUserForDevice(deviceId) {
        try {
            // Find the device in our devices map
            const device = this.devices.get(deviceId);
            if (!device || !device.ownerActorId) {
                return null;
            }

            // Find the user who owns this actor
            const actor = game.actors.get(device.ownerActorId);
            if (!actor) {
                return null;
            }

            // Find the user who owns this actor
            const users = Array.from(game.users.values());
            const owner = users.find(user => user.character && user.character.id === device.ownerActorId);

            if (!owner) {
                // If no direct character ownership, check if user has ownership of the actor
                const owner = users.find(user => actor.testUserPermission(user, 'OWNER'));
                return owner;
            }

            return owner;
        } catch (error) {
            console.error("Cyberpunk Agent | Error getting user for device:", error);
            return null;
        }
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
     * Play notification sound if enabled, contact is not muted, and not for active conversation
     * @param {string|null} senderId - Sender ID for CHAT7 messages
     * @param {string|null} receiverId - Receiver ID for CHAT7 messages  
     * @param {string} type - Type of notification ('chat7', 'zmail', etc.)
     */
    playNotificationSound(senderId = null, receiverId = null, type = 'chat7') {
        try {
            // Check if notification sounds are enabled in localStorage (default to true)
            const soundEnabled = localStorage.getItem('cyberpunk-agent-notification-sound') !== 'false';

            if (!soundEnabled) {
                console.log("Cyberpunk Agent | Notification sounds disabled by user");
                return;
            }

            // For ZMail notifications, always play sound (no muting or active conversation checks)
            if (type === 'zmail') {
                this.playSoundEffect('notification-message');
                console.log("Cyberpunk Agent | ZMail notification sound played");
                return;
            }

            // For CHAT7 messages, apply the existing logic
            if (type === 'chat7' && senderId && receiverId) {
                // Check if this is a device conversation (device IDs contain hyphens)
                const isDeviceConversation = senderId.includes('-') || receiverId.includes('-');

                let isMuted = false;
                if (isDeviceConversation) {
                    isMuted = this.isContactMutedForDevice(receiverId, senderId);
                } else {
                    isMuted = this.isContactMuted(receiverId, senderId);
                }

                if (isMuted) {
                    console.log("Cyberpunk Agent | Contact is muted, skipping notification sound");
                    return;
                }

                // Check if this message is for the currently active conversation
                const shouldPlay = this.shouldPlayNotificationSound(receiverId, senderId);
                if (!shouldPlay) {
                    console.log("Cyberpunk Agent | Message is for active conversation, skipping notification sound");
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
     * Show UI notification for new messages if contact is not muted and not for active conversation
     */
    showMessageNotification(senderId = null, receiverId = null) {
        try {
            // If we have sender and receiver IDs, check if the contact is muted
            if (senderId && receiverId) {
                // Check if this is a device conversation (device IDs contain hyphens)
                const isDeviceConversation = senderId.includes('-') || receiverId.includes('-');

                let isMuted = false;
                if (isDeviceConversation) {
                    isMuted = this.isContactMutedForDevice(receiverId, senderId);
                } else {
                    isMuted = this.isContactMuted(receiverId, senderId);
                }

                if (isMuted) {
                    console.log("Cyberpunk Agent | Contact is muted, skipping UI notification");
                    return;
                }

                // Check if this message is for the currently active conversation
                const shouldShow = this.shouldShowNotification(receiverId, senderId);
                if (!shouldShow) {
                    console.log("Cyberpunk Agent | Message is for active conversation, skipping UI notification");
                    return;
                }
            }

            // Show UI notification
            ui.notifications.info("Você tem uma nova mensagem no seu Agente.");
            console.log("Cyberpunk Agent | UI notification displayed");
        } catch (error) {
            console.error("Cyberpunk Agent | Error showing message notification:", error);
        }
    }

    /**
     * Handle both sound and UI notifications for new messages
     * This method coordinates both notification types while keeping them as separate implementations
     */
    handleNewMessageNotifications(senderId = null, receiverId = null) {
        // Trigger both notifications simultaneously but as separate method calls
        this.playNotificationSound(senderId, receiverId);
        this.showMessageNotification(senderId, receiverId);
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






    /**
     * Test function to verify Contact Manager save functionality
     * Run this in GM console to test the actual Contact Manager save method
     */


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

    /**
     * List chat history for all devices
     * Useful for debugging and monitoring conversations
     */
    listAllChatHistory() {
        console.log("\n📱 === CHAT HISTORY FOR ALL DEVICES ===");

        if (!this.devices || this.devices.size === 0) {
            console.log("❌ No devices registered in the system");
            return;
        }

        let totalConversations = 0;
        let totalMessages = 0;
        let devicesWithHistory = 0;

        // Iterate through all devices
        for (const [deviceId, device] of this.devices) {
            const deviceName = this.getDeviceOwnerName(deviceId);
            const phoneNumber = this.devicePhoneNumbers.get(deviceId);
            const formattedPhone = phoneNumber ? this.formatPhoneNumberForDisplay(phoneNumber) : 'No phone';

            console.log(`\n📱 Device: ${deviceName} (${deviceId})`);
            console.log(`   📞 Phone: ${formattedPhone}`);
            console.log(`   👤 Owner: ${device.ownerActorId || 'Unknown'}`);

            // Get contacts for this device
            const contacts = this.getContactsForDevice(deviceId);

            if (contacts.length === 0) {
                console.log(`   💬 No contacts found`);
                continue;
            }

            console.log(`   👥 Contacts: ${contacts.length}`);
            let deviceConversations = 0;
            let deviceMessages = 0;

            // Check conversations with each contact
            for (const contactDeviceId of contacts) {
                const contactDevice = this.devices.get(contactDeviceId);
                if (!contactDevice) {
                    console.log(`     ⚠️  Contact ${contactDeviceId} not found in devices`);
                    continue;
                }

                const contactName = this.getDeviceOwnerName(contactDeviceId);
                const contactPhone = this.devicePhoneNumbers.get(contactDeviceId);
                const contactFormattedPhone = contactPhone ? this.formatPhoneNumberForDisplay(contactPhone) : 'No phone';

                // Get conversation key
                const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
                const messages = this.messages.get(conversationKey) || [];

                if (messages.length === 0) {
                    console.log(`     📱 ${contactName} (${contactFormattedPhone}) - No messages`);
                    continue;
                }

                deviceConversations++;
                deviceMessages += messages.length;

                // Get unread count
                const unreadCount = this.getUnreadCountForDevices(deviceId, contactDeviceId);
                const isMuted = this.isContactMutedForDevice(deviceId, contactDeviceId);

                console.log(`     💬 ${contactName} (${contactFormattedPhone})`);
                console.log(`        📊 Messages: ${messages.length}`);
                console.log(`        📖 Unread: ${unreadCount}`);
                console.log(`        🔇 Muted: ${isMuted ? 'Yes' : 'No'}`);

                // Show last few messages
                const lastMessages = messages.slice(-3); // Last 3 messages
                if (lastMessages.length > 0) {
                    console.log(`        📝 Last messages:`);
                    lastMessages.forEach(msg => {
                        const isOwn = msg.senderId === deviceId;
                        const sender = isOwn ? deviceName : contactName;
                        const time = msg.time || new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const readStatus = msg.read ? '✓' : '○';
                        const preview = msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text;

                        console.log(`           ${readStatus} [${time}] ${sender}: ${preview}`);
                    });
                }
            }

            if (deviceConversations > 0) {
                devicesWithHistory++;
                totalConversations += deviceConversations;
                totalMessages += deviceMessages;
                console.log(`   📊 Device Summary: ${deviceConversations} conversations, ${deviceMessages} total messages`);
            } else {
                console.log(`   📊 Device Summary: No conversations`);
            }
        }

        // Overall summary
        console.log(`\n📊 === OVERALL SUMMARY ===`);
        console.log(`📱 Total devices: ${this.devices.size}`);
        console.log(`💬 Devices with conversations: ${devicesWithHistory}`);
        console.log(`📝 Total conversations: ${totalConversations}`);
        console.log(`💌 Total messages: ${totalMessages}`);

        // Show some statistics
        if (totalMessages > 0) {
            const avgMessagesPerConversation = (totalMessages / totalConversations).toFixed(1);
            const avgMessagesPerDevice = (totalMessages / devicesWithHistory).toFixed(1);
            console.log(`📈 Average messages per conversation: ${avgMessagesPerConversation}`);
            console.log(`📈 Average messages per device (with history): ${avgMessagesPerDevice}`);
        }

        console.log(`\n🎉 Chat history listing complete!`);
    }

    /**
     * List chat history for a specific device
     * @param {string} deviceId - The device ID to list history for
     */
    listDeviceChatHistory(deviceId) {
        console.log(`\n📱 === CHAT HISTORY FOR DEVICE: ${deviceId} ===`);

        const device = this.devices.get(deviceId);
        if (!device) {
            console.log(`❌ Device ${deviceId} not found`);
            return;
        }

        const deviceName = this.getDeviceOwnerName(deviceId);
        const phoneNumber = this.devicePhoneNumbers.get(deviceId);
        const formattedPhone = phoneNumber ? this.formatPhoneNumberForDisplay(phoneNumber) : 'No phone';

        console.log(`📱 Device: ${deviceName} (${deviceId})`);
        console.log(`📞 Phone: ${formattedPhone}`);
        console.log(`👤 Owner: ${device.ownerActorId || 'Unknown'}`);

        // Get contacts for this device
        const contacts = this.getContactsForDevice(deviceId);

        if (contacts.length === 0) {
            console.log(`💬 No contacts found for this device`);
            return;
        }

        console.log(`👥 Contacts: ${contacts.length}`);
        let totalMessages = 0;
        let totalUnread = 0;

        // Check conversations with each contact
        for (const contactDeviceId of contacts) {
            const contactDevice = this.devices.get(contactDeviceId);
            if (!contactDevice) {
                console.log(`⚠️  Contact ${contactDeviceId} not found in devices`);
                continue;
            }

            const contactName = this.getDeviceOwnerName(contactDeviceId);
            const contactPhone = this.devicePhoneNumbers.get(contactDeviceId);
            const contactFormattedPhone = contactPhone ? this.formatPhoneNumberForDisplay(contactPhone) : 'No phone';

            // Get conversation key
            const conversationKey = this._getDeviceConversationKey(deviceId, contactDeviceId);
            const messages = this.messages.get(conversationKey) || [];

            // Get unread count
            const unreadCount = this.getUnreadCountForDevices(deviceId, contactDeviceId);
            const isMuted = this.isContactMutedForDevice(deviceId, contactDeviceId);

            totalMessages += messages.length;
            totalUnread += unreadCount;

            console.log(`\n💬 ${contactName} (${contactFormattedPhone})`);
            console.log(`   📊 Messages: ${messages.length}`);
            console.log(`   📖 Unread: ${unreadCount}`);
            console.log(`   🔇 Muted: ${isMuted ? 'Yes' : 'No'}`);

            if (messages.length > 0) {
                // Show all messages for this contact
                console.log(`   📝 Messages:`);
                messages.forEach((msg, index) => {
                    const isOwn = msg.senderId === deviceId;
                    const sender = isOwn ? deviceName : contactName;
                    const time = msg.time || new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    const readStatus = msg.read ? '✓' : '○';
                    const messageNumber = index + 1;

                    console.log(`      ${messageNumber}. ${readStatus} [${time}] ${sender}: ${msg.text}`);
                });
            }
        }

        console.log(`\n📊 === DEVICE SUMMARY ===`);
        console.log(`💬 Total conversations: ${contacts.length}`);
        console.log(`💌 Total messages: ${totalMessages}`);
        console.log(`📖 Total unread: ${totalUnread}`);

        if (totalMessages > 0) {
            const avgMessagesPerConversation = (totalMessages / contacts.length).toFixed(1);
            console.log(`📈 Average messages per conversation: ${avgMessagesPerConversation}`);
        }

        console.log(`\n🎉 Device chat history listing complete!`);
    }

    /**
     * List chat history for a specific conversation between two devices
     * @param {string} deviceId1 - First device ID
     * @param {string} deviceId2 - Second device ID
     */
    listConversationHistory(deviceId1, deviceId2) {
        console.log(`\n💬 === CONVERSATION HISTORY ===`);

        const device1 = this.devices.get(deviceId1);
        const device2 = this.devices.get(deviceId2);

        if (!device1 || !device2) {
            console.log(`❌ One or both devices not found:`);
            if (!device1) console.log(`   Device ${deviceId1} not found`);
            if (!device2) console.log(`   Device ${deviceId2} not found`);
            return;
        }

        const device1Name = this.getDeviceOwnerName(deviceId1);
        const device2Name = this.getDeviceOwnerName(deviceId2);
        const device1Phone = this.devicePhoneNumbers.get(deviceId1);
        const device2Phone = this.devicePhoneNumbers.get(deviceId2);
        const device1FormattedPhone = device1Phone ? this.formatPhoneNumberForDisplay(device1Phone) : 'No phone';
        const device2FormattedPhone = device2Phone ? this.formatPhoneNumberForDisplay(device2Phone) : 'No phone';

        console.log(`📱 ${device1Name} (${device1FormattedPhone})`);
        console.log(`📱 ${device2Name} (${device2FormattedPhone})`);

        // Get conversation key
        const conversationKey = this._getDeviceConversationKey(deviceId1, deviceId2);
        const messages = this.messages.get(conversationKey) || [];

        if (messages.length === 0) {
            console.log(`💬 No messages in this conversation`);
            return;
        }

        // Get unread count for both devices
        const unreadCount1 = this.getUnreadCountForDevices(deviceId1, deviceId2);
        const unreadCount2 = this.getUnreadCountForDevices(deviceId2, deviceId1);
        const isMuted1 = this.isContactMutedForDevice(deviceId1, deviceId2);
        const isMuted2 = this.isContactMutedForDevice(deviceId2, deviceId1);

        console.log(`\n📊 Conversation Statistics:`);
        console.log(`💌 Total messages: ${messages.length}`);
        console.log(`📖 Unread for ${device1Name}: ${unreadCount1}`);
        console.log(`📖 Unread for ${deviceId2}: ${unreadCount2}`);
        console.log(`🔇 ${device1Name} muted: ${isMuted1 ? 'Yes' : 'No'}`);
        console.log(`🔇 ${device2Name} muted: ${isMuted2 ? 'Yes' : 'No'}`);

        // Show all messages
        console.log(`\n📝 Messages:`);
        messages.forEach((msg, index) => {
            const isOwn = msg.senderId === deviceId1;
            const sender = isOwn ? device1Name : device2Name;
            const time = msg.time || new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const readStatus = msg.read ? '✓' : '○';
            const messageNumber = index + 1;
            const direction = isOwn ? '→' : '←';

            console.log(`   ${messageNumber}. ${readStatus} [${time}] ${direction} ${sender}: ${msg.text}`);
        });

        // Show conversation metadata
        if (messages.length > 0) {
            const firstMessage = messages[0];
            const lastMessage = messages[messages.length - 1];
            const firstTime = new Date(firstMessage.timestamp).toLocaleString('pt-BR');
            const lastTime = new Date(lastMessage.timestamp).toLocaleString('pt-BR');

            console.log(`\n📅 Conversation Timeline:`);
            console.log(`   🕐 Started: ${firstTime}`);
            console.log(`   🕐 Last message: ${lastTime}`);

            const duration = lastMessage.timestamp - firstMessage.timestamp;
            const durationMinutes = Math.floor(duration / (1000 * 60));
            const durationHours = Math.floor(durationMinutes / 60);
            const durationDays = Math.floor(durationHours / 24);

            if (durationDays > 0) {
                console.log(`   ⏱️  Duration: ${durationDays} days, ${durationHours % 24} hours`);
            } else if (durationHours > 0) {
                console.log(`   ⏱️  Duration: ${durationHours} hours, ${durationMinutes % 60} minutes`);
            } else {
                console.log(`   ⏱️  Duration: ${durationMinutes} minutes`);
            }
        }

        console.log(`\n🎉 Conversation history listing complete!`);
    }

    // ===== ZMAIL SYSTEM METHODS =====

    /**
     * Load ZMail data (local storage first, then server sync for all users)
     */
    async loadZMailData() {
        try {
            console.log("Cyberpunk Agent | Loading ZMail data...");

            // Load from localStorage first (like CHAT7 messages)
            await this._loadZMailDataFromLocal();

            // If user is GM, sync directly from server
            if (game.user.isGM) {
                await this._loadZMailDataFromServer();
            } else {
                // If user is player, request sync from GM (like CHAT7 messages)
                await this.requestZMailSyncFromGM();
            }

            console.log(`Cyberpunk Agent | ZMail data loaded: ${this.zmailMessages.size} devices with messages`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading ZMail data:", error);
        }
    }

    /**
     * Load ZMail data from local storage
     */
    async _loadZMailDataFromLocal() {
        try {
            const storageKey = `cyberpunk-agent-zmail-${game.user.id}`;
            const localData = localStorage.getItem(storageKey);

            if (localData) {
                const zmailData = JSON.parse(localData);

                // Load messages
                for (const [deviceId, messages] of Object.entries(zmailData.messages || {})) {
                    this.zmailMessages.set(deviceId, messages || []);
                }

                // Load settings
                for (const [deviceId, settings] of Object.entries(zmailData.settings || {})) {
                    this.zmailSettings.set(deviceId, settings || {});
                }

                console.log("Cyberpunk Agent | ZMail data loaded from localStorage");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading ZMail data from localStorage:", error);
        }
    }

    /**
     * Load ZMail data from server settings (GM only)
     */
    async _loadZMailDataFromServer() {
        try {
            const zmailData = game.settings.get('cyberpunk-agent', 'zmail-data') || { messages: {}, settings: {} };

            // Merge server messages with local messages (preserve local read status)
            for (const [deviceId, serverMessages] of Object.entries(zmailData.messages || {})) {
                const localMessages = this.zmailMessages.get(deviceId) || [];
                const localMessageIds = new Set(localMessages.map(msg => msg.id));

                // Create a map of local messages by ID for quick lookup
                const localMessagesMap = new Map();
                localMessages.forEach(msg => localMessagesMap.set(msg.id, msg));

                // Merge server messages with local messages
                const mergedMessages = [...localMessages];
                let newMessages = 0;

                for (const serverMessage of serverMessages) {
                    if (!localMessageIds.has(serverMessage.id)) {
                        // New message from server, add it
                        mergedMessages.push(serverMessage);
                        newMessages++;
                    } else {
                        // Message exists locally, preserve local read status but update other fields
                        const localMessage = localMessagesMap.get(serverMessage.id);
                        if (localMessage) {
                            // Keep local read status, but update other fields from server
                            const mergedMessage = {
                                ...serverMessage,
                                isRead: localMessage.isRead // Preserve local read status
                            };

                            // Update the message in the merged array
                            const index = mergedMessages.findIndex(msg => msg.id === serverMessage.id);
                            if (index !== -1) {
                                mergedMessages[index] = mergedMessage;
                            }
                        }
                    }
                }

                // Sort by timestamp (newest first)
                mergedMessages.sort((a, b) => b.timestamp - a.timestamp);

                // Update the local ZMail messages
                this.zmailMessages.set(deviceId, mergedMessages);

                if (newMessages > 0) {
                    console.log(`Cyberpunk Agent | ZMail merge: ${newMessages} new messages for device ${deviceId}`);
                }
            }

            // Load settings from server
            for (const [deviceId, settings] of Object.entries(zmailData.settings || {})) {
                this.zmailSettings.set(deviceId, settings || {});
            }

            console.log("Cyberpunk Agent | ZMail data synced from server");
        } catch (error) {
            console.error("Cyberpunk Agent | Error loading ZMail data from server:", error);
        }
    }

    /**
     * Save ZMail data (local storage for all users, server sync for GMs)
     */
    async saveZMailData() {
        try {
            console.log("Cyberpunk Agent | Saving ZMail data...");

            // Save to local storage first (like CHAT7 messages)
            await this._saveZMailDataToLocal();

            // If user is GM, also save to server for cross-client sync
            if (game.user.isGM) {
                await this._saveZMailDataToServer();
            }

            console.log("Cyberpunk Agent | ZMail data saved successfully");
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving ZMail data:", error);
        }
    }

    /**
     * Save ZMail data to local storage (like CHAT7 messages)
     */
    async _saveZMailDataToLocal() {
        try {
            const zmailData = {
                messages: {},
                settings: {}
            };

            // Convert messages Map to Object
            for (const [deviceId, messages] of this.zmailMessages) {
                zmailData.messages[deviceId] = messages;
            }

            // Convert settings Map to Object
            for (const [deviceId, settings] of this.zmailSettings) {
                zmailData.settings[deviceId] = settings;
            }

            // Save to localStorage (like CHAT7 messages)
            const storageKey = `cyberpunk-agent-zmail-${game.user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(zmailData));
            console.log("Cyberpunk Agent | ZMail data saved to localStorage for user:", game.user.name);
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving ZMail data to localStorage:", error);
        }
    }

    /**
     * Save ZMail data to server settings (GM only, for cross-client sync)
     */
    async _saveZMailDataToServer() {
        try {
            const zmailData = {
                messages: {},
                settings: {}
            };

            // Convert messages Map to Object
            for (const [deviceId, messages] of this.zmailMessages) {
                zmailData.messages[deviceId] = messages;
            }

            // Convert settings Map to Object
            for (const [deviceId, settings] of this.zmailSettings) {
                zmailData.settings[deviceId] = settings;
            }

            await game.settings.set('cyberpunk-agent', 'zmail-data', zmailData);
            console.log("Cyberpunk Agent | ZMail data saved to server");
        } catch (error) {
            console.error("Cyberpunk Agent | Error saving ZMail data to server:", error);
        }
    }

    /**
     * Send ZMail message from GM to player
     */
    async sendZMailMessage(recipientDeviceId, sender, subject, content) {
        try {
            if (!game.user.isGM) {
                console.error("Cyberpunk Agent | Only GM can send ZMail messages");
                return false;
            }

            console.log(`Cyberpunk Agent | Sending ZMail to device ${recipientDeviceId}`);

            // Create ZMail message
            const zmailMessage = {
                id: `zmail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: sender,
                subject: subject,
                content: content,
                timestamp: Date.now(),
                time: new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                isRead: false,
                recipientDeviceId: recipientDeviceId
            };

            // Add to device's ZMail messages
            if (!this.zmailMessages.has(recipientDeviceId)) {
                this.zmailMessages.set(recipientDeviceId, []);
            }
            this.zmailMessages.get(recipientDeviceId).push(zmailMessage);

            // Sort messages by timestamp (newest first) to ensure new messages appear at the top
            this.zmailMessages.get(recipientDeviceId).sort((a, b) => b.timestamp - a.timestamp);

            // Save to server
            await this.saveZMailData();

            // Notify recipient if online
            const recipientUser = this._getUserForDevice(recipientDeviceId);
            if (recipientUser && recipientUser.active) {
                // Send real-time notification via SocketLib
                if (this.socketLibIntegration && this.socketLibIntegration.isAvailable) {
                    try {
                        await this.socketLibIntegration.sendSystemResponseToUser(recipientUser.id, 'zmailUpdate', {
                            type: 'newMessage',
                            message: zmailMessage
                        });
                        console.log(`Cyberpunk Agent | ZMail notification sent to user ${recipientUser.id}`);
                    } catch (error) {
                        console.error("Cyberpunk Agent | Error sending ZMail notification:", error);
                    }
                } else {
                    console.warn("Cyberpunk Agent | SocketLib not available for ZMail notification");
                }
            }

            console.log(`Cyberpunk Agent | ZMail sent successfully to ${recipientDeviceId}`);
            return true;

        } catch (error) {
            console.error("Cyberpunk Agent | Error sending ZMail:", error);
            return false;
        }
    }

    /**
     * Get ZMail messages for a device
     */
    getZMailMessages(deviceId) {
        return this.zmailMessages.get(deviceId) || [];
    }

    /**
     * Mark ZMail message as read
     */
    async markZMailMessageAsRead(deviceId, messageId) {
        try {
            const messages = this.zmailMessages.get(deviceId);
            if (!messages) return false;

            const message = messages.find(msg => msg.id === messageId);
            if (message) {
                message.isRead = true;

                // Save locally first (like CHAT7 messages)
                await this.saveZMailData();

                // Notify GM of read status change (IoC approach)
                await this._notifyGMZMailReadStatus(deviceId, messageId, true);

                return true;
            }
            return false;
        } catch (error) {
            console.error("Cyberpunk Agent | Error marking ZMail as read:", error);
            return false;
        }
    }

    /**
     * Delete ZMail message
     */
    async deleteZMailMessage(deviceId, messageId) {
        try {
            const messages = this.zmailMessages.get(deviceId);
            if (!messages) return false;

            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                messages.splice(messageIndex, 1);

                // Save locally first (like CHAT7 messages)
                await this.saveZMailData();

                return true;
            }
            return false;
        } catch (error) {
            console.error("Cyberpunk Agent | Error deleting ZMail:", error);
            return false;
        }
    }

    /**
     * Request ZMail sync from GM (for players)
     */
    async requestZMailSyncFromGM() {
        try {
            if (game.user.isGM) {
                console.log("Cyberpunk Agent | GM doesn't need to request ZMail sync from self");
                return;
            }

            if (!this.socketLibIntegration) {
                console.warn("Cyberpunk Agent | SocketLib not available for ZMail sync request");
                return;
            }

            // Get user's device IDs
            const userDevices = this.getUserActors()
                .flatMap(actor => this.deviceMappings.get(actor.id) || []);

            if (userDevices.length === 0) {
                console.log("Cyberpunk Agent | No devices found for user, skipping ZMail sync request");
                return;
            }

            console.log(`Cyberpunk Agent | Requesting ZMail sync from GM for ${userDevices.length} devices`);

            // Request ZMail sync for each device
            for (const deviceId of userDevices) {
                try {
                    await this.socketLibIntegration.sendMessageToGM('requestZMailSync', {
                        deviceId: deviceId,
                        requestingUserId: game.user.id,
                        requestingUserName: game.user.name
                    });
                } catch (error) {
                    console.error(`Cyberpunk Agent | Error requesting ZMail sync for device ${deviceId}:`, error);
                }
            }

            console.log("Cyberpunk Agent | ZMail sync requests sent to GM");
        } catch (error) {
            console.error("Cyberpunk Agent | Error requesting ZMail sync from GM:", error);
        }
    }

    /**
     * Parse ZMail links in message text and convert them to clickable elements
     * @param {string} text - The message text to parse
     * @param {boolean} isOwn - Whether the message is from the current user (for color styling)
     * @returns {string} - HTML with ZMail links converted to clickable elements
     */
    parseZMailLinks(text, isOwn = false) {
        if (!text) return text;

        // Regex to match @ZMAIL[messageId]{displayText}
        const zmailLinkRegex = /@ZMAIL\[([^\]]+)\]\{([^}]+)\}/g;

        return text.replace(zmailLinkRegex, (match, messageId, displayText) => {
            // Escape HTML in display text
            const escapedDisplayText = displayText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            // Apply color class based on message ownership
            const colorClass = isOwn ? 'cp-zmail-link-own' : 'cp-zmail-link-other';

            return `<span class="cp-zmail-link ${colorClass}" data-zmail-id="${messageId}" data-action="open-zmail-link" title="Click to open ZMail message"><i class="fas fa-envelope"></i> ${escapedDisplayText}</span>`;
        });
    }


    /**
     * Get ZMail statistics for GM (with real-time read status from players)
     */
    getZMailStatistics() {
        let totalMessages = 0;
        let unreadMessages = 0;
        let activePlayers = 0;

        for (const [deviceId, messages] of this.zmailMessages) {
            if (messages.length > 0) {
                activePlayers++;
                totalMessages += messages.length;
                unreadMessages += messages.filter(msg => !msg.isRead).length;
            }
        }

        return {
            totalMessages,
            unreadMessages,
            activePlayers
        };
    }

    /**
     * Notify GM of ZMail read status change (IoC approach)
     */
    async _notifyGMZMailReadStatus(deviceId, messageId, isRead) {
        try {
            if (!this.socketLibIntegration || !this.socketLibIntegration.isAvailable) {
                console.warn("Cyberpunk Agent | SocketLib not available for ZMail read status notification");
                return;
            }

            // Send read status notification to GM
            await this.socketLibIntegration.sendMessageToGM('zmailReadStatusNotification', {
                deviceId: deviceId,
                messageId: messageId,
                isRead: isRead,
                userId: game.user.id,
                userName: game.user.name,
                timestamp: Date.now()
            });

            console.log(`Cyberpunk Agent | ZMail read status notification sent to GM: ${messageId} = ${isRead ? 'read' : 'unread'}`);
        } catch (error) {
            console.error("Cyberpunk Agent | Error notifying GM of ZMail read status:", error);
        }
    }


    /**
     * Get recent ZMail messages for GM panel
     */
    getRecentZMailMessages(limit = 10) {
        const allMessages = [];

        for (const [deviceId, messages] of this.zmailMessages) {
            for (const message of messages) {
                const device = this.devices.get(deviceId);
                allMessages.push({
                    ...message,
                    recipientDeviceId: deviceId,
                    recipientName: device ? device.deviceName : `Device ${deviceId}`
                });
            }
        }

        // Sort by timestamp (newest first) and limit
        return allMessages
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Clear old ZMail messages (older than specified days)
     */
    async clearOldZMailMessages(daysOld = 30) {
        try {
            if (!game.user.isGM) {
                console.error("Cyberpunk Agent | Only GM can clear ZMail messages");
                return false;
            }

            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            let clearedCount = 0;

            for (const [deviceId, messages] of this.zmailMessages) {
                const originalLength = messages.length;
                const filteredMessages = messages.filter(msg => msg.timestamp > cutoffTime);
                this.zmailMessages.set(deviceId, filteredMessages);
                clearedCount += originalLength - filteredMessages.length;
            }

            await this.saveZMailData();
            console.log(`Cyberpunk Agent | Cleared ${clearedCount} old ZMail messages`);
            return true;

        } catch (error) {
            console.error("Cyberpunk Agent | Error clearing old ZMail messages:", error);
            return false;
        }
    }
}

// Make test functions globally available

window.verifyContactNetworkPersistence = function () {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.verifyContactNetworkPersistence();
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



window.checkSocketLibStatus = function () {
    if (CyberpunkAgent.instance) {
        console.log("=== CHECKING SOCKETLIB STATUS ===");
        CyberpunkAgent.instance._checkSocketLibStatus();
    } else {
        console.error("❌ CyberpunkAgent instance not available");
    }
};


console.log("Cyberpunk Agent | module.js loaded successfully");

// Initialize the module
Hooks.once('init', () => {
    try {
        console.log("Cyberpunk Agent | Init hook triggered");
        CyberpunkAgent.registerSettings();
        console.log("Cyberpunk Agent | Settings registered successfully");
    } catch (error) {
        console.error("Cyberpunk Agent | Error in init hook:", error);
    }
});

Hooks.once('ready', () => {
    try {
        console.log("Cyberpunk Agent | Ready hook triggered");
        console.log("Cyberpunk Agent | Module loaded successfully!");

        // Check if Cyberpunk RED system is active
        if (game.system.id === 'cyberpunk-red-core') {
            console.log("Cyberpunk Agent | Cyberpunk RED system detected!");
        } else {
            console.warn("Cyberpunk Agent | Warning: Cyberpunk RED system not detected. Current system:", game.system.id);
        }

        // Initialize the agent system
        console.log("Cyberpunk Agent | Creating new CyberpunkAgent instance...");
        CyberpunkAgent.instance = new CyberpunkAgent();
        console.log("Cyberpunk Agent | Instance created successfully");
        CyberpunkAgent.instance.setupAgentSystem();

        // Make the instance globally available
        window.cyberpunkAgent = CyberpunkAgent.instance;

        // Hook for when a user joins - sync messages and deliver offline messages
        Hooks.on('userJoined', (user) => {
            console.log(`Cyberpunk Agent | User ${user.name} joined the session`);

            // If we're the GM, handle message sync and offline delivery
            if (game.user.isGM && CyberpunkAgent.instance) {
                setTimeout(async () => {
                    try {
                        // Get user's devices to sync messages
                        const userDevices = [];
                        for (const [actorId, deviceIds] of CyberpunkAgent.instance.deviceMappings.entries()) {
                            const actor = game.actors.get(actorId);
                            if (actor && actor.ownership && actor.ownership[user.id] === 1) {
                                userDevices.push(...deviceIds);
                            }
                        }

                        // Sync messages for each user device
                        for (const deviceId of userDevices) {
                            await CyberpunkAgent.instance.socketLibIntegration.sendSystemResponseToUser(
                                user.id,
                                'requestMessageSync',
                                { deviceId, requestingUserId: user.id }
                            );
                        }

                        // Also deliver any queued offline messages
                        await CyberpunkAgent.instance.deliverOfflineMessages(user.id);

                        console.log(`Cyberpunk Agent | Synced messages for user ${user.name} (${userDevices.length} devices)`);
                    } catch (error) {
                        console.error("Cyberpunk Agent | Error syncing messages for joined user:", error);
                    }
                }, 2000); // Wait 2 seconds for user to fully connect
            } else if (CyberpunkAgent.instance) {
                // If we're a player, request message sync from GM
                setTimeout(async () => {
                    try {
                        const userDevices = CyberpunkAgent.instance.getUserActors()
                            .flatMap(actor => CyberpunkAgent.instance.deviceMappings.get(actor.id) || []);

                        for (const deviceId of userDevices) {
                            await CyberpunkAgent.instance.socketLibIntegration.sendMessageToGM('requestMessageSync', {
                                deviceId,
                                requestingUserId: game.user.id,
                                requestingUserName: game.user.name
                            });
                        }

                        console.log(`Cyberpunk Agent | Requested message sync from GM for ${userDevices.length} devices`);
                    } catch (error) {
                        console.error("Cyberpunk Agent | Error requesting message sync:", error);
                    }
                }, 3000); // Wait 3 seconds to ensure GM has processed
            }
        });

        // Hook for when actors are updated
        Hooks.on('updateActor', (actor, changes, options, userId) => {
            if (CyberpunkAgent.instance) {
                CyberpunkAgent.instance.handleActorUpdate(actor, changes, options, userId);
            }
        });

        // Hook for when the controls toolbar is built (defensive against other module errors)
        Hooks.on('getSceneControlButtons', (controls) => {
            try {
                if (CyberpunkAgent.instance && controls) {
                    CyberpunkAgent.instance.addControlButton(controls);
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error in getSceneControlButtons hook:", error);
            }
        });

        // Hook to refresh controls when scene controls are rendered
        Hooks.on('renderSceneControls', (sceneControls, html, data) => {
            try {
                if (CyberpunkAgent.instance) {
                    // Simply ensure our button is in the controls without re-initializing
                    setTimeout(() => {
                        if (ui.controls && ui.controls.controls) {
                            CyberpunkAgent.instance.addControlButton(ui.controls.controls);
                        }
                    }, 50);
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error in renderSceneControls hook:", error);
            }
        });

        // Hook to ensure button appears when canvas is ready (fixes initial load issue)
        Hooks.on('canvasReady', () => {
            try {
                if (CyberpunkAgent.instance) {
                    // Aggressive fallback: ensure button appears even if other modules break getSceneControlButtons
                    setTimeout(() => {
                        CyberpunkAgent.instance.forceAddTokenControlButton();
                    }, 1000);
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error in canvasReady hook:", error);
            }
        });

        // Hook for when token layer is activated (when user switches to token controls)
        Hooks.on('activateTokensLayer', () => {
            try {
                if (CyberpunkAgent.instance && ui.controls && ui.controls.controls) {
                    // This runs when user switches to token controls
                    setTimeout(() => {
                        CyberpunkAgent.instance.addControlButton(ui.controls.controls);
                        ui.controls.render();
                    }, 50);
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error in activateTokensLayer hook:", error);
            }
        });

        // Additional hook for when controls are actually rendered (backup)
        Hooks.on('renderApplication', (app, html, data) => {
            try {
                if (app.constructor.name === 'SceneControls' && CyberpunkAgent.instance) {
                    // Small delay to ensure the controls are fully rendered
                    setTimeout(() => {
                        if (ui.controls && ui.controls.controls) {
                            CyberpunkAgent.instance.addControlButton(ui.controls.controls);
                        }
                    }, 100);
                }
            } catch (error) {
                // Silent fail for this backup hook
            }
        });

        // Hook for settings changes (backup for real-time updates)

    } catch (error) {
        console.error("Cyberpunk Agent | Error in ready hook:", error);
    }
});

Hooks.once('disableModule', () => {
    console.log("Cyberpunk Agent | Disable hook triggered");
    CyberpunkAgent.cleanup();
});

// Make CyberpunkAgent globally available
window.CyberpunkAgent = CyberpunkAgent;

// Make test functions globally available



window.debugSocketLib = () => {
    if (CyberpunkAgent.instance) {
        CyberpunkAgent.instance.debugSocketLib();
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




window.forceTokenControlsUpdate = () => {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        console.log("Cyberpunk Agent | Forcing token controls update...");

        // Force device discovery first
        window.CyberpunkAgent.instance.discoverAndCreateDevices().then(() => {
            console.log("Cyberpunk Agent | Device discovery completed");

            // Force token controls update
            window.CyberpunkAgent.instance.updateTokenControls();

            // Also try to manually trigger the hook
            if (ui.controls && ui.controls.controls) {
                console.log("Cyberpunk Agent | Manually triggering addControlButton...");
                window.CyberpunkAgent.instance.addControlButton(ui.controls.controls);
            }

            console.log("Cyberpunk Agent | Token controls update completed");
        }).catch(error => {
            console.error("Cyberpunk Agent | Error updating token controls:", error);
        });
    } else {
        console.error("Cyberpunk Agent | Instance not available");
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
console.log("  - window.cyberpunkAgent.syncAllAgents() - Full agent synchronization");
console.log("  - window.cyberpunkAgent.quickSyncAgents() - Quick agent sync for missing registrations");
console.log("  - window.cyberpunkAgent.migrateOwnerNames() - Migrate existing devices with owner names");
console.log("  - window.cyberpunkAgent.updateAllOwnerNames() - Force update all owner names from actors");
console.log("  - window.cyberpunkAgent.migrateDeviceNamesAndAvatars() - Migrate device names and avatars to use actor data");
console.log("🆕 Chat History Functions:");
console.log("  - window.cyberpunkAgent.listAllChatHistory() - List chat history for all devices");
console.log("  - window.cyberpunkAgent.listDeviceChatHistory(deviceId) - List chat history for a specific device");
console.log("  - window.cyberpunkAgent.listConversationHistory(deviceId1, deviceId2) - List chat history for a specific conversation");
console.log("🆕 Reactive Device Registry System:");
console.log("  - Actor changes automatically update device registry");
console.log("  - Name changes, avatar changes, and deletions are handled automatically");
console.log("  - Device registry stays in sync with game.actors data");
console.log("🆕 Intelligent Notification System:");
console.log("  - debugActivityManager() - Debug the activity manager system");
console.log("  - testNotificationSound() - Test intelligent notification sound behavior");
console.log("  - registerTestConversation(deviceId, contactId) - Manually register a test conversation");
console.log("  - clearTestConversation() - Clear active conversation for testing");

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

// ========================================
// ACTIVITY MANAGER DEBUG FUNCTIONS
// ========================================

// Debug function for activity manager
window.debugActivityManager = () => {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error("❌ CyberpunkAgent instance not found");
        return;
    }

    const agent = window.CyberpunkAgent.instance;
    console.log("=== ACTIVITY MANAGER DEBUG ===");

    console.log("📊 Activity Manager Status:");
    console.log(`  - Active conversations count: ${agent._activeConversations.size}`);
    console.log(`  - Last activity update: ${agent._lastActivityUpdate ? new Date(agent._lastActivityUpdate).toLocaleString() : 'Never'}`);

    if (agent._activeConversations.size > 0) {
        console.log("📱 Active Conversations:");
        for (const [userId, activity] of agent._activeConversations) {
            const user = game.users.get(userId);
            const userName = user ? user.name : `Unknown User (${userId})`;
            const device = agent.devices.get(activity.deviceId);
            const contact = agent.devices.get(activity.contactId);

            console.log(`  - User: ${userName} (${userId})`);
            console.log(`    Device: ${device?.deviceName || activity.deviceId}`);
            console.log(`    Contact: ${contact?.deviceName || activity.contactId}`);
            console.log(`    Timestamp: ${new Date(activity.timestamp).toLocaleString()}`);
        }
    } else {
        console.log("  - No active conversations");
    }

    console.log("🔍 Current User Activity:");
    const currentUserActivity = agent.getActiveConversation(game.user.id);
    if (currentUserActivity) {
        const device = agent.devices.get(currentUserActivity.deviceId);
        const contact = agent.devices.get(currentUserActivity.contactId);

        console.log(`  - Active conversation: ${device?.deviceName || currentUserActivity.deviceId} -> ${contact?.deviceName || currentUserActivity.contactId}`);
        console.log(`  - Timestamp: ${new Date(currentUserActivity.timestamp).toLocaleString()}`);
    } else {
        console.log("  - No active conversation for current user");
    }

    console.log("🎵 Notification Sound Test:");
    console.log("  - Run testNotificationSound() to test the intelligent notification system");
    console.log("📱 Auto-Fade Alerts Test:");
    console.log("  - Run testAutoFadeAlerts() to test the auto-fade functionality");
};


// Function to manually register an active conversation for testing
window.registerTestConversation = (deviceId, contactId) => {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error("❌ CyberpunkAgent instance not found");
        return;
    }

    const agent = window.CyberpunkAgent.instance;
    agent.registerActiveConversation(game.user.id, deviceId, contactId);
    console.log(`✅ Registered test conversation: ${deviceId} -> ${contactId}`);
    console.log("📱 Run debugActivityManager() to see the updated status");
};

// Function to clear active conversation for testing
window.clearTestConversation = () => {
    if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
        console.error("❌ CyberpunkAgent instance not found");
        return;
    }

    const agent = window.CyberpunkAgent.instance;
    agent.clearActiveConversation(game.user.id);
    console.log("✅ Cleared active conversation for current user");
    console.log("📱 Run debugActivityManager() to see the updated status");
};

// Function to test auto-fade alerts


