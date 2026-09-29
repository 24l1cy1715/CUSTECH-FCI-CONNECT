import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  Building2,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { campusApi, CampusLocation, CampusLocationCategory, CATEGORY_ICONS, CreateLocationInput } from '@/api/campusApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

const CATEGORIES: CampusLocationCategory[] = [
  'FACULTY', 'DEPARTMENT', 'LECTURE_HALL', 'LABORATORY', 'ICT',
  'ADMINISTRATION', 'LIBRARY', 'STUDENT_SERVICE', 'EVENT_LOCATION',
  'CAFETERIA', 'SPORTS', 'HOSTEL', 'MEDICAL', 'SECURITY', 'OTHER',
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ── Location Form ─────────────────────────────────────────────────────────────
const LocationForm: React.FC<{
  initial?: Partial<CampusLocation>;
  onSave: (data: CreateLocationInput & { isActive?: boolean }) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ initial, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState<CampusLocationCategory>(initial?.category || 'OTHER');
  const [building, setBuilding] = useState(initial?.building || '');
  const [floor, setFloor] = useState(initial?.floor || '');
  const [room, setRoom] = useState(initial?.room || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [latitude, setLatitude] = useState(initial?.latitude ? String(initial.latitude) : '');
  const [longitude, setLongitude] = useState(initial?.longitude ? String(initial.longitude) : '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const initialHours = (initial?.openingHours as Record<string, string>) || {};
  const [hours, setHours] = useState<Record<string, string>>(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: initialHours[d] || '' }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Location name is required');

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const cleanHours: Record<string, string> = {};
    DAYS.forEach((d) => { if (hours[d]) cleanHours[d] = hours[d]; });

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      building: building.trim() || undefined,
      floor: floor.trim() || undefined,
      room: room.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      latitude: !isNaN(lat) ? lat : undefined,
      longitude: !isNaN(lng) ? lng : undefined,
      openingHours: Object.keys(cleanHours).length ? cleanHours : undefined,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Location Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. FCI ICT Laboratory"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CampusLocationCategory)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Building
          </label>
          <input
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder="e.g. FCI Complex"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Floor
          </label>
          <input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="e.g. Ground Floor"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Room / Lab Number
          </label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Lab 1, Room 201"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. CUSTECH Main Campus, Osara, Kogi State"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 xxx xxx xxxx"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dept@custech.edu.ng"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Coordinates */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Navigation className="w-3 h-3" /> Latitude (GPS)
          </label>
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 7.8234567"
            type="number"
            step="any"
            min={-90}
            max={90}
            className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Navigation className="w-3 h-3" /> Longitude (GPS)
          </label>
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. 6.5234567"
            type="number"
            step="any"
            min={-180}
            max={180}
            className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what this location is and what services are available here…"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Opening Hours */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
            Opening Hours
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-xs text-text-muted capitalize w-20 shrink-0">{day}</span>
                <input
                  value={hours[day]}
                  onChange={(e) => setHours((h) => ({ ...h, [day]: e.target.value }))}
                  placeholder='e.g. 8AM–5PM or "Closed"'
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface-card text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Active toggle */}
        {initial && (
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-accent' : 'bg-surface-raised'}`}
              aria-checked={isActive}
              role="switch"
              aria-label="Location active status"
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-text-secondary">
              {isActive ? 'Active — visible to all users' : 'Inactive — hidden from public'}
            </span>
          </div>
        )}
      </div>

      {/* Coords note */}
      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/90">
          <strong>GPS Coordinates:</strong> Enter verified GPS coordinates for this location. Without accurate coordinates, the campus map will show a placeholder zone. You can use Google Maps to find the precise latitude and longitude.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="min-w-[120px]">
          {isSaving ? 'Saving…' : initial?.id ? 'Update Location' : 'Create Location'}
        </Button>
      </div>
    </form>
  );
};

// ── Main Admin Campus Manager ─────────────────────────────────────────────────
export const AdminCampusManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingLocation, setEditingLocation] = useState<CampusLocation | null | 'new'>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campus-locations', search],
    queryFn: () => campusApi.adminGetLocations({ search: search || undefined, limit: 100 }),
  });

  const locations = data?.locations || [];

  const createMutation = useMutation({
    mutationFn: (d: CreateLocationInput) => campusApi.adminCreateLocation(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-locations'] });
      queryClient.invalidateQueries({ queryKey: ['campus-locations'] });
      toast.success('Location created successfully');
      setEditingLocation(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create location');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLocationInput> & { isActive?: boolean } }) =>
      campusApi.adminUpdateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-locations'] });
      queryClient.invalidateQueries({ queryKey: ['campus-locations'] });
      toast.success('Location updated');
      setEditingLocation(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update location');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campusApi.adminDeleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-locations'] });
      queryClient.invalidateQueries({ queryKey: ['campus-locations'] });
      toast.success('Location deactivated');
    },
  });

  const handleSave = (data: CreateLocationInput & { isActive?: boolean }) => {
    if (editingLocation === 'new') {
      createMutation.mutate(data);
    } else if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const needsCoordsCount = locations.filter((l) => l.needsCoords).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Campus Location Management
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Manage FCI campus locations visible on the Campus Explorer map.
          </p>
        </div>
        <Button
          onClick={() => setEditingLocation('new')}
          className="self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      {/* Coordinate warning banner */}
      {needsCoordsCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {needsCoordsCount} location{needsCoordsCount !== 1 ? 's' : ''} missing GPS coordinates
            </p>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Click Edit on each location to add verified GPS coordinates so directions work correctly.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations…"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {editingLocation !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-6 border-accent/30">
              <h3 className="font-bold text-text-primary mb-5">
                {editingLocation === 'new' ? 'New Campus Location' : `Edit: ${editingLocation.name}`}
              </h3>
              <LocationForm
                initial={editingLocation === 'new' ? undefined : editingLocation}
                onSave={handleSave}
                onCancel={() => setEditingLocation(null)}
                isSaving={isSaving}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locations Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-widest">Location</th>
                <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-widest hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">Building</th>
                <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-widest text-center">Coords</th>
                <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-5 bg-surface-raised animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-muted text-sm">
                    No locations found
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent shrink-0" />
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{loc.name}</p>
                          <p className="text-xs text-text-muted font-mono">{loc.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" size="sm">{loc.category.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-text-secondary text-xs flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-text-muted" />
                        {loc.building || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loc.needsCoords ? (
                        <span title="Coordinates needed" className="inline-flex items-center gap-1 text-amber-400 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" /> Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Set
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loc.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
                          <Eye className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-text-muted text-xs">
                          <EyeOff className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingLocation(loc)}
                          aria-label={`Edit ${loc.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        {loc.isActive && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(loc.id)}
                            disabled={deleteMutation.isPending}
                            aria-label={`Deactivate ${loc.name}`}
                            className="text-red-400 hover:text-red-300"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
