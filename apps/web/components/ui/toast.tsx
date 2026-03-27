import type { HTMLAttributes } from 'react';

import { classNames } from '@/lib/cn';

type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
  title: string;
  message?: string;
};

const variantClass: Record<ToastVariant, string> = {
  info: 'border-info/30 bg-info-subtle text-info',
  success: 'border-success/30 bg-success-subtle text-success',
  warning: 'border-warning/30 bg-warning-subtle text-warning',
  danger: 'border-danger/30 bg-danger-subtle text-danger',
};

export function Toast({ className, variant = 'info', title, message, ...props }: ToastProps) {
  return (
    <div
      role="status"
      className={classNames(
        'rounded-md border px-4 py-3 shadow-sm',
        variantClass[variant],
        className
      )}
      {...props}
    >
      <p className="text-sm font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm/5">{message}</p> : null}
    </div>
  );
}
