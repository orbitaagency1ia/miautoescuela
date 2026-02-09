import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const targetEmail = 'brainrotini26@miautoescuela.com';
  const tempPassword = 'Brainrot2024!';

  // Obtener TerranovaAI
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%terranova%')
    .single();

  console.log('Escuela:', school.name);

  // Listar usuarios
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === targetEmail);

  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }

  console.log('Usuario:', user.email);
  console.log('ID:', user.id);

  // Crear perfil con id y user_id iguales
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    user_id: user.id,
    full_name: 'Brain Rotini',
    phone: null,
    activity_points: 0,
  });

  if (profileError) {
    console.log('Error perfil:', profileError.message);
  } else {
    console.log('✅ Perfil creado');
  }

  // Eliminar owner anterior
  await supabase
    .from('school_members')
    .delete()
    .eq('school_id', school.id)
    .eq('role', 'owner');

  // Crear nuevo owner
  const { error: insertError } = await supabase.from('school_members').insert({
    school_id: school.id,
    user_id: user.id,
    role: 'owner',
    status: 'active',
  });

  if (insertError) {
    console.log('Error owner:', insertError.message);
    return;
  }

  console.log('✅ Owner creado');
  console.log('');
  console.log('✅ LISTO!');
  console.log('');
  console.log('   Email:', targetEmail);
  console.log('   Password:', tempPassword);
  console.log('');
  console.log('   Inicia sesión: http://localhost:3000/iniciar-sesion');
  console.log('   Panel: http://localhost:3000/temas');
}

main().catch(console.error);
