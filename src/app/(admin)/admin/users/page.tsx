'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, ShieldOff, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllUsers, updateUserRole, blockUser } from '@/services/users.service';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(user.uid, newRole);
      setUsers((prev) => prev.map((u) => u.uid === user.uid ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleBlockToggle = async (user: User) => {
    try {
      await blockUser(user.uid, !user.isBlocked);
      setUsers((prev) => prev.map((u) => u.uid === user.uid ? { ...u, isBlocked: !u.isBlocked } : u));
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filtered = users.filter((u) =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Users</h1>
        <p className="text-stone-500 mt-1">Manage platform users and permissions.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <span className="text-sm text-stone-500 self-center">{filtered.length} users</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div key={user.uid} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900 truncate">{user.displayName}</span>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {user.role}
                      </Badge>
                      {user.isBlocked && <Badge variant="destructive" className="text-xs shrink-0">Blocked</Badge>}
                    </div>
                    <p className="text-sm text-stone-500 truncate">{user.email}</p>
                    <p className="text-xs text-stone-400">Joined {formatDate(user.createdAt)}</p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleRoleToggle(user)}
                    >
                      {user.role === 'admin' ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      variant={user.isBlocked ? 'outline' : 'destructive'}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleBlockToggle(user)}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
