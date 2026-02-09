import { Settings, Sparkles } from 'lucide-react';

export default function ConfigPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Admin</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Configuración general de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Parámetros de la Plataforma</h3>
            <p className="text-sm text-slate-500 mt-1">
              Configura los valores globales del sistema
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Duración de Prueba</p>
                <p className="text-sm text-muted-foreground">14 días</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Precio Mensual</p>
                <p className="text-sm text-muted-foreground">€49/mes</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tamaño Máximo de Video</p>
                <p className="text-sm text-muted-foreground">2 GB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Integraciones</h3>
            <p className="text-sm text-slate-500 mt-1">
              Servicios de terceros conectados
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stripe</p>
                <p className="text-sm text-green-500">Conectado</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Supabase</p>
                <p className="text-sm text-green-500">Conectado</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resend (Email)</p>
                <p className="text-sm text-yellow-500">Por configurar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
