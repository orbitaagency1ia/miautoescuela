/**
 * Debug script to check schools, owners, and generate test invite
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  // Get all schools
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name')
    .order('created_at', { ascending: true });

  console.log('\n📋 ESCUELAS DISPONIBLES:');
  schools?.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} (ID: ${s.id})`);
  });

  // Get all memberships to see who belongs to what
  const { data: memberships } = await supabase
    .from('school_members')
    .select('user_id, school_id, role, status');

  console.log('\n👥 MIEMBROS POR ESCUELA:');

  for (const school of schools || []) {
    const schoolMembers = memberships?.filter(m => m.school_id === school.id && m.status === 'active');
    console.log(`\n   🏫 ${school.name}:`);

    const owners = schoolMembers?.filter(m => m.role === 'owner') || [];
    const admins = schoolMembers?.filter(m => m.role === 'admin') || [];
    const students = schoolMembers?.filter(m => m.role === 'student') || [];

    if (owners.length > 0) {
      console.log(`      👑 Owners: ${owners.length} (User IDs: ${owners.map(o => o.user_id.substring(0, 8)).join(', ')}...)`);
    }
    if (admins.length > 0) {
      console.log(`      🔧 Admins: ${admins.length}`);
    }
    if (students.length > 0) {
      console.log(`      📚 Students: ${students.length}`);
    }
  }

  // Get all active invites
  const { data: invites } = await supabase
    .from('invites')
    .select('token_hash, school_id, role, used_at, expires_at')
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString());

  console.log('\n🎟️  CÓDIGOS DE INVITACIÓN ACTIVOS:');

  if (invites && invites.length > 0) {
    for (const invite of invites) {
      const school = schools?.find(s => s.id === invite.school_id);
      console.log(`   Código: ${invite.token_hash}`);
      console.log(`   Escuela: ${school?.name || 'Unknown'}`);
      console.log(`   Rol: ${invite.role}`);
      console.log(`   Expira: ${new Date(invite.expires_at).toLocaleDateString()}`);
      console.log('');
    }
  } else {
    console.log('   ❌ No hay códigos activos. Generando uno nuevo...');

    // Generate new invite for the second school (or first if only one exists)
    const targetSchool = schools && schools.length > 1 ? schools[1] : schools?.[0];

    if (targetSchool) {
      const code = nanoid(6).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newInvite } = await supabase
        .from('invites')
        .insert({
          school_id: targetSchool.id,
          email: code + '@code',
          role: 'student',
          token_hash: code,
          invited_by: 'system',
          expires_at: expiresAt.toISOString(),
        })
        .select('token_hash')
        .single();

      console.log(`\n   ✅ NUEVO CÓDIGO GENERADO:`);
      console.log(`   🎟️  Código: ${newInvite?.token_hash}`);
      console.log(`   🏫 Escuela: ${targetSchool.name}`);
      console.log(`   🔗 Usa este código para unirte a ${targetSchool.name}`);
    }
  }

  console.log('\n📝 INSTRUCCIONES:');
  console.log('   1. Si eres OWNER de una escuela, NO puedes unirte a tu propia escuela');
  console.log('   2. Para probar, crea un NUEVO usuario o usa el código de una escuela diferente');
  console.log('   3. Ve a /elegir-destino?force=true para ver la página aunque tengas escuela');
  console.log('   4. Usa el código de invitación de una escuela donde NO seas miembro\n');
}

main().catch(console.error);
