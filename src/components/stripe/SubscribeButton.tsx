'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface SubscribeButtonProps {
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SubscribeButton({ size = 'default', className }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      toast({
        title: 'Error de pago',
        description: 'No se pudo iniciar el proceso de pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button size={size} className={className} onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Activar Suscripción
        </>
      )}
    </Button>
  );
}
