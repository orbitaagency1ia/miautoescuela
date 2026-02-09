'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface PortalButtonProps {
  className?: string;
}

export function PortalButton({ className }: PortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No se recibió URL del portal');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al abrir el portal de gestión');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Abriendo...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Gestionar Suscripción
        </>
      )}
    </Button>
  );
}
