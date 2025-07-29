# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.6] - 2024-01-XX

### Adicionado
- **Sistema de contador de mensagens não lidas**: Contador visual que mostra quantas mensagens novas cada contato tem
- **Chip de contador**: Exibido ao lado do nome do contato na lista do Chat7
- **Atualização em tempo real**: Contador atualiza automaticamente quando novas mensagens chegam
- **Marcação de leitura**: Contador é zerado quando o usuário abre o chat com o contato
- **Persistência**: Estado de leitura é salvo e mantido entre sessões
- **Cache inteligente**: Sistema de cache para performance otimizada

### Alterado
- **Template do Chat7**: Adicionado suporte para exibir contadores de mensagens não lidas
- **Interface visual**: Contador com estilo quadrado amarelo no canto inferior direito
- **Métodos de mensagem**: Adicionados métodos para gerenciar estado de leitura
- **Atualização de interfaces**: Sistema atualiza contadores em tempo real

### Adicionado
- Script de teste `test-unread-count.js` para verificar sistema de contador
- Documentação detalhada em `docs/UNREAD-MESSAGE-COUNT.md`
- Métodos `getUnreadCount()`, `markConversationAsRead()`, `getUnreadCountsForActor()`
- Sistema de timestamps de leitura persistente

---

## [1.0.5] - 2024-01-XX

### Removido
- **Sistema de scroll personalizado**: Removido completamente o sistema de scroll personalizado
- **Configurações de scroll**: Removidas todas as configurações relacionadas ao scroll
- **Métodos de scroll**: Removidos métodos de gerenciamento de posições de scroll
- **Scripts de teste**: Removidos scripts de teste relacionados ao scroll personalizado
- **Documentação**: Removida documentação do sistema de scroll personalizado

### Alterado
- **Comportamento de scroll**: Voltou ao comportamento padrão de scroll automático
- **Botão voltar**: Corrigido para não fechar o agente, apenas voltar para tela anterior
- **ChatConversationApplication**: Simplificada para usar scroll padrão

### Corrigido
- **Navegação**: Botão voltar agora reabre o Chat7 em vez de fechar o agente

---

## [1.0.4] - 2024-01-XX

### Corrigido
- **Erro de configuração**: Corrigido erro "This is not a registered game setting" para scroll-positions
- **Registro de configuração**: Adicionado registro da configuração scroll-positions no sistema de configurações

---

## [1.0.3] - 2024-01-XX

### Adicionado
- **Sistema de scroll personalizado**: Controle total do usuário sobre a posição do scroll
- **Persistência de posições**: Posição do scroll salva e restaurada para cada conversa
- **Configurações de scroll**: Opções para habilitar/desabilitar auto-scroll e salvamento de posições
- **Navegação livre**: Usuário pode rolar livremente sem interrupções por scroll automático

### Alterado
- **Comportamento de scroll**: Removidos todos os scrolls automáticos por padrão
- **ChatConversationApplication**: Implementado sistema de salvamento e restauração de posições
- **Módulo principal**: Adicionados métodos para gerenciar posições de scroll
- **Configurações**: Novas opções para controlar comportamento de scroll

### Adicionado
- Script de teste `test-custom-scroll.js` para verificar sistema de scroll personalizado
- Documentação detalhada em `docs/CUSTOM-SCROLL-SYSTEM.md`
- Métodos de gerenciamento de posições de scroll no módulo principal
- Configurações de usuário para controlar comportamento de scroll

---

## [1.0.2] - 2024-01-XX

### Corrigido
- **Comportamento de scroll**: Corrigido problema onde o scroll voltava para o início e descia para o fim quando novas mensagens chegavam
- **Re-renderização desnecessária**: Eliminadas re-renderizações completas que causavam reset do scroll
- **Múltiplos eventos de scroll**: Coordenados eventos de scroll para evitar conflitos
- **Experiência do usuário**: Scroll agora é inteligente e respeita a intenção do usuário

### Adicionado
- Sistema de scroll inteligente que detecta posição do usuário
- Script de teste `test-scroll-fix.js` para verificar correção do scroll
- Documentação detalhada da correção em `docs/SCROLL-BEHAVIOR-FIX.md`
- Detecção de scroll manual para melhor experiência do usuário

### Alterado
- ChatConversationApplication com sistema de scroll inteligente (`scripts/agent-home.js`)
- Método `_updateChatInterfacesImmediately` para evitar re-renderizações (`scripts/module.js`)
- Adicionado script de teste ao `module.json`

---

## [1.0.1] - 2024-01-XX

### Corrigido
- **Mensagens em tempo real**: Corrigido problema onde mensagens do GM para jogadores não apareciam automaticamente no chat do agente
- **Atualização de interfaces**: Mensagens agora aparecem imediatamente sem necessidade de fechar e abrir o chat novamente
- **Métodos handleMessageUpdate**: Corrigidos para adicionar mensagens localmente em vez de apenas recarregar dados
- **Compatibilidade**: Funciona com todos os métodos de comunicação (SocketLib, socket nativo, chat)

### Adicionado
- Script de teste `test-realtime-message-fix.js` para verificar correção de mensagens em tempo real
- Documentação detalhada da correção em `docs/REALTIME-MESSAGE-FIX.md`
- Logs melhorados para debugging de mensagens em tempo real

### Alterado
- Método `handleMessageUpdate` no módulo principal (`scripts/module.js`)
- Método `handleMessageUpdate` no SocketLib integration (`scripts/socketlib-integration.js`)
- Adicionado script de teste ao `module.json`

---

## [1.0.0] - 2024-01-XX

### Adicionado
- Versão inicial do módulo
- Estrutura básica do módulo
- Suporte ao FoundryVTT V11
- Compatibilidade com Cyberpunk RED 0.88+
- Pasta `__tests__` para organização de testes
- Documentação completa de testes no `__tests__/README.md`

### Alterado
- Reorganização: Todos os arquivos de teste movidos para pasta `__tests__`
- Atualização de referências no `module.json` e documentação
- Script `dev:watch` atualizado para monitorar pasta `__tests__`

### Removido
- N/A

### Corrigido
- N/A 