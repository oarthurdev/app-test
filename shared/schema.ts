import { pgTable, serial, text, timestamp, integer, boolean, decimal, varchar, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('client'),
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
  clientId: integer('client_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  servicesOffered: many(services),
  businessHours: many(businessHours),
  clientAppointments: many(appointments),
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
