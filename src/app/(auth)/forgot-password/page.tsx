'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { sendResetEmail } from '@/services/auth.service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await sendResetEmail(data.email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-2xl w-fit">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            {sent ? "Check your inbox for the reset link." : "Enter your email and we'll send a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <Button type="submit" variant="premium" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-stone-600 text-sm mb-6">Didn&apos;t receive the email? Check your spam folder.</p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Try again
              </Button>
            </div>
          )}
          <Link href="/login" className="flex items-center justify-center gap-1.5 mt-4 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
