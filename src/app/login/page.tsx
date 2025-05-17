'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminLogin = searchParams?.get('type') === 'admin';

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role === 'admin') {
          router.push('/');
        } else {
          setError('This login is for admin users only.');
          await supabase.auth.signOut();
        }
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log environment variables (masked for security)
      console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError(signInError.message || 'Failed to login. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if user has admin role
        if (isAdminLogin && data.user.user_metadata?.role !== 'admin') {
          setError('This login is for admin users only.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kaaba-pilgrims.jpg"
          alt="Kaaba and pilgrims"
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      {/* Login Form */}
      <div className="max-w-md w-full space-y-8 p-8 bg-white bg-opacity-90 rounded-lg shadow-xl relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl">🕋</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            <span className="text-primary">
              Tafweej
            </span>{' '}
            Hajj
          </h1>
          <p className="text-gray-600 mb-8">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-dark font-semibold shadow"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
        <button
          type="button"
          className="w-full mt-4 py-2 px-4 rounded-md text-primary border border-primary bg-white hover:bg-primary hover:text-white font-semibold shadow transition"
          onClick={() => router.push('/identify')}
        >
          Back
        </button>
      </div>
    </div>
  );
} 