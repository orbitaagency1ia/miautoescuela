'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';

interface FormState {
  error: string | null;
  success: string | null;
}

export function useAuthForm(action: (prevState: FormState, formData: FormData) => Promise<FormState>) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {
    error: null,
    success: null,
  });

  return {
    state,
    formAction,
    isPending,
  };
}
