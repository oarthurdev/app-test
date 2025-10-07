
ALTER TABLE "appointments" ADD COLUMN "temp_client_token" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'client' NOT NULL;
