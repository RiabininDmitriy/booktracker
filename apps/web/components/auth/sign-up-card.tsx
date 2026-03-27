import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AuthField } from './auth-field';

type SignUpCardProps = {
  onSwitchToSignIn: () => void;
};

export function SignUpCard({ onSwitchToSignIn }: SignUpCardProps) {
  return (
    <Card className="w-full md:max-w-[440px]">
      <CardHeader>
        <CardTitle className="text-[26px] leading-8">Create account ✨</CardTitle>
        <CardDescription>Start tracking your reading journey</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AuthField idPrefix="signup" label="Full name" placeholder="Dmytro Riabinin" />
        <AuthField idPrefix="signup" label="Email address" placeholder="dmytro@example.com" />
        <AuthField
          idPrefix="signup"
          label="Password"
          placeholder="min 8 characters"
          type="password"
        />
        <AuthField
          idPrefix="signup"
          label="Confirm password"
          placeholder="repeat password"
          type="password"
        />

        <Button className="w-full" size="lg">
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            className="text-primary hover:text-primary-hover"
            onClick={onSwitchToSignIn}
            type="button"
          >
            Sign in
          </button>
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Preview state:</span>
          {/* We keep this badge to quickly validate semantic token rendering on every auth state. */}
          <Badge variant="info">Design token ready</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
