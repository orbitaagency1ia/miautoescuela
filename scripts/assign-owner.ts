import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const targetEmail = 'brainrotini26@gmail.com';
  const tempPassword = 'Brainrot2024!';

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

  console.log('Escuela:', school.name);

  // Intentar crear usuario
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: targetEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Brain Rotini' },
  });

  if (createError) {
    console.log('Error:', createError.message);
    console.log('');
    console.log('Este email probablemente está registrado en OTRO proyecto de Supabase.');
    console.log('Cambia el email o usa uno diferente para este proyecto.');
    return;
  }

  const userId = data.user.id;
  console.log('Usuario creado:', targetEmail);
  console.log('ID:', userId);

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
  console.log('✅ Owner creado exitosamente!');
  console.log('   Email:', targetEmail);
  console.log('   Password:', tempPassword);
  console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
  console.log('   Luego ve a: http://localhost:3000/panel o http://localhost:3000/temas');
}

main().catch(console.error);
