'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, MailCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

const RESEND_COOLDOWN = 60; // seconds

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const { user, setUser } = useAuthStore();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP on first mount
  useEffect(() => {
    sendOTP(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const sendOTP = useCallback(async (silent = false) => {
    setSending(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send code');
      if (!silent) toast.success('New code sent! Check your inbox.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const msg = (err as Error).message;
      if (msg.includes('already verified')) {
        toast.success('Email is already verified.');
        if (user) setUser({ ...user, isEmailVerified: true });
        router.replace(redirect);
        return;
      }
      if (!silent) toast.error(msg);
      else console.warn('[verify-email] auto-send failed:', msg);
    } finally {
      setSending(false);
    }
  }, [redirect, router, user, setUser]);

  const handleDigitInput = (index: number, value: string) => {
    // Accept only a single digit; handle paste of full 6-digit code
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const newDigits = value.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }
    setVerifying(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Verification failed');
      setVerified(true);
      if (user) setUser({ ...user, isEmailVerified: true });
      setTimeout(() => router.replace(redirect), 1500);
    } catch (err: unknown) {
      toast.error((err as Error).message);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-stone-900">Email Verified!</h2>
            <p className="text-stone-500 text-sm">Taking you to your dashboard...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-2xl w-fit">
            <MailCheck className="h-7 w-7 text-amber-700" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{' '}
            <span className="font-medium text-stone-700">{user?.email ?? 'your email'}</span>.
            <br />Check your inbox (and spam folder).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 6-digit input */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={d}
                onChange={(e) => handleDigitInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className="w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl
                  focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200
                  border-stone-200 bg-stone-50 text-stone-900 transition-all"
              />
            ))}
          </div>

          <Button
            variant="premium"
            className="w-full h-11"
            onClick={handleVerify}
            disabled={verifying || digits.join('').length < 6}
          >
            {verifying
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</>
              : 'Verify Email'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-stone-500 mb-2">Didn&apos;t receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-amber-700 hover:text-amber-800"
              onClick={() => sendOTP(false)}
              disabled={sending || cooldown > 0}
            >
              {sending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
