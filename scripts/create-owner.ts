import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const newEmail = 'brainrotini26@gmail.com';
  const tempPassword = 'TempPass123!';

  // Obtener TerranovaAI
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%terranova%')
    .single();

  if (!school) {
    console.log('No encontré TerranovaAI');
    return;
  }

  // Crear usuario
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: newEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Brain Rotini' },
  });

  if (createError) {
    console.log('Error creando usuario:', createError.message);
    return;
  }

  const userId = data.user.id;
  console.log('Usuario creado:', newEmail);
  console.log('User ID:', userId);

  // Eliminar owner anterior
  await supabase
    .from('school_members')
    .delete()
    .eq('school_id', school.id)
    .eq('role', 'owner');

  // Crear nuevo owner
  const { error: insertError } = await supabase.from('school_members').insert({
    school_id: school.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  });

  if (insertError) {
    console.log('Error creando owner:', insertError.message);
    return;
  }

  console.log('');
  console.log('✅ Owner creado y asignado!');
  console.log('   Email:', newEmail);
  console.log('   Password temporal:', tempPassword);
  console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
}

main().catch(console.error);
