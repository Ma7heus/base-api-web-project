import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../../../database/ormconfig';
import { User, UserRole } from '../../models/user.entity';

async function seedAdmin() {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    console.error(
      '❌ Variáveis de ambiente ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórias',
    );
    console.error('   Configure no arquivo .env:');
    console.error('   ADMIN_NAME=Administrador');
    console.error('   ADMIN_EMAIL=admin@admin.com');
    console.error('   ADMIN_PASSWORD=SuaSenhaSegura123');
    process.exit(1);
  }

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conexão estabelecida');

    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`ℹ️  Usuário admin já existe: ${adminEmail}`);
      await AppDataSource.destroy();
      process.exit(0);
    }

    console.log('🔄 Criando usuário admin...');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepository.create({
      name: adminName,
      login: adminEmail.split('@')[0],
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(admin);

    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`   Nome: ${adminName}`);
    console.log(`   Email: ${adminEmail}`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

void seedAdmin();
