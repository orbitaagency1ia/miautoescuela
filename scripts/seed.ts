/**
 * SEED SCRIPT - Genera datos de prueba para mIAutoescuela
 *
 * Ejecutar con: npm run seed
 *
 * Este script crea:
 * - Autoescuelas de prueba con datos realistas
 * - Usuarios (owners, admins, students) con perfiles
 * - Miembros de escuela
 * - Módulos y lecciones
 * - Progreso de lecciones
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('\nNecesitas tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local');
  console.error('\nAsegúrate de que tu archivo .env.local tenga algo como:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

const supabase: any = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Datos de prueba
const AUTOESCUELAS = [
  {
    name: 'Autoescuela Madrid Centro',
    slug: 'autoescuela-madrid-centro',
    contact_email: 'info@madridcentro.com',
    phone: '+34 91 123 45 67',
    address: 'Calle Gran Vía, 45, 28013 Madrid',
    website: 'https://autoescuelamadridcentro.com',
    city: 'Madrid',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
  },
  {
    name: 'Autoescuela Barcelona',
    slug: 'autoescuela-barcelona',
    contact_email: 'contacto@autoescuelabcn.com',
    phone: '+34 93 987 65 43',
    address: 'Avinguda Diagonal, 123, 08018 Barcelona',
    website: 'https://autoescuelabcn.com',
    city: 'Barcelona',
    primary_color: '#8B5CF6',
    secondary_color: '#6D28D9',
  },
  {
    name: 'Autoescuela Valencia',
    slug: 'autoescuela-valencia',
    contact_email: 'hola@autoescuelavlc.com',
    phone: '+34 96 111 22 33',
    address: 'Calle Calabuig, 56, 46010 Valencia',
    website: 'https://autoescuelavlc.com',
    city: 'Valencia',
    primary_color: '#EC4899',
    secondary_color: '#BE185D',
  },
  {
    name: 'Autoescuela Sevilla',
    slug: 'autoescuela-sevilla',
    contact_email: 'info@autoescuelasvq.com',
    phone: '+34 95 444 55 66',
    address: 'Avenida de la Constitución, 78, 41001 Sevilla',
    website: 'https://autoescuelasvq.com',
    city: 'Sevilla',
    primary_color: '#F59E0B',
    secondary_color: '#D97706',
  },
  {
    name: 'Autoescuela Bilbao',
    slug: 'autoescuela-bilbao',
    contact_email: 'bilbao@autoeuskadi.com',
    phone: '+34 94 777 88 99',
    address: 'Gran Vía de Don Diego López de Haro, 12, 48001 Bilbao',
    website: 'https://autoeuskadi.com',
    city: 'Bilbao',
    primary_color: '#10B981',
    secondary_color: '#059669',
  },
];

const NOMBRES = ['María', 'Carlos', 'Lucía', 'Miguel', 'Ana', 'David', 'Carmen', 'José', 'Laura', 'Daniel', 'Sofía', 'Pablo', 'Elena', 'Adrián', 'Isabel', 'Javier', 'Claudia', 'Rodrigo', 'Patricia', 'Alejandro'];
const APELLIDOS = ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez', 'Fernández', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Torres', 'Ruiz', 'Jiménez', 'Navarro', 'Rivas', 'Serrano', 'Blanco', 'Ramos', 'Molina'];
const DOMINIOS = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.com', 'icloud.com'];

// Función helper para generar email aleatorio
function generarEmail(nombre: string, apellido: string): string {
  const nombreLower = nombre.toLowerCase();
  const apellidoLower = apellido.toLowerCase();
  const dominio = DOMINIOS[Math.floor(Math.random() * DOMINIOS.length)];
  const randomNum = Math.floor(Math.random() * 100);
  return `${nombreLower}.${apellidoLower}${randomNum}@${dominio}`;
}

// Generar usuario de prueba
function generarUsuario(rol: 'owner' | 'admin' | 'student', indice: number) {
  const nombre = NOMBRES[indice % NOMBRES.length];
  const apellido = APELLIDOS[indice % APELLIDOS.length];
  const email = generarEmail(nombre, apellido);
  const userId = randomUUID();

  return {
    id: userId,
    email,
    nombre_completo: `${nombre} ${apellido}`,
    rol,
  };
}

// Generar módulos con lecciones
function generarModulos(schoolId: string) {
  return [
    {
      id: randomUUID(),
      school_id: schoolId,
      title: 'Temario de Conducción',
      description: 'Todo lo que necesitas saber para obtener tu carnet de conducir',
      order_index: 1,
      is_published: true,
      lessons: [
        { id: randomUUID(), title: 'Introducción a la conducción', order_index: 1, is_published: true },
        { id: randomUUID(), title: 'El vehículo y sus componentes', order_index: 2, is_published: true },
        { id: randomUUID(), title: 'Normas de circulación general', order_index: 3, is_published: true },
        { id: randomUUID(), title: 'Señales verticales', order_index: 4, is_published: true },
        { id: randomUUID(), title: 'Señales horizontales y marcas viales', order_index: 5, is_published: true },
      ],
    },
    {
      id: randomUUID(),
      school_id: schoolId,
      title: 'Prácticas de Maniobras',
      description: 'Aprende las maniobras básicas para el examen práctico',
      order_index: 2,
      is_published: true,
      lessons: [
        { id: randomUUID(), title: 'Aparcado en batería', order_index: 1, is_published: true },
        { id: randomUUID(), title: 'Aparcado en línea', order_index: 2, is_published: true },
        { id: randomUUID(), title: 'Cambios de sentido de la marcha', order_index: 3, is_published: true },
      ],
    },
    {
      id: randomUUID(),
      school_id: schoolId,
      title: 'Circulación en Poblado',
      description: 'Técnicas de conducción en zonas urbanas',
      order_index: 3,
      is_published: true,
      lessons: [
        { id: randomUUID(), title: 'Intersecciones y rotondas', order_index: 1, is_published: true },
        { id: randomUUID(), title: 'Cambios de carril', order_index: 2, is_published: true },
        { id: randomUUID(), title: 'Adelantamientos', order_index: 3, is_published: true },
      ],
    },
  ];
}

// Función principal de seed
async function runSeed() {
  console.log('🌱 Iniciando seed de mIAutoescuela...\n');

  try {
    // 1. Crear autoescuelas
    console.log('📚 Creando autoescuelas...');
    const autoescuelasCreadas: any[] = [];

    for (const autoescuela of AUTOESCUELAS) {
      const { data: school, error } = await supabase
        .from('schools')
        .insert({
          id: randomUUID(),
          name: autoescuela.name,
          slug: autoescuela.slug,
          contact_email: autoescuela.contact_email,
          phone: autoescuela.phone,
          address: autoescuela.address,
          website: autoescuela.website,
          primary_color: autoescuela.primary_color,
          secondary_color: autoescuela.secondary_color,
          subscription_status: 'active',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log(`   ⚠️  ${autoescuela.name} - Slug "${autoescuela.slug}" ya existe, saltando...`);
        } else {
          console.error(`   ✗ Error creando ${autoescuela.name}:`, error.message);
        }
        continue;
      }

      if (school) {
        autoescuelasCreadas.push(school);
        console.log(`   ✓ ${autoescuela.name} (${autoescuela.city})`);
      }
    }

    if (autoescuelasCreadas.length === 0) {
      console.log('\n⚠️  No se crearon autoescuelas nuevas.');
      console.log('💡 Si ya existen autoescuelas, el script continuará con ellas.');

      // Obtener autoescuelas existentes
      const { data: autoescuelasExistentes } = await supabase
        .from('schools')
        .select('*')
        .limit(5);

      if (autoescuelasExistentes && autoescuelasExistentes.length > 0) {
        autoescuelasCreadas.push(...autoescuelasExistentes);
        console.log(`\n   ✓ Usando ${autoescuelasExistentes.length} autoescuelas existentes`);
      } else {
        console.log('\n❌ No hay autoescuelas para trabajar. El script se detendrá.');
        return;
      }
    }

    // 2. Crear usuarios, perfiles y miembros para cada autoescuela
    console.log('\n👥 Creando usuarios y miembros...');

    for (const school of autoescuelasCreadas) {
      const usuarios: any[] = [];

      // Crear 1 owner
      const owner = generarUsuario('owner', 0);
      usuarios.push(owner);

      // Crear 2 admins
      usuarios.push(generarUsuario('admin', 1));
      usuarios.push(generarUsuario('admin', 2));

      // Crear 15 estudiantes
      for (let i = 0; i < 15; i++) {
        usuarios.push(generarUsuario('student', i + 3));
      }

      // Insertar usuarios y perfiles
      for (const usuario of usuarios) {
        // Crear auth user (esto requiere service role)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: usuario.email,
          password: 'password123', // Contraseña provisional
          email_confirm: true,
          user_metadata: {
            full_name: usuario.nombre_completo,
          },
        });

        if (authError) {
          // Si el usuario ya existe, obtenerlo
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', usuario.email)
            .maybeSingle();

          if (existingUser) {
            // Añadir como miembro si no lo es ya
            const { data: existeMiembro } = await supabase
              .from('school_members')
              .select('*')
              .eq('school_id', school.id)
              .eq('user_id', existingUser.id)
              .maybeSingle();

            if (!existeMiembro) {
              await supabase.from('school_members').insert({
                school_id: school.id,
                user_id: existingUser.id,
                role: usuario.rol,
                status: 'active',
                joined_at: new Date().toISOString(),
              });
              console.log(`   + ${usuario.nombre_completo} (${usuario.rol}) - añadido a ${school.name}`);
            }
          }
          continue;
        }

        if (!authUser) continue;

        // Crear perfil
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authUser.id,
          email: usuario.email,
          full_name: usuario.nombre_completo,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('   ✗ Error creando perfil:', profileError.message);
          continue;
        }

        // Añadir como miembro de la escuela
        await supabase.from('school_members').insert({
          school_id: school.id,
          user_id: authUser.id,
          role: usuario.rol,
          status: 'active',
          joined_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 90 días
        });

        const emoji = usuario.rol === 'owner' ? '👑' : usuario.rol === 'admin' ? '🔑' : '📚';
        console.log(`   ${emoji} ${usuario.nombre_completo} (${usuario.rol}) - ${school.name}`);
      }

      // 3. Crear módulos y lecciones si no existen
      console.log(`\n   📖 Creando módulos para ${school.name}...`);
      const { data: modulosExistentes } = await supabase
        .from('modules')
        .select('*')
        .eq('school_id', school.id);

      if (!modulosExistentes || modulosExistentes.length === 0) {
        const modulos = generarModulos(school.id);

        for (const modulo of modulos) {
          // Insertar módulo
          const { data: moduloInsertado } = await supabase
            .from('modules')
            .insert({
              id: modulo.id,
              school_id: modulo.school_id,
              title: modulo.title,
              description: modulo.description,
              order_index: modulo.order_index,
              is_published: modulo.is_published,
            })
            .select()
            .single();

          if (moduloInsertado) {
            // Insertar lecciones
            for (const leccion of modulo.lessons) {
              await supabase.from('lessons').insert({
                id: leccion.id,
                module_id: modulo.id,
                title: leccion.title,
                order_index: leccion.order_index,
                is_published: leccion.is_published,
              });
            }

            console.log(`      + Módulo: ${modulo.title} (${modulo.lessons.length} lecciones)`);
          }
        }
      } else {
        console.log(`      ✓ ${modulosExistentes.length} módulos ya existen`);
      }

      // 4. Generar progreso aleatorio para estudiantes
      console.log(`\n   📊 Generando progreso de estudiantes...`);
      const { data: miembros } = await supabase
        .from('school_members')
        .select('user_id, role')
        .eq('school_id', school.id)
        .eq('role', 'student');

      const { data: todasLecciones } = await supabase
        .from('lessons')
        .select('id')
        .eq('school_id', school.id);

      if (miembros && todasLecciones && todasLecciones.length > 0) {
        for (const miembro of miembros) {
          // Verificar si ya tiene progreso
          const { data: progresoExistente } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', miembro.user_id)
            .limit(1);

          if (progresoExistente && progresoExistente.length > 0) {
            console.log(`      - ${miembro.user_id} ya tiene progreso, saltando`);
            continue;
          }

          // Cada estudiante completa entre 20% y 60% de las lecciones
          const numCompletadas = Math.floor(Math.random() * todasLecciones.length * 0.4) + Math.floor(todasLecciones.length * 0.2);

          // Seleccionar lecciones aleatorias para completar
          const leccionesCompletadas = todasLecciones
            .sort(() => Math.random() - 0.5)
            .slice(0, numCompletadas);

          for (const leccion of leccionesCompletadas) {
            await supabase.from('lesson_progress').insert({
              user_id: miembro.user_id,
              lesson_id: leccion.id,
              completed_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
        }
      }

      console.log(`      ✓ Progreso generado para estudiantes de ${school.name}`);
    }

    console.log('\n✨ Seed completado con éxito!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('   Email: cualquier email generado');
    console.log('   Password: password123');
    console.log('\n🔗 URLs de acceso:');
    for (const school of autoescuelasCreadas) {
      console.log(`   ${school.slug}.miautoescuela.com`);
    }

  } catch (error: any) {
    console.error('❌ Error durante el seed:', error?.message || error);
    process.exit(1);
  }
}

// Ejecutar seed
runSeed();
