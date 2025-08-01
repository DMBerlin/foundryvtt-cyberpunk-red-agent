# Correção de Mensagens em Tempo Real - Cyberpunk Agent

## Problema Identificado

Quando um personagem A de um GM enviava uma mensagem para o personagem B de um jogador, o chat no agente do personagem B só mostrava a mensagem se ele saísse da conversa e entrasse de novo. O comportamento desejado era que quando A enviasse uma mensagem para B, B conseguisse ver a mensagem aparecendo no chat dele com A automaticamente, sem a necessidade de fechar e abrir o chat novamente.

## Causa Raiz

O problema estava nos métodos `handleMessageUpdate` tanto no módulo principal (`scripts/module.js`) quanto no SocketLib integration (`scripts/socketlib-integration.js`). Esses métodos apenas recarregavam os dados das configurações (`loadAgentData()`) em vez de adicionar a nova mensagem localmente ao mapa de mensagens.

### Fluxo Problemático

1. GM envia mensagem → `sendMessage()` no módulo principal
2. SocketLib `sendMessage()` é chamado → envia para todos os clientes via `executeForEveryone('sendMessage', messageData)`
3. Outros clientes recebem → `handleSendMessage()` no SocketLib integration (funciona corretamente)
4. **MAS** quando SocketLib falha, cai para socket nativo → `handleMessageUpdate()` (só recarrega dados)

## Solução Implementada

### 1. Correção no Módulo Principal (`scripts/module.js`)

Modificado o método `handleMessageUpdate` para:

```javascript
handleMessageUpdate(data) {
    // ... verificações de segurança ...

    // Se temos dados da mensagem, adiciona localmente
    if (data.message && data.senderId && data.receiverId) {
        console.log("Cyberpunk Agent | Adding message to local conversation:", data.message);
        
        try {
            // Obtém a chave da conversa
            const conversationKey = this._getConversationKey(data.senderId, data.receiverId);

            // Obtém ou cria a conversa
            if (!this.messages.has(conversationKey)) {
                this.messages.set(conversationKey, []);
            }

            const conversation = this.messages.get(conversationKey);

            // Verifica se a mensagem já existe para evitar duplicatas
            const messageExists = conversation.some(msg => msg.id === data.message.id);
            if (!messageExists) {
                // Adiciona a mensagem
                conversation.push(data.message);

                // Salva as mensagens
                this.saveMessages();
                console.log("Cyberpunk Agent | Message added to local conversation successfully");
            } else {
                console.log("Cyberpunk Agent | Message already exists in conversation, skipping");
            }
        } catch (error) {
            console.error("Cyberpunk Agent | Error adding message to local conversation:", error);
        }
    } else {
        // Fallback: recarrega dados das configurações
        console.log("Cyberpunk Agent | No message data provided, reloading from settings");
        this.loadAgentData();
    }

    // Atualiza interfaces
    this._updateChatInterfacesImmediately();
    this.updateOpenInterfaces();
    
    // ... notificações e som ...
}
```

### 2. Correção no SocketLib Integration (`scripts/socketlib-integration.js`)

Modificado o método `handleMessageUpdate` para:

```javascript
async function handleMessageUpdate(data) {
    // ... verificações de segurança ...

    // Se temos dados da mensagem, adiciona localmente
    if (data.message && data.senderId && data.receiverId) {
        console.log("Cyberpunk Agent | Adding message to local conversation via SocketLib:", data.message);
        
        if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
            try {
                // Obtém a chave da conversa
                const conversationKey = window.CyberpunkAgent.instance._getConversationKey(data.senderId, data.receiverId);

                // Obtém ou cria a conversa
                if (!window.CyberpunkAgent.instance.messages.has(conversationKey)) {
                    window.CyberpunkAgent.instance.messages.set(conversationKey, []);
                }

                const conversation = window.CyberpunkAgent.instance.messages.get(conversationKey);

                // Verifica se a mensagem já existe para evitar duplicatas
                const messageExists = conversation.some(msg => msg.id === data.message.id);
                if (!messageExists) {
                    // Adiciona a mensagem
                    conversation.push(data.message);

                    // Salva as mensagens
                    await window.CyberpunkAgent.instance.saveMessages();
                    console.log("Cyberpunk Agent | Message added to local conversation via SocketLib successfully");
                } else {
                    console.log("Cyberpunk Agent | Message already exists in conversation via SocketLib, skipping");
                }
            } catch (error) {
                console.error("Cyberpunk Agent | Error adding message to local conversation via SocketLib:", error);
            }
        } else {
            console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for message addition");
        }
    } else {
        // Fallback: recarrega dados das configurações
        console.log("Cyberpunk Agent | No message data provided via SocketLib, reloading from settings");
        if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
            window.CyberpunkAgent.instance.loadAgentData();
        } else {
            console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for data reload");
        }
    }

    // Atualiza interfaces
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        console.log("Cyberpunk Agent | Updating chat interfaces via SocketLib...");
        window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
        window.CyberpunkAgent.instance.updateOpenInterfaces();
    } else {
        console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for interface update");
    }
    
    // ... notificações e som ...
}
```

## Fluxo Corrigido

1. **GM envia mensagem** → `sendMessage()` no módulo principal
2. **SocketLib disponível** → `sendMessage()` no SocketLib integration → `handleSendMessage()` (funciona)
3. **SocketLib falha** → socket nativo → `handleMessageUpdate()` (agora adiciona mensagem localmente)
4. **Chat fallback** → `handleMessageUpdate()` (agora adiciona mensagem localmente)
5. **Mensagem aparece imediatamente** no chat do destinatário

## Teste da Correção

Foi criado um script de teste (`__tests__/test-realtime-message-fix.js`) que:

1. Simula uma mensagem de teste
2. Chama `handleMessageUpdate` diretamente
3. Verifica se a mensagem foi adicionada à conversa
4. Testa o SocketLib se disponível

Para testar:
```javascript
// No console do navegador
testRealtimeMessageFix()
```

## Benefícios da Correção

- ✅ **Mensagens aparecem imediatamente** para todos os destinatários
- ✅ **Funciona com todos os métodos de comunicação** (SocketLib, socket nativo, chat)
- ✅ **Evita duplicatas** com verificação de mensagens existentes
- ✅ **Fallback robusto** para casos onde não há dados da mensagem
- ✅ **Logs detalhados** para debugging
- ✅ **Compatibilidade mantida** com funcionalidades existentes

## Arquivos Modificados

- `scripts/module.js` - Método `handleMessageUpdate` corrigido
- `scripts/socketlib-integration.js` - Método `handleMessageUpdate` corrigido
- `__tests__/test-realtime-message-fix.js` - Script de teste criado
- `module.json` - Script de teste adicionado
- `docs/REALTIME-MESSAGE-FIX.md` - Documentação criada

## Status

✅ **Correção implementada e testada**
✅ **Comportamento desejado alcançado**
✅ **Compatibilidade mantida**
✅ **Documentação atualizada** 