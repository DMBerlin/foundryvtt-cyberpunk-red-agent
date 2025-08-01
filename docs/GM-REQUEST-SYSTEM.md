# GM Request System - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora implementa um sistema de requisições GM através do SocketLib, permitindo que jogadores solicitem ações que requerem permissões de GM (como salvar configurações do mundo) de forma segura e controlada.

## Como Funciona

### 1. Arquitetura de Requisições

```
Jogador (Solicita) → SocketLib → GM (Processa) → SocketLib → Jogador (Recebe Resposta)
     ↓                    ↓              ↓                    ↓
  Validação Local    Execução GM    Salva Dados        Notificação
```

### 2. Fluxo de Requisição

1. **Solicitação**: Jogador tenta executar uma ação que requer permissão GM
2. **Validação**: Sistema verifica se o usuário é GM
3. **Requisição GM**: Se não for GM, envia requisição via SocketLib
4. **Processamento**: GM recebe e processa a requisição
5. **Resposta**: GM envia resposta de sucesso/erro de volta ao jogador
6. **Notificação**: Jogador recebe notificação do resultado

## Tipos de Requisições Suportadas

### 1. Salvar Dados de Números de Telefone
- **Evento**: `requestGMPhoneNumberSave`
- **Dados**: Mapeamentos de número de telefone para ID do dispositivo
- **Ação GM**: Salva em `game.settings.set('cyberpunk-agent', 'phone-number-data', phoneData)`

### 2. Salvar Dados de Dispositivos
- **Evento**: `requestGMDeviceDataSave`
- **Dados**: Informações de dispositivos e mapeamentos
- **Ação GM**: Salva em `game.settings.set('cyberpunk-agent', 'device-data', deviceData)`

### 3. Salvar Redes de Contatos
- **Evento**: `requestGMContactNetworkSave`
- **Dados**: Redes de contatos entre atores
- **Ação GM**: Salva em `game.settings.set('cyberpunk-agent', 'contact-networks', contactNetworks)`

## Implementação Técnica

### Handlers SocketLib

#### Handlers GM (Processam Requisições)
```javascript
// Em socketlib-integration.js
async function handleRequestGMPhoneNumberSave(data) {
    if (!game.user.isGM) return; // Apenas GMs processam
    
    const { phoneData, requestUserId, requestUserName } = data;
    game.settings.set('cyberpunk-agent', 'phone-number-data', phoneData);
    
    // Envia resposta de sucesso
    await socket.executeForUser(requestUserId, 'gmPhoneNumberSaveResponse', {
        success: true,
        message: 'Phone number data saved successfully by GM'
    });
}
```

#### Handlers de Resposta (Para Jogadores)
```javascript
async function handleGMPhoneNumberSaveResponse(data) {
    if (data.success) {
        ui.notifications.info("Phone number data saved successfully by GM");
    } else {
        ui.notifications.error(`Failed to save phone number data: ${data.error}`);
    }
}
```

### Métodos de Requisição

#### SocketLibIntegration Class
```javascript
async requestGMPhoneNumberSave(phoneData) {
    const requestData = {
        phoneData: phoneData,
        requestUserId: game.user.id,
        requestUserName: game.user.name,
        timestamp: Date.now()
    };
    
    await socket.executeAsGM('requestGMPhoneNumberSave', requestData);
}
```

### Integração com Métodos Existentes

#### Exemplo: savePhoneNumberData()
```javascript
async savePhoneNumberData() {
    const phoneData = {
        phoneNumberDictionary: Object.fromEntries(this.phoneNumberDictionary),
        devicePhoneNumbers: Object.fromEntries(this.devicePhoneNumbers)
    };

    // Se for GM, salva diretamente
    if (game.user.isGM) {
        game.settings.set('cyberpunk-agent', 'phone-number-data', phoneData);
        return;
    }

    // Se não for GM, solicita via SocketLib
    if (this._isSocketLibAvailable() && this.socketLibIntegration) {
        const success = await this.socketLibIntegration.requestGMPhoneNumberSave(phoneData);
        if (success) {
            ui.notifications.info("Phone number data save request sent to GM");
        } else {
            ui.notifications.warn("Failed to send phone number save request to GM");
        }
    } else {
        ui.notifications.warn("Cannot save phone number data - GM action required");
    }
}
```

## Configuração

### 1. Registro de Handlers
Os handlers são registrados automaticamente quando o SocketLib é inicializado:

