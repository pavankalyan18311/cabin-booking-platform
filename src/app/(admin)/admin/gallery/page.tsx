'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ImageIcon, Plus, Trash2, Loader2, Upload, GripVertical, X, Pencil, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { uploadRoomImage } from '@/lib/firebase/storage';
import { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/gallery.service';
import type { GalleryItem, GallerySpan } from '@/types';
import { toast } from 'sonner';

const SPAN_OPTIONS: { value: GallerySpan; label: string }[] = [
  { value: 'col-span-2 row-span-2', label: 'Large (2×2)' },
  { value: 'col-span-1 row-span-1', label: 'Small (1×1)' },
];

const DEFAULT_FORM = { label: '', sub: '', span: 'col-span-1 row-span-1' as GallerySpan };

export default function AdminGalleryPage() {
  const [items,   setItems]   = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);

  const [form, setForm]     = useState(DEFAULT_FORM);
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setItems(await getGalleryItems()); }
    catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(DEFAULT_FORM);
    setImgUrl('');
    setOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setForm({ label: item.label, sub: item.sub, span: item.span });
    setImgUrl(item.src);
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setUploading(true);
    try {
      const url = await uploadRoomImage(file, () => {});
      setImgUrl(url);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!imgUrl) { toast.error('Please upload an image'); return; }
    if (!form.label.trim()) { toast.error('Label is required'); return; }
    if (!form.sub.trim()) { toast.error('Subtitle is required'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await updateGalleryItem(editItem.id, { src: imgUrl, ...form });
        setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, src: imgUrl, ...form } : i));
        toast.success('Gallery item updated');
      } else {
        const id = await addGalleryItem({ src: imgUrl, ...form, order: items.length });
        setItems((prev) => [...prev, { id, src: imgUrl, ...form, order: items.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
        toast.success('Gallery item added');
      }
      setOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteGalleryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Gallery</h1>
          <p className="text-stone-500 text-sm mt-1">Manage the photos shown in the &ldquo;Life at Relax Cabin&rdquo; section.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4" /> Add Photo
        </Button>
      </motion.div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>Tip:</strong> Use one <Badge className="bg-amber-100 text-amber-800 border-amber-300 mx-1">Large (2×2)</Badge> card
        as a hero image, and fill the rest with <Badge className="bg-amber-100 text-amber-800 border-amber-300 mx-1">Small (1×1)</Badge> cards.
        Changes go live on the homepage immediately.
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-2xl">
          <ImageIcon className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="font-semibold text-stone-600 mb-1">No gallery photos yet</p>
          <p className="text-stone-400 text-sm mb-4">Add your first photo to show it on the homepage.</p>
          <Button onClick={openAdd} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4" /> Add First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              <Image src={item.src} alt={item.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Span badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/50 text-white border-0 text-[10px]">
                  {item.span === 'col-span-2 row-span-2' ? 'Large' : 'Small'}
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => openEdit(item)}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-stone-700 shadow-sm">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg text-white shadow-sm">
                  {deleting === item.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight">{item.label}</p>
                <p className="text-white/60 text-xs mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Gallery Photo' : 'Add Gallery Photo'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              {imgUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200">
                  <Image src={imgUrl} alt="Preview" fill className="object-cover" sizes="400px" />
                  <button type="button" onClick={() => setImgUrl('')}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  role="button" tabIndex={0}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}>
                  {uploading
                    ? <Loader2 className="h-7 w-7 animate-spin text-amber-500 mx-auto mb-2" />
                    : <Upload className="h-7 w-7 text-stone-300 mx-auto mb-2" />}
                  <p className="text-sm text-stone-500">{uploading ? 'Uploading…' : 'Click or drag & drop an image'}</p>
                  <p className="text-xs text-stone-400 mt-1">PNG, JPG, WebP · max 10 MB</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input placeholder="e.g. Forest Trails" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input placeholder="e.g. Miles of paths at your door" value={form.sub} onChange={(e) => setForm((p) => ({ ...p, sub: e.target.value }))} />
            </div>

            {/* Grid size */}
            <div className="space-y-1.5">
              <Label>Grid Size</Label>
              <Select value={form.span} onValueChange={(v) => setForm((p) => ({ ...p, span: v as GallerySpan }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPAN_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-400">Use one Large card as the hero, rest Small.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave} disabled={saving || uploading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Photo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
