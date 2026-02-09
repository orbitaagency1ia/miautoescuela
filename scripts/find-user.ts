import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const targetEmail = 'brainrotini26@gmail.com';

  // Obtener TerranovaAI
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%terranova%')
    .single();

  // Buscar usuario - listar TODOS los usuarios
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  console.log('Buscando:', targetEmail);
  console.log('Total usuarios:', users.length);
  
  const user = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
  
  if (user) {
    console.log('');
    console.log('✅ Usuario encontrado!');
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);
    console.log('   Creado:', new Date(user.created_at).toLocaleString('es-ES'));
    
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
      console.log('Error creando owner:', insertError.message);
      return;
    }
    
    console.log('');
    console.log('✅ Ahora es owner de TerranovaAI!');
    console.log('   Inicia sesión en: http://localhost:3000/iniciar-sesion');
    
  } else {
    console.log('');
    console.log('❌ Usuario no encontrado');
    console.log('');
    console.log('Usuarios con "brain" en el email:');
    users.filter(u => u.email?.includes('brain')).forEach(u => {
      console.log('  -', u.email);
    });
  }
}

main().catch(console.error);
