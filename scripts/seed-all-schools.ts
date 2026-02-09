import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Datos ficticios realistas para autoescuelas
const moduleTemplates = [
  {
    title: 'Señales de Tráfico',
    description: 'Aprende a identificar y interpretar todas las señales de tráfico que encontrarás en las carreteras. Desde señales de prohibición hasta las de indicación, dominarás su significado y aplicación.',
    lessons: [
      { title: 'Señales de Prohibición', description: 'Aprende qué no puedes hacer' },
      { title: 'Señales de Obligación', description: 'Normas que debes cumplir obligatoriamente' },
      { title: 'Señales de Advertencia de Peligro', description: 'Precauciones para tu seguridad' },
      { title: 'Señales de Indicación', description: 'Información útil para el conductor' },
      { title: 'Señales Verticales', description: 'Señalización en carreteras convencionales' },
    ],
  },
  {
    title: 'Normas de Circulación',
    description: 'Conoce las reglas fundamentales que todo conductor debe respetar. Velocidad, distancias, adelantamientos y prioridades serán tus aliados en la carretera.',
    lessons: [
      { title: 'Velocidad y Distancias', description: 'Límites de velocidad y distancias de seguridad' },
      { title: 'Adelantamientos', description: 'Cuándo y cómo adelantar correctamente' },
      { title: 'Prioridad de Paso', description: 'Intersecciones y rotondas' },
      { title: 'Cambio de Sentido', description: 'Giros y cambios de dirección' },
      { title: 'Paradas y Estacionamientos', description: 'Dónde y cómo aparcar' },
    ],
  },
  {
    title: 'Maniobras Básicas',
    description: 'Domina las maniobras esenciales para conducir con seguridad. Desde arrancar el coche hasta estacionar en espacios reducidos.',
    lessons: [
      { title: 'Arranque y Puesta en Marcha', description: 'Los primeros pasos al volante' },
      { title: 'Control del Volante', description: 'Técnica de conducción fluida' },
      { title: 'Marcha Atrás y Aparcamiento', description: 'Estacionar sin estrés' },
      { title: 'Giro y Cambio de Carril', description: 'Movimientos laterales con seguridad' },
      { title: 'Remolque y Maniobras Especiales', description: 'Situaciones complejas' },
    ],
  },
  {
    title: 'Conducción en Ciudad',
    description: 'Aprende a navegar por el tráfico urbano con confianza. Semáforos, rotondas, peatones y ciclistas serán parte de tu entorno diario.',
    lessons: [
      { title: 'Semáforos y Cruces', description: 'Interpretación de semáforos' },
      { title: 'Rotondas y Glorietas', description: 'Cómo circular en rotondas' },
      { title: 'Zonas Peatonales', description: 'Respeto al peatón' },
      { title: 'Carriles Bus y Taxi', description: 'Carriles reservados' },
      { title: 'Tráfico Denso', description: 'Conducir en hora punta' },
    ],
  },
  {
    title: 'Carretera y Autovía',
    description: 'La conducción en vías rápidas requiere técnicas especiales. Adelantamientos, incorporaciones y salidas son fundamentales.',
    lessons: [
      { title: 'Incorporación a la Autovía', description: 'Entrar con seguridad' },
      { title: 'Velocidad en Vías Rápidas', description: 'Adecuar la velocidad' },
      { title: 'Adelantamientos en Autovía', description: 'Maniobras de adelantamiento' },
      { title: 'Carriles de Circulación', description: 'Elección del carril correcto' },
      { title: 'Salidas y Desvíos', description: 'Abandonar la vía correctamente' },
    ],
  },
  {
    title: 'Condiciones Meteorológicas',
    description: 'Lluvia, nieve, hielo o niebla pueden cambiar las reglas del juego. Aprende a adaptar tu conducción a cualquier situación climática.',
    lessons: [
      { title: 'Conducción con Lluvia', description: 'Aquaplaning y visibilidad reducida' },
      { title: 'Conducción con Nieve', description: 'Tracción y control en nieve' },
      { title: 'Hielo y Heladas', description: 'Pavimento resbaladizo' },
      { title: 'Niebla y Visibilidad Reducida', description: 'Luces y precauciones' },
      { title: 'Viento Fuerte', description: 'Estabilidad lateral del vehículo' },
    ],
  },
  {
    title: 'Mecánica Básica',
    description: 'Conocer los fundamentos de tu vehículo te ahorrará problemas y dinero. Mantenimiento básico y averías simples están al alcance de todos.',
    lessons: [
      { title: 'Niveles de Fluidos', description: 'Aceite, agua, refrigerante' },
      { title: 'Sistema de Frenos', description: 'Pastillas y discos' },
      { title: 'Neumáticos y Presiones', description: 'Cuidado de los neumáticos' },
      { title: 'Batería y Electricidad', description: 'Fundamentos eléctricos' },
      { title: 'Mantenimiento Preventivo', description: 'Revisión periódica' },
    ],
  },
];

const studentNames = [
  { full_name: 'María García López', email_prefix: 'maria.garcia' },
  { full_name: 'Carlos Rodríguez Martínez', email_prefix: 'carlos.rodriguez' },
  { full_name: 'Ana Fernández Sánchez', email_prefix: 'ana.fernandez' },
  { full_name: 'Miguel Ángel Torres Ruiz', email_prefix: 'miguel.torres' },
  { full_name: 'Laura Díaz Martín', email_prefix: 'laura.diaz' },
  { full_name: 'David Moreno Jiménez', email_prefix: 'david.moreno' },
  { full_name: 'Carmen Castro Ramos', email_prefix: 'carmen.castro' },
  { full_name: 'José Luis Ortiz Vargas', email_prefix: 'jose.ortiz' },
  { full_name: 'Isabel Flores Herrera', email_prefix: 'isabel.flores' },
  { full_name: 'Rafael Méndez Castillo', email_prefix: 'rafael.mendez' },
];

