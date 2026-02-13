import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Users, BookOpen, Award, Clock, BarChart3 } from 'lucide-react';
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('role', 'owner')
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

  return (
    <AnalyticsClient
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      schoolName={school?.name || 'Tu Autoescuela'}
    />
  );
}
