import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { users, services, businessHours, appointments, notifications } from '../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { hashPassword, comparePassword, generateToken, authenticateToken, requireRole, AuthRequest } from './auth';
import Stripe from 'stripe';
import twilio from 'twilio';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const expo = new Expo();

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

app.post('/api/auth/push-token', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pushToken } = req.body;

    if (!Expo.isExpoPushToken(pushToken)) {
      return res.status(400).json({ error: 'Token de push inválido' });
    }

    await db
      .update(users)
      .set({ pushToken })
      .where(eq(users.id, req.userId!));

    res.json({ message: 'Token de push registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar token de push:', error);
    res.status(500).json({ error: 'Erro ao registrar token de push' });
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
          lte(appointments.appointmentDate, endOfDay)
        )
      );

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentDate.toISOString());

    res.json({ businessHours: hours, bookedTimes });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao buscar disponibilidade' });
  }
});

async function sendPushNotification(userId: number, title: string, message: string, data?: any) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user?.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      const pushMessage: ExpoPushMessage = {
        to: user.pushToken,
        sound: 'default',
        title,
        body: message,
        data: data || {},
      };

      const chunks = expo.chunkPushNotifications([pushMessage]);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error('Erro ao enviar push notification:', error);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao processar push notification:', error);
  }
}

async function createNotification(userId: number, title: string, message: string, type: string, data?: any) {
  try {
    await db.insert(notifications).values({
      userId,
      title,
      message,
      type,
      data: data ? JSON.stringify(data) : null,
    });

    await sendPushNotification(userId, title, message, data);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

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
          eq(appointments.appointmentDate, new Date(appointmentDate))
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
        status: 'confirmed',
        paymentStatus: 'pending',
      })
      .returning();

    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    const appointmentDateFormatted = new Date(appointmentDate).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await createNotification(
      service.professionalId,
      'Novo Agendamento',
      `${client?.name} agendou ${service.name} para ${appointmentDateFormatted}`,
      'new_appointment',
      {
        appointmentId: newAppointment.id,
        serviceId: service.id,
        clientId: req.userId,
      }
    );

    res.json(newAppointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.post('/api/appointments/:id/mark-paid', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const appointmentId = Number(req.params.id);

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (!user || user.role !== 'professional') {
      return res.status(403).json({ error: 'Apenas profissionais podem marcar pagamentos' });
    }

    if (appointment.professionalId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para atualizar este agendamento' });
    }

    await db
      .update(appointments)
      .set({
        paymentStatus: 'paid',
      })
      .where(eq(appointments.id, appointmentId));

    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, appointment.clientId))
      .limit(1);

    await createNotification(
      appointment.clientId,
      'Pagamento Confirmado',
      `Pagamento do serviço confirmado por ${user.name}`,
      'payment_confirmed',
      {
        appointmentId: appointment.id,
      }
    );

    res.json({ success: true, message: 'Pagamento marcado como realizado' });
  } catch (error) {
    console.error('Erro ao marcar pagamento:', error);
    res.status(500).json({ error: 'Erro ao marcar pagamento' });
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

    if (appointment.clientId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para confirmar este agendamento' });
    }

    await db
      .update(appointments)
      .set({
        status: 'confirmed',
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

app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.userId!))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    res.json(userNotifications.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    })));
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notificationId = Number(req.params.id);

    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, req.userId!)
        )
      );

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, req.userId!));

    res.json({ message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
