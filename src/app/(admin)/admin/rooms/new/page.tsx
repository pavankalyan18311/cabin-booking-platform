'use client';
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
import { roomSchema, type RoomInput } from '@/lib/validations';
import { createRoom } from '@/services/rooms.service';
import { RoomImageUpload } from '@/components/admin/RoomImageUpload';
import Link from 'next/link';
import { toast } from 'sonner';

const AMENITIES_GROUPS = [
  {
    label: 'Bathroom & Laundry',
    items: ['Bed Linen', 'Blow Dryer', 'Shower', 'Towel Set', 'Bathtub', 'Whirlpool Tub', 'Washer/Dryer', 'Iron'],
  },
  {
    label: 'Heating & Cooling',
    items: ['Air Conditioning', 'Central Heating', 'Fireplace', 'Ceiling Fans'],
  },
  {
    label: 'Kitchen & Dining',
    items: ['Blender', 'Coffee Maker', 'Cooking Utensils', 'Dishwasher', 'Grill', 'Kitchen Stove', 'Microwave', 'Oven', 'Refrigerator', 'Toaster'],
  },
  {
    label: 'Entertainment',
    items: ['TV / Satellite TV', 'DVD Player', 'Game Room'],
  },
  {
    label: 'Internet & Office',
    items: ['WiFi', 'Broadband Internet', 'Telephone'],
  },
  {
    label: 'Home Safety',
    items: ['Fire Extinguisher'],
  },
  {
    label: 'Outdoor & Recreation',
    items: ['Fire Pit', 'BBQ Grill', 'Parking', 'Porch', 'Screened Porch', 'Balcony', 'Terrace', 'Hot Tub', 'Pool', 'Kayaks', 'Fishing Access'],
  },
  {
    label: 'Views & Location',
    items: ['Mountain View', 'Lakefront'],
  },
  {
    label: 'Other',
    items: ['Pet Friendly'],
  },
];

export default function NewRoomPage() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RoomInput, any, RoomInput>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      amenities: [],
      isFeatured: false,
      isAvailable: true,
      isUnderMaintenance: false,
      tags: [],
      category: 'cabin',
      images: [],
    },
  });

  const onSubmit = async (data: RoomInput) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createRoom(data as any);
      toast.success('Room created successfully!');
      router.push('/admin/rooms');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to create room');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/rooms">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Add New Cabin</h1>
          <p className="text-stone-500 text-sm">Create a new property listing.</p>
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
              <Label>Description *</Label>
              <Textarea placeholder="Detailed description of the property..." rows={5} {...register('description')} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

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
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Capacity</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {[
              { label: 'Max Guests', field: 'maxGuests' as const },
              { label: 'Bedrooms',   field: 'bedrooms'  as const },
              { label: 'Bathrooms',  field: 'bathrooms' as const },
            ].map((f) => (
              <div key={f.field} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type="number" min={1} {...register(f.field, { valueAsNumber: true })} />
                {errors[f.field] && <p className="text-xs text-red-500">{errors[f.field]?.message}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Room Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Room Details <span className="text-stone-400 font-normal text-xs">(optional counts shown as chips on room page)</span></CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Toilets',         field: 'toilets'       as const },
              { label: 'Balconies',       field: 'balconies'     as const },
              { label: 'Kitchens',        field: 'kitchens'      as const },
              { label: 'Dining Rooms',    field: 'diningRooms'   as const },
              { label: 'Living Rooms',    field: 'livingRooms'   as const },
              { label: 'Queen-size Beds', field: 'queensizeBeds' as const },
              { label: 'Sofa Beds',       field: 'sofaBeds'      as const },
              { label: 'Fold-away Beds',  field: 'foldawayBeds'  as const },
              { label: 'Loft Beds',       field: 'loftBeds'      as const },
              { label: 'King-size Beds',  field: 'kingsizeBeds'  as const },
              { label: 'Terraces',        field: 'terraces'      as const },
            ].map((f) => (
              <div key={f.field} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Input type="number" min={1} placeholder="—" {...register(f.field, { valueAsNumber: true })} />
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
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
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
              <div className="space-y-4">
                {AMENITIES_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">{group.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.items.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={field.value.includes(amenity)}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange([...field.value, amenity]);
                              else field.onChange(field.value.filter((a) => a !== amenity));
                            }}
                          />
                          <span className="text-sm text-stone-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Room'}
          </Button>
        </div>
      </form>
    </div>
  );
}
