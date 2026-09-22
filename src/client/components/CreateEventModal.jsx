import React, { useState } from 'react';
import { api } from '../api';
import { X, Plus, Trash2, Calendar, MapPin, Ticket, Loader2, AlertCircle } from 'lucide-react';

export function CreateEventModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  
  const [tiers, setTiers] = useState([
    { tier_name: 'General Admission', price: 49.00, available_seats: 100 },
    { tier_name: 'VIP Experience', price: 129.00, available_seats: 25 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddTier = () => {
    setTiers([...tiers, { tier_name: '', price: 0, available_seats: 50 }]);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index][field] = field === 'price' || field === 'available_seats' ? Number(value) : value;
    setTiers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !venue.trim() || !startTime) {
      setError('Please fill in title, venue, and date/time.');
      return;
    }

    if (tiers.some(t => !t.tier_name.trim() || t.available_seats <= 0 || t.price < 0)) {
      setError('Every tier must have a name, non-negative price, and at least 1 seat.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.events.create({
        title: title.trim(),
        venue: venue.trim(),
        start_time: new Date(startTime).toISOString(),
        description: description.trim(),
        status,
        tiers,
      });

      onCreated(res.data?.event);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create event. Make sure you are an ORGANIZER or ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="create-event-modal"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Create New Event
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Publish event details and set up ticket tier availability
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node.js Summit 2026"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Venue Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Convention Center Hall A"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Event Date & Time *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, schedule highlights, or speaker roster..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Ticket Tiers */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Ticket Tiers & Capacities *
              </label>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Tier
              </button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 grid grid-cols-12 gap-2.5 items-center"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Tier Name (e.g. VIP)"
                      required
                      value={tier.tier_name}
                      onChange={(e) => handleTierChange(idx, 'tier_name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        required
                        value={tier.price}
                        onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Seats"
                      required
                      value={tier.available_seats}
                      onChange={(e) => handleTierChange(idx, 'available_seats', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      disabled={tiers.length <= 1}
                      className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              id="submit-create-event-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Publish Event & Open Ticketing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
