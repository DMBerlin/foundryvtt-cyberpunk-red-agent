# Realtime Unread Count Fix

## Visão Geral

Este documento descreve as melhorias implementadas para garantir que o contador de mensagens não lidas seja atualizado em tempo real e que as mensagens sejam marcadas como lidas automaticamente quando a conversa for aberta.

## Problema Identificado

O sistema anterior tinha algumas limitações na atualização em tempo real do contador de mensagens não lidas:

1. O contador não era sempre atualizado imediatamente quando uma nova mensagem chegava
2. As mensagens não eram marcadas como lidas automaticamente quando a conversa era aberta
3. O cache de contadores não lidos não era limpo adequadamente

## Soluções Implementadas

### 1. Melhoria na Função `handleMessageUpdate`

**Arquivo:** `scripts/module.js`

**Melhorias:**
- Comentário mais claro sobre a limpeza do cache
- Garantia de que o cache seja limpo para forçar recálculo
- Múltiplas estratégias de atualização da UI

**Código relevante:**
```javascript
// Clear unread count cache for this conversation to force recalculation
this.unreadCounts.delete(this._getConversationKey(data.senderId, data.receiverId));
```

### 2. Melhoria na Função `_forceChat7UnreadCountUpdate`

**Arquivo:** `scripts/module.js`

**Melhorias:**
- Suporte para janelas legacy `Chat7Application`
- Verificação mais abrangente de janelas abertas
- Melhor tratamento de erros

**Código relevante:**
```javascript
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
```

### 3. Melhoria na Função `markConversationAsRead`

**Arquivo:** `scripts/module.js`

**Melhorias:**
- Adição da estratégia de forçar atualização específica do Chat7
- Melhor sequência de estratégias de atualização

**Código relevante:**
```javascript
// Strategy 4: Force Chat7 interfaces to refresh unread counts specifically
this._forceChat7UnreadCountUpdate(actorId1, actorId2);
```

### 4. Melhoria na Função `_renderConversationView`

**Arquivo:** `scripts/agent-home.js`

**Melhorias:**
- Comentário mais claro sobre quando as mensagens são marcadas como lidas
- Log adicional para debug

**Código relevante:**
```javascript
// Mark conversation as read when opening (not during re-renders)
// This ensures that when a user opens a conversation, all messages are marked as read
if (!this._isUpdating && window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("AgentApplication | Marking conversation as read for contact:", this.currentContact.id);
    window.CyberpunkAgent.instance.markConversationAsRead(this.actor.id, this.currentContact.id);
}
```

### 5. Melhoria na Função `_onContactChatClick`

**Arquivo:** `scripts/agent-home.js`

**Melhorias:**
- Marcação imediata das mensagens como lidas quando o contato é clicado
- Garantia de que o contador seja limpo assim que a conversa for aberta

**Código relevante:**
```javascript
// Mark conversation as read immediately when clicking on contact
// This ensures the unread count is cleared as soon as the user opens the conversation
if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("AgentApplication | Marking conversation as read immediately for contact:", contactId);
    window.CyberpunkAgent.instance.markConversationAsRead(this.actor.id, contactId);
}
```

### 6. Melhoria na Função `getData`

**Arquivo:** `scripts/agent-home.js`

**Melhorias:**
- Limpeza forçada do cache antes de calcular contadores não lidos
- Garantia de que os dados sejam sempre atualizados

**Código relevante:**
```javascript
// Force recalculation of unread count by clearing cache first
if (window.CyberpunkAgent?.instance) {
    const conversationKey = window.CyberpunkAgent.instance._getConversationKey(this.actor.id, contact.id);
    window.CyberpunkAgent.instance.unreadCounts.delete(conversationKey);
}
```

## Funcionalidades Implementadas

### 1. Atualização em Tempo Real do Contador

- Quando uma nova mensagem chega, o contador é atualizado imediatamente
- Múltiplas estratégias de atualização garantem que a UI seja atualizada
- Cache é limpo para forçar recálculo dos contadores

### 2. Marcação Automática como Lida

- Mensagens são marcadas como lidas automaticamente quando a conversa é aberta
- Marcação acontece tanto no clique do contato quanto na abertura da conversa
- Contador é limpo imediatamente quando a conversa é acessada

### 3. Suporte a Múltiplas Interfaces

- Suporte para `AgentApplication` (nova interface)
- Suporte para `Chat7Application` (interface legacy)
- Atualização de todas as janelas abertas

## Teste Implementado

Um teste completo foi criado em `__tests__/test-realtime-unread-count-fix.js` que verifica:

1. Se o contador é atualizado quando uma nova mensagem chega
2. Se as mensagens são marcadas como lidas quando a conversa é aberta
3. Se o contador é limpo após marcar como lida
4. Se a atualização em tempo real funciona corretamente

## Como Usar

1. **Receber Mensagem:** Quando um contato envia uma mensagem, o contador aparece imediatamente na lista de contatos do Chat7
2. **Abrir Conversa:** Clicar em um contato com mensagens não lidas marca automaticamente todas as mensagens como lidas
3. **Verificar Contador:** O contador é limpo imediatamente quando a conversa é aberta

## Compatibilidade

- ✅ FoundryVTT v11
- ✅ SocketLib (quando disponível)
- ✅ Interface AgentApplication (nova)
- ✅ Interface Chat7Application (legacy)
- ✅ Múltiplos clientes conectados

## Logs de Debug

O sistema agora inclui logs detalhados para debug:

```
Cyberpunk Agent | Marking conversation as read for contact: [contact-id]
AgentApplication | Marking conversation as read immediately for contact: [contact-id]
Cyberpunk Agent | Forcing Chat7 unread count update for message from [sender] to [receiver]
```

## Conclusão

As melhorias implementadas garantem que:

1. ✅ O contador de mensagens não lidas seja atualizado em tempo real
2. ✅ As mensagens sejam marcadas como lidas automaticamente quando a conversa for aberta
3. ✅ A experiência do usuário seja mais fluida e responsiva
4. ✅ O sistema funcione corretamente em múltiplos clientes 