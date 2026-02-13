import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Sparkles, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { simpleLogoutAction } from '@/actions/auth';
import SetupWizard from '@/components/setup/SetupWizard';

export default async function SetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Check if THIS USER has an active school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select(`
      *,
      schools (
        id,
        name,
        primary_color
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as any);

  // If user already has a school, redirect to their dashboard
  if (membership && membership.schools) {
    if (membership.role === 'admin') {
      redirect('/admin');
    } else if (membership.role === 'owner') {
      redirect('/panel');
    } else if (membership.role === 'student') {
      redirect('/inicio');
    }
  }

  // User doesn't have a school - let them create one
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl gradient-primary">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Crea tu Autoescuela</CardTitle>
          <CardDescription>
            Configura tu autoescuela personalizada para empezar a usar mIAutoescuela
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Cuenta verificada ✓</p>
              </div>
            </div>
          </div>

          <SetupWizard userId={user.id} userEmail={user.email!} />

          <div className="text-sm text-muted-foreground">
            ¿Ya tienes una autoescuela?{' '}
            <a href="/iniciar-sesion" className="text-primary hover:underline font-medium">
              Inicia sesión con otra cuenta
            </a>
          </div>

          <div className="pt-4 border-t">
            <form action={simpleLogoutAction}>
              <Button variant="ghost" size="sm" className="w-full" type="submit">
                Cancelar y volver al inicio
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
