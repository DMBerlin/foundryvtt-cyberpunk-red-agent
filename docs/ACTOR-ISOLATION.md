# Actor Isolation System

## Visão Geral

O sistema de isolamento por actor garante que as configurações de mute e o histórico de mensagens sejam independentes para cada actor/agente. Isso significa que:

- **Configurações de Mute**: Quando o GM muta um contato no agente do Actor A, essa configuração não afeta o agente do Actor B
- **Histórico de Mensagens**: Quando um actor limpa o histórico de conversa com um contato, outros actors que também conversam com esse contato mantêm seu próprio histórico intacto

## Como Funciona

### Sistema de Mute Isolado

**Antes (Comportamento Global):**
```
Chave: "actorId-contactId"
Exemplo: "actorA-contactE" = true
```

**Agora (Comportamento Isolado):**
```
Chave: "userId-actorId-contactId"
Exemplo: "user123-actorA-contactE" = true
Exemplo: "user123-actorB-contactE" = false
```

### Sistema de Mensagens Isolado

**Antes (Compartilhado):**
```
Storage: "cyberpunk-agent-messages-userId"
```

**Agora (Isolado por Actor):**
```
Storage: "cyberpunk-agent-messages-userId-actorId"
```

## Cenários de Uso

### Cenário 1: GM com Múltiplos Actors

1. **GM abre o agente do Actor A**
   - Muta os contatos E e F
   - Configurações salvas como: `userGM-actorA-contactE: true`, `userGM-actorA-contactF: true`

2. **GM abre o agente do Actor B**
   - Contatos E e F aparecem com notificações ativas (não mutados)
   - Configurações: `userGM-actorB-contactE: false`, `userGM-actorB-contactF: false`

### Cenário 2: Limpeza de Histórico

1. **Actor A conversa com Contact E**
   - Mensagens salvas em: `cyberpunk-agent-messages-userA-actorA`

2. **Actor B também conversa com Contact E**
   - Mensagens salvas em: `cyberpunk-agent-messages-userB-actorB`

3. **Actor A limpa histórico com Contact E**
   - Apenas as mensagens em `cyberpunk-agent-messages-userA-actorA` são limpas
   - Mensagens do Actor B permanecem intactas

## Migração de Dados

### Migração Automática

O módulo detecta automaticamente se há dados no formato antigo e solicita migração:

```javascript
// Verificar se migração é necessária
checkMigrationNeeded()

// Executar migração
migrateActorIsolation()

// Rollback (se necessário)
rollbackMigration()
```

### Processo de Migração

1. **Backup dos dados antigos**
   - Cria backup com timestamp: `cyberpunk-agent-mutes-userId-backup-timestamp`
   - Cria backup com timestamp: `cyberpunk-agent-messages-userId-backup-timestamp`

2. **Conversão de formato**
   - Mute settings: `actorId-contactId` → `userId-actorId-contactId`
   - Messages: `cyberpunk-agent-messages-userId` → `cyberpunk-agent-messages-userId-actorId`

3. **Validação**
   - Verifica se o usuário tem acesso aos actors
   - Migra apenas dados de actors acessíveis

## Testes

### Script de Teste

Execute o script de teste para verificar o isolamento:

```javascript
// No console do navegador
testActorIsolation()
```

### Testes Incluídos

1. **Teste de Isolamento de Mute**
   - Muta contatos para Actor A
   - Verifica que Actor B permanece desmutado
   - Testa independência cruzada

2. **Teste de Isolamento de Histórico**
   - Envia mensagens entre Actor A e Contact E
   - Envia mensagens entre Actor B e Contact E
   - Limpa histórico do Actor A
   - Verifica que Actor B mantém seu histórico

## Estrutura de Dados

### Mute Settings (localStorage)

```json
{
  "user123-actorA-contactE": true,
  "user123-actorA-contactF": false,
  "user123-actorB-contactE": false,
  "user123-actorB-contactF": true
}
```

### Message Storage (localStorage)

```
cyberpunk-agent-messages-user123-actorA:
{
  "actorA-contactE": [messages...],
  "actorA-contactF": [messages...]
}

cyberpunk-agent-messages-user123-actorB:
{
  "actorB-contactE": [messages...],
  "actorB-contactF": [messages...]
}
```

## Funções Modificadas

### Mute System

- `toggleContactMute(actorId, contactId)` - Agora usa chave isolada
- `isContactMuted(actorId, contactId)` - Verifica mute isolado
- `_saveUserMuteSettings(userId, userMuteSettings)` - Salva formato isolado
- `_loadUserMuteSettings(userId)` - Carrega formato isolado

### Message System

- `saveMessagesForActor(actorId)` - Nova função para salvar por actor
- `loadMessagesForActor(actorId)` - Nova função para carregar por actor
- `sendMessage(senderId, receiverId, text)` - Salva para ambos os actors
- `clearConversationHistory(actorId, contactId)` - Limpa apenas para o actor
- `showAgentHome(actor)` - Carrega mensagens específicas do actor

## Benefícios

1. **Isolamento Completo**: Cada actor tem suas próprias configurações
2. **Flexibilidade**: GM pode ter configurações diferentes para cada personagem
3. **Privacidade**: Players não afetam configurações uns dos outros
4. **Performance**: Carrega apenas dados relevantes para o actor atual
5. **Compatibilidade**: Migração automática preserva dados existentes

## Troubleshooting

### Problemas Comuns

1. **Configurações não migradas**
   ```javascript
   // Verificar se há dados antigos
   checkMigrationNeeded()
   // Executar migração
   migrateActorIsolation()
   ```

2. **Mute não funcionando**
   ```javascript
   // Verificar formato da chave
   console.log(localStorage.getItem('cyberpunk-agent-mutes-userId'))
   ```

3. **Mensagens não carregando**
   ```javascript
   // Verificar storage específico do actor
   console.log(localStorage.getItem('cyberpunk-agent-messages-userId-actorId'))
   ```

### Logs de Debug

Ative logs detalhados no console para debug:

```javascript
// Verificar mute status
console.log(agent.isContactMuted('actorId', 'contactId'))

// Verificar mensagens
console.log(agent.getMessagesForConversation('actorId1', 'actorId2'))
``` 