/**
 * Script para insertar datos de demostración en la base de datos
 * Ejecutar con: node scripts/insert-demo-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo data
const schools = [
  {
    id: 'school-demo-1',
    name: 'Autoescuela Madrid Centro',
    slug: 'madrid-centro',
    contact_email: 'info@madridcentro.com',
    phone: '+34 910 123 456',
    address: 'Calle Gran Vía, 45, Madrid',
    website: 'https://madridcentro.com',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-2',
    name: 'Autoescuela Barcelona',
    slug: 'barcelona',
    contact_email: 'contacto@autoescuelabcn.com',
    phone: '+34 933 456 789',
    address: 'Avinguda Diagonal, 123, Barcelona',
    website: 'https://autoescuelabcn.com',
    primary_color: '#8B5CF6',
    secondary_color: '#6D28D9',
    subscription_status: 'trialing',
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-3',
    name: 'Autoescuela Valencia',
    slug: 'valencia',
    contact_email: 'info@valenciadriving.com',
    phone: '+34 963 789 012',
    address: 'Calle Colón, 78, Valencia',
    website: 'https://valenciadriving.com',
    primary_color: '#10B981',
    secondary_color: '#059669',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-4',
    name: 'Autoescuela Sevilla',
    slug: 'sevilla',
    contact_email: 'sevilla@drivingschool.es',
    phone: '+34 954 321 098',
    address: 'Avenida de la Constitución, 15, Sevilla',
    website: 'https://sevilladriving.com',
    primary_color: '#F59E0B',
    secondary_color: '#D97706',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-5',
    name: 'Autoescuela Bilbao',
    slug: 'bilbao',
    contact_email: 'bilbao@driving.es',
    phone: '+34 944 567 890',
    address: 'Gran Vía de Don Diego López de Haro, 32, Bilbao',
    website: 'https://bilbaodriving.com',
    primary_color: '#EF4444',
    secondary_color: '#DC2626',
    subscription_status: 'past_due',
    trial_ends_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const profiles = [
  // Owners
  { id: 'profile-owner-1', full_name: 'Juan Pérez (Owner Madrid)', email: 'juan.madrid@example.com', phone: '+34 600 100 001' },
  { id: 'profile-owner-2', full_name: 'María González (Owner Barcelona)', email: 'maria.bcn@example.com', phone: '+34 600 100 002' },
  { id: 'profile-owner-3', full_name: 'Luis Herrera (Owner Valencia)', email: 'luis.valencia@example.com', phone: '+34 600 100 003' },
  { id: 'profile-owner-4', full_name: 'Carmen Ortiz (Owner Sevilla)', email: 'carmen.sevilla@example.com', phone: '+34 600 100 004' },
  { id: 'profile-owner-5', full_name: 'Pedro Castillo (Owner Bilbao)', email: 'pedro.bilbao@example.com', phone: '+34 600 100 005' },
  // Students
  { id: 'profile-student-1', full_name: 'María García López', email: 'maria.garcia@example.com', phone: '+34 611 111 111' },
  { id: 'profile-student-2', full_name: 'Carlos Rodríguez Martínez', email: 'carlos.rodriguez@example.com', phone: '+34 622 222 222' },
  { id: 'profile-student-3', full_name: 'Ana Fernández Sánchez', email: 'ana.fernandez@example.com', phone: '+34 633 333 333' },
  { id: 'profile-student-4', full_name: 'Pedro Jiménez Castro', email: 'pedro.jimenez@example.com', phone: '+34 644 444 444' },
  { id: 'profile-student-5', full_name: 'Laura Morales Ruiz', email: 'laura.morales@example.com', phone: '+34 655 555 555' },
  { id: 'profile-student-6', full_name: 'Miguel Ángel Torres', email: 'miguel.torres@example.com', phone: '+34 666 666 666' },
  { id: 'profile-student-7', full_name: 'Carmen Romero Gil', email: 'carmen.romero@example.com', phone: '+34 677 777 777' },
  { id: 'profile-student-8', full_name: 'José Luis Navas', email: 'jose.navas@example.com', phone: '+34 688 888 888' },
  { id: 'profile-student-9', full_name: 'Isabel Herrera Moreno', email: 'isabel.herrera@example.com', phone: '+34 699 999 999' },
  { id: 'profile-student-10', full_name: 'Francisco Javier Paredes', email: 'francisco.paredes@example.com', phone: '+34 600 000 001' },
  { id: 'profile-student-11', full_name: 'Lucía Díaz Costa', email: 'lucia.diaz@example.com', phone: '+34 600 000 002' },
  { id: 'profile-student-12', full_name: 'Roberto Blanco Iglesias', email: 'roberto.blanco@example.com', phone: '+34 600 000 003' },
  { id: 'profile-student-13', full_name: 'Elena Núñez Vargas', email: 'elena.nunez@example.com', phone: '+34 600 000 004' },
  { id: 'profile-student-14', full_name: 'Diego Ramos Soto', email: 'diego.ramos@example.com', phone: '+34 600 000 005' },
  { id: 'profile-student-15', full_name: 'Sara Flores Ortiz', email: 'sara.flores@example.com', phone: '+34 600 000 006' },
];

const schoolMembers = [
  // Madrid - 5 students + 1 owner
  { school_id: 'school-demo-1', user_id: 'profile-owner-1', role: 'owner', status: 'active' },
  { school_id: 'school-demo-1', user_id: 'profile-student-1', role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: 'profile-student-2', role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: 'profile-student-3', role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: 'profile-student-4', role: 'student', status: 'suspended' },
  { school_id: 'school-demo-1', user_id: 'profile-student-5', role: 'student', status: 'active' },
  // Barcelona - 4 students + 1 owner
  { school_id: 'school-demo-2', user_id: 'profile-owner-2', role: 'owner', status: 'active' },
  { school_id: 'school-demo-2', user_id: 'profile-student-6', role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: 'profile-student-7', role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: 'profile-student-8', role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: 'profile-student-9', role: 'student', status: 'active' },
  // Valencia - 6 students + 1 owner
  { school_id: 'school-demo-3', user_id: 'profile-owner-3', role: 'owner', status: 'active' },
  { school_id: 'school-demo-3', user_id: 'profile-student-10', role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: 'profile-student-11', role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: 'profile-student-12', role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: 'profile-student-13', role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: 'profile-student-14', role: 'student', status: 'suspended' },
  { school_id: 'school-demo-3', user_id: 'profile-student-15', role: 'student', status: 'active' },
  // Sevilla - 2 students + 1 owner
  { school_id: 'school-demo-4', user_id: 'profile-owner-4', role: 'owner', status: 'active' },
  { school_id: 'school-demo-4', user_id: 'profile-student-1', role: 'student', status: 'active' },
  { school_id: 'school-demo-4', user_id: 'profile-student-6', role: 'student', status: 'active' },
  // Bilbao - 1 student + 1 owner
  { school_id: 'school-demo-5', user_id: 'profile-owner-5', role: 'owner', status: 'active' },
  { school_id: 'school-demo-5', user_id: 'profile-student-2', role: 'student', status: 'suspended' },
];

async function insertDemoData() {
  console.log('🚀 Insertando datos de demostración...\n');

  // Insert schools
  console.log('📚 Insertando autoescuelas...');
  for (const school of schools) {
    const { error } = await supabase.from('schools').upsert(school, { onConflict: 'id' });
    if (error) console.error(`  ❌ Error inserting ${school.name}:`, error.message);
    else console.log(`  ✅ ${school.name}`);
  }

  // Insert profiles
  console.log('\n👤 Insertando perfiles...');
  for (const profile of profiles) {
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
    if (error && error.code !== '23505') console.error(`  ❌ Error inserting ${profile.full_name}:`, error.message);
  }
  console.log(`  ✅ ${profiles.length} perfiles insertados`);

  // Insert school_members
  console.log('\n🔗 Vinculando miembros a escuelas...');
  for (const member of schoolMembers) {
    const { error } = await supabase.from('school_members').upsert(member, { onConflict: 'school_id,user_id' });
    if (error && error.code !== '23505') console.error(`  ❌ Error linking member:`, error.message);
  }
  console.log(`  ✅ ${schoolMembers.length} miembros vinculados`);

  // Verify data
  console.log('\n📊 Verificando datos...\n');

  const { data: schoolsData } = await supabase.from('schools').select('id, name');
  console.log(`Autoescuelas totales: ${schoolsData?.length || 0}`);

  const { data: membersData } = await supabase.from('school_members').select('school_id, role');
  console.log(`Miembros totales: ${membersData?.length || 0}`);

  const { data: studentsCount } = await supabase
    .from('school_members')
    .select('school_id', { count: 'exact', head: true })
    .eq('role', 'student');
  console.log(`Estudiantes totales: ${studentsCount || 0}`);

  console.log('\n✨ ¡Datos de demostración insertados correctamente!');
  console.log('\n📝 IDs de autoescuelas para probar:');
  schools.forEach((s) => console.log(`  - ${s.id}: ${s.name}`));
}

insertDemoData().catch(console.error);
