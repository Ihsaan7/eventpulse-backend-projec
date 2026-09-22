import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
];

export function EventCard({ event, onSelect, index = 0 }) {
  const tiers = event.tiers || [];
  const minPrice = tiers.length > 0 ? Math.min(...tiers.map(t => t.price)) : 0;
  const totalSeats = tiers.reduce((acc, t) => acc + (t.available_seats || 0), 0);

  // Format date cleanly
  const dateFormatted = (() => {
    try {
      const d = new Date(event.start_time);
      if (isNaN(d.getTime())) return event.start_time;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      return event.start_time;
    }
  })();

  const cardImage = event.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <div 
      id={`event-card-${event.id}`}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
    >
      {/* Top Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={cardImage}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-white/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            {totalSeats > 0 ? `${totalSeats} seats left` : 'Sold out'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Location */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            <span>{dateFormatted}</span>
            <span>•</span>
            <span className="truncate max-w-[170px]">{event.venue}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Short Description */}
          {event.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Pricing & Sharp Button */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Starting from
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {tiers.length > 0 ? (minPrice === 0 ? 'Free' : `$${minPrice.toFixed(2)}`) : 'Inquire'}
            </span>
          </div>

          <button
            id={`reserve-gala-btn-${event.id}`}
            onClick={() => onSelect(event)}
            className="py-2 px-4 bg-zinc-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            Get Tickets
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
