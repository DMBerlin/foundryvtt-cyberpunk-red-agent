# Integração com Chat do FoundryVTT - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora integra completamente com o sistema de chat nativo do FoundryVTT, oferecendo:

- **Mensagens reais no chat** do FoundryVTT
- **Sincronização bidirecional** entre Chat7 e chat nativo
- **Estilização cyberpunk** para mensagens no chat
- **Controle de visibilidade** baseado em permissões
- **Persistência automática** no histórico do FoundryVTT

## Como Funciona

### 1. Sistema de Chat do FoundryVTT

O FoundryVTT usa um sistema robusto baseado em `ChatMessage`:

```javascript
// Tipos de mensagem disponíveis
CONST.CHAT_MESSAGE_TYPES = {
    OTHER: 0,      // Mensagem do sistema
    OOC: 1,        // Out of Character
    IC: 2,         // In Character (padrão para agent)
    EMOTE: 3,      // Emote
    WHISPER: 4,    // Sussurro
    ROLL: 5        // Rolagem
}
```

### 2. Fluxo de Integração

```
Chat7 (Envia) → Sistema Interno → ChatMessage.create() → Chat do FoundryVTT
     ↓
  SocketLib → Outros Clientes → ChatMessage.create() → Chat do FoundryVTT
     ↓
  Sincronização → Ambos os sistemas atualizados
```

### 3. Estrutura de Mensagem

Cada mensagem do Agent no chat do FoundryVTT contém:

```javascript
{
    user: game.user.id,
    speaker: {
        Actor: senderId,
        alias: senderName
    },
    content: `<div class="cyberpunk-agent-chat-message">
        <div class="cyberpunk-agent-chat-header">
            <img src="${sender.img}" />
            <span>${sender.name} → ${receiver.name}</span>
        </div>
        <div class="cyberpunk-agent-chat-content">
            ${messageText}
        </div>
        <div class="cyberpunk-agent-chat-time">
            ${timestamp}
        </div>
    </div>`,
    type: CONST.CHAT_MESSAGE_TYPES.IC,
    whisper: [userIds], // Controle de visibilidade
    blind: false,
    flags: {
        'cyberpunk-agent': {
            isAgentMessage: true,
            messageId: uniqueId,
            senderId: senderId,
            receiverId: receiverId,
            timestamp: Date.now()
        }
    }
}
```

## Implementação Técnica

### 1. Criação de Mensagens

```javascript
// Método principal
_createFoundryChatMessage(senderId, receiverId, text, messageId) {
    // Determina visibilidade baseada em permissões
    const senderUser = this._getUserForActor(senderId);
    const receiverUser = this._getUserForActor(receiverId);
    
    let whisper = [];
    let blind = false;
    
    // Adiciona usuários que devem ver a mensagem
    if (senderUser && !senderUser.isGM) whisper.push(senderUser.id);
    if (receiverUser && !receiverUser.isGM) whisper.push(receiverUser.id);
    
    // Se há whispers, torna blind para outros
    if (whisper.length > 0) blind = true;
    
    // Cria a mensagem
    ChatMessage.create(messageData);
}
```

### 2. Leitura de Mensagens

```javascript
// Obtém mensagens do chat do FoundryVTT
getMessagesFromFoundryChat(actorId1, actorId2) {
    const messages = [];
    const chatMessages = game.messages.contents;
    
    for (const chatMessage of chatMessages) {
        if (chatMessage.flags?.['cyberpunk-agent']?.isAgentMessage) {
            const agentFlags = chatMessage.flags['cyberpunk-agent'];
            
            // Verifica se pertence à conversa
            if ((agentFlags.senderId === actorId1 && agentFlags.receiverId === actorId2) ||
                (agentFlags.senderId === actorId2 && agentFlags.receiverId === actorId1)) {
                
                // Extrai conteúdo da mensagem
                const content = this._parseChatMessageContent(chatMessage.content);
                messages.push({
                    id: agentFlags.messageId,
                    senderId: agentFlags.senderId,
                    receiverId: agentFlags.receiverId,
                    text: content.text,
                    timestamp: agentFlags.timestamp,
                    time: content.time,
                    isOwn: agentFlags.senderId === actorId1,
                    chatMessageId: chatMessage.id
                });
            }
        }
    }
    
    return messages.sort((a, b) => a.timestamp - b.timestamp);
}
```

### 3. Sincronização

```javascript
// Sincroniza mensagens entre sistemas
syncMessagesWithFoundryChat() {
    this.messages.forEach((conversation, conversationKey) => {
        const [actorId1, actorId2] = conversationKey.split('-');
        const foundryMessages = this.getMessagesFromFoundryChat(actorId1, actorId2);
        const mergedMessages = this._mergeMessages(conversation, foundryMessages);
        this.messages.set(conversationKey, mergedMessages);
    });
    
    this.saveMessages();
}
```

## Controle de Visibilidade

### 1. Regras de Visibilidade

- **GM**: Vê todas as mensagens
- **Jogador (Sender)**: Vê mensagens que enviou
- **Jogador (Receiver)**: Vê mensagens que recebeu
- **Outros Jogadores**: Não veem mensagens privadas

### 2. Implementação

```javascript
// Determina quem deve ver a mensagem
let whisper = [];
let blind = false;

// Sender vê se for jogador
if (senderUser && !senderUser.isGM) {
    whisper.push(senderUser.id);
}

// Receiver vê se for jogador
if (receiverUser && !receiverUser.isGM) {
    whisper.push(receiverUser.id);
}

// Se há whispers, torna blind para outros
if (whisper.length > 0) {
    blind = true;
}
```

