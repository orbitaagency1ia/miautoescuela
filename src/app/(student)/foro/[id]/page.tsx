import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  const { id } = await params;

  // Get post with author info
  const { data: post } = await (supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      profiles (
        full_name
      )
    `)
    .eq('id', id)
    .single() as any);

  if (!post) {
    redirect('/foro');
  }

  // Get comments
  const { data: comments } = await (supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      profiles (
        full_name
      )
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true }) as any);

  async function addComment(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    const content = formData.get('content') as string;

    if (!content) {
      throw new Error('El comentario no puede estar vacío');
    }

    // Create comment
    const { error } = await (supabase
      .from('comments') as any)
      .insert({
        post_id: id,
        user_id: user.id,
        content,
      });

    if (error) {
      console.error('Error creating comment:', error);
      throw new Error('Error al añadir el comentario');
    }

    // Award activity points
    const { data: currentProfile } = await (supabase
      .from('profiles')
      .select('activity_points')
      .eq('user_id', user.id)
      .single() as any);

    await (supabase.from('profiles') as any)
      .update({
        activity_points: (currentProfile?.activity_points || 0) + 2
      })
      .eq('user_id', user.id);

    revalidatePath(`/foro/${id}`);
    revalidatePath('/ranking');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Button */}
      <Link href="/foro">
        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al foro
        </Button>
      </Link>

      {/* Post Card */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-500">
            Por {post.profiles?.full_name || 'Usuario'} •{' '}
            {format(new Date(post.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Comentarios ({comments?.length || 0})
        </h2>

        {/* Add Comment Form */}
        <form action={addComment} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="comment" className="sr-only">
                Añadir comentario
              </Label>
              <Input
                id="comment"
                name="content"
                placeholder="Escribe un comentario..."
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 font-semibold shadow-md">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {!comments || comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay comentarios todavía. ¡Sé el primero en comentar!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment: any) => (
              <div key={comment.id} className="pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {comment.profiles?.full_name || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
