'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { loginWithEmail, loginWithGoogle } from '@/services/auth.service';
import { getUserProfile } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setUser } = useAuthStore();

  const getRedirect = (role: string) =>
    redirect || (role === 'admin' ? '/admin' : '/dashboard');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const cred = await loginWithEmail(data.email, data.password);
      const profile = await getUserProfile(cred.user.uid);
      if (profile?.isBlocked) {
        toast.error('Your account has been suspended');
        return;
      }
      setUser(profile);
      // Gate unverified email/password users — Google users are auto-verified
      if (profile?.authProvider === 'email' && !profile.isEmailVerified) {
        toast.info('Please verify your email to continue.');
        const dest = getRedirect(profile.role);
        router.push(`/verify-email?redirect=${encodeURIComponent(dest)}`);
        return;
      }
      toast.success('Welcome back!');
      router.push(getRedirect(profile?.role ?? 'user'));
    } catch {
      toast.error('Invalid email or password');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      setUser(user);
      toast.success('Signed in with Google!');
      router.push(getRedirect(user.role));
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Relax Cabin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-11 gap-2"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-amber-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              variant="premium"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-amber-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
