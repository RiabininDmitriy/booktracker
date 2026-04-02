import { Card } from '@/components/ui/card';

type StateCardProps = {
  message: string;
  className?: string;
};

function BaseStateCard({ message, className }: StateCardProps) {
  return (
    <Card className={className}>
      <div className="flex min-h-[6.5rem] flex-col items-center justify-center px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
}

export function LoadingStateCard({ message = 'Loading...', className }: Partial<StateCardProps>) {
  return <BaseStateCard message={message} className={className} />;
}

export function EmptyStateCard({ message = 'No data yet.', className }: Partial<StateCardProps>) {
  return <BaseStateCard message={message} className={className} />;
}

export function ErrorStateCard({
  message = 'Something went wrong.',
  className,
}: Partial<StateCardProps>) {
  return (
    <Card className={className}>
      <div className="flex min-h-[6.5rem] flex-col items-center justify-center px-6 py-8 text-center">
        <p className="text-sm text-danger">{message}</p>
      </div>
    </Card>
  );
}
