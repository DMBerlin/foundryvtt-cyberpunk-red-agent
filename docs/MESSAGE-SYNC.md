# Sincronização de Mensagens do Chat7

## Problema Resolvido

Anteriormente, as mensagens do chat7 enviadas de um agente para outro só apareciam no chat se os dois clientes estivessem com o agente aberto. Isso acontecia porque:

1. As mensagens são salvas localmente no localStorage de cada usuário
2. Quando uma mensagem é enviada, ela é notificada via SocketLib para outros clientes
3. Mas quando um agente é aberto, ele só carrega as mensagens do localStorage local
4. Não havia uma sincronização com o servidor para buscar mensagens que podem ter sido enviadas por outros usuários

## Solução Implementada

Foi implementada uma solução de sincronização automática que:

1. **Sincronização Automática**: Sempre que o chat7 de um agente é aberto, ele sincroniza automaticamente suas mensagens locais com as mensagens no servidor
2. **Busca de Novas Mensagens**: O sistema busca mensagens que podem ter sido enviadas por outros clientes enquanto o agente estava fechado
3. **Comunicação via SocketLib**: Utiliza o SocketLib para comunicação em tempo real entre clientes
4. **Prevenção de Duplicatas**: Implementa verificações para evitar mensagens duplicadas

## Como Funciona

### 1. Abertura do Agente

Quando um usuário abre o agente (`showAgentHome`), o sistema:

```javascript
// Carrega mensagens locais
await this.loadMessagesForActor(actor.id);

// Sincroniza com o servidor
await this.synchronizeMessagesWithServer(actor.id);
```

### 2. Processo de Sincronização

A função `synchronizeMessagesWithServer`:

1. **Verifica Condições**: Só sincroniza se há múltiplos usuários e SocketLib está disponível
2. **Identifica Usuários**: Obtém todos os usuários ativos na sessão
3. **Envia Solicitações**: Para cada usuário (exceto o atual), envia uma solicitação de sincronização
4. **Aguarda Respostas**: Processa as respostas e adiciona novas mensagens localmente

### 3. Tratamento de Solicitações

Quando um cliente recebe uma solicitação de sincronização (`handleMessageSyncRequest`):

1. **Valida Acesso**: Verifica se o usuário tem acesso ao actor solicitado
2. **Coleta Mensagens**: Busca mensagens do localStorage para o actor específico
3. **Filtra por Idade**: Só inclui mensagens das últimas 24 horas
4. **Envia Resposta**: Retorna as mensagens para o cliente solicitante

### 4. Processamento de Respostas

Quando um cliente recebe uma resposta de sincronização (`handleMessageSyncResponse`):

1. **Valida Destinatário**: Confirma que a resposta é para o usuário correto
2. **Verifica Duplicatas**: Evita adicionar mensagens que já existem
3. **Adiciona Mensagens**: Insere novas mensagens na conversa local
4. **Atualiza Interface**: Força atualização das interfaces de chat
5. **Notifica Usuário**: Mostra notificação sobre mensagens sincronizadas

## Estrutura de Dados

### Solicitação de Sincronização
```javascript
{
    requestingUserId: "user-id",
    requestingUserName: "User Name",
    actorId: "actor-id",
    timestamp: Date.now()
}
```

### Resposta de Sincronização
```javascript
{
    respondingUserId: "responder-id",
    respondingUserName: "Responder Name",
    requestingUserId: "user-id",
    actorId: "actor-id",
    messages: [
        {
            conversationKey: "actor1-actor2",
            message: {
                id: "message-id",
                senderId: "actor1",
                receiverId: "actor2",
                text: "Message text",
                timestamp: Date.now(),
                time: "HH:MM",
                read: false
            }
        }
    ],
    timestamp: Date.now()
}
```

## Registro no SocketLib

As novas funções são registradas no SocketLib:

```javascript
socket.register("requestMessageSync", handleMessageSyncRequest);
socket.register("messageSyncResponse", handleMessageSyncResponse);
```

## Benefícios

1. **Sincronização Automática**: Mensagens são sincronizadas automaticamente quando o agente é aberto
2. **Tempo Real**: Utiliza SocketLib para comunicação em tempo real
3. **Prevenção de Perda**: Evita perda de mensagens quando clientes estão offline
4. **Performance**: Só sincroniza quando necessário (abertura do agente)
5. **Robustez**: Implementa verificações de duplicatas e validações de acesso

## Testes

Foi criado um script de teste completo (`__tests__/test-message-sync.js`) que inclui:

- `testMessageSync()`: Testa sincronização básica
- `testMessageSyncRequest()`: Testa tratamento de solicitações
- `testMessageSyncResponse()`: Testa tratamento de respostas
- `testFullSyncFlow()`: Testa fluxo completo
- `testRealDataSync()`: Testa com dados reais
- `runAllMessageSyncTests()`: Executa todos os testes

## Uso

A sincronização é automática e transparente para o usuário. Quando um agente é aberto:

1. O sistema carrega as mensagens locais
2. Automaticamente sincroniza com outros clientes
3. Adiciona novas mensagens encontradas
4. Atualiza a interface
5. Notifica o usuário sobre mensagens sincronizadas

## Logs

O sistema gera logs detalhados para debugging:

```
Cyberpunk Agent | Starting message synchronization for actor: actor-id
Cyberpunk Agent | Active users for synchronization: ["User1", "User2"]
Cyberpunk Agent | Requesting message sync from user: User1
Cyberpunk Agent | Message sync request sent to User1
Cyberpunk Agent | Message synchronization results: {successful: 1, failed: 0, total: 1}
Cyberpunk Agent | Message synchronization completed successfully
```

## Configuração

Não é necessária configuração adicional. A funcionalidade é ativada automaticamente quando:

- Há múltiplos usuários na sessão
- SocketLib está disponível
- O usuário tem acesso a pelo menos um actor

## Compatibilidade

- **Foundry VTT**: Compatível com todas as versões suportadas
- **SocketLib**: Requer SocketLib instalado e funcionando
- **Navegadores**: Compatível com todos os navegadores modernos
- **Módulos**: Não interfere com outros módulos 