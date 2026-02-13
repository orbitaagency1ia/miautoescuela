import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Award, Download, Share2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CertificatesClient } from '@/components/certificates/CertificatesClient';

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle() as any);

  if (!membership) {
    redirect('/inicio');
  }

  // Get school details
  const { data: school } = await (supabase
    .from('schools')
    .select('id, name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Fetch certificates
  const { data: certificates } = await (supabase
    .from('certificates')
    .select(`
      id,
      certificate_number,
      student_name,
      course_name,
      completion_date,
      issued_at,
      pdf_url,
      schools (name, logo_url),
      modules (title)
    `)
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false }) as any);

  return (
    <CertificatesClient
      certificates={certificates || []}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    />
  );
}
