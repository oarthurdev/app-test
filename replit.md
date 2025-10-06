# Sistema de Agendamento de Serviços

**Status**: ✅ Totalmente configurado e funcionando no Replit (Outubro 2025)

## Visão Geral
Aplicativo móvel desenvolvido com Expo/React Native para agendamento de serviços com dois tipos de usuários:
- **Clientes**: Podem visualizar serviços, agendar horários e fazer pagamentos
- **Profissionais**: Podem cadastrar serviços e definir horários de funcionamento

## Tecnologias Utilizadas
- **Frontend**: Expo, React Native, TypeScript
- **Backend**: Express.js, Node.js
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: JWT
- **Pagamentos**: Stripe
- **Notificações**: Twilio SMS
- **ORM**: Drizzle

## Estrutura do Projeto

### Backend (`server/`)
- `index.ts`: API REST com Express
- `auth.ts`: Sistema de autenticação JWT
- `db.ts`: Configuração do banco de dados
- `seed.ts`: Script para criar usuário profissional

### Frontend (`app/`)
- `(auth)/`: Telas de login e registro
- `(tabs)/`: Navegação principal (serviços, agendamentos, notificações, perfil, admin)
- `(booking)/`: Fluxo de agendamento (seleção de serviço, data/hora, verificação, pagamento)
- `(admin)/`: Painel administrativo para profissionais

### Contextos (`contexts/`)
- `AuthContext.tsx`: Gerenciamento de autenticação e sessão
- `NotificationContext.tsx`: Gerenciamento de notificações com polling automático

### Banco de Dados (`shared/schema.ts`)
- `users`: Usuários (clientes e profissionais)
- `services`: Serviços oferecidos
- `business_hours`: Horários de funcionamento
- `appointments`: Agendamentos

## Como Testar

### 1. Credenciais de Teste
Um usuário profissional já foi criado:
- **Email**: profissional@teste.com
- **Senha**: senha123

### 2. Fluxo do Profissional
1. Fazer login com as credenciais acima
2. Acessar a aba "Admin"
3. Cadastrar serviços (nome, descrição, preço, duração)
4. Cadastrar horários de funcionamento (dia da semana, horário inicial e final)

### 3. Fluxo do Cliente
1. Criar uma conta nova (aba "Cadastro")
2. Navegar pela lista de serviços
3. Selecionar um serviço
4. Escolher data e horário disponível
5. Verificar dados
6. Realizar pagamento (simulado)
7. Receber confirmação (SMS seria enviado em produção)

## Variáveis de Ambiente
As seguintes variáveis estão configuradas:
- `DATABASE_URL`: Conexão PostgreSQL Neon (gerado automaticamente)
- `JWT_SECRET`: Chave secreta para tokens (Replit Secret)
- `STRIPE_SECRET_KEY`: Chave do Stripe (Replit Secret)
- `TWILIO_ACCOUNT_SID`: Credenciais Twilio (Replit Secret)
- `TWILIO_AUTH_TOKEN`: Token Twilio (Replit Secret)
- `TWILIO_PHONE_NUMBER`: Número Twilio (Replit Secret)
- `EXPO_PUBLIC_API_URL`: URL da API (configurado no workflow do Frontend)
- `PAYMENT_DEMO_MODE`: Modo demonstração para pagamentos (true por padrão)

## Scripts Disponíveis
- `npm run server`: Inicia o servidor backend na porta 3001
- `npm run db:push`: Sincroniza schema com banco de dados
- `npm run db:push --force`: Força sincronização em caso de avisos de perda de dados
- `npm run db:seed`: Cria usuário profissional de teste
- `npm run db:studio`: Abre Drizzle Studio para gerenciar banco de dados
- `npm start`: Inicia o Expo
- `npm run web`: Inicia apenas o frontend web

## Configuração do Replit
- **Backend**: Rodando na porta 3001 (localhost)
- **Frontend**: Expo web rodando na porta 5000 (0.0.0.0)
- **Database**: PostgreSQL Neon configurado via DATABASE_URL (provisionado automaticamente)
- **Workflows**: 
  - Backend: `npm run server` (porta 3001)
  - Frontend: `EXPO_PUBLIC_API_URL=https://[DOMAIN]:3001 EXPO_METRO_PORT=5000 npx expo start --web --port 5000` (porta 5000)
