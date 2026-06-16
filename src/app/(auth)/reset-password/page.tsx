'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error?.includes('invalid') || json.error?.includes('expired') || json.error?.includes('used')) {
          setInvalidToken(true);
        }
        throw new Error(json.error ?? 'Failed to reset password');
      }
      setDone(true);
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  if (invalidToken) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="shadow-2xl border-0 text-center">
          <CardContent className="py-12 space-y-4">
            <XCircle className="h-14 w-14 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-stone-900">Link invalid or expired</h2>
            <p className="text-stone-500 text-sm max-w-xs mx-auto">
              This password reset link is invalid or has already been used. Request a new one.
            </p>
            <Link href="/forgot-password">
              <Button variant="premium" className="mt-2">Request New Link</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="shadow-2xl border-0 text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-stone-900">Password reset!</h2>
            <p className="text-stone-500 text-sm">Redirecting you to sign in...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-2xl w-fit">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
          <CardDescription>Your new password must be at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-3 mt-2">
                  {checks.map((c) => (
                    <div key={c.label} className={`flex items-center gap-1 text-xs ${c.valid ? 'text-emerald-600' : 'text-stone-400'}`}>
                      <span>{c.valid ? '✓' : '○'}</span> {c.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="premium" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Saving...' : 'Reset Password'}
            </Button>
          </form>

          <Link href="/login" className="flex items-center justify-center gap-1.5 mt-4 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
