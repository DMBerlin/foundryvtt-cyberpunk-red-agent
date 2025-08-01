# Correção de Persistência de Mensagens - Cyberpunk Agent

## Problema Identificado

O usuário reportou que quando o agente está fechado no momento do envio de uma mensagem, o receptor recebe as notificações de UI e som, mas o conteúdo da mensagem não aparece no chat quando o agente é reaberto. Isso indicava que as mensagens não estavam sendo salvas corretamente no `localStorage` do receptor.

## Causa Raiz

O problema estava nos handlers do SocketLib (`handleSendMessage` e `handleMessageUpdate` em `scripts/socketlib-integration.js`). Esses handlers estavam usando o método `saveMessages()` em vez de `saveMessagesForActor()`, o que resultava em:

1. **Salvamento incorreto**: As mensagens eram salvas apenas no storage geral do usuário (`cyberpunk-agent-messages-${userId}`)
2. **Carregamento falhado**: Quando o agente era aberto, o método `loadMessagesForActor()` procurava por mensagens no storage específico do ator (`cyberpunk-agent-messages-${userId}-${actorId}`)
3. **Mensagens perdidas**: Como as mensagens não estavam no local correto, elas não eram carregadas e não apareciam no chat

### Fluxo Problemático

1. Remetente envia mensagem → SocketLib envia para todos os clientes
2. Receptor (agente fechado) recebe → `handleSendMessage()` adiciona mensagem ao mapa local
3. **PROBLEMA**: `saveMessages()` salva apenas no storage geral do usuário
4. Receptor abre agente → `loadMessagesForActor()` procura no storage específico do ator
5. **RESULTADO**: Mensagem não é encontrada e não aparece no chat

## Solução Implementada

### 1. Correção nos Handlers do SocketLib

**Arquivo**: `scripts/socketlib-integration.js`

**Antes**:
```javascript
// Save messages
await window.CyberpunkAgent.instance.saveMessages();
```

**Depois**:
```javascript
// Save messages for both sender and receiver actors
await window.CyberpunkAgent.instance.saveMessagesForActor(data.senderId);
if (data.senderId !== data.receiverId) {
  await window.CyberpunkAgent.instance.saveMessagesForActor(data.receiverId);
}
```

### 2. Handlers Corrigidos

- **`handleSendMessage`** (linha ~520): Agora salva mensagens para ambos os atores envolvidos
- **`handleMessageUpdate`** (linha ~221): Agora salva mensagens para ambos os atores envolvidos

### 3. Estrutura de Storage Corrigida

**Antes**:
```
localStorage:
  cyberpunk-agent-messages-${userId} → { conversationKey: messages[] }
```

**Depois**:
```
localStorage:
  cyberpunk-agent-messages-${userId}-${actorId} → { conversationKey: messages[] }
  cyberpunk-agent-messages-${userId}-${actorId2} → { conversationKey: messages[] }
```

## Fluxo Corrigido

1. **Envio**: Remetente envia mensagem via SocketLib
2. **Recebimento**: Receptor (agente fechado) recebe via `handleSendMessage()`
3. **Salvamento**: Mensagem é salva no storage específico do ator receptor
4. **Abertura**: Receptor abre agente → `loadMessagesForActor()` carrega do storage correto
5. **Sincronização**: Sistema de sincronização também funciona corretamente
6. **Resultado**: Mensagem aparece no chat normalmente

## Benefícios da Correção

1. **Persistência Garantida**: Mensagens são salvas no local correto do `localStorage`
2. **Carregamento Confiável**: `loadMessagesForActor()` encontra as mensagens salvas
3. **Compatibilidade**: Funciona com o sistema de sincronização existente
4. **Isolamento**: Cada ator tem seu próprio storage, mantendo a separação de dados
5. **Robustez**: Funciona mesmo quando o agente está fechado durante o recebimento

## Testes Implementados

### Script de Teste: `__tests__/test-message-persistence-fix.js`

1. **`testMessagePersistenceFix()`**: Testa o fluxo completo de persistência
2. **`testSocketLibMessageHandling()`**: Testa o handler corrigido do SocketLib
3. **`testLocalStoragePersistence()`**: Testa o salvamento no localStorage
4. **`runAllMessagePersistenceFixTests()`**: Executa todos os testes

### Como Executar os Testes

```javascript
// No console do navegador
runAllMessagePersistenceFixTests();
```

## Verificação da Correção

Para verificar se a correção está funcionando:

1. **Cenário de Teste**:
   - Cliente A envia mensagem para Cliente B
   - Cliente B tem o agente fechado no momento do envio
   - Cliente B recebe notificação de UI e som
   - Cliente B abre o agente

2. **Resultado Esperado**:
   - A mensagem deve aparecer no chat do Cliente B
   - A mensagem deve estar persistida no `localStorage`

3. **Verificação Técnica**:
   ```javascript
   // Verificar se a mensagem está no storage correto
   const storageKey = `cyberpunk-agent-messages-${game.user.id}-${actorId}`;
   const storedData = localStorage.getItem(storageKey);
   console.log("Stored messages:", JSON.parse(storedData));
   ```

## Compatibilidade

- ✅ **SocketLib**: Funciona com o sistema SocketLib existente
- ✅ **Sincronização**: Compatível com o sistema de sincronização implementado
- ✅ **UI**: Não afeta a interface do usuário
- ✅ **Performance**: Impacto mínimo na performance
- ✅ **Backward Compatibility**: Não quebra funcionalidades existentes

## Arquivos Modificados

1. **`scripts/socketlib-integration.js`**:
   - Corrigido `handleSendMessage()` para usar `saveMessagesForActor()`
   - Corrigido `handleMessageUpdate()` para usar `saveMessagesForActor()`

2. **`__tests__/test-message-persistence-fix.js`** (novo):
   - Script de teste para verificar a correção

3. **`docs/MESSAGE-PERSISTENCE-FIX.md`** (novo):
   - Documentação da correção

## Conclusão

Esta correção resolve o problema fundamental de persistência de mensagens quando o agente está fechado. Agora, todas as mensagens recebidas via SocketLib são salvas corretamente no storage específico do ator, garantindo que elas sejam carregadas quando o agente for aberto.

O problema estava na inconsistência entre onde as mensagens eram salvas e onde elas eram procuradas, e a correção alinha esses dois pontos para garantir a persistência adequada das mensagens. 