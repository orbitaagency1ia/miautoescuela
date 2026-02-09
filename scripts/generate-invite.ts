/**
 * Generate an invite token
 * Run with: npx tsx scripts/generate-invite.ts <email>
 */

import { createServiceClient } from '../src/lib/supabase/server';
import { generateToken, hashToken } from '../src/lib/utils';

async function generateInvite(email: string) {
  const supabase = await createServiceClient();

  // Get the school
  const { data: school } = await (supabase
    .from('schools')
    .select('id')
    .limit(1)
    .single() as any);

  if (!school) {
    console.error('No school found');
    process.exit(1);
  }

  console.log('School ID:', school.id);

  // Generate secure token
  const token = generateToken();
  const tokenHash = await hashToken(token);

  // Calculate expiration (14 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  // Delete existing invites for this email
  await (supabase
    .from('invites')
    .delete()
    .eq('email', email) as any);

  // Create invite
  const { error: inviteError } = await (supabase
    .from('invites') as any)
    .insert({
      school_id: school.id,
      email,
      role: 'student',
      token_hash: tokenHash,
      invited_by: 'temp-admin',
      expires_at: expiresAt.toISOString(),
    });

  if (inviteError) {
    console.error('Error creating invite:', inviteError);
    process.exit(1);
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitacion/${token}`;

  console.log('\n=== INVITE CREATED ===');
  console.log('Email:', email);
  console.log('Token:', token);
  console.log('Token Hash:', tokenHash);
  console.log('Invite Link:', inviteLink);
  console.log('====================\n');
}

// Get email from command line
const email = process.argv[2];

if (!email || !email.includes('@')) {
  console.error('Usage: npx tsx scripts/generate-invite.ts <email>');
  process.exit(1);
}

generateInvite(email);
