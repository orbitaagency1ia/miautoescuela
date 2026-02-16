'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FolderOpen, Sparkles } from 'lucide-react';

interface CreateModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateModuleDialog({ open, onOpenChange, onSuccess }: CreateModuleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/content/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el tema');
      }

      // Reset form
      setFormData({ title: '', description: '' });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle>Nuevo Tema</DialogTitle>
                <DialogDescription>
                  Crea un nuevo tema para organizar tus clases
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700">
                <div className="p-1 rounded-lg bg-red-100 shrink-0">
                  <Sparkles className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Error al crear el tema</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label htmlFor="title">
                Título del Tema <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Temario de Conducción"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Usa un título claro y descriptivo
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el contenido de este tema..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                La descripción ayudará a los alumnos a entender qué aprenderán
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4" />
                  Crear Tema
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
