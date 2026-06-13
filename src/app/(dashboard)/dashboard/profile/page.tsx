'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { profileSchema, type ProfileInput } from '@/lib/validations';
import { updateUserProfile } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, data);
      setUser({ ...user, ...data });
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
  };

  const initials = user?.displayName?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U';

  return (
    <div className="space-y-5 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-600 dark:text-white/60 mt-1 text-sm">Manage your personal information.</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="dash-card rounded-2xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Profile</p>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-white text-lg">{user?.displayName}</p>
              <p className="text-sm text-white/40">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full
                bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 capitalize">
                {user?.role} account
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal info form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="dash-card rounded-2xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Personal Information</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-white/60 text-xs font-bold uppercase tracking-wide">Full Name</Label>
              <Input id="displayName" {...register('displayName')}
                className="dash-input rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20" />
              {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/60 text-xs font-bold uppercase tracking-wide">Email Address</Label>
              <Input id="email" value={user?.email} disabled
                className="dash-input rounded-xl opacity-40 cursor-not-allowed" />
              <p className="text-xs text-white/25">Email cannot be changed here — go to Settings</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/60 text-xs font-bold uppercase tracking-wide">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register('phone')}
                className="dash-input rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20" />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            <div className="pt-1">
              <Button type="submit" disabled={isSubmitting || !isDirty}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-bold shadow-lg shadow-amber-900/30">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="dash-card-blue rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/80">Account Security</p>
              <p className="text-xs text-white/35">Change your email or password in Settings</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
