# Sistema de Agendamento de Serviços

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
- `(tabs)/`: Navegação principal (serviços, agendamentos, perfil, admin)
- `(booking)/`: Fluxo de agendamento (seleção de serviço, data/hora, verificação, pagamento)
- `(admin)/`: Painel administrativo para profissionais

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
As seguintes variáveis já estão configuradas no Replit Secrets:
- `DATABASE_URL`: Conexão PostgreSQL
- `JWT_SECRET`: Chave secreta para tokens
- `STRIPE_SECRET_KEY`: Chave do Stripe
- `TWILIO_ACCOUNT_SID`: Credenciais Twilio
- `TWILIO_AUTH_TOKEN`: Token Twilio
- `TWILIO_PHONE_NUMBER`: Número Twilio
- `EXPO_PUBLIC_API_URL`: URL da API

## Scripts Disponíveis
- `npm run server`: Inicia o servidor backend na porta 3001
- `npm run db:push`: Sincroniza schema com banco de dados
- `npm run db:seed`: Cria usuário profissional de teste
- `npm start`: Inicia o Expo

## Configuração do Replit
- **Backend**: Rodando na porta 3001 (localhost)
- **Frontend**: Expo web rodando na porta 5000 (0.0.0.0)
- **Database**: PostgreSQL configurado via DATABASE_URL
- **Workflows**: 
  - Backend: `npm run server` (porta 3001)
  - Frontend: `EXPO_METRO_PORT=5000 npx expo start --web --port 5000` (porta 5000)

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
- ✅ Persistência de dados em PostgreSQL

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
