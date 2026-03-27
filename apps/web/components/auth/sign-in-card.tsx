import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { AuthField } from './auth-field';

type SignInCardProps = {
  onSwitchToSignUp: () => void;
};

export function SignInCard({ onSwitchToSignUp }: SignInCardProps) {
  return (
    <Card className="w-full md:max-w-[440px]">
      <CardHeader className="items-center text-center">
        <p className="text-2xl font-bold">📚 BookTracker</p>
        <CardTitle className="text-[26px] leading-8">Welcome back 👋</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <AuthField idPrefix="signin" label="Email address" placeholder="dmytro@example.com" />
        <AuthField idPrefix="signin" label="Password" placeholder="••••••••" type="password" />

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox />
            Remember me
          </div>
          <a className="text-sm text-primary hover:text-primary-hover" href="/auth/forgot-password">
            Forgot password?
          </a>
        </div>

        <Button className="w-full" size="lg">
          Sign In
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            className="text-primary hover:text-primary-hover"
            onClick={onSwitchToSignUp}
            type="button"
          >
            Sign up
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
