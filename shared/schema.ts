import { pgTable, serial, text, timestamp, integer, boolean, decimal, varchar, time, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de empresas/estabelecimentos
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL amigável: seuapp.com/barbearia-central
  subdomain: text('subdomain').unique(), // Para uso com subdomínios: barbearia.seuapp.com
  businessType: text('business_type'), // Ex: salão, barbearia, consultório
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  logo: text('logo'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(), // Vincula usuário à empresa
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('client'), // 'owner' (proprietário) ou 'client' (cliente)
  pushToken: text('push_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Garantir que email seja único dentro do tenant (não globalmente)
  emailTenantUnique: unique('email_tenant_unique').on(table.email, table.tenantId),
  // Índice para consultas frequentes por tenant
  tenantIdIdx: index('users_tenant_id_idx').on(table.tenantId),
}));

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: boolean('read').notNull().default(false),
  data: text('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Índice para consultas de notificações por usuário
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
  // Índice para consultas de notificações não lidas
  userReadIdx: index('notifications_user_read_idx').on(table.userId, table.read),
}));

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Índice composto para consultas por tenant
  tenantIdIdx: index('services_tenant_id_idx').on(table.tenantId),
  // Índice para consultas por profissional dentro do tenant
  tenantProfessionalIdx: index('services_tenant_professional_idx').on(table.tenantId, table.professionalId),
}));

export const businessHours = pgTable('business_hours', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  professionalId: integer('professional_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Índice composto para consultas de horários por tenant e profissional
  tenantProfessionalIdx: index('business_hours_tenant_professional_idx').on(table.tenantId, table.professionalId),
  // Garantir que não haja horários duplicados para o mesmo dia/profissional
  uniqueDayProfessional: unique('unique_day_professional').on(table.tenantId, table.professionalId, table.dayOfWeek, table.startTime, table.endTime),
}));

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
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
  guestClientId: text('guest_client_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Índice para consultas por tenant
  tenantIdIdx: index('appointments_tenant_id_idx').on(table.tenantId),
  // Índice para consultas por data e tenant
  tenantDateIdx: index('appointments_tenant_date_idx').on(table.tenantId, table.appointmentDate),
  // Índice para consultas por profissional e data
  professionalDateIdx: index('appointments_professional_date_idx').on(table.tenantId, table.professionalId, table.appointmentDate),
  // Índice para consultas por cliente
  clientIdx: index('appointments_client_idx').on(table.tenantId, table.clientId),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  services: many(services),
  businessHours: many(businessHours),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
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
  tenant: one(tenants, {
    fields: [services.tenantId],
    references: [tenants.id],
  }),
  professional: one(users, {
    fields: [services.professionalId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  tenant: one(tenants, {
    fields: [businessHours.tenantId],
    references: [tenants.id],
  }),
  professional: one(users, {
    fields: [businessHours.professionalId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  }),
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

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
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
