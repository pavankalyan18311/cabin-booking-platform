'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to send reset email');
      setSentEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-2xl w-fit">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">
            {sent ? 'Check your inbox' : 'Reset your password'}
          </CardTitle>
          <CardDescription>
            {sent
              ? <>We sent a reset link to <span className="font-semibold text-stone-700">{sentEmail}</span></>
              : "Enter your email and we'll send a reset link."
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <Button type="submit" variant="premium" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
                    : 'Send Reset Link'
                  }
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Reset link sent!</p>
                    <p className="text-sm text-emerald-700 mt-0.5">
                      The link expires in 30 minutes. Check your spam or junk folder if you don&apos;t see it in your inbox.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">Didn&apos;t receive the email?</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder</li>
                    <li>Add <strong>relaxingatcabins@gmail.com</strong> to your contacts</li>
                    <li>Wait a minute and check again</li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setSent(false);
                    setSentEmail('');
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Try a different email
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 pt-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
