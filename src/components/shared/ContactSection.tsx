'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, Navigation, ExternalLink, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';

const contacts = [
  { icon: Phone,  value: '608-350-0800',                  sub: 'Call us anytime',        bg: 'bg-amber-100',   icon_cls: 'text-amber-700'   },
  { icon: Mail,   value: 'relaxingatcabins@gmail.com',    sub: 'Reply within 24 hours',  bg: 'bg-emerald-100', icon_cls: 'text-emerald-700' },
  { icon: MapPin, value: 'N6768 WI-58, New Lisbon, WI',  sub: 'New Lisbon, WI 53950',   bg: 'bg-rose-100',    icon_cls: 'text-rose-700'    },
];

export default function ContactSection() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Controlled form fields
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [email,     setEmail]       = useState('');
  const [subject,   setSubject]     = useState('');
  const [message,   setMessage]     = useState('');

  // OTP state (only needed for non-logged-in users)
  const [otpSending,    setOtpSending]    = useState(false);
  const [otpSent,       setOtpSent]       = useState(false);
  const [otpVerified,   setOtpVerified]   = useState(false);
  const [otpCode,       setOtpCode]       = useState('');
  const [otpVerifying,  setOtpVerifying]  = useState(false);

  // Auto-fill from logged-in user; mark as verified (Firebase already verified their email)
  useEffect(() => {
    if (user) {
      const parts = (user.displayName ?? '').trim().split(/\s+/);
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' '));
      setEmail(user.email ?? '');
      setOtpVerified(true);
    }
  }, [user]);

  // Reset OTP verification when email changes (for non-logged-in users)
  useEffect(() => {
    if (!user) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtpCode('');
    }
  }, [email, user]);

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email first');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/contact/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setOtpSent(true);
      toast.success(`Verification code sent to ${email}`);
    } catch {
      toast.error('Failed to send code. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) { toast.error('Enter the code first'); return; }
    setOtpVerifying(true);
    try {
      const res = await fetch('/api/contact/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json() as { verified?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Verification failed');
      setOtpVerified(true);
      toast.success('Email verified!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error('Please verify your email first');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, subject, message }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setSubject('');
      setMessage('');
      // Keep name/email for logged-in users but reset for guests
      if (!user) {
        setFirstName('');
        setLastName('');
        setEmail('');
        setOtpVerified(false);
        setOtpSent(false);
        setOtpCode('');
      }
    } catch {
      toast.error('Failed to send message. Please email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400/20';

  return (
    <section id="contact" className="py-24 bg-emerald-900 relative overflow-hidden">
      {/* Warm golden glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
      {/* Corner circle */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-800 rounded-full opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-4">
            Get in touch
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Plan Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              Perfect Escape
            </span>
          </h2>
          <p className="text-emerald-300 mt-4 max-w-xl mx-auto text-base">
            Have questions or need help? Our team is ready to make your dream cabin stay happen.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Contact info */}
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            className="space-y-4">
            {contacts.map((c) => (
              <div key={c.value}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all group">
                <div className={`p-3 rounded-xl ${c.bg} shrink-0 group-hover:scale-110 transition-transform`}>
                  <c.icon className={`h-5 w-5 ${c.icon_cls}`} />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{c.value}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}

            {/* Emergency */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl shadow-amber-900/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <h4 className="font-bold text-white text-sm">24/7 Emergency Support</h4>
              </div>
              <p className="text-amber-100 text-xs leading-relaxed mb-3">
                Urgent issues during your stay? We&apos;re always here for you.
              </p>
              <p className="text-white font-black text-lg">608-350-0800</p>
            </div>

            {/* Location card */}
            <motion.a
              href="https://www.google.com/maps/place/Relaxin+Cabins/@43.8890419,-90.0712974,17z/data=!4m15!1m8!3m7!1s0x87fe038c5e671d5b:0xd51965f9fcc98de5!2sN6768+WI-58,+New+Lisbon,+WI+53950,+USA!3b1!8m2!3d43.8890419!4d-90.0687225!16s%2Fg%2F11f54w7cxr!3m5!1s0x87fe03364d789a2d:0x373f5f6016adcfce!8m2!3d43.8889845!4d-90.0687502!16s%2Fg%2F11fl794v0v?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank" rel="noopener noreferrer"
              initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              whileHover={{ scale: 1.02 }}
              className="block rounded-2xl overflow-hidden shadow-xl border border-white/10 h-52 relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700" />
              <div className="absolute inset-0 opacity-10 map-grid" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-300/40 -rotate-6" />
              <div className="absolute top-[40%] left-0 right-[30%] h-0.5 bg-white/20 rotate-3" />
              <div className="absolute bottom-[30%] left-[20%] right-0 h-0.5 bg-white/15 -rotate-2" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping scale-150" />
                  <div className="relative w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-900/60 group-hover:bg-amber-400 transition-colors">
                    <MapPin className="h-6 w-6 text-white fill-white/30" />
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <p className="text-white font-bold text-sm">Relaxin Cabins</p>
                  <p className="text-white/70 text-xs">N6768 WI-58, New Lisbon, WI</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-3">
                <div className="flex items-center gap-1.5 bg-white/90 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Navigation className="h-3 w-3" />
                  Get Directions
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </motion.a>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <form onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-7 sm:p-8 shadow-2xl space-y-4">
              <h3 className="text-xl font-black text-stone-900 mb-2">Talk to us</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">First name</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    readOnly={!!user}
                    className={`${inputCls} ${user ? 'bg-stone-50 text-stone-500' : ''}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Last name</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    readOnly={!!user}
                    className={`${inputCls} ${user ? 'bg-stone-50 text-stone-500' : ''}`}
                  />
                </div>
              </div>

              {/* Email + OTP verify (for non-logged-in users) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Email</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    readOnly={!!user || otpVerified}
                    className={`${inputCls} flex-1 ${(user || otpVerified) ? 'bg-stone-50 text-stone-500' : ''}`}
                  />
                  {!user && !otpVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-10 px-3 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-bold"
                      onClick={handleSendOtp}
                      disabled={otpSending}
                    >
                      {otpSending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : otpSent ? 'Resend' : 'Verify'}
                    </Button>
                  )}
                  {!user && otpVerified && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold px-2 shrink-0">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>

                {/* OTP input — shown after code is sent */}
                {!user && otpSent && !otpVerified && (
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      <Input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className={`${inputCls} pl-9 font-mono tracking-widest`}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 h-10 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpCode.length < 6}
                    >
                      {otpVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your dream getaway..."
                  rows={4}
                  required
                  className={`${inputCls} resize-none`}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-200 gap-2"
                disabled={loading || (!user && !otpVerified)}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Sending...' : 'Send'}
              </Button>

              {!user && !otpVerified && (
                <p className="text-xs text-stone-400 text-center">
                  Verify your email to send a message
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
