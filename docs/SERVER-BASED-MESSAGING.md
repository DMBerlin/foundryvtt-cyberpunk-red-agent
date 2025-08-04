# Sistema de Mensagens Baseado em Servidor - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora implementa um sistema de mensagens baseado em servidor centralizado, onde todas as mensagens são armazenadas no servidor Foundry VTT usando `game.settings`. Este sistema elimina a necessidade de comunicação direta entre clientes e garante que mensagens sejam entregues mesmo quando dispositivos estão offline.

## Arquitetura

### Fluxo de Mensagens

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GM Client     │    │ Player Client   │    │ Player Client   │
│   (Device A)    │    │   (Device B)    │    │   (Device C)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Foundry VTT Server     │
                    │   (Message Storage)       │
                    │  - game.settings          │
                    │  - Centralized Messages   │
                    │  - Contact Lists          │
                    └───────────────────────────┘
```

### Estrutura de Dados no Servidor

```javascript
// game.settings para mensagens
{
  'cyberpunk-agent-server-messages': {
    [deviceId]: {
      [conversationKey]: [
        {
          id: 'message-id',
          senderId: 'device-id',
          receiverId: 'device-id',
          text: 'message text',
          timestamp: 1234567890,
          time: '14:30',
          read: false
        }
      ]
    }
  }
}
```

## Funcionalidades Principais

### 1. Armazenamento Centralizado

- **Localização**: Todas as mensagens são salvas em `game.settings`
- **Persistência**: Mensagens permanecem no servidor mesmo após desconexão
- **Acesso**: Todos os clientes podem acessar mensagens quando se conectam

### 2. Sincronização Automática

- **Ao Conectar**: Clientes sincronizam automaticamente com o servidor
- **Mensagens Perdidas**: Dispositivos offline recebem mensagens quando voltam online
- **Contatos Automáticos**: Contatos são adicionados automaticamente ao receber mensagens

### 3. Sistema de Contatos Inteligente

- **Adição Automática**: Contatos são adicionados automaticamente ao receber mensagens
- **Contatos Anônimos**: Mensagens de desconhecidos são tratadas adequadamente
- **Sincronização**: Lista de contatos é mantida sincronizada com o servidor

## Implementação Técnica

### Métodos Principais

#### `saveMessageToServer(senderDeviceId, receiverDeviceId, message)`
Salva uma mensagem no servidor para ambos os dispositivos envolvidos.

```javascript
const success = await cyberpunkAgent.saveMessageToServer('device-1', 'device-2', message);
```

#### `loadMessagesFromServer(deviceId)`
Carrega todas as mensagens de um dispositivo específico do servidor.

```javascript
const success = await cyberpunkAgent.loadMessagesFromServer('device-1');
```

#### `syncMessagesWithServer(deviceId)`
Sincroniza mensagens com o servidor e processa novos contatos.

```javascript
const success = await cyberpunkAgent.syncMessagesWithServer('device-1');
```

#### `addContactAutomatically(deviceId, contactDeviceId)`
Adiciona automaticamente um contato a um dispositivo.

```javascript
await cyberpunkAgent.addContactAutomatically('device-1', 'device-2');
```

### Métodos de Envio Refatorados

#### `sendMessage(senderId, receiverId, text)`
Envia mensagem usando o sistema baseado em servidor.

```javascript
const success = await cyberpunkAgent.sendMessage('actor-1', 'actor-2', 'Hello!');
```

#### `sendDeviceMessage(senderDeviceId, receiverDeviceId, text)`
Envia mensagem entre dispositivos usando o sistema baseado em servidor.

```javascript
const success = await cyberpunkAgent.sendDeviceMessage('device-1', 'device-2', 'Hello!');
```

## Fluxo de Funcionamento

### 1. Envio de Mensagem

1. **Criação**: Mensagem é criada com ID único e timestamp
2. **Salvamento**: Mensagem é salva no servidor para ambos os dispositivos
3. **Atualização Local**: Interface é atualizada imediatamente
4. **Contatos**: Contatos são adicionados automaticamente se necessário

### 2. Recebimento de Mensagem

1. **Sincronização**: Cliente sincroniza com servidor ao conectar
2. **Carregamento**: Mensagens são carregadas do servidor
3. **Processamento**: Novos contatos são identificados e adicionados
4. **Notificação**: Interface é atualizada com novas mensagens

### 3. Dispositivo Offline

1. **Armazenamento**: Mensagens são salvas no servidor
2. **Fila**: Mensagens aguardam o dispositivo voltar online
3. **Sincronização**: Ao reconectar, dispositivo recebe todas as mensagens pendentes
4. **Contatos**: Contatos são adicionados automaticamente

## Vantagens do Sistema

### 1. Confiabilidade
- **Sem Perda**: Mensagens nunca são perdidas
- **Persistência**: Dados permanecem no servidor
- **Recuperação**: Dispositivos offline recebem mensagens ao voltar

### 2. Simplicidade
- **Sem SocketLib**: Não depende de comunicação direta entre clientes
- **Centralizado**: Um único ponto de verdade (servidor)
- **Robusto**: Funciona mesmo com problemas de conectividade

### 3. Escalabilidade
- **Múltiplos Clientes**: Suporta qualquer número de clientes
- **Performance**: Sincronização eficiente
- **Flexibilidade**: Fácil de estender e modificar

## Configuração

### Registro de Configuração

O sistema registra automaticamente a configuração necessária:

```javascript
game.settings.register('cyberpunk-agent', 'server-messages', {
    name: 'Server Messages',
    hint: 'Internal storage for server-based messaging system',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
});
```

### Migração

O sistema é compatível com o sistema anterior e migra automaticamente os dados existentes.

## Testes

### Script de Teste

Use o script `__tests__/test-server-based-messaging.js` para testar o sistema:

```javascript
// Executar todos os testes
testServerBasedMessaging();

// Ou executar testes específicos
runAllServerBasedMessagingTests();
```

### Testes Disponíveis

1. **Save Message to Server**: Testa salvamento de mensagens
2. **Load Messages from Server**: Testa carregamento de mensagens
3. **Sync Messages with Server**: Testa sincronização
4. **Send Message via Server**: Testa envio de mensagens
5. **Send Device Message via Server**: Testa envio entre dispositivos
6. **Auto-Add Contacts**: Testa adição automática de contatos
7. **Get Unread Count from Server**: Testa contagem de não lidas
8. **Mark Messages as Read on Server**: Testa marcação de lidas

## Troubleshooting

### Problema: Mensagens não aparecem
**Causa**: Sincronização não foi executada
**Solução**: Verificar se `syncMessagesWithServer()` foi chamado

### Problema: Contatos não são adicionados
**Causa**: Processamento de contatos falhou
**Solução**: Verificar se `processNewMessagesAndContacts()` foi executado

### Problema: Mensagens não são salvas
**Causa**: Erro no servidor
**Solução**: Verificar logs do console e permissões de GM

## Logs e Debugging

O sistema inclui logs detalhados para debugging:

```javascript
console.log(`Cyberpunk Agent | Saving message to server: ${senderDeviceId} → ${receiverDeviceId}`);
console.log(`Cyberpunk Agent | Message saved to server successfully`);
console.log(`Cyberpunk Agent | Starting message sync with server for device: ${deviceId}`);
```

## Compatibilidade

- **Foundry VTT**: v10+
- **SocketLib**: Não é mais necessário para mensagens
- **Módulos**: Compatível com outros módulos
- **Migração**: Migração automática de dados existentes 