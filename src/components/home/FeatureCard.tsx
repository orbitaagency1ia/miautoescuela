'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, iconBg = 'from-blue-600 to-blue-700', title, description }: FeatureCardProps) {
  return (
    <div
      className="group p-10 rounded-3xl border hover:shadow-xl transition-all duration-500"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
    >
      {/* Icon */}
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${iconBg} mb-8 shadow-lg`}>
        <Icon className="h-8 w-8 text-white" strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-semibold mb-4" style={{ color: '#000000' }}>
        {title}
      </h3>
      <p className="text-lg leading-relaxed" style={{ color: '#1A1A1A' }}>
        {description}
      </p>
    </div>
  );
}
