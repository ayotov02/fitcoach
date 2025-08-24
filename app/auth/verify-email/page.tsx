'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/auth/supabase';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      setResendSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <MainLayout>
      <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to{' '}
              {email && <span className="font-medium">{email}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent-green mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">What's next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Check your email inbox</li>
                    <li>2. Click the verification link</li>
                    <li>3. Complete your profile setup</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {resendSuccess ? (
              <div className="rounded-md bg-accent-green/15 p-3">
                <p className="text-sm text-accent-green">
                  Verification email sent successfully!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </div>
            )}

            <div className="text-center pt-4">
              <Link 
                href="/auth/login"
                className="text-sm text-primary hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}