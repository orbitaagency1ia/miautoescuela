/**
 * Generate an invite token - standalone script
 * Run with: npx tsx scripts/generate-invite-simple.ts <email>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

const envVars: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    envVars[match[1]] = match[2];
  }
}

// Generate random token
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateInvite(email: string) {
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL!,
    envVars.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the school
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (schoolError || !school) {
    console.error('Error finding school:', schoolError);
    process.exit(1);
  }

  console.log('School ID:', school.id);

  // Fix any invites with null school_id
  await supabase
    .from('invites')
    .update({ school_id: school.id })
    .is('school_id', null);

  // Delete existing invites for this email
  await supabase
    .from('invites')
    .delete()
    .eq('email', email);

  // Generate shorter token (40 chars) to avoid any URL truncation issues
  const token = Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Hash the token
  const tokenHash = await hashToken(token);

  // Calculate expiration (14 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  // Create invite
  const { error: inviteError } = await supabase
    .from('invites')
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

  const inviteLink = `${envVars.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitacion/${token}`;

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
  console.error('Usage: npx tsx scripts/generate-invite-simple.ts <email>');
  process.exit(1);
}

generateInvite(email);
