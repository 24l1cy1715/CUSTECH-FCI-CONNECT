import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  X,
  Phone,
  Mail,
  Clock,
  Building2,
  Navigation,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Filter,
  Layers,
  Info,
  Landmark,
  Compass,
  GraduationCap,
  FlaskConical,
  Cpu,
  BookOpen,
  Users,
  Calendar,
  Utensils,
  Trophy,
  Home,
  HeartPulse,
  Shield,
  Map,
} from 'lucide-react';
import {
  campusApi,
  CampusLocation,
  CampusLocationCategory,
  CATEGORY_COLORS,
} from '@/api/campusApi';

function getCategoryIcon(cat: string): React.ComponentType<{ className?: string }> {
  switch (cat) {
    case 'FACULTY': return Landmark;
    case 'DEPARTMENT': return Compass;
    case 'LECTURE_HALL': return GraduationCap;
    case 'LABORATORY': return FlaskConical;
    case 'ICT': return Cpu;
    case 'ADMINISTRATION': return Building2;
    case 'LIBRARY': return BookOpen;
    case 'STUDENT_SERVICE': return Users;
    case 'EVENT_LOCATION': return Calendar;
    case 'CAFETERIA': return Utensils;
    case 'SPORTS': return Trophy;
    case 'HOSTEL': return Home;
    case 'MEDICAL': return HeartPulse;
    case 'SECURITY': return Shield;
    case 'ALL': return Map;
    default: return MapPin;
  }
}
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

// ── Category tab labels ───────────────────────────────────────────────────────
const CATEGORY_ORDER: (CampusLocationCategory | 'ALL')[] = [
  'ALL',
  'FACULTY',
  'DEPARTMENT',
  'LECTURE_HALL',
  'LABORATORY',
  'ICT',
  'LIBRARY',
  'ADMINISTRATION',
  'STUDENT_SERVICE',
  'EVENT_LOCATION',
  'OTHER',
];

const CATEGORY_NAMES: Record<CampusLocationCategory | 'ALL', string> = {
  ALL: 'All',
  FACULTY: 'Faculty',
  DEPARTMENT: 'Departments',
  LECTURE_HALL: 'Lecture Halls',
  LABORATORY: 'Laboratories',
  ICT: 'ICT Labs',
  ADMINISTRATION: 'Admin',
  LIBRARY: 'Library',
  STUDENT_SERVICE: 'Student Services',
  EVENT_LOCATION: 'Event Venues',
  CAFETERIA: 'Cafeteria',
  SPORTS: 'Sports',
  HOSTEL: 'Hostel',
  MEDICAL: 'Medical',
  SECURITY: 'Security',
  OTHER: 'Other',
};

// ── Directions helper ─────────────────────────────────────────────────────────
function buildDirectionsUrl(location: CampusLocation): string | null {
  if (location.latitude && location.longitude) {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  }
  if (location.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
  }
  return null;
}

// ── Location Card ─────────────────────────────────────────────────────────────
const LocationCard: React.FC<{
  location: CampusLocation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ location, isSelected, onClick }) => {
  const CategoryIcon = getCategoryIcon(location.category);
  const gradient = CATEGORY_COLORS[location.category] || 'from-[#94A3B8] to-[#64748B]';

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 p-4 ${
        isSelected
          ? 'border-accent bg-accent/10 shadow-md shadow-accent/10'
          : 'border-border bg-surface-card hover:border-accent/40 hover:bg-surface-raised'
      }`}
      aria-pressed={isSelected}
      aria-label={`View details for ${location.name}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm leading-tight line-clamp-1">
            {location.name}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {location.building || CATEGORY_NAMES[location.category] || location.category}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {location.needsCoords && (
            <span className="text-amber-400 text-[10px]" title="Coordinates not yet configured">
              <AlertTriangle className="w-3 h-3" />
            </span>
          )}
          <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
        </div>
      </div>
    </motion.button>
  );
};

