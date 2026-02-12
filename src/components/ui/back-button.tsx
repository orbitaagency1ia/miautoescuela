'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * Premium back button component with chip style.
 * Uses router.back() when href is not provided.
 */
export function BackButton({
  href,
  label = 'Volver',
  onClick,
  className,
}: BackButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else if (!href) {
      e.preventDefault();
      window.history.back();
    }
  };

  const content = (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );

  if (href && !onClick) {
    return <Link href={href} className="group">{content}</Link>;
  }

  return <div className="group">{content}</div>;
}
