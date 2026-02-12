/**
 * Script corregido para insertar datos de demostración
 * Ejecutar con: node scripts/insert-demo-data-fixed.js
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

// Demo data - matching the actual schema
const schools = [
  {
    id: 'school-demo-1',
    name: 'Autoescuela Madrid Centro',
    slug: 'madrid-centro',
    contact_email: 'info@madridcentro.com',
    phone: '+34 910 123 456',
    primary_color: '#3B82F6',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-2',
    name: 'Autoescuela Barcelona',
    slug: 'barcelona',
    contact_email: 'contacto@autoescuelabcn.com',
    phone: '+34 933 456 789',
    primary_color: '#8B5CF6',
    subscription_status: 'trialing',
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-3',
    name: 'Autoescuela Valencia',
    slug: 'valencia',
    contact_email: 'info@valenciadriving.com',
    phone: '+34 963 789 012',
    primary_color: '#10B981',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-4',
    name: 'Autoescuela Sevilla',
    slug: 'sevilla',
    contact_email: 'sevilla@drivingschool.es',
    phone: '+34 954 321 098',
    primary_color: '#F59E0B',
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-demo-5',
    name: 'Autoescuela Bilbao',
    slug: 'bilbao',
    contact_email: 'bilbao@driving.es',
    phone: '+34 944 567 890',
    primary_color: '#EF4444',
    subscription_status: 'past_due',
    trial_ends_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// These are mock user IDs - they must exist in auth.users for the foreign key to work
// For demo purposes, we'll use the structure but skip actual profile insertion
// since profiles require valid auth.users IDs
const mockUserIds = [
  'user-mock-001', 'user-mock-002', 'user-mock-003', 'user-mock-004', 'user-mock-005',
  'user-mock-006', 'user-mock-007', 'user-mock-008', 'user-mock-009', 'user-mock-010',
  'user-mock-011', 'user-mock-012', 'user-mock-013', 'user-mock-014', 'user-mock-015',
  'user-mock-016', 'user-mock-017', 'user-mock-018', 'user-mock-019', 'user-mock-020',
];

const schoolMembers = [
  // Madrid - 5 students + 1 owner
  { school_id: 'school-demo-1', user_id: mockUserIds[0], role: 'owner', status: 'active' },
  { school_id: 'school-demo-1', user_id: mockUserIds[1], role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: mockUserIds[2], role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: mockUserIds[3], role: 'student', status: 'active' },
  { school_id: 'school-demo-1', user_id: mockUserIds[4], role: 'student', status: 'suspended' },
  { school_id: 'school-demo-1', user_id: mockUserIds[5], role: 'student', status: 'active' },
  // Barcelona - 4 students + 1 owner
  { school_id: 'school-demo-2', user_id: mockUserIds[6], role: 'owner', status: 'active' },
  { school_id: 'school-demo-2', user_id: mockUserIds[7], role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: mockUserIds[8], role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: mockUserIds[9], role: 'student', status: 'active' },
  { school_id: 'school-demo-2', user_id: mockUserIds[10], role: 'student', status: 'active' },
  // Valencia - 6 students + 1 owner
  { school_id: 'school-demo-3', user_id: mockUserIds[11], role: 'owner', status: 'active' },
  { school_id: 'school-demo-3', user_id: mockUserIds[12], role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: mockUserIds[13], role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: mockUserIds[14], role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: mockUserIds[15], role: 'student', status: 'active' },
  { school_id: 'school-demo-3', user_id: mockUserIds[16], role: 'student', status: 'suspended' },
  { school_id: 'school-demo-3', user_id: mockUserIds[17], role: 'student', status: 'active' },
  // Sevilla - 2 students + 1 owner
  { school_id: 'school-demo-4', user_id: mockUserIds[18], role: 'owner', status: 'active' },
  { school_id: 'school-demo-4', user_id: mockUserIds[1], role: 'student', status: 'active' },
  { school_id: 'school-demo-4', user_id: mockUserIds[7], role: 'student', status: 'active' },
  // Bilbao - 1 student + 1 owner
  { school_id: 'school-demo-5', user_id: mockUserIds[19], role: 'owner', status: 'active' },
  { school_id: 'school-demo-5', user_id: mockUserIds[2], role: 'student', status: 'suspended' },
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

  console.log('\n⚠️  NOTA: Los perfiles de usuario requieren usuarios válidos en auth.users');
  console.log('   Para demo real, crea usuarios a través del flujo de registro\n');

  console.log('\n🔗 Intentando vincular miembros a escuelas...');
  let successCount = 0;
  for (const member of schoolMembers) {
    const { error } = await supabase.from('school_members').insert(member);
    if (error) {
      if (error.code === '23503') {
        // Foreign key violation - user doesn't exist in auth.users
        // This is expected for demo data
      } else {
        console.error(`  ❌ Error linking member:`, error.message);
      }
    } else {
      successCount++;
    }
  }
  console.log(`  ✅ ${successCount} miembros vinculados (se esperaban fallos FK para demo)`);

  // Verify data
  console.log('\n📊 Verificando datos...\n');

  const { data: schoolsData } = await supabase.from('schools').select('id, name, subscription_status');
  console.log(`Autoescuelas totales: ${schoolsData?.length || 0}`);
  schoolsData?.forEach(s => console.log(`  - ${s.id}: ${s.name} (${s.subscription_status})`));

  const { data: membersData } = await supabase.from('school_members').select('school_id, role');
  const studentsCount = membersData?.filter(m => m.role === 'student').length || 0;
  console.log(`\nMiembros totales: ${membersData?.length || 0}`);
  console.log(`Estudiantes totales: ${studentsCount}`);

  console.log('\n✨ ¡Datos insertados correctamente!');
  console.log('\n💡 Para probar con usuarios reales:');
  console.log('   1. Regístrate nuevos usuarios');
  console.log('   2. Invítalos a las autoescuelas usando el panel de admin');
  console.log('   3. O usa la función de invitación por código');
}

insertDemoData().catch(console.error);
