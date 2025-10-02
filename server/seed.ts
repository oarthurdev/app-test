import { db } from './db';
import { users } from '../shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('Verificando se já existe um profissional...');
    
    const existingProfessional = await db
      .select()
      .from(users)
      .where(eq(users.email, 'profissional@teste.com'))
      .limit(1);

    if (existingProfessional.length > 0) {
      console.log('Profissional já existe no banco de dados');
      return;
    }

    console.log('Criando usuário profissional...');
    
    const hashedPassword = await hashPassword('senha123');
    
    const [professional] = await db
      .insert(users)
      .values({
        name: 'João Silva',
        email: 'profissional@teste.com',
        phone: '+5511999999999',
        password: hashedPassword,
        role: 'professional',
      })
      .returning();

    console.log('Profissional criado com sucesso!');
    console.log('Email: profissional@teste.com');
    console.log('Senha: senha123');
    console.log('ID:', professional.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    process.exit(1);
  }
}

seed();
