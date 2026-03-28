import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <input
        ref={ref}
        className={twMerge(
          clsx(
            "flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-error focus-visible:ring-error",
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
