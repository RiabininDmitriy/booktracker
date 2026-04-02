import type { SelectHTMLAttributes } from 'react';

import { classNames } from '@/lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Chevron inset from the right matches pl-3 (0.75rem) so spacing mirrors the text on the left. */
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Select({ className, children, style, ...props }: SelectProps) {
  return (
    <select
      className={classNames(
        'h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface pl-3 pr-10 text-sm text-foreground',
        'bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      style={{
        backgroundImage: SELECT_CHEVRON,
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
