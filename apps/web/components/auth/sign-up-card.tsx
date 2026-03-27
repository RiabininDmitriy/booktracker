import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

import { AuthField } from './auth-field';

type SignUpCardProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function SignUpCard({
  name,
  email,
  password,
  confirmPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isSubmitting = false,
  error = null,
}: SignUpCardProps) {
  return (
    <Card className="w-full md:max-w-[440px]">
      <CardHeader>
        <CardTitle className="text-[26px] leading-8">Create account ✨</CardTitle>
        <CardDescription>Start tracking your reading journey</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" data-testid="sign-up-form" onSubmit={onSubmit}>
          <AuthField
            idPrefix="signup"
            label="Full name"
            placeholder="Dmytro Riabinin"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <AuthField
            idPrefix="signup"
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
            idPrefix="signup"
            label="Password"
            placeholder="min 8 characters"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
          />
          <AuthField
            idPrefix="signup"
            label="Confirm password"
            placeholder="repeat password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            required
          />

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            data-testid="sign-up-submit"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link className="text-primary hover:text-primary-hover" href="/sign-in">
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Preview state:</span>
            {/* We keep this badge to quickly validate semantic token rendering on every auth state. */}
            <Badge variant="info">Design token ready</Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
