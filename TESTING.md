# Guia de Testes do Sistema de Agendamento

## Status do Sistema
✅ Backend API rodando na porta 5000
✅ Banco de dados PostgreSQL configurado
✅ Usuário profissional criado

## Credenciais de Teste

### Profissional (já criado)
- **Email**: profissional@teste.com
- **Senha**: senha123

### Cliente
Você precisará criar uma nova conta através do app.

## Fluxo de Teste Completo

### PARTE 1: Configuração pelo Profissional

1. **Login como Profissional**
   - Abra o app e faça login com as credenciais acima
   - Você verá 4 abas: Serviços, Agendamentos, Admin, Perfil

2. **Cadastrar Serviços** (aba Admin)
   - Clique na aba "Admin"
   - Na seção "Cadastrar Serviço":
     - Nome: "Consulta Nutrição"
     - Descrição: "Consulta nutricional completa"
     - Preço: 100.00
     - Duração: 60
   - Clique em "Cadastrar Serviço"

3. **Cadastrar Horários de Funcionamento** (aba Admin)
   - Na seção "Cadastrar Horário de Funcionamento":
     - Selecione: Segunda-feira
     - Horário inicial: 09:00
     - Horário final: 18:00
   - Clique em "Cadastrar Horário"
   - Repita para outros dias da semana se desejar

4. **Logout**
   - Vá para a aba "Perfil"
   - Clique em "Sair"

### PARTE 2: Agendamento pelo Cliente

1. **Criar Conta de Cliente**
   - Na tela de login, clique em "Não tem conta? Cadastre-se"
   - Preencha:
     - Nome completo: Seu nome
     - Email: seu@email.com
     - Telefone: +5511999999999
     - Senha: mínimo 6 caracteres
   - Clique em "Cadastrar"

2. **Visualizar Serviços**
   - Após o login, você verá a lista de serviços
   - Deve aparecer "Consulta Nutrição" que foi cadastrado

3. **Selecionar Serviço**
   - Clique no card do serviço "Consulta Nutrição"
   - Você será levado para a tela de agendamento

4. **Escolher Data**
   - No calendário, selecione uma data futura (segunda-feira)
   - Os horários disponíveis aparecerão abaixo

5. **Escolher Horário**
   - Selecione um dos horários disponíveis (ex: 09:00)
   - O horário ficará destacado em azul
   - Clique em "Continuar"

6. **Verificação**
   - Revise seus dados pessoais
   - Revise data e horário do agendamento
   - Clique em "Confirmar e Pagar"

7. **Pagamento**
   - Na tela de pagamento, leia a informação
   - Clique em "Pagar Agora"
   - Aguarde alguns segundos (simulação de processamento)
   - Você verá uma mensagem de sucesso

8. **Confirmação**
   - Após o pagamento, você será redirecionado para a tela principal
   - Vá para a aba "Agendamentos"
   - Seu agendamento aparecerá com status "Confirmado" e "Pago"

## Verificações Importantes

### ✅ Verificar Bloqueio de Horários
1. Faça logout e login novamente como cliente
2. Tente agendar o mesmo serviço na mesma data/hora
3. O horário deve aparecer riscado e não permitir seleção

### ✅ Verificar Menu Admin
1. O menu Admin só aparece para usuários profissionais
2. Clientes não devem ver a aba "Admin"

### ✅ Verificar SMS (em produção)
- Com as credenciais Twilio configuradas, o cliente receberia um SMS
- No ambiente de teste, a mensagem aparece apenas nos logs do servidor

## Problemas Comuns

### "Nenhum serviço disponível"
- Certifique-se de ter cadastrado serviços como profissional

### "Não há horários disponíveis"
- Verifique se cadastrou horários para o dia da semana selecionado
- Segunda = 1, Terça = 2, etc.

### "Erro ao criar agendamento"
- Verifique se o servidor backend está rodando
- Verifique a conexão com o banco de dados

## API Endpoints Disponíveis

### Autenticação
- POST `/api/auth/register` - Registrar novo usuário
- POST `/api/auth/login` - Fazer login
- GET `/api/auth/me` - Obter usuário atual

### Serviços
- GET `/api/services` - Listar todos os serviços
- POST `/api/services` - Criar serviço (profissional)

### Horários
- GET `/api/business-hours` - Listar horários
- POST `/api/business-hours` - Criar horário (profissional)

### Agendamentos
- GET `/api/appointments/available` - Verificar disponibilidade
- POST `/api/appointments` - Criar agendamento
- GET `/api/appointments/my` - Meus agendamentos

### Pagamentos
- POST `/api/payments/create-intent` - Criar intenção de pagamento
- POST `/api/payments/confirm` - Confirmar pagamento
