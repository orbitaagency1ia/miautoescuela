import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function NewPostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  async function createPost(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    // Get school_id
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as any);

    if (!membership) {
      throw new Error('No tienes acceso a ninguna autoescuela');
    }

    const title = formData.get('title') as string;
    const body = formData.get('content') as string;

    if (!title || !body) {
      throw new Error('El título y el contenido son obligatorios');
    }

    // Create post
    const { error } = await (supabase
      .from('posts') as any)
      .insert({
        author_id: user.id,
        school_id: membership.school_id,
        title,
        body,
        is_pinned: false,
        is_locked: false,
      });

    if (error) {
      console.error('Error creating post:', error);
      throw new Error(`Error al crear la publicación: ${error.message || 'Error desconocido'}`);
    }

    // Award activity points for creating post (+5 points)
    const { data: currentProfile } = await (supabase
      .from('profiles')
      .select('activity_points')
      .eq('user_id', user.id)
      .single() as any);

    await (supabase.from('profiles') as any)
      .update({
        activity_points: (currentProfile?.activity_points || 0) + 5
      })
      .eq('user_id', user.id);

    revalidatePath('/foro');
    revalidatePath('/ranking');
    redirect('/foro');
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/foro">
          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Nueva Publicación</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Crear Pregunta</h1>
          <p className="text-slate-500 mt-1">
            Comparte una duda o pregunta con tus compañeros
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <form action={createPost} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
              Título *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: ¿Cómo practicar el cambio de carril?"
              className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
              Contenido *
            </Label>
            <textarea
              id="content"
              name="content"
              className="flex w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 min-h-[200px] transition-all duration-200"
              placeholder="Describe tu duda o pregunta con detalle..."
              required
            />
          </div>

          {/* Tip Box */}
          <div className="bg-purple-50 rounded-xl p-4 flex gap-3">
            <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">Consejo</p>
              <p className="text-sm text-purple-700">
                Sé específico con tu pregunta para que tus compañeros puedan ayudarte mejor.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Publicar
            </Button>
            <Link href="/foro" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 font-semibold">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
