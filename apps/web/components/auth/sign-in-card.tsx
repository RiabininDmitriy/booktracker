import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

import { AuthField } from './auth-field';

type SignInCardProps = {
  email: string;
  password: string;
  rememberMe: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function SignInCard({
  email,
  password,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  isSubmitting = false,
  error = null,
}: SignInCardProps) {
  return (
    <Card className="w-full md:max-w-[440px]">
      <CardHeader className="items-center text-center">
        <p className="text-2xl font-bold">📚 BookTracker</p>
        <CardTitle className="text-[26px] leading-8">Welcome back 👋</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" data-testid="sign-in-form" onSubmit={onSubmit}>
          <AuthField
            idPrefix="signin"
            label="Email address"
            placeholder="dmytro@example.com"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
          <AuthField
            idPrefix="signin"
            label="Password"
            placeholder="••••••••"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={rememberMe}
                onChange={(event) => onRememberMeChange(event.target.checked)}
              />
              Remember me
            </label>
            <a
              className="text-sm text-primary hover:text-primary-hover"
              href="/auth/forgot-password"
            >
              Forgot password?
            </a>
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            data-testid="sign-in-submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link className="text-primary hover:text-primary-hover" href="/sign-up">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
