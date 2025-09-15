'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const emailTrimmed = email.trim();
      if (!emailTrimmed || !password) {
        setError('Please enter both email and password to sign up.');
        setLoading(false);
        return;
      }
      const emailOk = /.+@.+\..+/.test(emailTrimmed);
      if (!emailOk) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: emailTrimmed,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/dashboard'
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If email confirmation is disabled and a session exists, upsert profile row
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
      } catch {
        // ignore; will be handled on first login if needed
      }

      setInfo('Check your email for the confirmation link (if required).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setInfo(null);
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter your email to receive a magic link.');
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
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard',
        shouldCreateUser: true
      }
    });
    if (error) {
      setError(error.message);
      return;
    }
    setInfo('Magic link sent! Check your email to finish signing up.');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Create account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up to access your Crisis Suite dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {info}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* OTP flow */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Email me a code
              </button>
              {otpSent && (
                <div className="flex items-center gap-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6‑digit code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifying}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              )}
            </div>

            {/* Password signup */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Email me a magic link instead
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-gray-700 hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
