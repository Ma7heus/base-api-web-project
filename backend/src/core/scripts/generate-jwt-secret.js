#!/usr/bin/env node

/**
 * Script para gerar JWT_SECRET seguro
 * Uso: node scripts/generate-jwt-secret.js
 *      npm run generate:secret
 */

const crypto = require('crypto');

console.log('\n🔐 Gerador de JWT_SECRET Seguro\n');
console.log('═'.repeat(80));
console.log('');

// Gera secret em diferentes formatos
const hexSecret = crypto.randomBytes(64).toString('hex');
const base64Secret = crypto.randomBytes(64).toString('base64');

console.log('📝 Secret em formato HEXADECIMAL (128 caracteres):');
console.log('');
console.log(`  ${hexSecret}`);
console.log('');
console.log('─'.repeat(80));
console.log('');
console.log('📝 Secret em formato BASE64 (88 caracteres):');
console.log('');
console.log(`  ${base64Secret}`);
console.log('');
console.log('═'.repeat(80));
console.log('');
console.log('💡 Como usar:');
console.log('');
console.log('1. Copie um dos secrets acima');
console.log('2. Adicione ao arquivo .env do seu ambiente:');
console.log('');
console.log('   Desenvolvimento (.env.development):');
console.log(`   JWT_SECRET=${hexSecret.substring(0, 32)}...`);
console.log('');
console.log('   Produção (.env.production):');
console.log(`   JWT_SECRET=${hexSecret}`);
console.log('');
console.log('3. Reinicie a aplicação');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('   • Use secrets DIFERENTES para cada ambiente (dev/staging/prod)');
console.log('   • NUNCA commite o arquivo .env no Git');
console.log('   • Rotacione o secret a cada 90 dias');
console.log('   • Armazene secrets de produção em gerenciador de secrets');
console.log('');
console.log('═'.repeat(80));
console.log('');