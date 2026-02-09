import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border-2 p-5 pr-8 shadow-premium transition-all duration-300 animate-slide-in-right',
  {
    variants: {
      variant: {
        default: 'border-border/50 bg-background/95 backdrop-blur-xl',
        destructive: 'border-destructive/50 bg-destructive/95 backdrop-blur-xl text-destructive-foreground',
        success: 'border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Toast.displayName = 'Toast';

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-xl p-2 text-foreground/50 opacity-0 transition-all duration-200 hover:text-foreground hover:bg-accent focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:opacity-100',
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Cerrar</span>
  </button>
));
ToastClose.displayName = 'ToastClose';

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-sm font-semibold flex items-center gap-2', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

type ToastPropsInner = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastContentProps = ToastPropsInner & {
  title?: string;
  description?: string;
};

const ToastContent = ({ title, description, variant = 'default', ...props }: ToastContentProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Toast variant={variant} {...props}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="grid gap-1 flex-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      <ToastClose />
    </Toast>
  );
};

ToastContent.displayName = 'ToastContent';

export {
  type ToastPropsInner,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastContent,
  toastVariants,
};
