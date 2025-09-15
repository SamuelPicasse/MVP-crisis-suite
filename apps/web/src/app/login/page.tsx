"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Ensure profile row exists for this user (self-heal in case trigger didn't run)
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email ?? email,
              full_name: (user.user_metadata as any)?.full_name ?? null,
              role: (user.user_metadata as any)?.role ?? null
            },
            { onConflict: 'id' }
          );
      }
    } catch {
      // no-op; RLS or duplicates are acceptable here
    }

    router.push('/dashboard');
    router.refresh();
  };


  const handleSendOtp = async () => {
    setError(null);
    setInfo(null);
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter your email to receive a code.');
      return;
    }
    const emailOk = /.+@.+\..+/.test(emailTrimmed);
    if (!emailOk) {
      setError('Please enter a valid email address.');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: emailTrimmed,
      options: { shouldCreateUser: true }
    });
    if (error) {
      setError(error.message);
      return;
    }
    setOtpSent(true);
    setInfo('We sent you a 6‑digit code. Enter it below.');
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setInfo(null);
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !otpCode.trim()) {
      setError('Enter your email and the 6‑digit code.');
      return;
    }
    setVerifying(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: emailTrimmed,
      token: otpCode.trim(),
      type: 'email'
    });
    if (error) {
      setError(error.message);
      setVerifying(false);
      return;
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email ?? emailTrimmed,
              full_name: (user.user_metadata as any)?.full_name ?? null,
              role: (user.user_metadata as any)?.role ?? null
            },
            { onConflict: 'id' }
          );
      }
    } catch {}
    setVerifying(false);
    router.push('/dashboard');
    router.refresh();
  };

  // Sign up flow is handled on a dedicated /signup page.

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-transparent">
          <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-semibold tracking-tight text-gray-900">Sign in</CardTitle>
            <CardDescription className="text-center text-gray-500 mt-1">Access your Crisis Suite</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-7" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              {info}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1.5"
              />
            </div>
            {showPassword && (
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</Label>
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* OTP flow */}
            <div className="space-y-2">
              <Button onClick={handleSendOtp} disabled={loading} className="w-full">
                Email me a code
              </Button>
              <p className="text-xs text-gray-500 text-center">We’ll email you a 6‑digit code.</p>
              {otpSent && (
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6‑digit code"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying…' : 'Verify'}
                  </Button>
                </div>
              )}
            </div>

            {/* Password flow (de-emphasized) */}
            {!showPassword ? (
              <Button
                onClick={() => { setShowPassword(true); setTimeout(() => passwordRef.current?.focus(), 0); }}
                disabled={loading}
                variant="link"
                className="text-xs"
              >
                Use password instead
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in with password'}
              </Button>
            )}

            {/** Signup CTA moved to footer next to Back to home */}
          </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full flex items-center justify-between">
              <Link href="/" className="text-sm text-primary hover:underline">
                Back to home
              </Link>
              <Button
                onClick={() => router.push('/signup')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Create new account
              </Button>
            </div>
          </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
