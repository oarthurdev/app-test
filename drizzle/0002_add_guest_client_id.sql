
ALTER TABLE "appointments" ADD COLUMN "guest_client_id" text;
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "temp_client_token";
