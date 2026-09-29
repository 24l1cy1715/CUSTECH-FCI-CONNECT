import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Search,
  Plus,
  MapPin,
  Phone,
  MessageCircle,
  Bookmark,
  Check,
  Building,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_ROOMMATES } from '@/data/mockData';
import { RoommateListing, DEPARTMENT_LABELS } from '@/types';

export const RoommatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['room-2']));

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredListings = MOCK_ROOMMATES.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || listing.roomType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Home className="w-4 h-4" />
            Verified Student Accommodations
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
            Find Your Roommate in Osara
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
            Browse verified listings from fellow FCI students near CUSTECH Osara campus. Filter by room type, budget, amenities, and location.
          </p>
        </div>

        <Link to="/roommates/new">
          <Button variant="accent" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Post Roommate Listing
          </Button>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface border border-border rounded-2xl p-4 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by area, landmark (e.g. Campus Gate, Adogo Road)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Room Types</option>
            <option value="SELF_CONTAIN">Self Contain</option>
            <option value="SINGLE_ROOM">Single Room</option>
            <option value="TWO_BEDROOM">2-Bedroom Flat</option>
            <option value="HOSTEL">Campus Hostel</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.map((listing) => {
          const isSaved = savedIds.has(listing.id);

          return (
            <Card key={listing.id} hoverable className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Photo & Badges */}
                <div className="relative h-56 overflow-hidden bg-gray-900">
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="accent" size="sm">
                      ₦{listing.rentAmount.toLocaleString()} / {listing.rentFrequency.toLowerCase()}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {listing.roomType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <button
                    onClick={() => toggleSave(listing.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:scale-110 transition-transform"
                    title={isSaved ? 'Saved' : 'Save listing'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? 'text-accent fill-accent' : ''}`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{listing.location}</span>
                      {listing.landmark && <span>({listing.landmark})</span>}
                    </div>

                    <h2 className="font-display font-bold text-lg text-primary dark:text-white leading-tight">
                      {listing.title}
                    </h2>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {listing.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-raised border border-border text-text-muted"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Host & Contact Footer */}
              <div className="p-5 sm:p-6 pt-0 border-t border-border mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {listing.owner.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-text">{listing.owner.fullName}</div>
                    <div className="text-[10px] text-text-muted">
                      {DEPARTMENT_LABELS[listing.owner.department]} ({listing.owner.level}L)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {listing.contactWhatsapp && (
                    <a
                      href={`https://wa.me/${listing.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      >
                        WhatsApp
                      </Button>
                    </a>
                  )}
                  <a href={`tel:${listing.contactPhone}`}>
                    <Button variant="accent" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                      Call
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
