import { Settings, Sparkles, Sliders, Plug, CheckCircle, AlertCircle, ChevronRight, Shield, Zap, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6 md:p-8 border border-violet-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-violet-700 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Administración</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Configuración
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Configuración general de la plataforma
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-3">
        {/* Platform Status */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-violet-200/50 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50/0 to-purple-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estado Plataforma</p>
              <p className="text-3xl font-bold text-gray-900">Activo</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-violet-200/50 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50/0 to-purple-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Integraciones</p>
              <p className="text-3xl font-bold text-gray-900">2/3</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Plug className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Storage Used */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-violet-200/50 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50/0 to-purple-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Límite Video</p>
              <p className="text-3xl font-bold text-gray-900">2 GB</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <HardDrive className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Platform Parameters */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden group hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="border-b bg-gradient-to-r from-violet-50 to-purple-50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Sliders className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Parámetros de la Plataforma</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configura los valores globales del sistema
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900">Duración de Prueba</p>
                <p className="text-sm text-gray-500">Periodo de prueba para nuevas autoescuelas</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                <span>14 días</span>
              </div>
            </div>
            <div className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900">Precio Mensual</p>
                <p className="text-sm text-gray-500">Suscripción mensual estándar</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold">
                <span>€49/mes</span>
              </div>
            </div>
            <div className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900">Tamaño Máximo de Video</p>
                <p className="text-sm text-gray-500">Límite por archivo subido</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 font-semibold">
                <span>2 GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden group hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="border-b bg-gradient-to-r from-violet-50 to-purple-50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Plug className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Integraciones</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Servicios de terceros conectados
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>
          <div className="p-6 space-y-3">
            {/* Stripe */}
            <div className="group/item flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-500">Procesamiento de pagos</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium text-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Conectado
              </div>
            </div>

            {/* Supabase */}
            <div className="group/item flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Supabase</p>
                  <p className="text-sm text-gray-500">Base de datos y autenticación</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium text-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Conectado
              </div>
            </div>

            {/* Resend */}
            <div className="group/item flex items-center justify-between p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50/30 hover:border-yellow-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-50 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Resend</p>
                  <p className="text-sm text-gray-500">Servicio de email</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 font-medium text-sm">
                <AlertCircle className="h-3.5 w-3.5" />
                Por configurar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200 hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Seguridad</h3>
            <p className="text-sm text-gray-600">Configuración de seguridad y permisos</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '550ms' }}>
            <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Autenticación</p>
              <p className="text-sm text-green-600">Segura</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>

          <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '600ms' }}>
            <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Encriptación</p>
              <p className="text-sm text-green-600">SSL/TLS</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>

          <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '650ms' }}>
            <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Auditoría</p>
              <p className="text-sm text-green-600">Activa</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
