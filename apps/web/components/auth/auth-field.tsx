import type { ChangeEvent } from 'react';

import { Input } from '@/components/ui/input';

type AuthFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  idPrefix: string;
  name?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
};

export function AuthField({
  label,
  placeholder,
  type = 'text',
  idPrefix,
  name,
  value,
  onChange,
  autoComplete,
  required,
}: AuthFieldProps) {
  const fieldId = `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-foreground">{label}</span>
      <Input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
    </label>
  );
}
