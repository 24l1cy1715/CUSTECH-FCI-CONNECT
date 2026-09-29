import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Video,
  Users,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_EVENTS } from '@/data/mockData';

export const EventsPage: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(
    new Set(['evt-1'])
  );

  const toggleRegister = (id: string) => {
    setRegisteredEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          Campus Tech Gatherings
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
          Hackathons, Masterclasses &amp; Tech Talks
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
          Participate in physical workshops in the new FCI lab and hybrid tech meetups organized by faculty clubs and the Deanery.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_EVENTS.map((evt) => {
          const isRegistered = registeredEvents.has(evt.id);

          return (
            <Card key={evt.id} hoverable className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-56 overflow-hidden bg-gray-900">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="accent" size="sm">
                      {evt.category}
                    </Badge>
                    {evt.isVirtual ? (
                      <Badge variant="neutral" size="sm">
                        <Video className="w-3 h-3 text-accent" /> Virtual Hybrid
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        <MapPin className="w-3 h-3 text-emerald-500" /> Physical
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-semibold text-accent">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(evt.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {evt.location}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl text-primary dark:text-white leading-tight">
                    {evt.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="text-xs text-text-muted">
                    <strong>Organizer:</strong> {evt.organizer}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 border-t border-border mt-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users className="w-4 h-4 text-accent" />
                  <span>
                    <strong>{evt.registeredCount + (isRegistered ? 1 : 0)}</strong> attending
                    {evt.registrationLimit && ` / ${evt.registrationLimit} max`}
                  </span>
                </div>

                <Button
                  variant={isRegistered ? 'secondary' : 'accent'}
                  size="md"
                  onClick={() => toggleRegister(evt.id)}
                  leftIcon={
                    isRegistered ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : undefined
                  }
                >
                  {isRegistered ? 'Registered' : 'Register for Event'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
