import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // Usar un email alternativo
  const targetEmail = 'brainrotini26@miautoescuela.com';
  const tempPassword = 'Brainrot2024!';

  // Obtener TerranovaAI
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%terranova%')
    .single();

  console.log('Escuela:', school.name);

  // Crear usuario
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: targetEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Brain Rotini' },
  });

  if (createError) {
    console.log('Error:', createError.message);
    return;
  }

  console.log('Usuario creado:', targetEmail);

  // Eliminar owner anterior
  await supabase
    .from('school_members')
    .delete()
    .eq('school_id', school.id)
    .eq('role', 'owner');

  // Crear nuevo owner
  const { error: insertError } = await supabase.from('school_members').insert({
    school_id: school.id,
    user_id: data.user.id,
    role: 'owner',
    status: 'active',
  });

  if (insertError) {
    console.log('Error:', insertError.message);
    return;
  }

  console.log('');
  console.log('✅ Owner creado!');
  console.log('   Email:', targetEmail);
  console.log('   Password:', tempPassword);
  console.log('');
  console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
  console.log('   Luego ve a: http://localhost:3000/temas');
}

main().catch(console.error);
