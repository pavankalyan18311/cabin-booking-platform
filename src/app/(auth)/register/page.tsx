'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { registerWithEmail, loginWithGoogle } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passwordChecks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterInput) => {
    try {
      const user = await registerWithEmail(data.email, data.password, data.displayName);
      setUser(user);
      toast.success('Account created! Please verify your email.');
      router.push('/verify-email');
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : 'Failed to create account';
      toast.error(msg);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      setUser(user);
      toast.success('Account created with Google!');
      router.push('/dashboard');
    } catch {
      toast.error('Google sign-up failed');
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
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join Relax Cabin and discover amazing retreats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button onClick={handleGoogleSignup} disabled={googleLoading} variant="outline" className="w-full h-11 gap-2">
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Sign up with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Full name</Label>
              <Input id="displayName" placeholder="John Doe" {...register('displayName')} />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-3 mt-2">
                  {passwordChecks.map((c) => (
                    <div key={c.label} className={`flex items-center gap-1 text-xs ${c.valid ? 'text-emerald-600' : 'text-stone-400'}`}>
                      <Check className="h-3 w-3" />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="premium" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-medium hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
