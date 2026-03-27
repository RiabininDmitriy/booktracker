import type { HTMLAttributes } from 'react';

import { classNames } from '@/lib/cn';

type BadgeVariant = 'default' | 'info' | 'success' | 'warning';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClass: Record<BadgeVariant, string> = {
  default: 'bg-surface text-foreground border border-border',
  info: 'bg-info-subtle text-info',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}
