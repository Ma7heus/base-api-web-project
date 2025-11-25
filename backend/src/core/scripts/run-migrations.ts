import AppDataSource from 'database/ormconfig';
import 'dotenv/config';

/**
 * Script para rodar migrações em produção
 */
async function runMigrations() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conexão estabelecida');

    console.log('🔄 Executando migrações pendentes...');
    const migrations = await AppDataSource.runMigrations({
      transaction: 'all',
    });

    if (migrations.length === 0) {
      console.log('ℹ️  Nenhuma migração pendente');
    } else {
      console.log(
        `✅ ${migrations.length} migração(ões) executada(s) com sucesso:`,
      );
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await AppDataSource.destroy();
    console.log('✅ Migrações concluídas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

void runMigrations();
