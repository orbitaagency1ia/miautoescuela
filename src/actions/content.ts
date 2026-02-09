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
 * Marcar una clase como completada
 * TEMPORAL: Sin autenticación - no funcional por ahora
 */
export async function markLessonCompleteAction(lessonId: string) {
  'use server';

  // TEMPORAL: No funcional sin autenticación
  console.log('TEMPORAL: markLessonCompleteAction no disponible sin autenticación');

  revalidatePath('/inicio');
  revalidatePath('/cursos');
}
