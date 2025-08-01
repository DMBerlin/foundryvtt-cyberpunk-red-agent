# Cyberpunk Agent v2.0.0

Um módulo do FoundryVTT que adiciona um sistema de mensagens estilo cyberpunk para que os jogadores se comuniquem através dos agentes de seus personagens.

## Características

- **Sistema Baseado em Equipamento**: O Agent só aparece nos controles quando equipado
- **Dispositivos Únicos**: Cada item "Agent" no inventário se torna um dispositivo separado
- **Controles Dinâmicos**: O ícone do telefone aparece/desaparece automaticamente baseado no estado de equipamento
- **Tooltips Informativos**: Mostra o nome do personagem ao passar o mouse sobre o ícone
- **Acesso GM Completo**: GM sempre tem acesso a todos os dispositivos via controles de token
- **Sistema de Mensagens em Tempo Real**: Comunicação instantânea entre jogadores usando SocketLib
- **Sincronização Automática**: Mensagens são automaticamente sincronizadas quando o agente é aberto
- **Interface Cyberpunk**: Design moderno e temático para o sistema de mensagens
- **Gerenciamento de Contatos**: Adicione, remova e organize seus contatos por dispositivo
- **Mensagens Privadas**: Opção para tornar as mensagens privadas entre participantes
- **Notificações Sonoras**: Sons de notificação para novas mensagens
- **Integração com FoundryVTT**: Sincronização com o chat do FoundryVTT
- **Sistema de Mute Isolado**: Mute contatos específicos para cada dispositivo independentemente
- **Histórico Isolado**: Cada dispositivo mantém seu próprio histórico de conversas

## Requisitos

- **FoundryVTT v11** ou superior
- **SocketLib** (obrigatório) - [Download aqui](https://github.com/farling42/foundryvtt-socketlib/releases)
- **Sistema Cyberpunk RED Core** (recomendado)

## Instalação

1. **Instale o SocketLib primeiro**:
   - Baixe o SocketLib do [GitHub](https://github.com/farling42/foundryvtt-socketlib/releases)
   - Instale o módulo no FoundryVTT

2. **Instale o Cyberpunk Agent**:
   - Baixe o módulo do [GitHub](https://github.com/dmberlin/cyberpunk-agent/releases)
   - Instale o módulo no FoundryVTT
   - Ative o módulo na sua campanha

## Uso

### Sistema Baseado em Equipamento

O Cyberpunk Agent v2.0.0 funciona baseado no estado de equipamento dos itens "Agent":

- **Equipado**: O ícone do telefone aparece nos controles do token
- **Não Equipado**: O ícone do telefone desaparece dos controles
- **Múltiplos Agentes**: Se você tem mais de um Agent equipado, aparece um menu de seleção

### Acessando o Agent

**Para Jogadores:**
- **Token Controls**: O ícone do telefone aparece automaticamente quando um Agent está equipado
- **Chat Command**: Digite `/agent` no chat para acessar seus dispositivos equipados
- **Tooltip**: Passando o mouse sobre o ícone mostra o nome do personagem

**Para GMs:**
- **Token Controls**: O ícone do telefone sempre aparece, permitindo acesso a todos os dispositivos
- **Chat Command**: Digite `/agent` no chat para acessar todos os dispositivos
- **Acesso Completo**: GM pode acessar dispositivos de todos os personagens

### Enviando Mensagens

1. Abra o Agent
2. Selecione um contato da sua lista
3. Digite sua mensagem
4. Pressione Enter para enviar

### Gerenciando Equipamento

**Para Jogadores:**
1. Abra a ficha do seu personagem
2. Vá para a aba "Gear" (Equipamento)
3. Encontre o item "Agent" no seu inventário
4. Clique no ícone de equipar (⚔️) para equipar o Agent
5. O ícone do telefone aparecerá automaticamente nos controles do token

**Para GMs:**
- O ícone do telefone sempre está disponível nos controles de token
- Pode acessar dispositivos de qualquer personagem
- Útil para gerenciar múltiplos personagens simultaneamente

### Gerenciando Contatos

1. Abra o Agent
2. Clique em "Gerenciar Contatos"
3. Adicione ou remova contatos conforme necessário

### Configurações

- **Mensagens Privadas**: Torna as mensagens visíveis apenas para os participantes
- **Som de Notificação**: Ativa/desativa sons para novas mensagens

## Comunicação

Este módulo usa **exclusivamente o SocketLib** para comunicação em tempo real entre clientes. O SocketLib é obrigatório e deve ser instalado antes do Cyberpunk Agent.

### Por que apenas SocketLib?

- **Confiabilidade**: SocketLib oferece comunicação WebSocket robusta
- **Performance**: Melhor performance que métodos alternativos
- **Simplicidade**: Um único método de comunicação elimina complexidade
- **Manutenibilidade**: Código mais limpo e fácil de manter

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no [GitHub](https://github.com/dmberlin/cyberpunk-agent/issues)
- Consulte a documentação na pasta `docs/`

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Changelog

### v1.0.54
- **Sistema de Sincronização de Mensagens**: Implementada sincronização automática de mensagens quando o agente é aberto
- **Comunicação Cross-Client**: Sistema busca mensagens de outros clientes automaticamente
- **Prevenção de Duplicatas**: Verificações para evitar mensagens duplicadas durante sincronização
- **Testes Automatizados**: Scripts de teste para verificar a sincronização funcionando corretamente

### v1.0.52
- **Sistema de Isolamento por Actor**: Implementado isolamento completo de configurações de mute e histórico de mensagens por personagem
- **Migração Automática**: Sistema automático de migração de dados existentes para o novo formato
- **Backup e Rollback**: Sistema de backup automático com capacidade de rollback
- **Testes Automatizados**: Scripts de teste para verificar o isolamento funcionando corretamente

### v1.0.6
- **REFATORAÇÃO MAJOR**: Módulo agora usa exclusivamente SocketLib para comunicação
- Removido suporte a socket nativo e chat como métodos de comunicação
- SocketLib agora é obrigatório (dependência)
- Melhorias na estabilidade e performance da comunicação
- Código simplificado e mais fácil de manter

### Versões Anteriores
- Sistema de mensagens em tempo real
- Interface cyberpunk
- Gerenciamento de contatos
- Integração com FoundryVTT
- Sistema de mute
- Contatos anônimos 