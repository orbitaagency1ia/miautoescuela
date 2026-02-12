import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, Send, Sparkles, Lock, Pin, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  // Get school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  if (!membership) {
    redirect('/elegir-destino');
  }

  // Get post with author_id
  const { data: post } = await (supabase
    .from('posts')
    .select(`
      id,
      title,
      body,
      is_pinned,
      is_locked,
      created_at,
      author_id
    `)
    .eq('id', id)
    .single() as any);

  if (!post) {
    redirect('/foro');
  }

  // Get post author profile
  const { data: postAuthor } = await (supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', post.author_id)
    .maybeSingle() as any);

  // Get comments
  const { data: commentsData } = await (supabase
    .from('comments')
    .select(`
      id,
      body,
      created_at,
      author_id
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true }) as any);

  // Get comment authors
  const commentAuthorIds = commentsData?.map((c: any) => c.author_id) || [];
  const { data: commentAuthors } = await (supabase
    .from('profiles')
    .select('user_id, full_name, email')
    .in('user_id', commentAuthorIds) as any);

  const authorsMap = new Map(
    commentAuthors?.map((a: any) => [a.user_id, a]) || []
  );

  const comments = (commentsData || []).map((comment: any) => ({
    ...comment,
    author: authorsMap.get(comment.author_id) || null,
  }));

  const postWithAuthor = {
    ...post,
    author: postAuthor,
  };

  async function addComment(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    // Get school membership
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as any);

    if (!membership) {
      throw new Error('No tienes acceso a ninguna autoescuela');
    }

    const content = formData.get('content') as string;

    if (!content || content.trim().length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }

    // Create comment
    const { error } = await (supabase
      .from('comments') as any)
      .insert({
        post_id: id,
        author_id: user.id,
        body: content.trim(),
      });

    if (error) {
      console.error('Error creating comment:', error);
      throw new Error('Error al añadir el comentario');
    }

    // Award activity points for commenting (+2 points)
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

    revalidatePath('/foro');
    revalidatePath('/ranking');
    revalidatePath(`/foro/${id}`);
    redirect(`/foro/${id}`);
  }

  const currentUserInitials = user.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-5">
      {/* Premium Header with Back Button */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 border border-purple-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-5">
            <Link href="/foro">
              <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/50 text-purple-700 font-semibold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al foro
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-purple-700 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              Discusión
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {postWithAuthor.is_pinned && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                <Pin className="h-4 w-4" />
                Fijado
              </div>
            )}
            {postWithAuthor.is_locked && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold">
                <Lock className="h-4 w-4" />
                Cerrado
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              {comments?.length || 0} respuestas
            </div>
          </div>
        </div>
      </div>

      {/* Post Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 transition-all duration-300 animate-fade-in">
        <div className="flex items-start gap-4 mb-6">
          {/* Author Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {postWithAuthor.author?.full_name?.slice(0, 2).toUpperCase() || postWithAuthor.author?.email?.slice(0, 2).toUpperCase() || 'U'}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 text-lg">{postWithAuthor.author?.full_name || 'Usuario'}</span>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{format(new Date(postWithAuthor.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Autor de la publicación
            </p>
          </div>
        </div>

        {/* Post Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{postWithAuthor.title}</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">{postWithAuthor.body}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Comentarios</h2>
                <p className="text-sm text-slate-600">{comments?.length || 0} respuestas</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!postWithAuthor.is_locked && (
            /* Add Comment Form */
            <div className="relative">
              <form action={addComment}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {currentUserInitials}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="comment" className="sr-only">
                      Añadir comentario
                    </Label>
                    <div className="relative">
                      <Input
                        id="comment"
                        name="content"
                        placeholder="Escribe un comentario..."
                        className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 h-12 pr-14"
                        required
                      />
                      <Button
                        type="submit"
                        className="absolute right-1 top-1 bottom-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-4 font-semibold shadow-md"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {postWithAuthor.is_locked && (
            <div className="p-4 rounded-xl bg-slate-50 text-center border border-slate-200">
              <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Esta publicación está cerrada. No se pueden añadir más comentarios.
              </p>
            </div>
          )}

          {/* Comments List */}
          {!comments || comments.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                No hay comentarios todavía. ¡Sé el primero en comentar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any, index: number) => (
                <div
                  key={comment.id}
                  className="flex gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:scale-110 transition-transform">
                      {comment.author?.full_name?.slice(0, 2).toUpperCase() || comment.author?.email?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">
                        {comment.author?.full_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(comment.created_at), 'dd MMM, HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
