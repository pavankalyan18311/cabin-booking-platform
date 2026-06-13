'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Loader2, MapPin, Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  getNearbyLocations,
  addNearbyLocation,
  updateNearbyLocation,
  deleteNearbyLocation,
} from '@/services/nearbyLocations.service';
import type { NearbyLocation } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  name:       z.string().min(2, 'Name is required'),
  distance:   z.number().positive('Must be a positive number'),
  approxTime: z.string().min(2, 'e.g. ~5 min drive'),
});
type FormData = z.infer<typeof schema>;

export default function NearbyAdminPage() {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]     = useState<NearbyLocation | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { distance: 1, approxTime: '', name: '' },
  });

  const load = () => {
    setLoading(true);
    getNearbyLocations()
      .then(setLocations)
      .catch(() => toast.error('Failed to load locations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    reset({ distance: 1, approxTime: '', name: '' });
    setDialogOpen(true);
  };

  const openEdit = (loc: NearbyLocation) => {
    setEditing(loc);
    reset({ name: loc.name, distance: loc.distance, approxTime: loc.approxTime });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await updateNearbyLocation(editing.id, data);
        toast.success('Location updated');
      } else {
        await addNearbyLocation(data);
        toast.success('Location added');
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error('Failed to save location');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteNearbyLocation(id);
      toast.success('Location deleted');
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error('Failed to delete location');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Nearby Locations</h1>
          <p className="text-stone-500 text-sm mt-1">Shown on the landing page to help guests plan their stay.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4" /> Add Location
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{locations.length} location{locations.length !== 1 ? 's' : ''} · sorted by distance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
            </div>
          ) : locations.length === 0 ? (
            <p className="text-center text-stone-400 py-10 text-sm">No nearby locations yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-4 py-3">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 shrink-0">
                    <MapPin className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm">{loc.name}</p>
                    <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-amber-600">{loc.distance} mi</span>
                      <span>·</span>
                      <Navigation2 className="h-3 w-3" />
                      {loc.approxTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-700"
                      onClick={() => openEdit(loc)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-red-600"
                      onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id}>
                      {deleting === loc.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Location' : 'Add Nearby Location'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Place name *</Label>
              <Input placeholder="e.g. Blue Ridge Market" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Distance (miles) *</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 2.5"
                {...register('distance', { valueAsNumber: true })}
              />
              {errors.distance && <p className="text-xs text-red-500">{errors.distance.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Approx travel time *</Label>
              <Input placeholder="e.g. ~5 min drive" {...register('approxTime')} />
              {errors.approxTime && <p className="text-xs text-red-500">{errors.approxTime.message}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{editing ? 'Saving...' : 'Adding...'}</>
                  : editing ? 'Save Changes' : 'Add Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
