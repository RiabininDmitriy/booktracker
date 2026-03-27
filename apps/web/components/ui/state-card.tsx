import { Card, CardContent } from '@/components/ui/card';

type StateCardProps = {
  message: string;
  className?: string;
};

function BaseStateCard({ message, className }: StateCardProps) {
  return (
    <Card className={className}>
      <CardContent className="py-8">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
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
      <CardContent className="py-8">
        <p className="text-sm text-danger">{message}</p>
      </CardContent>
    </Card>
  );
}
