'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const role = userRaw ? (JSON.parse(userRaw)?.role as string | undefined) : undefined;
      router.push(role === 'admin' ? '/admin' : '/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 text-white p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl"></span> paham-bareng
        </Link>
        <div>
          <h1 className="text-4xl font-bold mb-4">Track your developer journey</h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Ikuti peta belajar terstruktur, lacak progresmu, dan tingkatkan keterampilanmu dengan platform komunitas kami.
          </p>
        </div>
        <p className="text-primary-300 text-sm">© 2026 paham-bareng</p>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl text-dark-900 mb-8">
            <span className="text-2xl"></span> paham-bareng
          </Link>

          <h2 className="text-3xl font-bold text-dark-900 mb-2">Welcome back</h2>
          <p className="text-dark-500 mb-8">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field !pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field !pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? 'Signing in...' : 'Sign In'} <FiArrowRight />
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-50 rounded-lg">
            <p className="text-xs font-medium text-dark-600 mb-2">Demo Accounts:</p>
            <p className="text-xs text-dark-500">Admin: admin@roadmap.com / Admin123!</p>
          </div>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
