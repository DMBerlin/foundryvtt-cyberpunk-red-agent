# Sistema de Eventos de Chat - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent implementa um sistema de eventos baseado no chat do FoundryVTT para propagar atualizações das listas de contatos em tempo real entre GM e jogadores. Este sistema utiliza mensagens de chat como um canal de comunicação confiável para sincronização de dados.

## Como Funciona

### 1. **Sistema de Eventos via Chat**

O sistema cria mensagens especiais no chat do FoundryVTT que contêm dados estruturados para propagar atualizações:

```javascript
// Exemplo de evento de chat
{
  type: 'contactUpdate',
  data: {
    timestamp: Date.now(),
    userId: game.user.id,
    userName: game.user.name,
    sessionId: game.data.id,
    actionDetails: {
      action: 'add',
      contactName: 'John Doe',
      actorId: 'actor-123',
      contactActorId: 'contact-456'
    }
  }
}
```

### 2. **Tipos de Eventos**

#### **Contact Update Events**
- **add**: Adição de novo contato
- **remove**: Remoção de contato
- **modify**: Modificação de contato existente
- **bulk**: Operações em lote
- **test**: Eventos de teste

#### **User-Specific Events**
- **userNotification**: Notificações personalizadas para usuários específicos
- **systemUpdate**: Atualizações do sistema

### 3. **Visibilidade Inteligente**

O sistema determina automaticamente quais usuários devem receber cada evento:

```javascript
// Usuários que possuem o actor afetado
const actor = game.actors.get(actionDetails.actorId);
for (const user of game.users.values()) {
    if (actor.ownership && actor.ownership[user.id] === 1) {
        targetUsers.push(user.id);
    }
}

// Sempre incluir GMs
const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
targetUsers = [...new Set([...targetUsers, ...gmUsers])];
```

## Implementação Técnica

### 1. **Criação de Eventos**