// ── Location Detail Panel ─────────────────────────────────────────────────────
const LocationDetail: React.FC<{
  location: CampusLocation;
  onClose: () => void;
}> = ({ location, onClose }) => {
  const CategoryIcon = getCategoryIcon(location.category);
  const gradient = CATEGORY_COLORS[location.category] || 'from-[#94A3B8] to-[#64748B]';
  const directionsUrl = buildDirectionsUrl(location);
  const hours = location.openingHours as Record<string, string> | null;

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <motion.div
      key={location.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${gradient} p-6 rounded-t-2xl text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
                <CategoryIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase opacity-80">
                  {CATEGORY_NAMES[location.category] || location.category}
                </span>
                <h2 className="text-xl font-extrabold leading-tight">{location.name}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close location details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Coordinate warning */}
        {location.needsCoords && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              GPS coordinates not yet configured. Admin can add exact coordinates via the campus management panel.
            </p>
          </div>
        )}

        {/* Description */}
        {location.description && (
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">About</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{location.description}</p>
          </div>
        )}

        {/* Location Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Location Details</h3>

          {location.building && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-accent shrink-0" />
              <div>
                <span className="text-text-muted text-xs">Building</span>
                <p className="text-text-primary font-medium">{location.building}</p>
              </div>
            </div>
          )}

          {(location.floor || location.room) && (
            <div className="flex items-center gap-3 text-sm">
              <Layers className="w-4 h-4 text-accent shrink-0" />
              <div>
                <span className="text-text-muted text-xs">Location</span>
                <p className="text-text-primary font-medium">
                  {[location.floor, location.room].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          )}

          {location.address && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <div>
                <span className="text-text-muted text-xs">Address</span>
                <p className="text-text-primary font-medium">{location.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        {(location.phone || location.email) && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Contact</h3>

            {location.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href={`tel:${location.phone}`} className="text-accent hover:underline font-medium">
                  {location.phone}
                </a>
              </div>
            )}

            {location.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href={`mailto:${location.email}`} className="text-accent hover:underline font-medium break-all">
                  {location.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Opening Hours */}
        {hours && Object.keys(hours).length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Opening Hours
            </h3>
            <div className="bg-surface-raised rounded-xl border border-border overflow-hidden">
              {DAYS.filter((d) => hours[d]).map((day, idx) => {
                const isToday = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase() === day;
                return (
                  <div
                    key={day}
                    className={`flex justify-between items-center px-4 py-2.5 text-xs ${
                      idx < DAYS.filter((d) => hours[d]).length - 1 ? 'border-b border-border' : ''
                    } ${isToday ? 'bg-accent/10' : ''}`}
                  >
                    <span className={`capitalize font-medium ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
                      {isToday ? `${day} (Today)` : day}
                    </span>
                    <span className={`${hours[day] === 'Closed' ? 'text-text-muted' : 'text-text-primary'} font-mono`}>
                      {hours[day]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Preview placeholder */}
        {!location.needsCoords && location.latitude && location.longitude && (
          <div className="rounded-xl overflow-hidden border border-border bg-surface-raised h-40 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-xs">
                {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Directions CTA */}
      <div className="p-5 border-t border-border shrink-0">
        {directionsUrl ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent/90 text-black font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-accent/20"
            aria-label={`Get directions to ${location.name}`}
          >
            <Navigation className="w-4 h-4" />
            Get Directions
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        ) : (
          <div className="text-center text-xs text-text-muted py-2 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Directions unavailable until coordinates are configured
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Visual Campus Map ─────────────────────────────────────────────────────────
const CampusMapVisual: React.FC<{
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
}> = ({ locations, selectedLocation, onSelectLocation }) => {
  // Build a visual grid map — positions are illustrative since real coords need admin configuration
  const categorized = locations.reduce(
    (acc, loc) => {
      const cat = loc.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(loc);
      return acc;
    },
    {} as Record<string, CampusLocation[]>,
  );

  const categoryGroups = Object.entries(categorized);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] rounded-2xl overflow-hidden border border-white/10">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/90 text-xs font-bold tracking-widest uppercase">
              CUSTECH FCI — Campus Explorer
            </p>
          </div>
        </div>
      </div>

      {/* Campus zones */}
      <div className="absolute inset-0 pt-16 pb-4 px-4 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-auto">
          {categoryGroups.map(([category, locs]) => {
            const gradient = CATEGORY_COLORS[category as CampusLocationCategory] || 'from-[#94A3B8] to-[#64748B]';
            const ZoneIcon = getCategoryIcon(category);

            return (
              <div
                key={category}
                className={`bg-gradient-to-br ${gradient} bg-opacity-20 rounded-xl border border-white/10 p-3 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <ZoneIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider leading-tight">
                    {CATEGORY_NAMES[category as CampusLocationCategory] || category}
                  </span>
                </div>
                <div className="space-y-1">
                  {locs.slice(0, 3).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className={`w-full text-left text-[10px] px-2 py-1.5 rounded-lg transition-all duration-150 leading-tight ${
                        selectedLocation?.id === loc.id
                          ? 'bg-white/30 text-white font-bold'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                      aria-label={`Select ${loc.name}`}
                      aria-pressed={selectedLocation?.id === loc.id}
                    >
                      <div className="flex items-center gap-1">
                        {selectedLocation?.id === loc.id && (
                          <MapPin className="w-2.5 h-2.5 text-accent shrink-0" />
                        )}
                        <span className="line-clamp-1">{loc.name}</span>
                      </div>
                    </button>
                  ))}
                  {locs.length > 3 && (
                    <p className="text-white/40 text-[9px] pl-2">+{locs.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs-coords notice */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/90 text-[10px] leading-relaxed">
            <strong>Admin note:</strong> Enable an interactive map by configuring GPS coordinates for each location in the Campus Management panel.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main CampusPage ───────────────────────────────────────────────────────────
export const CampusPage: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CampusLocationCategory | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['campus-locations', activeCategory, debouncedSearch],
    queryFn: () =>
      campusApi.getLocations({
        category: activeCategory === 'ALL' ? undefined : activeCategory,
        search: debouncedSearch || undefined,
        limit: 100,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const locations = data?.locations || [];

  // Auto-select from URL param
  useEffect(() => {
    if (paramSlug && locations.length > 0) {
      const found = locations.find((l) => l.slug === paramSlug);
      if (found) {
        setSelectedLocation(found);
        setShowMobileDetail(true);
      }
    }
  }, [paramSlug, locations]);

  const handleSelectLocation = useCallback(
    (loc: CampusLocation) => {
      setSelectedLocation(loc);
      setShowMobileDetail(true);
      navigate(`/campus/${loc.slug}`, { replace: true });
    },
    [navigate],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedLocation(null);
    setShowMobileDetail(false);
    navigate('/campus', { replace: true });
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2">
            <MapPin className="w-7 h-7 text-accent" />
            FCI Campus Explorer
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Discover CUSTECH Faculty of Computing and Informatics — buildings, labs, services, and more.
          </p>
        </div>
        <Badge variant="accent" size="sm" className="self-start sm:self-center">
          {locations.length} Locations
        </Badge>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search "ICT lab", "lecture hall", "library"…'
          className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-surface-card text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          aria-label="Search campus locations"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4" role="tablist" aria-label="Filter by category">
        {CATEGORY_ORDER.map((cat) => {
          const CatIcon = getCategoryIcon(cat);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-accent text-black border-accent shadow-sm'
                  : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{CATEGORY_NAMES[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main layout: Map + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Map Visualization */}
        <div className="h-[420px] sm:h-[520px] lg:h-[620px]">
          {isLoading ? (
            <div className="w-full h-full rounded-2xl bg-surface-card border border-border flex items-center justify-center">
              <div className="text-center text-text-muted">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading campus map…</p>
              </div>
            </div>
          ) : isError ? (
            <div className="w-full h-full rounded-2xl bg-surface-card border border-border flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-text-muted text-sm">Failed to load campus data</p>
                <Button size="sm" variant="ghost" onClick={() => refetch()} className="mt-3">Retry</Button>
              </div>
            </div>
          ) : (
            <CampusMapVisual
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
            />
          )}
        </div>

        {/* Location List + Detail Panel */}
        <div className="flex flex-col gap-4">
          {/* Location List */}
          <Card className="p-0 overflow-hidden flex flex-col" style={{ maxHeight: selectedLocation ? '300px' : '620px' }}>
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <h2 className="font-semibold text-text-primary text-sm">
                {isLoading ? 'Loading…' : `${locations.length} Location${locations.length !== 1 ? 's' : ''}`}
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-surface-raised animate-pulse" />
                  ))
                ) : locations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center text-text-muted text-sm"
                  >
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No locations match your search
                  </motion.div>
                ) : (
                  locations.map((loc) => (
                    <LocationCard
                      key={loc.id}
                      location={loc}
                      isSelected={selectedLocation?.id === loc.id}
                      onClick={() => handleSelectLocation(loc)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* Detail Panel (desktop) */}
          <AnimatePresence mode="wait">
            {selectedLocation && (
              <Card className="p-0 overflow-hidden flex-1 min-h-0" style={{ maxHeight: '400px' }}>
                <LocationDetail location={selectedLocation} onClose={handleCloseDetail} />
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile Detail Bottom Sheet ── */}
      <AnimatePresence>
        {showMobileDetail && selectedLocation && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-surface-card rounded-t-2xl shadow-2xl border-t border-border max-h-[80vh] flex flex-col"
            role="dialog"
            aria-label={`Details for ${selectedLocation.name}`}
            aria-modal="true"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <LocationDetail location={selectedLocation} onClose={handleCloseDetail} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile detail backdrop */}
      <AnimatePresence>
        {showMobileDetail && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetail}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
