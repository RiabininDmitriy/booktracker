import type { ReactNode } from 'react';

import { classNames } from '@/lib/cn';

type DrawerSide = 'left' | 'right';

export type DrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  side?: DrawerSide;
};

const sideClass: Record<DrawerSide, string> = {
  left: 'left-0 border-r',
  right: 'right-0 border-l',
};

export function Drawer({ open, title, description, children, side = 'right' }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        aria-labelledby="drawer-title"
        aria-modal="true"
        className={classNames(
          'absolute top-0 h-full w-full max-w-md border-border bg-surface p-6 shadow-lg',
          sideClass[side]
        )}
        role="dialog"
      >
        <div className="mb-4 space-y-1">
          <h2 className="text-xl font-semibold text-foreground" id="drawer-title">
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
