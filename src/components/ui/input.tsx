import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  withIcon?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, withIcon, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all duration-200',
          'hover:bg-white',
          'focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white',
          'placeholder:text-slate-400',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          withIcon && 'pl-12',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
