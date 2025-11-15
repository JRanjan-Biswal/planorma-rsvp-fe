'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!password || password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to home page after successful login
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ 
        general: error?.message || 'Login failed. Please check your credentials and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/30 dark:bg-[#1a1a1a]">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-secondary/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {errors.general && (
            <motion.div
              // initial={{ opacity: 0, y: -10 }}
              // animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  label=""
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-sm text-secondary dark:text-secondary hover:underline"
            >
              Don't have an account? Sign up
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
            <p>Admin access requires special permissions</p>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