## Estilização

### 1. CSS para Mensagens no Chat

```css
.cyberpunk-agent-chat-message {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
    font-family: 'Courier New', monospace;
    position: relative;
}

.cyberpunk-agent-chat-message::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ff00, #00cc00, #00ff00);
    border-radius: 8px 8px 0 0;
}
```

### 2. Elementos Visuais

- **Header**: Avatar, nome do sender, seta, nome do receiver
- **Content**: Texto da mensagem
- **Time**: Timestamp da mensagem
- **Borda superior**: Gradiente verde cyberpunk

## Funcionalidades

### ✅ Implementadas

- [x] Criação de mensagens no chat do FoundryVTT
- [x] Leitura de mensagens do chat
- [x] Sincronização bidirecional
- [x] Controle de visibilidade
- [x] Estilização cyberpunk
- [x] Persistência automática
- [x] Hooks para atualização em tempo real
- [x] Merge inteligente de mensagens

### 🔄 Em Desenvolvimento

- [ ] Filtros de mensagem no chat
- [ ] Busca de mensagens
- [ ] Exportação de conversas
- [ ] Notificações sonoras
- [ ] Indicadores de status

## Testes

### Funções de Teste Disponíveis

Execute no console do navegador:

```javascript
// Teste de integração com chat
testFoundryChatIntegration()

// Sincronizar mensagens
syncFoundryChat()

// Obter mensagens do chat
getFoundryChatMessages(actorId1, actorId2)
```

### Exemplo de Teste

```javascript
// Teste completo
testFoundryChatIntegration();

// Verificar mensagens após envio
setTimeout(() => {
    const characterActors = game.actors.filter(actor => actor.type === 'character');
    if (characterActors.length >= 2) {
        const messages = getFoundryChatMessages(characterActors[0].id, characterActors[1].id);
        console.log("Mensagens encontradas:", messages.length);
    }
}, 2000);
```

## Vantagens da Integração

### 1. **Persistência Nativa**
- Mensagens ficam no histórico do FoundryVTT
- Sobrevivem a recarregamentos
- Backup automático com o mundo

### 2. **Compatibilidade**
- Funciona com todos os módulos de chat
- Integra com sistema de permissões
- Suporte a hooks nativos

### 3. **Visibilidade**
- Controle granular de quem vê o quê
- Whisper automático para privacidade
- Blind para mensagens sensíveis

### 4. **Performance**
- Usa sistema otimizado do FoundryVTT
- Cache automático de mensagens
- Lazy loading de histórico

## Troubleshooting

### Problemas Comuns

#### 1. Mensagens não aparecem no chat

**Sintomas:**
- Mensagem enviada mas não visível no chat
- Erro ao criar ChatMessage

**Soluções:**
1. Verifique permissões de GM
2. Use `testFoundryChatIntegration()` para testar
3. Verifique logs do console
4. Reinicie o módulo

#### 2. Sincronização não funciona

**Sintomas:**
- Mensagens duplicadas
- Mensagens faltando

**Soluções:**
1. Use `syncFoundryChat()` para forçar sincronização
2. Verifique se há conflitos de ID
3. Limpe cache do navegador

#### 3. Estilização não aplicada

**Sintomas:**
- Mensagens sem estilo cyberpunk
- CSS não carregado

**Soluções:**
1. Verifique se o CSS foi carregado
2. Recarregue a página
3. Verifique conflitos com outros módulos

### Logs de Debug

```javascript
// Verificar integração
console.log("Chat messages:", game.messages.contents.length);
console.log("Agent messages:", game.messages.contents.filter(m => m.flags?.['cyberpunk-agent']).length);

// Verificar permissões
const actor = game.actors.get(actorId);
console.log("Actor ownership:", actor.ownership);
```

## Configuração

### 1. Configurações do Módulo

No módulo Cyberpunk Agent:

- **Integração com Chat**: Ativada por padrão
- **Tipo de Mensagem**: IC (In Character)
- **Visibilidade**: Automática baseada em permissões

### 2. Configurações do FoundryVTT

- **Chat Log**: Deve estar ativo
- **Permissões**: Configuradas corretamente
- **Módulos de Chat**: Compatíveis

## Compatibilidade

### Sistemas Suportados

- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED Core
- ✅ Todos os módulos de chat
- ✅ Sistema de permissões nativo

### Módulos Testados

- ✅ Chat Portrait
- ✅ Chat Enhancements
- ✅ Better Chat
- ✅ Chat Commands

## Desenvolvimento

### Estrutura de Arquivos

```
scripts/
├── module.js                   # Lógica principal + integração chat
├── socketlib-integration.js    # Comunicação em tempo real
└── agent-home.js              # Interfaces de chat

styles/
└── module.css                 # Estilos para chat do FoundryVTT
```

### Hooks Utilizados

```javascript
// Criação de mensagens
Hooks.on('createChatMessage', (message) => {
    this._handleNewChatMessage(message);
});

// Renderização de mensagens
Hooks.on('renderChatMessage', (message, html, data) => {
    // Personalização adicional se necessário
});
```

### Extensibilidade

Para adicionar novas funcionalidades:

1. **Novos tipos de mensagem**: Adicione ao `CONST.CHAT_MESSAGE_TYPES`
2. **Novos estilos**: Adicione CSS para `.cyberpunk-agent-chat-message`
3. **Novos hooks**: Registre handlers para eventos de chat
4. **Novos flags**: Adicione metadados às mensagens

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute testes de diagnóstico
3. Verifique logs do console
4. Teste com módulos desabilitados
5. Abra uma issue no GitHub 