```javascript
socket.register("requestGMPhoneNumberSave", handleRequestGMPhoneNumberSave);
socket.register("requestGMDeviceDataSave", handleRequestGMDeviceDataSave);
socket.register("requestGMContactNetworkSave", handleRequestGMContactNetworkSave);
socket.register("gmPhoneNumberSaveResponse", handleGMPhoneNumberSaveResponse);
socket.register("gmDeviceDataSaveResponse", handleGMDeviceDataSaveResponse);
socket.register("gmContactNetworkSaveResponse", handleGMContactNetworkSaveResponse);
```

### 2. Verificação de Disponibilidade
O sistema verifica se o SocketLib está disponível antes de tentar enviar requisições:

```javascript
if (this._isSocketLibAvailable() && this.socketLibIntegration) {
    // Envia requisição GM
} else {
    // Fallback para notificação de erro
}
```

## Funcionalidades

### ✅ Implementadas

- [x] Requisições GM para salvar dados de números de telefone
- [x] Requisições GM para salvar dados de dispositivos
- [x] Requisições GM para salvar redes de contatos
- [x] Respostas automáticas de sucesso/erro
- [x] Notificações de usuário para feedback
- [x] Fallback quando SocketLib não está disponível
- [x] Validação de permissões GM
- [x] Logs detalhados para debugging

### 🔄 Benefícios

- **Segurança**: Apenas GMs podem modificar configurações do mundo
- **Transparência**: Jogadores recebem feedback claro sobre o status das requisições
- **Robustez**: Fallback gracioso quando SocketLib não está disponível
- **Flexibilidade**: Sistema extensível para outros tipos de requisições GM
- **UX Melhorada**: Jogadores podem executar ações que requerem GM sem interrupção

## Casos de Uso

### 1. Jogador Adiciona Contato
1. Jogador adiciona contato via interface
2. Sistema tenta salvar dados de contato
3. Se não for GM, envia requisição GM via SocketLib
4. GM processa e salva automaticamente
5. Jogador recebe notificação de sucesso

### 2. Jogador Remove Contato
1. Jogador remove contato via interface
2. Sistema tenta salvar alterações
3. Requisição GM é enviada automaticamente
4. GM processa e atualiza dados
5. Interface é atualizada em tempo real

### 3. Jogador Adiciona Dispositivo
1. Jogador adquire agente no inventário
2. Sistema detecta novo dispositivo
3. Requisição GM para salvar dados do dispositivo
4. GM processa e registra dispositivo
5. Sistema está pronto para uso

## Troubleshooting

### Problema: "Cannot save data - GM action required"
**Causa**: SocketLib não está disponível ou GM não está online
**Solução**: 
- Verificar se SocketLib está instalado e ativo
- Garantir que pelo menos um GM está online
- Verificar logs do console para detalhes

### Problema: Requisições não são processadas
**Causa**: GM não está recebendo as requisições
**Solução**:
- Verificar se o GM tem SocketLib ativo
- Verificar logs do console para erros de SocketLib
- Reiniciar o módulo se necessário

### Problema: Respostas não chegam ao jogador
**Causa**: Problema na comunicação de volta
**Solução**:
- Verificar se o jogador tem SocketLib ativo
- Verificar logs para erros de `executeForUser`
- Verificar se o GM está enviando respostas corretamente

## Logs e Debugging

### Logs de Requisição
```
Cyberpunk Agent | Non-GM user, requesting GM to save phone number data
Cyberpunk Agent | Phone number save request sent to GM via SocketLib
```

### Logs de Processamento GM
```
Cyberpunk Agent | GM phone number save request received: {...}
Cyberpunk Agent | GM saved phone number data for user PlayerName (userId)
```

### Logs de Resposta
```
Cyberpunk Agent | GM phone number save response received: {success: true}
Cyberpunk Agent | Phone number data saved successfully by GM
```

## Extensibilidade

O sistema foi projetado para ser facilmente extensível. Para adicionar novos tipos de requisições GM:

1. **Adicionar novo handler GM**:
```javascript
async function handleRequestGMNewAction(data) {
    if (!game.user.isGM) return;
    // Processar requisição
    await socket.executeForUser(data.requestUserId, 'gmNewActionResponse', response);
}
```

2. **Adicionar método de requisição**:
```javascript
async requestGMNewAction(actionData) {
    await socket.executeAsGM('requestGMNewAction', actionData);
}
```

3. **Integrar com método existente**:
```javascript
async saveNewData() {
    if (game.user.isGM) {
        // Salvar diretamente
    } else {
        await this.socketLibIntegration.requestGMNewAction(data);
    }
}
```

## Conclusão

O sistema de requisições GM fornece uma solução elegante para o problema de permissões em FoundryVTT, permitindo que jogadores executem ações que requerem privilégios de GM de forma segura e transparente, mantendo a integridade dos dados do mundo enquanto melhora significativamente a experiência do usuário. 