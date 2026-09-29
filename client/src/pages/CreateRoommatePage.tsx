import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, Plus, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const CreateRoommatePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentFrequency, setRentFrequency] = useState('ANNUAL');
  const [roomType, setRoomType] = useState('SELF_CONTAIN');
  const [genderPreference, setGenderPreference] = useState('ANY');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    'Borehole Water',
    'Prepaid Meter',
    'Fenced Compound',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/roommates');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/roommates"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to roommate finder
      </Link>

      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-primary dark:text-white">
          Post Roommate Listing
        </h1>
        <p className="text-sm text-text-secondary">
          Find a compatible, verified roommate from the Faculty of Computing and Informatics in Osara.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Listing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spacious Self-Contain near CUSTECH Campus Gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Location Area *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Osara Campus Gate, Adogo Road"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Nearby Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Behind Royal Guest Inn"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Rent Amount (₦) *
              </label>
              <input
                type="number"
                required
                placeholder="85000"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Frequency *
              </label>
              <select
                value={rentFrequency}
                onChange={(e) => setRentFrequency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              >
                <option value="ANNUAL">Per Year (Annual)</option>
                <option value="SEMESTER">Per Semester</option>
                <option value="MONTHLY">Per Month</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Room Type *
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              >
                <option value="SELF_CONTAIN">Self Contain</option>
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="TWO_BEDROOM">2-Bedroom Flat</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the environment, study atmosphere, light schedule, and house rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Amenities &amp; Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Solar Inverter, Running Water, Wi-Fi"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddAmenity}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {amenities.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface-raised border border-border text-text"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(item)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+234 812 345 6789"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                WhatsApp Number
              </label>
              <input
                type="tel"
                placeholder="+234 812 345 6789"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link to="/roommates">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="accent" size="md" isLoading={isSubmitting}>
              Publish Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
