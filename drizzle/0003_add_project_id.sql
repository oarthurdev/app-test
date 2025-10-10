
-- Adicionar campo project_id para armazenar EAS Project IDs
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS project_id TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tenants_project_id ON tenants(project_id);
