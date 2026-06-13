'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bell, Mail, Shield, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { changeEmail, changePassword } from '@/services/auth.service';
import { useAuthStore } from '@/store';

const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail: z.email('Enter a valid email address'),
});
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ChangeEmailInput    = z.infer<typeof changeEmailSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

function isGoogleOnlyUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Dynamically access the already-initialised auth singleton from the module cache
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAuth } = require('firebase/auth') as typeof import('firebase/auth');
    const fbUser = getAuth().currentUser;
    if (!fbUser) return false;
    return fbUser.providerData.every((p) => p.providerId === 'google.com');
  } catch { return false; }
}

function ChangeEmailDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const googleOnly = isGoogleOnlyUser();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangeEmailInput>({ resolver: zodResolver(changeEmailSchema) });

  const onSubmit = async (data: ChangeEmailInput) => {
    try {
      await changeEmail(data.currentPassword, data.newEmail);
      if (user) setUser({ ...user, email: data.newEmail });
      toast.success('Email updated successfully');
      reset(); onClose();
    } catch (e: unknown) {
      const msg = (e as Error).message ?? '';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) toast.error('Incorrect current password');
      else if (msg.includes('email-already-in-use')) toast.error('That email is already in use');
      else toast.error('Failed to update email.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>{googleOnly ? 'Your account uses Google Sign-In.' : `Current: ${user?.email}`}</DialogDescription>
        </DialogHeader>
        {googleOnly ? (
          <div className="py-4 text-center"><p className="text-sm text-stone-500">Update your email via your Google account settings.</p><Button variant="outline" className="mt-4" onClick={onClose}>Close</Button></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showPwd ? 'text' : 'password'} {...register('currentPassword')} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New Email</Label>
              <Input type="email" placeholder="you@example.com" {...register('newEmail')} />
              {errors.newEmail && <p className="text-xs text-red-500">{errors.newEmail.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button type="submit" variant="premium" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Updating...</> : 'Update Email'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const googleOnly = isGoogleOnlyUser();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully'); reset(); onClose();
    } catch (e: unknown) {
      const msg = (e as Error).message ?? '';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) toast.error('Incorrect current password');
      else toast.error('Failed to update password.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>{googleOnly ? 'Passwords are managed by Google.' : 'Enter your current password and choose a new one.'}</DialogDescription>
        </DialogHeader>
        {googleOnly ? (
          <div className="py-4 text-center"><p className="text-sm text-stone-500">Update your password via your Google account settings.</p><Button variant="outline" className="mt-4" onClick={onClose}>Close</Button></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? 'text' : 'password'} {...register('currentPassword')} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? 'text' : 'password'} placeholder="Min. 8 chars, 1 uppercase, 1 number" {...register('newPassword')} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button type="submit" variant="premium" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Updating...</> : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, bookingUpdates: true, marketing: false });
  const [emailDialogOpen, setEmailDialogOpen]       = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-600 dark:text-white/60 mt-1 text-sm">Manage your preferences and account.</p>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="dash-card rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-amber-500/20 rounded-xl"><Bell className="h-4 w-4 text-amber-400" /></div>
            <div>
              <p className="font-bold text-white text-sm">Notifications</p>
              <p className="text-xs text-white/35">Choose what you want to hear about.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email',          label: 'Email notifications', desc: 'Booking confirmations via email'       },
              { key: 'bookingUpdates', label: 'Booking updates',     desc: 'Status changes on your reservations' },
              { key: 'marketing',      label: 'Promotions & deals',  desc: 'Exclusive offers and new properties'  },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-semibold text-white/70 text-sm">{item.label}</Label>
                  <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/8">
            <Button size="sm" onClick={() => toast.success('Notification preferences saved')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-bold">
              Save preferences
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="dash-card-blue rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Shield className="h-4 w-4 text-blue-400" /></div>
            <div>
              <p className="font-bold text-white text-sm">Security</p>
              <p className="text-xs text-white/35">Update your login credentials.</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2 border-white/10 text-white/60 hover:bg-white/8 hover:text-white hover:border-blue-500/40 bg-transparent"
              onClick={() => setEmailDialogOpen(true)}>
              <Mail className="h-4 w-4 text-blue-400" /> Change Email Address
            </Button>
            <Separator className="bg-white/8" />
            <Button variant="outline" className="w-full justify-start gap-2 border-white/10 text-white/60 hover:bg-white/8 hover:text-white hover:border-blue-500/40 bg-transparent"
              onClick={() => setPasswordDialogOpen(true)}>
              <Shield className="h-4 w-4 text-blue-400" /> Change Password
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="dash-card-orange rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-red-500/20 rounded-xl"><Trash2 className="h-4 w-4 text-red-400" /></div>
            <div>
              <p className="font-bold text-red-300 text-sm">Danger Zone</p>
              <p className="text-xs text-white/35">Irreversible actions — proceed with caution.</p>
            </div>
          </div>
          <Button variant="destructive" className="gap-2 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:text-red-200"
            onClick={() => toast.error('Please contact support to delete your account')}>
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>
      </motion.div>

      <ChangeEmailDialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} />
      <ChangePasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />
    </div>
  );
}
