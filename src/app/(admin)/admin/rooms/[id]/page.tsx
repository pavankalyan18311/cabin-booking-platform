'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { roomSchema, type RoomInput } from '@/lib/validations';
import { getRoomById, updateRoom } from '@/services/rooms.service';
import { RoomImageUpload } from '@/components/admin/RoomImageUpload';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Room } from '@/types';

const AMENITIES_LIST = [
  'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Air Conditioning', 'Heating', 'Ceiling Fans',
  'Fire Pit', 'BBQ Grill', 'Parking', 'Porch', 'Screened Porch', 'Balcony', 'Terrace',
  'Hot Tub', 'Whirlpool Tub', 'Bathtub', 'Washer/Dryer', 'Iron',
  'TV / Satellite TV', 'Coffee Maker', 'Pet Friendly',
  'Pool', 'Mountain View', 'Lakefront', 'Game Room', 'Kayaks', 'Fishing Access',
];

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loadingRoom, setLoadingRoom] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<RoomInput, any, RoomInput>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      amenities: [], isFeatured: false, isAvailable: true,
      isUnderMaintenance: false, tags: [], category: 'cabin', images: [],
    },
  });

  useEffect(() => {
    getRoomById(id).then((room: Room | null) => {
      if (!room) { toast.error('Room not found'); router.push('/admin/rooms'); return; }
      reset({
        title: room.title,
        shortDescription: room.shortDescription,
        description: room.description,
        location: room.location,
        category: room.category,
        maxGuests: room.maxGuests,
        bedrooms: room.bedrooms,
        bathrooms: room.bathrooms,
        size: room.size,
        price: room.price,
        discountPrice: room.discountPrice,
        images: room.images,
        amenities: room.amenities,
        isFeatured: room.isFeatured,
        isAvailable: room.isAvailable,
        isUnderMaintenance: room.isUnderMaintenance ?? false,
        tags: room.tags ?? [],
      });
    }).finally(() => setLoadingRoom(false));
  }, [id, reset, router]);

  const onSubmit = async (data: RoomInput) => {
    try {
      await updateRoom(id, data as Partial<Room>);
      toast.success('Room updated!');
      router.push('/admin/rooms');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to update room');
    }
  };

  if (loadingRoom) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/rooms">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Edit Room</h1>
          <p className="text-stone-500 text-sm">Update property listing details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Cozy Mountain Cabin with Hot Tub" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Short Description *</Label>
              <Input placeholder="A brief tagline for the listing" {...register('shortDescription')} />
              {errors.shortDescription && <p className="text-xs text-red-500">{errors.shortDescription.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Full Description *</Label>
              <Textarea placeholder="Detailed description..." rows={5} {...register('description')} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['cabin', 'lodge', 'cottage', 'villa', 'chalet'].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Location *</Label>
                <Input placeholder="Blue Ridge, Georgia" {...register('location')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Capacity & Size</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Max Guests', field: 'maxGuests' as const },
              { label: 'Bedrooms',   field: 'bedrooms'  as const },
              { label: 'Bathrooms',  field: 'bathrooms' as const },
              { label: 'Size (sq ft)', field: 'size'    as const },
            ].map((f) => (
              <div key={f.field} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type="number" min={1} {...register(f.field, { valueAsNumber: true })} />
                {errors[f.field] && <p className="text-xs text-red-500">{errors[f.field]?.message}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nightly Rate (USD) *</Label>
              <Input type="number" min={1} placeholder="299" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Discount Price (optional)</Label>
              <Input type="number" min={1} placeholder="249" {...register('discountPrice', { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader><CardTitle className="text-base">Photos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <RoomImageUpload value={field.value ?? []} onChange={field.onChange} />
              )}
            />
            {errors.images && (
              <p className="text-xs text-red-500">{errors.images.message ?? (errors.images as { root?: { message?: string } }).root?.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader><CardTitle className="text-base">Amenities *</CardTitle></CardHeader>
          <CardContent>
            <Controller name="amenities" control={control} render={({ field }) => (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES_LIST.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={field.value.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) field.onChange([...field.value, amenity]);
                        else field.onChange(field.value.filter((a: string) => a !== amenity));
                      }}
                    />
                    <span className="text-sm text-stone-700">{amenity}</span>
                  </label>
                ))}
              </div>
            )} />
            {errors.amenities && <p className="text-xs text-red-500 mt-2">{errors.amenities.message}</p>}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Available for Booking</Label>
                <p className="text-xs text-stone-400">Make this property visible and bookable</p>
              </div>
              <Controller name="isAvailable" control={control} render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured Property</Label>
                <p className="text-xs text-stone-400">Show on homepage featured section</p>
              </div>
              <Controller name="isFeatured" control={control} render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-amber-700">Under Maintenance</Label>
                <p className="text-xs text-stone-400">Show as temporarily closed — still visible but not bookable</p>
              </div>
              <Controller name="isUnderMaintenance" control={control} render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/admin/rooms" className="flex-1">
            <Button variant="outline" type="button" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" variant="premium" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
