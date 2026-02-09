'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FolderOpen, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      {/*
        OVERLAY/BACKDROP - Capa oscura detrás del modal
        - Background oscuro con opacidad 60%
        - Backdrop blur para desenfoque del fondo
        - z-index alto para cubrir todo el contenido
        - Transición suave de opacidad
      */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay oscuro con blur */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => onOpenChange(false)}
        />

        {/* Modal Container - z-index superior al overlay */}
        <div className="relative z-[60] w-full max-w-[550px] px-4">
          {/*
            MODAL CONTAINER
            - Fondo blanco puro
            - Sombra pronunciada
            - Border radius generoso
            - Animación de entrada: scale + opacity
            - Font family premium
          */}
          <div
            className={cn(
              "bg-white rounded-3xl shadow-2xl overflow-hidden",
              "transform transition-all duration-300",
              open ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            }}
          >
            {/*
              HEADER PREMIUM
              - Gradiente suave como acento
              - Icono con gradiente
              - Títulos con buen contraste
            */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 px-8 py-6 border-b-2 border-indigo-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Icono con gradiente y sombra */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Nuevo Tema
                    </DialogTitle>
                    <DialogDescription className="text-slate-700 mt-1 font-medium">
                      Crea un nuevo tema para organizar tus clases
                    </DialogDescription>
                  </div>
                </div>

                {/* Botón cerrar */}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/*
                CONTENIDO DEL FORMULARIO
                - Padding generoso
                - Spacing consistente
                - Labels con buen contraste
              */}
              <div className="px-8 py-8 space-y-6">
                {/*
                  CAMPO: TÍTULO
                  - Border visible por defecto (2px)
                  - Background gris claro
                  - Focus: borde azul + ring
                  - Hover: background blanco
                  - Placeholder con color gris claro
                  - Texto principal oscuro para contraste
                */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Título del Tema <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ej: Temario de Conducción"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={loading}
                    className={cn(
                      // Base styles
                      "h-12 rounded-xl text-slate-900 text-base",
                      // Border visible por defecto
                      "border-2 border-slate-300",
                      // Background gris claro
                      "bg-slate-50 hover:bg-white",
                      // Focus state con anillo
                      "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                      // Placeholder con buen contraste
                      "placeholder:text-slate-400",
                      // Transiciones
                      "transition-all duration-200"
                    )}
                  />
                  <p className="text-xs text-slate-600 pl-1">
                    Usa un título claro y descriptivo
                  </p>
                </div>

                {/*
                  CAMPO: DESCRIPCIÓN (Textarea)
                  - Border visible por defecto
                  - Background gris claro
                  - Altura mínima generosa
                  - Sin redimensionado
                  - Focus con anillo
                */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe brevemente el contenido de este tema..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    disabled={loading}
                    className={cn(
                      // Base styles
                      "rounded-xl text-slate-900 text-base p-4",
                      // Altura mínima
                      "min-h-[120px]",
                      // Border visible
                      "border-2 border-slate-300",
                      // Background
                      "bg-slate-50 hover:bg-white",
                      // Focus state
                      "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                      // Placeholder
                      "placeholder:text-slate-400",
                      // Sin resize
                      "resize-none",
                      // Transiciones
                      "transition-all duration-200"
                    )}
                  />
                  <p className="text-xs text-slate-600 pl-1">
                    La descripción ayudará a los alumnos a entender qué aprenderán
                  </p>
                </div>

                {/*
                  DISPLAY DE ERRORES
                  - Contraste alto con fondo
                  - Icono visible
                  - Bordes definidos
                */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border-2 bg-red-50">
                    <div className="p-1 rounded-lg bg-red-100 shrink-0">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">
                        Error al crear el tema
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/*
                  FOOTER CON BOTONES
                  - Botón Cancelar: border visible
                  - Botón Crear: gradiente con sombra
                  - Hover states bien definidos
                  - Transiciones suaves
                */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-100">
                  {/* Botón Cancelar */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className={cn(
                      // Base styles
                      "rounded-xl px-8 py-3 h-auto",
                      // Border visible
                      "border-2 border-slate-300",
                      // Background
                      "bg-white hover:bg-slate-50",
                      // Texto con buen contraste
                      "text-slate-700 hover:text-slate-900",
                      // Transiciones
                      "transition-all duration-200",
                      // Loading state
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Cancelar
                  </Button>

                  {/* Botón Crear Tema */}
                  <Button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    className={cn(
                      // Base styles
                      "rounded-xl px-8 py-3 h-auto font-semibold",
                      // Gradiente
                      "bg-gradient-to-r from-blue-600 to-indigo-600",
                      // Hover
                      "hover:from-blue-700 hover:to-indigo-700",
                      // Sombra
                      "shadow-lg hover:shadow-xl",
                      // Transform
                      "hover:scale-105",
                      // Texto
                      "text-white",
                      // Transiciones
                      "transition-all duration-200",
                      // Loading state
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Crear Tema
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
