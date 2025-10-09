CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"business_type" text,
	"phone" varchar(20),
	"address" text,
	"logo" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "tenant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "guest_email" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "guest_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "guest_client_id" text;--> statement-breakpoint
ALTER TABLE "business_hours" ADD COLUMN "tenant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "tenant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_tenant_id_idx" ON "appointments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "appointments_tenant_date_idx" ON "appointments" USING btree ("tenant_id","appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_professional_date_idx" ON "appointments" USING btree ("tenant_id","professional_id","appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_client_idx" ON "appointments" USING btree ("tenant_id","client_id");--> statement-breakpoint
CREATE INDEX "business_hours_tenant_professional_idx" ON "business_hours" USING btree ("tenant_id","professional_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "services_tenant_id_idx" ON "services" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "services_tenant_professional_idx" ON "services" USING btree ("tenant_id","professional_id");--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "unique_day_professional" UNIQUE("tenant_id","professional_id","day_of_week","start_time","end_time");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "email_tenant_unique" UNIQUE("email","tenant_id");