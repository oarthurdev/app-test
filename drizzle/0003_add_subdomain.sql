
ALTER TABLE "tenants" ADD COLUMN "subdomain" text;
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain");
