/**
 * SCRIPT TEMPORAL - Crea un usuario admin para acceder al sistema
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminUser() {
  console.log('🔑 Creando usuario admin temporal...\n');

  const ADMIN_EMAIL = 'admin@miautoescuela.com';
  const ADMIN_PASSWORD = 'Admin123456!';

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();

    if (existingUser) {
      console.log(`✅ El usuario ya existe: ${ADMIN_EMAIL}`);

      // Verificar si es miembro de alguna autoescuela
      const { data: member } = await supabase
        .from('school_members')
        .select('*, schools!inner(*)')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (member) {
        console.log(`\n📚 Ya es admin de: ${member.schools?.name || 'N/A'}`);
      } else {
        // Añadir como admin a la primera autoescuela disponible
        const { data: schools } = await supabase
          .from('schools')
          .select('*')
          .limit(1);

        if (schools && schools.length > 0) {
          const school = schools[0];
          await supabase.from('school_members').insert({
            school_id: school.id,
            user_id: existingUser.id,
            role: 'admin',
            status: 'active',
            joined_at: new Date().toISOString(),
          });
          console.log(`✅ Añadido como admin de: ${school.name}`);
        }
      }

      console.log('\n🎉 Ya puedes entrar con:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   URL: http://localhost:3001/iniciar-sesion`);
      return;
    }

    // Crear nuevo usuario
    console.log('Creando nuevo usuario...');

    // 1. Crear auth user con service role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin Temporal',
      },
    });

    if (authError) {
      console.error('❌ Error creando auth user:', authError.message);
      return;
    }

    if (!authData.user || !authData.user.id) {
      console.error('❌ No se pudo crear el usuario (sin ID)');
      console.log('Respuesta:', JSON.stringify(authData, null, 2));
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Auth user creado:', ADMIN_EMAIL);
    console.log('✅ User ID:', userId);

    // 2. Crear perfil
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Admin Temporal',
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError.message);

      // Si falla, intentar crear perfil con los datos básicos que necesitamos
      console.log('\n💡 Intentando crear perfil manualmente...');

      // Al menos intentamos añadir como miembro de una escuela
      const { data: schools } = await supabase
        .from('schools')
        .select('*')
        .limit(1);

      if (schools && schools.length > 0) {
        const school = schools[0];

        // Crear perfil básico
        const { error: basicProfileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: ADMIN_EMAIL,
            full_name: 'Admin Temporal',
          }, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (basicProfileError) {
          console.error('❌ Error creando perfil básico:', basicProfileError.message);
        } else {
          console.log('✅ Perfil básico creado');
        }

        // Añadir como miembro
        await supabase.from('school_members').insert({
          school_id: school.id,
          user_id: userId,
          role: 'admin',
          status: 'active',
          joined_at: new Date().toISOString(),
        });

        console.log(`✅ Añadido como admin de: ${school.name}`);
      }

      console.log('\n🎉 Puedes intentar entrar con:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   URL: http://localhost:3001/iniciar-sesion`);
      return;
    }

    console.log('✅ Perfil creado');

    // 3. Añadir como admin a la primera autoescuela
    const { data: schools } = await supabase
      .from('schools')
      .select('*')
      .limit(1);

    if (!schools || schools.length === 0) {
      console.log('\n⚠️  No hay autoescuelas disponibles. Ejecuta: npm run seed');
      return;
    }

    const school = schools[0];

    await supabase.from('school_members').insert({
      school_id: school.id,
      user_id: userId,
      role: 'admin',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    console.log(`✅ Añadido como admin de: ${school.name}`);

    console.log('\n🎉 ¡Listo! Ya puedes entrar con:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   URL: http://localhost:3001/iniciar-sesion`);

  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    console.log('\n📋 Información de depuración:');
    console.log('   - Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY están en .env.local');
    console.log('   - Verifica que SUPABASE_SERVICE_ROLE_KEY tenga permisos de admin');
  }
}

createAdminUser();
