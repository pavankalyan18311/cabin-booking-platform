'use client';
import { useState } from 'react';
import { Loader2, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId?: string;
  roomTitle?: string;
  userEmail?: string;
  userName?: string;
}

export default function SupportDialog({ open, onClose, bookingId, roomTitle, userEmail, userName }: Props) {
  const [name, setName]       = useState(userName ?? '');
  const [email, setEmail]     = useState(userEmail ?? '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleClose = () => {
    onClose();
    // reset after dialog animates out
    setTimeout(() => { setSent(false); setError(''); setMessage(''); }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), bookingId, roomTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to send');
      }
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Contact Support
          </DialogTitle>
          {!sent && (
            <DialogDescription>
              {bookingId
                ? `Send a message about booking #${bookingId.slice(0, 8).toUpperCase()}${roomTitle ? ` · ${roomTitle}` : ''}`
                : 'We typically respond within 24 hours.'}
            </DialogDescription>
          )}
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 mb-1">Message sent!</p>
              <p className="text-sm text-stone-500">
                We'll reply to <span className="font-medium text-stone-700">{email}</span> within 24 hours.
                Check your inbox for a confirmation.
              </p>
            </div>
            <Button className="mt-2 w-full" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Name</label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Email</label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Message</label>
              <Textarea
                placeholder={bookingId
                  ? 'Describe your issue or question about this booking…'
                  : 'How can we help you?'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                disabled={sending}
              >
                {sending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  : <><Send className="h-4 w-4" /> Send Message</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
