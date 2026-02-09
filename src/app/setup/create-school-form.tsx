'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Loader2 } from 'lucide-react';

interface CreateSchoolFormProps {
  userId: string;
  userEmail: string;
}

export default function CreateSchoolForm({ userId, userEmail }: CreateSchoolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSchool(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name || !slug) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/setup/create-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, userId, userEmail, userName: userEmail.split('@')[0] }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la autoescuela');
      }

      router.push('/panel');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la autoescuela');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={createSchool} className="space-y-4">
      <div className="space-y-2 text-left">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre de la Autoescuela
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Ej: Autoescuela Madrid"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2 text-left">
        <label htmlFor="slug" className="text-sm font-medium">
          URL única (slug)
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          placeholder="Ej: autoescuela-madrid"
          pattern="[a-z0-9-]+"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Solo letras minúsculas, números y guiones. Sin espacios.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando...
          </>
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Crear mi Autoescuela
          </>
        )}
      </Button>
    </form>
  );
}
