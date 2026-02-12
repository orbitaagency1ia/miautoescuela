'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TOAST_MESSAGES } from '@/lib/constants';

// TEMPORAL: Helper para obtener school_id sin autenticación
async function getSchoolId() {
  const supabase = await createClient();
  const { data: school } = await (supabase
    .from('schools')
    .select('id')
    .limit(1)
    .maybeSingle() as any);

  if (!school) {
    throw new Error('No hay autoescuelas creadas. Ve a Administración para crear una primero.');
  }

  return school.id;
}

/**
 * Create Module Action
 * Crear un nuevo tema/módulo
 * TEMPORAL: Sin autenticación
 */
export async function createModuleAction(formData: FormData) {
  const supabase = await createClient();

  const schoolId = await getSchoolId();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  // Get current max order_index
  const { data: lastModule } = await (supabase
    .from('modules')
    .select('order_index')
    .eq('school_id', schoolId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle() as any);

  const newOrderIndex = (lastModule?.order_index ?? -1) + 1;

  const { error } = await (supabase.from('modules') as any).insert({
    school_id: schoolId,
    title,
    description: description || null,
    order_index: newOrderIndex,
    is_published: false,
  });

  if (error) {
    console.error('Error creating module:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Update Module Action
 * Actualizar un tema/módulo
 */
export async function updateModuleAction(moduleId: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isPublished = formData.get('is_published') === 'true';

  if (!title) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  const { error } = await (supabase
    .from('modules') as any)
    .update({
      title,
      description: description || null,
      is_published: isPublished,
    })
    .eq('id', moduleId);

  if (error) {
    console.error('Error updating module:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Delete Module Action
 * Eliminar un tema/módulo
 */
export async function deleteModuleAction(moduleId: string) {
  const supabase = await createClient();

  const { error } = await (supabase
    .from('modules') as any)
    .delete()
    .eq('id', moduleId);

  if (error) {
    console.error('Error deleting module:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Create Lesson Action
 * Crear una nueva clase/lección
 * TEMPORAL: Sin autenticación
 */
export async function createLessonAction(formData: FormData) {
  const supabase = await createClient();

  const schoolId = await getSchoolId();

  const moduleId = formData.get('module_id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const videoFile = formData.get('video') as File | null;

  if (!moduleId || !title) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  // Get current max order_index for this module
  const { data: lastLesson } = await (supabase
    .from('lessons')
    .select('order_index')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle() as any);

  const newOrderIndex = (lastLesson?.order_index ?? -1) + 1;

  let videoPath: string | null = null;

  // Upload video if provided
  if (videoFile && videoFile.size > 0) {
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${schoolId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await (supabase
      .storage
      .from('lesson-videos')
      .upload(fileName, videoFile) as any);

    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      throw new Error('Error al subir el video');
    }

    videoPath = uploadData?.path || null;
  }

  const { error } = await (supabase.from('lessons') as any).insert({
    school_id: schoolId,
    module_id: moduleId,
    title,
    description: description || null,
    video_path: videoPath,
    order_index: newOrderIndex,
    is_published: false,
  });

  if (error) {
    console.error('Error creating lesson:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Update Lesson Action
 * Actualizar una clase/lección
 */
export async function updateLessonAction(lessonId: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isPublished = formData.get('is_published') === 'true';

  if (!title) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  const { error } = await (supabase
    .from('lessons') as any)
    .update({
      title,
      description: description || null,
      is_published: isPublished,
    })
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Delete Lesson Action
 * Eliminar una clase/lección
 */
export async function deleteLessonAction(lessonId: string) {
  const supabase = await createClient();

  // Get lesson to delete video file
  const { data: lesson } = await (supabase
    .from('lessons')
    .select('video_path')
    .eq('id', lessonId)
    .single() as any);

  // Delete lesson from database
  const { error } = await (supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId) as any);

  if (error) {
    console.error('Error deleting lesson:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // Delete video file from storage
  if (lesson?.video_path) {
    await (supabase.storage.from('lesson-videos').remove([lesson.video_path]) as any);
  }

  revalidatePath('/temas');
  redirect('/temas');
}

/**
 * Toggle Module Publish Status
 * Cambiar estado de publicación de un tema
 */
export async function toggleModulePublishAction(moduleId: string, currentState: boolean) {
  const supabase = await createClient();

  const { error } = await (supabase
    .from('modules') as any)
    .update({ is_published: !currentState })
    .eq('id', moduleId);

  if (error) {
    console.error('Error toggling module:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
}

/**
 * Toggle Lesson Publish Status
 * Cambiar estado de publicación de una clase
 */
export async function toggleLessonPublishAction(lessonId: string, currentState: boolean) {
  const supabase = await createClient();

  const { error } = await (supabase
    .from('lessons') as any)
    .update({ is_published: !currentState })
    .eq('id', lessonId);

  if (error) {
    console.error('Error toggling lesson:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/temas');
}

/**
 * Mark Lesson Complete Action
 * Marcar una clase como completada por un estudiante
 */
export async function markLessonCompleteAction(lessonId: string) {
  'use server';

  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  if (!membership) {
    throw new Error('No tienes membresía activa en ninguna autoescuela');
  }

  // Get lesson details to verify it belongs to user's school and get module_id
  const { data: lesson } = await (supabase
    .from('lessons')
    .select('school_id, module_id')
    .eq('id', lessonId)
    .single() as any);

  if (!lesson) {
    throw new Error('Lección no encontrada');
  }

  if (lesson.school_id !== membership.school_id) {
    throw new Error('No tienes acceso a esta lección');
  }

  // Ensure profile exists (for users registered before profile creation)
  const { data: existingProfile } = await (supabase
    .from('profiles')
    .select('user_id, activity_points')
    .eq('user_id', user.id)
    .maybeSingle() as any);

  if (!existingProfile) {
    // Create profile if it doesn't exist
    await (supabase.from('profiles') as any)
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        activity_points: 0,
      });
  }

  // Check if already completed
  const { data: existingProgress } = await (supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle() as any);

  if (existingProgress) {
    // Already completed, remove progress (toggle off)
    const { error: deleteError } = await (supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId) as any);

    if (deleteError) {
      console.error('Error removing lesson progress:', deleteError);
      throw new Error('Error al actualizar progreso');
    }

    // Remove activity points (10 points per lesson)
    const currentPoints = existingProfile?.activity_points || 0;
    await (supabase.from('profiles') as any)
      .update({
        activity_points: Math.max(0, currentPoints - 10)
      })
      .eq('user_id', user.id);
  } else {
    // Not completed, add progress (toggle on)
    const { error: insertError } = await (supabase
      .from('lesson_progress') as any)
      .insert({
        school_id: lesson.school_id,
        user_id: user.id,
        lesson_id: lessonId,
        progress_percent: 100,
        completed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error marking lesson complete:', insertError);
      throw new Error('Error al marcar lección como completada');
    }

    // Award activity points (10 points per lesson)
    const currentPoints = existingProfile?.activity_points || 0;
    await (supabase.from('profiles') as any)
      .update({
        activity_points: currentPoints + 10
      })
      .eq('user_id', user.id);
  }

  // Revalidate all relevant paths
  revalidatePath('/inicio');
  revalidatePath('/cursos');
  revalidatePath(`/cursos/${lesson.module_id}`);
  revalidatePath(`/cursos/${lesson.module_id}/${lessonId}`);
  revalidatePath('/ranking');
}
