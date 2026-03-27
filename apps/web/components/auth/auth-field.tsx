import { Input } from '@/components/ui/input';

type AuthFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  idPrefix: string;
};

export function AuthField({ label, placeholder, type = 'text', idPrefix }: AuthFieldProps) {
  const fieldId = `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-foreground">{label}</span>
      <Input id={fieldId} type={type} placeholder={placeholder} />
    </label>
  );
}
