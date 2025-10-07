import { pgTable, serial, text, timestamp, integer, boolean, decimal, varchar, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('client'),
  pushToken: text('push_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: boolean('read').notNull().default(false),
  data: text('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businessHours = pgTable('business_hours', {
  id: serial('id').primaryKey(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: varchar('guest_phone', { length: 20 }),
  tempClientToken: text('temp_client_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  servicesOffered: many(services),
  businessHours: many(businessHours),
  clientAppointments: many(appointments),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  professional: one(users, {
    fields: [services.professionalId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  professional: one(users, {
    fields: [businessHours.professionalId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  professional: one(users, {
    fields: [appointments.professionalId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type BusinessHour = typeof businessHours.$inferSelect;
export type InsertBusinessHour = typeof businessHours.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
