'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';

export interface ExtendTrialResult {
  success: boolean;
  error: string | null;
  newTrialEndsAt: string | null;
}

/**
 * Extend Trial Action
 * Extends the trial period for a school by a specified number of days
 * @param schoolId - The ID of the school to extend the trial for
 * @param daysToExtend - Number of days to extend (default: 14)
 * @returns Object with success status, error message (if any), and new trial end date
 */
export async function extendTrialAction(
  schoolId: string,
  daysToExtend: number = 14
): Promise<ExtendTrialResult> {
  try {
    const supabase = await createServiceClient();

    // Validate inputs
    if (!schoolId) {
      return {
        success: false,
        error: 'School ID is required',
        newTrialEndsAt: null,
      };
    }

    if (daysToExtend <= 0 || !Number.isInteger(daysToExtend)) {
      return {
        success: false,
        error: 'Days to extend must be a positive integer',
        newTrialEndsAt: null,
      };
    }

    // Get current trial_ends_at
    const { data: school, error: fetchError } = await (supabase
      .from('schools') as any)
      .select('trial_ends_at')
      .eq('id', schoolId)
      .single();

    if (fetchError) {
      console.error('Error fetching school:', fetchError);
      return {
        success: false,
        error: 'Failed to fetch school data',
        newTrialEndsAt: null,
      };
    }

    if (!school) {
      return {
        success: false,
        error: 'School not found',
        newTrialEndsAt: null,
      };
    }

    // Calculate new trial_ends_at
    const currentTrialEnd = school.trial_ends_at
      ? new Date(school.trial_ends_at)
      : new Date();

    const newTrialEnd = new Date(currentTrialEnd);
    newTrialEnd.setDate(newTrialEnd.getDate() + daysToExtend);

    // Update the school with new trial_ends_at
    // Keep subscription_status as 'trialing'
    const { error: updateError } = await (supabase
      .from('schools') as any)
      .update({
        trial_ends_at: newTrialEnd.toISOString(),
        subscription_status: 'trialing',
      })
      .eq('id', schoolId);

    if (updateError) {
      console.error('Error updating trial:', updateError);
      return {
        success: false,
        error: 'Failed to update trial period',
        newTrialEndsAt: null,
      };
    }

    // Revalidate paths
    revalidatePath('/admin/autoescuelas');
    revalidatePath(`/admin/autoescuelas/${schoolId}`);
    revalidatePath('/suscripcion');

    return {
      success: true,
      error: null,
      newTrialEndsAt: newTrialEnd.toISOString(),
    };
  } catch (error) {
    console.error('Unexpected error in extendTrialAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      newTrialEndsAt: null,
    };
  }
}
