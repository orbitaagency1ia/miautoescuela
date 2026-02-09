/**
 * Generate invite codes for schools where the user is NOT a member
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

  // The owner of terranovaai - we need to generate codes for OTHER schools
  const ownerUserId = 'd5af4e25-c2b4-4493-8b91-faf4e69a9246';

  const { data: ownerMemberships } = await supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', ownerUserId)
    .eq('role', 'owner');

  const ownerSchoolIds = new Set(ownerMemberships?.map(m => m.school_id) || []);

  console.log('\n🎟️  GENERANDO CÓDIGOS PARA ESCUELAS DONDE NO ERES MIEMBRO:\n');

  const codes = [];

  for (const school of schools || []) {
    if (!ownerSchoolIds.has(school.id)) {
      const code = nanoid(6).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newInvite } = await supabase
        .from('invites')
        .insert({
          school_id: school.id,
          email: code + '@code',
          role: 'student',
          token_hash: code,
          invited_by: 'system',
          expires_at: expiresAt.toISOString(),
        })
        .select('token_hash')
        .single();

      if (newInvite) {
        codes.push({ code: newInvite.token_hash, school: school.name });
        console.log(`   ✅ ${school.name}`);
        console.log(`      Código: ${newInvite.token_hash}`);
        console.log('');
      }
    }
  }

  console.log('\n📝 USA ESTOS CÓDIGOS PARA PROBAR (no eres miembro de estas escuelas):');
  console.log('\n'.repeat(2));
  codes.forEach((c, i) => {
    console.log(`   ${i + 1}. "${c.code}" -> ${c.school}`);
  });
  console.log('\n');
}

main().catch(console.error);
