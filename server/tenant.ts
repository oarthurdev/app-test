
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { tenants } from '../shared/schema';
import { eq } from 'drizzle-orm';

export interface TenantRequest extends Request {
  tenantId?: number;
  tenantSlug?: string;
}

// Middleware para extrair tenant do subdomínio ou slug na URL
export const extractTenantContext = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Opção 1: Extrair do subdomínio (ex: barbearia-central.seuapp.com)
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    
    // Opção 2: Extrair do path (ex: seuapp.com/barbearia-central/...)
    const pathSlug = req.path.split('/')[1];
    
    const slug = subdomain !== 'www' && subdomain !== 'seuapp' 
      ? subdomain 
      : pathSlug;

    if (!slug) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    if (!tenant.active) {
      return res.status(403).json({ error: 'Estabelecimento inativo' });
    }

    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;
    
    next();
  } catch (error) {
    console.error('Erro ao extrair contexto do tenant:', error);
    res.status(500).json({ error: 'Erro ao identificar estabelecimento' });
  }
};

// Função auxiliar para validar se usuário pertence ao tenant
export const validateUserTenant = async (
  userId: number,
  tenantId: number
): Promise<boolean> => {
  const { users } = await import('../shared/schema');
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.tenantId === tenantId;
};
