import type { ReactNode } from 'react';

import { classNames } from '@/lib/cn';

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, description, children, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={classNames(
          'w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg'
        )}
      >
        <div className="mb-4 space-y-1">
          <h2 id="modal-title" className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-6 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