async function createTestStudent(schoolId: string, schoolName: string, index: number) {
  const student = studentNames[index % studentNames.length];
  const email = `${student.email_prefix}.${Date.now()}@${schoolName.toLowerCase().replace(/\s+/g, '')}.com`;
  const password = 'Password123!';

  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: student.full_name,
      phone: '+34 600' + String(Math.floor(Math.random() * 900000) + 100000),
    },
  });

  if (authError) {
    console.log('  ⚠️  Error creando usuario:', authError.message);
    return null;
  }

  const userId = authData.user.id;

  // Crear perfil
  await supabase.from('profiles').insert({
    id: userId,
    user_id: userId,
    full_name: student.full_name,
    phone: null,
    activity_points: Math.floor(Math.random() * 200),
  });

  // Añadir a la escuela como student
  await supabase.from('school_members').insert({
    school_id: schoolId,
    user_id: userId,
    role: 'student',
    status: 'active',
  });

  // Marcar algunas lecciones como completadas aleatoriamente
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('school_id', schoolId)
    .limit(20);

  if (lessons && lessons.length > 0) {
    const completedCount = Math.floor(Math.random() * lessons.length * 0.4); // 0-40% completadas
    const shuffledLessons = lessons.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(completedCount, shuffledLessons.length); i++) {
      await supabase.from('lesson_progress').insert({
        user_id: userId,
        lesson_id: shuffledLessons[i].id,
      });
    }
  }

  return { email, password, student: student.full_name };
}

async function seedSchool(schoolId: string, schoolName: string) {
  console.log(`\n🏫 Procesando: ${schoolName}`);
  console.log('─'.repeat(50));

  // 1. Crear módulos con sus lecciones
  console.log('📚 Creando módulos y lecciones...');
  let totalLessons = 0;

  for (let i = 0; i < moduleTemplates.length; i++) {
    const moduleTemplate = moduleTemplates[i];

    // Verificar si el módulo ya existe
    const { data: existingModule } = await supabase
      .from('modules')
      .select('id')
      .eq('school_id', schoolId)
      .eq('title', moduleTemplate.title)
      .maybeSingle();

    let moduleId;

    if (existingModule) {
      moduleId = existingModule.id;
      console.log(`  ✓ Módulo "${moduleTemplate.title}" ya existe`);
    } else {
      const { data: newModule } = await supabase
        .from('modules')
        .insert({
          school_id: schoolId,
          title: moduleTemplate.title,
          description: moduleTemplate.description,
          order_index: i,
          is_published: true,
        })
        .select('id')
        .single();

      if (!newModule) {
        console.log(`  ⚠️  Error creando módulo "${moduleTemplate.title}"`);
        continue;
      }

      moduleId = newModule.id;
      console.log(`  ✓ Módulo "${moduleTemplate.title}" creado`);
    }

    // Crear lecciones del módulo
    for (let j = 0; j < moduleTemplate.lessons.length; j++) {
      const lessonTemplate = moduleTemplate.lessons[j];

      // Verificar si la lección ya existe
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('school_id', schoolId)
        .eq('module_id', moduleId)
        .eq('title', lessonTemplate.title)
        .maybeSingle();

      if (!existingLesson) {
        await supabase.from('lessons').insert({
          school_id: schoolId,
          module_id: moduleId,
          title: lessonTemplate.title,
          description: lessonTemplate.description,
          video_path: null,
          order_index: j,
          is_published: true,
        });
        totalLessons++;
      }
    }
  }

  console.log(`  ✅ ${totalLessons} nuevas lecciones creadas`);

  // 2. Crear alumnos ficticios
  console.log('👥 Creando alumnos de prueba...');
  const numStudents = 5 + Math.floor(Math.random() * 6); // 5-10 alumnos
  const createdStudents = [];

  for (let i = 0; i < numStudents; i++) {
    const student = await createTestStudent(schoolId, schoolName, i);
    if (student) {
      createdStudents.push(student);
    }
  }

  console.log(`  ✅ ${createdStudents.length} alumnos creados`);

  return createdStudents;
}

async function main() {
  console.log('🚀 Iniciando seed de datos para todas las autoescuelas...\n');

  // Obtener todas las escuelas
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name')
    .order('created_at', { ascending: true });

  if (schoolsError) {
    console.error('❌ Error obteniendo escuelas:', schoolsError.message);
    return;
  }

  if (!schools || schools.length === 0) {
    console.log('❌ No hay autoescuelas creadas');
    return;
  }

  console.log(`📋 Found ${schools.length} escuelas`);

  // Procesar cada escuela
  const allCredentials = [];

  for (const school of schools) {
    const students = await seedSchool(school.id, school.name);
    allCredentials.push({
      school: school.name,
      students: students,
    });
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATOS DE PRUEBA CREADOS');
  console.log('='.repeat(60));

  allCredentials.forEach(({ school, students }) => {
    console.log(`\n🏫 ${school}:`);
    console.log(`   Alumnos creados: ${students.length}`);
    console.log(`   Credenciales de prueba:`);
    students.slice(0, 3).forEach((s: any) => {
      console.log(`   - Email: ${s.email}`);
      console.log(`     Password: ${s.password}`);
      console.log(`     Nombre: ${s.student}`);
    });
    if (students.length > 3) {
      console.log(`   ... y ${students.length - 3} más`);
    }
  });

  console.log('\n💡 Ahora puedes iniciar sesión con cualquier de estos usuarios para ver la plataforma como alumno.');
  console.log('💡 Los alumnos tienen progreso aleatorio para que parezca real.');
}

main().catch(console.error);
