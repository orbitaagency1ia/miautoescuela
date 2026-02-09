import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/kevinubeda/Desktop/miautoescuela/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const newEmail = 'brainrotini26@gmail.com';

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

  console.log('Escuela:', school.name, 'ID:', school.id);

  // Buscar usuario en auth
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === newEmail);

  if (!user) {
    console.log('Usuario no encontrado con email:', newEmail);
    console.log('Primeros usuarios disponibles:');
    users.slice(0, 10).forEach(u => console.log('  -', u.email));
    return;
  }

  console.log('Usuario encontrado:', user.email);
  console.log('User ID:', user.id);

  // Eliminar owner anterior de TerranovaAI
  const { error: deleteError } = await supabase
    .from('school_members')
    .delete()
    .eq('school_id', school.id)
    .eq('role', 'owner');

  if (deleteError) {
    console.log('Error eliminando owner anterior:', deleteError.message);
  }

  // Crear nuevo owner
  const { error: insertError } = await supabase.from('school_members').insert({
    school_id: school.id,
    user_id: user.id,
    role: 'owner',
    status: 'active',
  });

  if (insertError) {
    console.log('Error creando nuevo owner:', insertError.message);
    return;
  }

  console.log('');
  console.log('✅ Owner cambiado exitosamente!');
  console.log('   Nuevo owner:', newEmail);
  console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
}

main().catch(console.error);
