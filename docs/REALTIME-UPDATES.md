# Realtime Updates - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent oferece atualizações em tempo real para mensagens e contatos, garantindo que todos os usuários vejam as mudanças instantaneamente. O sistema também inclui notificações sonoras para alertar sobre novas mensagens.

## Funcionalidades

### ✅ Atualizações em Tempo Real
- **Mensagens**: Novas mensagens aparecem instantaneamente para todos os usuários
- **Contatos**: Adição/remoção de contatos é sincronizada automaticamente
- **Interfaces**: Todas as janelas abertas são atualizadas automaticamente

### 🔊 Notificações Sonoras
- **Som de Notificação**: Toca um som quando você recebe uma nova mensagem
- **Configurável**: Pode ser habilitado/desabilitado nas configurações do módulo
- **Inteligente**: Só toca para o destinatário da mensagem

## Configuração

### Som de Notificação

1. Vá para **Configurações do Módulo** > **Cyberpunk Agent**
2. Encontre a opção **"Som de Notificação"**
3. Marque/desmarque para habilitar/desabilitar o som
4. A configuração é individual por usuário (scope: client)

### Métodos de Comunicação

O módulo suporta múltiplos métodos de comunicação:

1. **Automático (Recomendado)**: SocketLib > Socket > Chat > Nenhum
2. **Apenas SocketLib**: Usa apenas SocketLib para comunicação
3. **Apenas Socket**: Usa socket nativo do FoundryVTT
4. **Apenas Chat**: Usa mensagens de chat como fallback
5. **Sem Comunicação**: Desabilita todas as comunicações

## Como Funciona

### Fluxo de Mensagem com Som

```
1. Usuário A envia mensagem
   ↓
2. Mensagem é salva localmente
   ↓
3. SocketLib/Socket envia para todos os clientes
   ↓
4. Usuário B recebe a mensagem
   ↓
5. Interface é atualizada automaticamente
   ↓
6. Se Usuário B é o destinatário E som está habilitado
   ↓
7. Som de notificação é tocado
```

### Verificação de Destinatário

O sistema verifica se o usuário atual é o destinatário da mensagem antes de tocar o som:

```javascript
// Verifica se o usuário atual possui o personagem destinatário
const userActors = this.getUserActors();
const isReceiver = userActors.some(actor => actor.id === data.receiverId);
if (isReceiver) {
    this.playNotificationSound();
}
```

## Arquivos de Som

O som de notificação está localizado em:
```
assets/sfx/notification-message.sfx.mp3
```

## Testando a Funcionalidade

### Teste Manual

1. Abra o console do navegador (F12)
2. Execute: `testNotificationSoundFeature()`
3. Verifique se o som toca quando habilitado
4. Desabilite a configuração e teste novamente

### Teste de Mensagens

1. Abra o console do navegador (F12)
2. Execute: `testMessageHandlers()`
3. Verifique se os handlers processam corretamente as mensagens

## Solução de Problemas

### Som Não Toca

1. **Verifique a configuração**: Certifique-se de que "Som de Notificação" está habilitado
2. **Verifique o volume**: O som é tocado com 30% do volume
3. **Verifique o navegador**: Alguns navegadores bloqueiam autoplay de áudio
4. **Verifique o arquivo**: Certifique-se de que `notification-message.sfx.mp3` existe

### Som Toca Para Mensagens Próprias

Isso não deveria acontecer. O sistema verifica se:
- A mensagem não é do próprio usuário
- O usuário atual é o destinatário da mensagem

### Som Toca Para Todas as Mensagens

O som só deve tocar quando:
- A configuração está habilitada
- O usuário atual possui o personagem destinatário
- A mensagem não é do próprio usuário

## Desenvolvimento

### Adicionando Novos Sons

Para adicionar novos sons de notificação:

1. Adicione o arquivo de som em `assets/sfx/`
2. Use o método `playSoundEffect('nome-do-arquivo')`
3. O arquivo deve ter extensão `.sfx.mp3`

### Modificando o Comportamento

Para modificar quando o som toca:

```javascript
// No método handleMessageUpdate ou handleSendMessage
if (data.receiverId) {
    const userActors = this.getUserActors();
    const isReceiver = userActors.some(actor => actor.id === data.receiverId);
    if (isReceiver) {
        this.playNotificationSound();
    }
}
```

## Compatibilidade

- ✅ FoundryVTT v10+
- ✅ SocketLib (opcional, mas recomendado)
- ✅ Todos os navegadores modernos
- ✅ Sistemas de áudio funcionais 