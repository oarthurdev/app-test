import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { users, services, businessHours, appointments } from '../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { hashPassword, comparePassword, generateToken, authenticateToken, requireRole, AuthRequest } from './auth';
import Stripe from 'stripe';
import twilio from 'twilio';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'client',
      })
      .returning();

    const token = generateToken(newUser.id, newUser.role);

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const allServices = await db
      .select({
        id: services.id,
        professionalId: services.professionalId,
        name: services.name,
        description: services.description,
        price: services.price,
        duration: services.duration,
        professionalName: users.name,
      })
      .from(services)
      .leftJoin(users, eq(services.professionalId, users.id));

    res.json(allServices);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.post('/api/services', authenticateToken, requireRole('professional'), async (req: AuthRequest, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const [newService] = await db
      .insert(services)
      .values({
        professionalId: req.userId!,
        name,
        description,
        price,
        duration,
      })
      .returning();

    res.json(newService);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

app.get('/api/business-hours', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const hours = await db
      .select()
      .from(businessHours)
      .where(eq(businessHours.professionalId, req.userId!));

    res.json(hours);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    res.status(500).json({ error: 'Erro ao buscar horários' });
  }
});

app.post('/api/business-hours', authenticateToken, requireRole('professional'), async (req: AuthRequest, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    const [newHour] = await db
      .insert(businessHours)
      .values({
        professionalId: req.userId!,
        dayOfWeek,
        startTime,
        endTime,
      })
      .returning();

    res.json(newHour);
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    res.status(500).json({ error: 'Erro ao criar horário' });
  }
});

app.get('/api/appointments/available', async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ error: 'serviceId e date são obrigatórios' });
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, Number(serviceId)))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const dateObj = new Date(date as string);
    const dayOfWeek = dateObj.getDay();

    const hours = await db
      .select()
      .from(businessHours)
      .where(
        and(
          eq(businessHours.professionalId, service.professionalId),
          eq(businessHours.dayOfWeek, dayOfWeek)
        )
      );

    if (hours.length === 0) {
      return res.json([]);
    }

    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.serviceId, Number(serviceId)),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay),
          eq(appointments.status, 'confirmed')
        )
      );

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentDate.toISOString());

    res.json({ businessHours: hours, bookedTimes });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao buscar disponibilidade' });
  }
});

app.post('/api/appointments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { serviceId, appointmentDate } = req.body;

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.serviceId, serviceId),
          eq(appointments.appointmentDate, new Date(appointmentDate)),
          eq(appointments.status, 'confirmed')
        )
      )
      .limit(1);

    if (existingAppointment.length > 0) {
      return res.status(400).json({ error: 'Horário já reservado' });
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        clientId: req.userId!,
        serviceId,
        professionalId: service.professionalId,
        appointmentDate: new Date(appointmentDate),
        status: 'pending',
        paymentStatus: 'pending',
      })
      .returning();

    res.json(newAppointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.post('/api/payments/create-intent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { appointmentId } = req.body;

    const [appointment] = await db
      .select({
        appointment: appointments,
        service: services,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const amount = Math.round(parseFloat(appointment.service!.price) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      metadata: {
        appointmentId: appointmentId.toString(),
      },
    });

    await db
      .update(appointments)
      .set({ stripePaymentIntentId: paymentIntent.id })
      .where(eq(appointments.id, appointmentId));

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erro ao criar intent de pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar intent de pagamento' });
  }
});

app.post('/api/payments/confirm', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { appointmentId } = req.body;

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await db
      .update(appointments)
      .set({
        status: 'confirmed',
        paymentStatus: 'paid',
      })
      .where(eq(appointments.id, appointmentId));

    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, appointment.clientId))
      .limit(1);

    if (client && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Seu agendamento foi confirmado! Data: ${appointment.appointmentDate.toLocaleDateString('pt-BR')}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: client.phone,
        });
      } catch (smsError) {
        console.error('Erro ao enviar SMS:', smsError);
      }
    }

    res.json({ message: 'Pagamento confirmado e agendamento aprovado' });
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ error: 'Erro ao confirmar pagamento' });
  }
});

app.get('/api/appointments/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userAppointments = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        paymentStatus: appointments.paymentStatus,
        serviceName: services.name,
        servicePrice: services.price,
        professionalName: users.name,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(users, eq(appointments.professionalId, users.id))
      .where(eq(appointments.clientId, req.userId!));

    res.json(userAppointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
