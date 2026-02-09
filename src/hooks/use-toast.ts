'use client';

import * as React from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

type ToasterToast = ToastProps & {
  id: string;
};

let toastCount = 0;

export function toast(props: ToastProps) {
  const id = `toast-${toastCount++}`;

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('toast', {
    detail: { id, ...props },
  }));

  return { id };
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  React.useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToasterToast>;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('toast', handleToast);

    return () => {
      window.removeEventListener('toast', handleToast);
    };
  }, []);

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
  };
}