```javascript
_sendContactUpdateViaChat(actionDetails) {
    // Determinar usuários alvo
    let targetUsers = [];
    
    // Encontrar usuários que possuem o actor afetado
    if (actionDetails && actionDetails.actorId) {
        const actor = game.actors.get(actionDetails.actorId);
        if (actor) {
            for (const user of game.users.values()) {
                if (actor.ownership && actor.ownership[user.id] === 1) {
                    targetUsers.push(user.id);
                }
            }
        }
    }
    
    // Sempre incluir GMs
    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
    targetUsers = [...new Set([...targetUsers, ...gmUsers])];

    // Criar mensagem de evento
    const messageData = {
        user: game.user.id,
        content: `<div class="cyberpunk-agent-event" data-event='${JSON.stringify(eventData)}'>
            <!-- Conteúdo visual do evento -->
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
}
```

### 2. **Processamento de Eventos**

```javascript
// Listener para mensagens de chat
Hooks.on('createChatMessage', (message) => {
    if (message.content.includes('cyberpunk-agent-event')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = message.content;

        const eventElement = tempDiv.querySelector('.cyberpunk-agent-event');
        if (eventElement && eventElement.dataset.event) {
            const eventData = JSON.parse(eventElement.dataset.event);
            if (eventData && eventData.type === 'contactUpdate' && eventData.data) {
                this.handleContactUpdate(eventData.data);
            }
        }
    }
});
```

### 3. **Eventos Específicos por Usuário**

```javascript
_sendEventToUser(userId, eventType, eventData) {
    const messageData = {
        user: game.user.id,
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
            <!-- Conteúdo visual do evento -->
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
}
```

## Vantagens do Sistema

### 1. **Confiabilidade**
- **Persistência**: Eventos ficam no histórico do chat
- **Recuperação**: Clientes podem sincronizar ao reconectar
- **Fallback**: Funciona mesmo se SocketLib falhar

### 2. **Visibilidade Inteligente**
- **Targeting**: Eventos são enviados apenas para usuários relevantes
- **Privacidade**: Usuários só veem eventos relacionados aos seus personagens
- **GM Access**: GMs sempre recebem todos os eventos

### 3. **Performance**
- **Eficiência**: Menos tráfego de rede que polling
- **Escalabilidade**: Funciona com muitos usuários
- **Latência**: Atualizações em tempo real

### 4. **Debugging**
- **Histórico**: Todos os eventos ficam registrados no chat
- **Transparência**: Fácil de rastrear problemas
- **Auditoria**: Log completo de todas as mudanças

## Tipos de Eventos Detalhados

### 1. **Contact Add Event**

```javascript
{
  action: 'add',
  contactName: 'John Doe',
  actorId: 'actor-123',
  contactActorId: 'contact-456'
}
```

**Visualização:**
- Ícone: `fas fa-user-plus`
- Cor: Verde (#00ff00)
- Mensagem: "Contato John Doe adicionado"

### 2. **Contact Remove Event**

```javascript
{
  action: 'remove',
  contactName: 'Jane Smith',
  actorId: 'actor-123',
  contactActorId: 'contact-789'
}
```

**Visualização:**
- Ícone: `fas fa-user-minus`
- Cor: Laranja (#ff6b35)
- Mensagem: "Contato Jane Smith removido"

### 3. **Contact Modify Event**

```javascript
{
  action: 'modify',
  contactName: 'Bob Wilson',
  actorId: 'actor-123',
  contactActorId: 'contact-101'
}
```

**Visualização:**
- Ícone: `fas fa-user-edit`
- Cor: Amarelo (#ffaa00)
- Mensagem: "Contato Bob Wilson modificado"

### 4. **Bulk Update Event**

```javascript
{
  action: 'bulk',
  count: 10,
  description: 'Importação de contatos do arquivo CSV',
  actorId: 'actor-123'
}
```

**Visualização:**
- Ícone: `fas fa-users-cog`
- Cor: Amarelo (#ffaa00)
- Mensagem: "10 contato(s) atualizado(s)"

### 5. **User-Specific Notification**

```javascript
{
  type: 'userNotification',
  data: {
    message: 'Sua lista de contatos foi atualizada pelo GM',
    actorId: 'actor-123',
    action: 'notification'
  }
}
```

**Visualização:**
- Ícone: `fas fa-bell`
- Cor: Verde (#00ff00)
- Mensagem: Personalizada por usuário

## Configuração e Uso

### 1. **Ativação Automática**

O sistema de eventos é ativado automaticamente quando:
- SocketLib não está disponível
- Comunicação via socket falha
- Como fallback para garantir sincronização

### 2. **Configuração Manual**

```javascript
// Forçar uso do sistema de eventos
game.settings.set('cyberpunk-agent', 'communication-method', 'chat-only');

// Usar sistema automático (recomendado)
game.settings.set('cyberpunk-agent', 'communication-method', 'auto');
```

### 3. **Testes**

Execute no console:

```javascript
// Testar sistema de eventos de chat
testChatEventSystem();

// Testar eventos específicos por usuário
testUserSpecificEvents();
```

## Fluxo de Funcionamento

### 1. **GM Atualiza Lista de Contatos**

```javascript
// GM adiciona contato
CyberpunkAgent.instance.addContactToActor('actor-123', 'contact-456');
```

### 2. **Sistema Cria Evento**

```javascript
// Sistema automaticamente cria evento
_sendContactUpdateViaChat({
  action: 'add',
  contactName: 'John Doe',
  actorId: 'actor-123',
  contactActorId: 'contact-456'
});
```

### 3. **Evento é Enviado via Chat**

```javascript
// Mensagem de chat é criada
ChatMessage.create({
  content: '<div class="cyberpunk-agent-event">...</div>',
  whisper: ['user-1', 'user-2'], // Usuários relevantes
  blind: true
});
```

### 4. **Jogadores Recebem Evento**

```javascript
// Listener detecta evento
Hooks.on('createChatMessage', (message) => {
  if (message.content.includes('cyberpunk-agent-event')) {
    // Processa evento
    handleContactUpdate(eventData);
  }
});
```

### 5. **Interface é Atualizada**

```javascript
// Interfaces são atualizadas automaticamente
updateOpenInterfaces();
_updateContactManagerImmediately();
```

## Troubleshooting

### Problemas Comuns

#### 1. **Eventos não aparecem**

**Sintomas:**
- Atualizações não chegam aos jogadores
- Chat não mostra eventos

**Soluções:**
1. Verificar se `createChatMessage` hook está ativo
2. Verificar permissões de usuários
3. Usar `testChatEventSystem()` para testar

#### 2. **Eventos aparecem para usuários errados**

**Sintomas:**
- Usuários veem eventos de outros personagens
- Privacidade comprometida

**Soluções:**
1. Verificar ownership dos actors
2. Verificar configuração de `whisper`
3. Verificar `targetUsers` array

#### 3. **Eventos duplicados**

**Sintomas:**
- Mesmo evento aparece múltiplas vezes
- Interface atualiza repetidamente

**Soluções:**
1. Verificar timestamp dos eventos
2. Implementar deduplicação
3. Verificar múltiplos listeners

### Logs de Debug

```javascript
// Verificar eventos no chat
const chatMessages = game.messages.contents;
const agentEvents = chatMessages.filter(msg => 
  msg.flags && msg.flags['cyberpunk-agent'] && msg.flags['cyberpunk-agent'].isEvent
);

console.log("Agent events in chat:", agentEvents.length);
agentEvents.forEach((event, index) => {
  console.log(`Event ${index + 1}:`, event.flags['cyberpunk-agent']);
});

// Verificar listeners ativos
console.log("Active chat message listeners:", Hooks._hooks.createChatMessage?.length || 0);
```

## Integração com Outros Sistemas

### 1. **SocketLib Integration**

O sistema de eventos funciona em conjunto com SocketLib:

```javascript
// Prioridade: SocketLib > Chat Events > Fallback
if (this._isSocketLibAvailable()) {
    // Usar SocketLib
    this.socketLibIntegration.sendContactUpdate(data);
} else {
    // Fallback para chat events
    this._sendContactUpdateViaChat(actionDetails);
}
```

### 2. **FoundryVTT Chat Integration**

Eventos são integrados com o sistema de chat nativo:

```javascript
// Eventos aparecem no chat mas são processados pelo módulo
ChatMessage.create({
  flags: {
    'cyberpunk-agent': {
      isEvent: true,
      updateType: 'contactUpdate'
    }
  }
});
```

### 3. **Real-time Updates**

Sistema de atualizações em tempo real:

```javascript
// Interfaces são atualizadas automaticamente
handleContactUpdate(data) {
  this.loadAgentData();
  this.updateOpenInterfaces();
  this._updateContactManagerImmediately();
}
```

## Performance e Otimização

### 1. **Limpeza de Eventos Antigos**

```javascript
// Remover eventos antigos (opcional)
const oldEvents = game.messages.filter(msg => 
  msg.flags && msg.flags['cyberpunk-agent'] && 
  msg.flags['cyberpunk-agent'].isEvent &&
  Date.now() - msg.timestamp > 24 * 60 * 60 * 1000 // 24 horas
);
```

### 2. **Deduplicação**

```javascript
// Evitar eventos duplicados
const recentEvents = new Set();
const eventKey = `${actionDetails.action}-${actionDetails.actorId}-${actionDetails.contactActorId}`;

if (recentEvents.has(eventKey)) {
  return; // Evento já foi enviado recentemente
}

recentEvents.add(eventKey);
setTimeout(() => recentEvents.delete(eventKey), 5000); // Limpar após 5s
```

### 3. **Batch Processing**

```javascript
// Processar múltiplos eventos em lote
const pendingEvents = [];
const processBatch = () => {
  if (pendingEvents.length > 0) {
    // Processar todos os eventos pendentes
    pendingEvents.forEach(event => this._sendContactUpdateViaChat(event));
    pendingEvents.length = 0;
  }
};

// Agendar processamento
setTimeout(processBatch, 100);
```

## Conclusão

O sistema de eventos de chat do Cyberpunk Agent oferece uma solução robusta e confiável para propagar atualizações de contatos em tempo real. Ele combina a confiabilidade do chat do FoundryVTT com a eficiência de eventos estruturados, garantindo que todos os usuários tenham acesso às informações mais recentes sobre suas listas de contatos.

### Benefícios Principais

1. **Confiabilidade**: Eventos persistem no chat
2. **Visibilidade Inteligente**: Apenas usuários relevantes recebem eventos
3. **Performance**: Sistema eficiente e escalável
4. **Debugging**: Histórico completo de eventos
5. **Integração**: Funciona com outros sistemas do módulo

### Próximos Passos

1. Implementar limpeza automática de eventos antigos
2. Adicionar mais tipos de eventos
3. Melhorar sistema de deduplicação
4. Implementar compressão de dados para eventos grandes 