import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const timestamp = Date.now();
  const newEmail = `owner${timestamp}@test.com`;
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
  console.log('Escuela encontrada:', school.name, '(ID:', school.id + ')');

  // Crear usuario en auth
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: newEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test Owner' },
  });

  if (createError) {
    console.log('Error creando usuario en auth:', createError.message);
    console.log('Detalles:', createError);
    return;
  }

  const userId = data.user.id;
  console.log('Usuario creado en auth:', newEmail);
  console.log('User ID:', userId);

  // Verificar que el usuario existe en auth.users
  const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(userId);
  if (authCheckError) {
    console.log('Error verificando usuario en auth:', authCheckError.message);
  } else {
    console.log('Usuario verificado en auth.users:', authUser.user?.email);
  }

  // Crear perfil
  console.log('Creando perfil...');
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    user_id: userId,
    full_name: 'Test Owner',
    phone: null,
    activity_points: 0,
  });

  if (profileError) {
    console.log('Error creando perfil:', profileError.message);
    console.log('Detalles:', profileError);
    return;
  }

  console.log('Perfil creado correctamente');

  // Eliminar owner anterior
  console.log('Eliminando owners anteriores...');
  await supabase
    .from('school_members')
    .delete()
    .eq('school_id', school.id)
    .eq('role', 'owner');

  // Crear nuevo owner
  console.log('Creando nueva membresía de owner...');
  const { error: insertError } = await supabase.from('school_members').insert({
    school_id: school.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  });

  if (insertError) {
    console.log('Error creando owner:', insertError.message);
    console.log('Detalles:', insertError);
    return;
  }

  console.log('');
  console.log('✅ Owner creado y asignado!');
  console.log('   Email:', newEmail);
  console.log('   Password temporal:', tempPassword);
  console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
}

main().catch(console.error);
