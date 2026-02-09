'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateModuleDialog } from '@/components/owner/CreateModuleDialog';
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  Plus,
  Lightbulb,
  Target,
  Zap,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function CreateModulePage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [moduleCreated, setModuleCreated] = useState(false);

  const tips = [
    { icon: Target, text: 'Usa títulos claros y descriptivos para facilitar la navegación' },
    { icon: Zap, text: 'Organiza el contenido en secciones lógicas y progresivas' },
    { icon: Award, text: 'Incluye una descripción que anime a los alumnos a empezar' },
  ];

  const handleSuccess = () => {
    setModuleCreated(true);
    // Auto redirect after short delay
    setTimeout(() => {
      redirect('/temas');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/temas">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Tema</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Nuevo</span>
            </div>
          </div>
          <p className="text-slate-500">Organiza tu contenido en temas para facilitar el aprendizaje</p>
        </div>
      </div>

      {/* Success Message */}
      {moduleCreated && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-2xl bg-emerald-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                ¡Tema creado correctamente!
              </h3>
              <p className="text-emerald-600">Redirigiendo a la lista de temas...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Dialog Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                <FolderOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Crea tu primer tema
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Los temas ayudan a organizar tus clases de manera estructurada, permitiendo a los alumnos seguir un orden lógico en su aprendizaje.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => setDialogOpen(true)}
                className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Crear Tema
              </Button>
            </div>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border-2 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Consejos</h3>
            </div>
            <div className="space-y-3">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white/50"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 shrink-0">
                      <Icon className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">¿Qué es un tema?</h3>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              Un tema agrupa clases relacionadas sobre un mismo concepto. Por ejemplo: "Señales de Tráfico", "Normas de Circulación", o "Maniobras Básicas".
            </p>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <CreateModuleDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && !moduleCreated) {
            redirect('/temas');
          }
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
