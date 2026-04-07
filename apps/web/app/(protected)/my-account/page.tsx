'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingStateCard } from '@/components/ui/state-card';
import {
  useConfirmMyEmailMutation,
  useMeQuery,
  useUpdateMyProfileMutation,
} from '@/lib/store/api/auth-api';

export default function MyAccountPage() {
  const { data: me, isLoading, isError } = useMeQuery();
  const [updateMyProfile, { isLoading: isUpdatingProfile }] = useUpdateMyProfileMutation();
  const [confirmMyEmail, { isLoading: isConfirmingEmail }] = useConfirmMyEmailMutation();

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [confirmTokenInput, setConfirmTokenInput] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isNameDirty, setIsNameDirty] = useState(false);
  const [isEmailDirty, setIsEmailDirty] = useState(false);

  const effectiveNameInput = useMemo(
    () => (isNameDirty ? nameInput : (me?.name ?? '')),
    [isNameDirty, me?.name, nameInput]
  );
  const effectiveEmailInput = useMemo(
    () => (isEmailDirty ? emailInput : (me?.pendingEmail ?? me?.email ?? '')),
    [emailInput, isEmailDirty, me?.email, me?.pendingEmail]
  );

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await updateMyProfile({
        name: effectiveNameInput,
        email: effectiveEmailInput,
      }).unwrap();
      setIsNameDirty(false);
      setIsEmailDirty(false);

      if (result.emailVerificationRequired) {
        setDevToken(result.emailVerificationToken);
        setConfirmTokenInput(result.emailVerificationToken ?? '');
        setFeedback('Profile updated. Confirm your new email with the token below.');
      } else {
        setDevToken(null);
        setConfirmTokenInput('');
        setFeedback('Profile updated.');
      }
    } catch {
      setFeedback('Unable to save profile changes.');
    }
  };

  const handleEmailConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmTokenInput.trim()) return;

    try {
      await confirmMyEmail({ token: confirmTokenInput.trim() }).unwrap();
      setConfirmTokenInput('');
      setDevToken(null);
      setFeedback('Email confirmed successfully.');
    } catch {
      setFeedback('Unable to confirm email. Check your token and try again.');
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-center">My account</CardTitle>
            <CardDescription className="text-center">
              Manage your account settings and sign out.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center">
            {isLoading ? (
              <LoadingStateCard message="Loading account info..." className="w-full max-w-sm" />
            ) : null}
            {!isLoading && isError ? (
              <p className="text-sm text-danger">
                Unable to load account info. You can still sign out.
              </p>
            ) : null}

            {!isLoading && !isError ? (
              <>
                <form className="w-full max-w-sm space-y-3 text-left" onSubmit={handleProfileSave}>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Nickname
                    </p>
                    <Input
                      value={effectiveNameInput}
                      onChange={(event) => {
                        setIsNameDirty(true);
                        setNameInput(event.target.value);
                      }}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>
                    <Input
                      type="email"
                      value={effectiveEmailInput}
                      onChange={(event) => {
                        setIsEmailDirty(true);
                        setEmailInput(event.target.value);
                      }}
                      placeholder="you@example.com"
                    />
                  </div>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>

                <div className="mt-4 w-full max-w-sm rounded-md border border-border p-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email status
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {me?.emailVerifiedAt ? 'Verified' : 'Not verified'}
                  </p>
                  {me?.pendingEmail ? (
                    <p className="mt-1 text-sm text-muted-foreground">Pending: {me.pendingEmail}</p>
                  ) : null}
                </div>

                {me?.pendingEmail || devToken ? (
                  <form
                    className="mt-4 w-full max-w-sm space-y-3 text-left"
                    onSubmit={handleEmailConfirm}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Confirm new email
                    </p>
                    <Input
                      value={confirmTokenInput}
                      onChange={(event) => setConfirmTokenInput(event.target.value)}
                      placeholder="Paste confirmation token"
                    />
                    <Button type="submit" disabled={isConfirmingEmail}>
                      {isConfirmingEmail ? 'Confirming...' : 'Confirm email'}
                    </Button>
                    {devToken ? (
                      <p className="text-xs text-muted-foreground">
                        Dev token: <span className="font-mono">{devToken}</span>
                      </p>
                    ) : null}
                  </form>
                ) : null}

                <p className="mt-4 text-sm text-muted-foreground">
                  Your session is active. When you sign out, you will be redirected to the sign-in
                  page.
                </p>

                {feedback ? <p className="mt-2 text-sm text-muted-foreground">{feedback}</p> : null}
              </>
            ) : null}

            <div className="mt-4 w-full max-w-sm">
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
