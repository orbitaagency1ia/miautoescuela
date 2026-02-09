/**
 * Create a test user with NO school membership
 * Run: npx tsx scripts/create-test-user.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const timestamp = Date.now();
  const email = `test${timestamp}@prueba.com`;
  const password = 'Test123!';

  // Create user in auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Usuario de Prueba',
    },
  });

  if (authError) {
    console.error('❌ Error creando usuario:', authError.message);
    return;
  }

  const userId = authData.user.id;

  // Create profile (WITHOUT adding to any school)
  await supabase.from('profiles').insert({
    id: userId,
    user_id: userId,
    full_name: 'Usuario de Prueba',
    phone: null,
    activity_points: 0,
  });

  console.log('\n✅ USUARIO DE PRUEBA CREADO');
  console.log('─'.repeat(50));
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`👤 User ID: ${userId}`);
  console.log('\n📝 PASOS PARA PROBAR:');
  console.log('   1. Ve a http://localhost:3000/iniciar-sesion');
  console.log('   2. Inicia sesión con estas credenciales');
  console.log('   3. Te llevará a /elegir-destino');
  console.log('   4. Usa cualquier código de invitación disponible');
  console.log('\n🎟️  CÓDIGOS DISPONIBLES (para cualquier escuela):');
  console.log('   "UFCX3L" -> terranovaai');
  console.log('   "E_HZVK" -> terranovaai');
  console.log('\n');
}

main().catch(console.error);
