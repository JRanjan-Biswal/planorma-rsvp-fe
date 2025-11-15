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

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (!pwd || pwd.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (!hasLetter) {
      return 'Password must contain at least 1 letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least 1 number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least 1 special character';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password);
      // After successful signup and auto-login, redirect to home
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ 
        general: error?.message || 'Signup failed. Please try again.' 
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
            <h1 className="text-3xl font-bold text-secondary mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign up to get started</p>
          </div>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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
                  className="absolute right-3 top-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  label=""
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-secondary dark:text-secondary hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}

