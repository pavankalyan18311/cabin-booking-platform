'use client';
import { useRef, useState } from 'react';
import { X, Upload, ImageIcon, Loader2, Star } from 'lucide-react';
import { uploadRoomImage } from '@/lib/firebase/storage';
import { toast } from 'sonner';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

interface UploadingFile {
  name: string;
  progress: number;
}

export function RoomImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 10 MB limit`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    setUploading(valid.map((f) => ({ name: f.name, progress: 0 })));

    const results = await Promise.all(
      valid.map((file, i) =>
        uploadRoomImage(file, (pct) =>
          setUploading((prev) =>
            prev.map((u, idx) => (idx === i ? { ...u, progress: pct } : u)),
          ),
        ).catch(() => {
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }),
      ),
    );

    const uploaded = results.filter(Boolean) as string[];
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading([]);

    // reset so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-stone-600">Click to browse or drag &amp; drop</p>
        <p className="text-xs text-stone-400 mt-1">PNG, JPG, WebP — up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-stone-500" />
              <span className="truncate text-stone-600 flex-1">{f.name}</span>
              <span className="text-stone-400 shrink-0 tabular-nums">{f.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <>
          <p className="text-xs text-stone-400">
            ★ The first image is used as the main/cover photo everywhere (cards, emails, bookings).
            Click the star on any image to make it the main photo.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {value.map((url, i) => (
              <div
                key={i}
                className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-colors ${
                  i === 0 ? 'border-amber-400' : 'border-stone-200'
                }`}
              >
                <img
                  src={url}
                  alt={`Room photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 bg-stone-100 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-stone-400" />
                </div>

                {/* Main badge */}
                {i === 0 && (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    <Star className="h-2.5 w-2.5 fill-current" /> Main
                  </div>
                )}

                {/* Set as main button (non-main images only) */}
                {i !== 0 && (
                  <button
                    type="button"
                    aria-label="Set as main photo"
                    onClick={() => {
                      const rest = value.filter((_, idx) => idx !== i);
                      onChange([url, ...rest]);
                    }}
                    className="absolute top-1 left-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Set as main photo"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