- **Deployment**: Configurado com VM para manter estado do servidor e rodar ambos frontend e backend simultaneamente

## Características Implementadas
- ✅ Login e registro com validação
- ✅ Dois tipos de permissão (cliente e profissional)
- ✅ Menu admin visível apenas para profissionais
- ✅ Cadastro de serviços e horários pelo profissional
- ✅ Calendário para seleção de datas
- ✅ Verificação de horários disponíveis
- ✅ Bloqueio de horários já agendados (pending ou confirmed)
- ✅ Tela de verificação de dados do cliente
- ✅ Integração com Stripe para pagamentos (modo demonstração documentado)
- ✅ Envio de SMS de confirmação via Twilio
- ✅ Sistema de notificações em tempo real com polling automático
- ✅ Área dedicada de notificações com filtros e badge de contador
- ✅ Persistência de dados em PostgreSQL
- ✅ **UI/UX moderna e profissional** (atualização recente - Outubro 2025)

## Design System e UI/UX (Atualização Outubro 2025)

### Sistema de Design (`constants/Theme.ts`)
Implementado um sistema de design completo e consistente com:
- **Paleta de Cores**: Primary (#6366f1), Secondary (#8b5cf6), Success, Warning, Error, Info
- **Gradientes**: Transições suaves entre primary e primaryDark para elementos visuais impactantes
- **Espaçamentos**: Sistema padronizado (xs: 4px até xxl: 48px)
- **Tipografia**: Tamanhos de fonte consistentes (xs: 12px até xxxl: 32px) e pesos (regular, medium, semibold, bold)
- **Bordas**: Border radius padronizado (sm: 8px até full: 9999px)
- **Sombras**: 4 níveis de elevação (sm, md, lg, xl) para profundidade visual

### Componentes Reutilizáveis (`components/ui/`)
- **Button**: Múltiplas variantes (primary, secondary, outline, ghost), tamanhos (sm, md, lg), estados de loading, gradientes
- **Input**: Campos com ícones, labels, estados de foco, toggle de senha, validação visual
- **Card**: Cards com variantes (default, elevated, outlined) para organização de conteúdo

### Telas Redesenhadas

#### Autenticação (`app/(auth)/`)
- **Login e Registro**: Headers com gradientes, ícones grandes, inputs modernos com validação visual
- **Experiência**: KeyboardAvoidingView, scrollable, feedback visual completo

#### Principais (`app/(tabs)/`)
- **Serviços (index.tsx)**: 
  - Header com gradiente e saudação personalizada
  - Cards de serviço com ícones, preços destacados, badges profissionais
  - Indicadores visuais de duração e profissional
  - Pull-to-refresh e animações suaves
  
- **Agendamentos (appointments.tsx)**:
  - Timeline visual de agendamentos
  - Badges de status coloridos (confirmado/pendente)
  - Informações de pagamento com ícones
  - Distinção visual entre agendamentos futuros e passados
  
- **Perfil (profile.tsx)**:
  - Avatar circular com inicial do nome
  - Badge especial para profissionais
  - Cards informativos com ícones
  - Gradiente no header
  
- **Notificações (notifications.tsx)** [NOVO - Outubro 2025]:
  - Área dedicada para notificações do sistema
  - Três filtros: "Todas", "Não lidas", "Lidas"
  - Badge com contador de não lidas na aba
  - Cards modernos com ícones por tipo (agendamento, pagamento, lembrete)
  - Timestamp relativo (ex: "5 min atrás", "2h atrás")
  - Marcar como lida individualmente ou todas de uma vez
  - Pull-to-refresh para atualização manual
  - Polling automático a cada 30 segundos
  - Estados vazios adaptativos para cada filtro
  - Visível apenas para profissionais
  
- **Admin (admin.tsx)**:
  - Formulários organizados com seções claras
  - Seletor de dias da semana horizontal e visual
  - Inputs com ícones contextuais
  - Feedback visual em todas as ações

#### Fluxo de Agendamento (`app/(booking)/`)
- **Verificação (verify.tsx)**:
  - Layout limpo com cards informativos
  - Separação clara de dados do cliente e agendamento
  - Avisos visuais antes da confirmação
  
- **Pagamento (payment.tsx)**:
  - Card de demonstração com avisos claros
  - Fluxo de pagamento explicado visualmente em etapas
  - Status do agendamento com badges
  - Design profissional mesmo em modo demo

### Melhorias de Experiência
- ✅ Gradientes modernos em headers de todas as telas
- ✅ Ícones contextuais do Ionicons em toda a aplicação
- ✅ Animações e transições suaves
- ✅ Feedback visual consistente (loading, success, error)
- ✅ Estados vazios informativos com ícones e mensagens amigáveis
- ✅ Design responsivo e adaptável
- ✅ Paleta de cores moderna e acessível
- ✅ Hierarquia visual clara com tipografia consistente
- ✅ Sombras e elevações para profundidade
- ✅ Espaçamentos harmoniosos em toda a interface

### Área de Notificações (Outubro 2025)
Sistema completo de notificações implementado com:

**Funcionalidades:**
- ✅ Aba dedicada na navegação principal (visível apenas para profissionais)
- ✅ Badge com contador de notificações não lidas
- ✅ Três filtros de visualização: Todas, Não lidas, Lidas
- ✅ Cards de notificação com informações organizadas
- ✅ Ícones contextuais por tipo (calendário, cartão, alarme)
- ✅ Timestamp relativo intuitivo
- ✅ Marcar como lida individual ou em massa
- ✅ Pull-to-refresh para atualização manual
- ✅ Polling automático a cada 30 segundos

**Implementação Técnica:**
- ✅ Context API com useCallback para performance
- ✅ useFocusEffect para carregamento ao focar na tela
- ✅ Atualização otimista do estado para UI responsiva
- ✅ Sem race conditions ou loops de carregamento
- ✅ Backend com endpoints REST para CRUD de notificações

## Sobre o Pagamento

### Estado Atual (Modo Demonstração)
O sistema implementa a integração com Stripe no backend:
- ✅ Cria Payment Intent através da API do Stripe
- ✅ Armazena o ID do Payment Intent no banco
- ✅ Valida propriedade do agendamento (clientId) antes de confirmar
- ✅ Consulta status do Payment Intent no Stripe via API
- ✅ Em **modo demonstração** (PAYMENT_DEMO_MODE≠false): aceita Payment Intents para testes
- ✅ Em **modo produção** (PAYMENT_DEMO_MODE=false): requer status 'succeeded' ou 'requires_capture'

### Próximos Passos para Produção Completa
Para habilitar coleta real de cartões e pagamentos:

1. **Instalar biblioteca Stripe React Native:**
```bash
npm install @stripe/stripe-react-native
```

2. **Atualizar app/(booking)/payment.tsx:**
```typescript
import { StripeProvider, CardField, confirmPayment } from '@stripe/stripe-react-native';

// Envolver tela com StripeProvider usando publishable key
// Substituir simulação por confirmPayment(clientSecret, {...})
```

3. **Configurar variável de ambiente:**
```
PAYMENT_DEMO_MODE=false
```

4. **Backend já está pronto:**
   - Valida status do Payment Intent no Stripe
   - Requer 'succeeded' ou 'requires_capture' em modo produção
   - Bloqueia confirmações sem pagamento válido

### Segurança
- ✅ Endpoint `/api/payments/confirm` valida propriedade do agendamento
- ✅ Verifica status do Payment Intent no Stripe antes de confirmar
- ✅ Requer autenticação JWT
- ✅ Modo demo claramente separado do modo produção

## Notas de Segurança
- Senhas são hashadas com bcrypt
- Tokens JWT com expiração de 7 dias
- Rotas protegidas com middleware de autenticação
- Validação de permissões por tipo de usuário
