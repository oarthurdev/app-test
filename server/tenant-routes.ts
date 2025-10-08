
import { Router } from 'express';
import { db } from './db';
import { tenants, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from './auth';

const router = Router();

// Criar novo tenant (estabelecimento) com dono
router.post('/api/tenants/register', async (req, res) => {
  try {
    const {
      // Dados do estabelecimento
      name,
      slug,
      businessType,
      phone,
      address,
      // Dados do dono
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
    } = req.body;

    // Validar se slug já existe
    const [existingTenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (existingTenant) {
      return res.status(400).json({ error: 'Este slug já está em uso' });
    }

    // Criar tenant
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        subdomain: slug, // Usar o mesmo slug como subdomain
        businessType,
        phone,
        address,
        active: true,
      })
      .returning();

    // Criar usuário dono
    const hashedPassword = await hashPassword(ownerPassword);
    
    const [owner] = await db
      .insert(users)
      .values({
        tenantId: newTenant.id,
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        password: hashedPassword,
        role: 'owner', // Proprietário do estabelecimento
      })
      .returning();

    // Gerar token
    const token = generateToken(owner.id, owner.role, owner.tenantId);

    res.status(201).json({
      token,
      tenant: {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
      },
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar tenant:', error);
    res.status(500).json({ error: 'Erro ao criar estabelecimento' });
  }
});

// Buscar informações do tenant
router.get('/api/tenants/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [tenant] = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        businessType: tenants.businessType,
        phone: tenants.phone,
        address: tenants.address,
        logo: tenants.logo,
      })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    res.status(500).json({ error: 'Erro ao buscar estabelecimento' });
  }
});

export default router;
