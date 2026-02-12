'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, iconBg = 'from-blue-600 to-blue-700', title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 border-slate-100 hover:border-slate-200">
      {/* Hover gradient background */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-50/0 to-blue-50/0 group-hover:from-slate-50/50 group-hover:to-blue-50/50 transition-all duration-300 pointer-events-none" />

      {/* Icon */}
      <div className="relative mb-6">
        <div className={cn(
          "w-16 h-16 rounded-2xl bg-gradient-to-br shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
          iconBg
        )}>
          <Icon className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}
