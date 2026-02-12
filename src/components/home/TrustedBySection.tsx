'use client';

import { Building2 } from 'lucide-react';

export function TrustedBySection() {
  const brands = [
    { name: 'Autoescuela Central', initials: 'AC', color: 'from-blue-500 to-blue-600' },
    { name: 'Conduce Bien', initials: 'CB', color: 'from-emerald-500 to-emerald-600' },
    { name: 'Vía Libre', initials: 'VL', color: 'from-violet-500 to-violet-600' },
    { name: 'Driver Pro', initials: 'DP', color: 'from-amber-500 to-amber-600' },
    { name: 'Auto Drive', initials: 'AD', color: 'from-rose-500 to-rose-600' },
    { name: 'SpeedDrive', initials: 'SD', color: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <section className="py-16 px-6 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 className="h-5 w-5" />
            <p className="text-sm font-semibold tracking-wide uppercase">
              +500 autoescuelas en España confían en nosotros
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 cursor-default"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md",
                  "bg-gradient-to-br " + brand.color
                )}>
                  {brand.initials}
                </div>
                <span className="text-base font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { cn } from '@/lib/utils';
