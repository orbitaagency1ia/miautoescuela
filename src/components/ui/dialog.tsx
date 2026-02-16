import * as React from 'react';
import { cn } from '@/lib/utils';

const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-md',
      className
    )}
    {...props}
  >
    {children}
    {onClose && (
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
      >
        ✕
      </button>
    )}
  </div>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-2 text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-xl font-semibold text-slate-900 leading-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 pt-4', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
    {...props}
  >
    ✕
  </button>
));
DialogClose.displayName = 'DialogClose';

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; children?: React.ReactNode }
>(({ asChild = false, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
    });
  }

  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});
DialogTrigger.displayName = 'DialogTrigger';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
};
