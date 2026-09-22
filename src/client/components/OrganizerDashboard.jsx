import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { DollarSign, Ticket, Users, Clock, Plus, RefreshCw, Layers } from 'lucide-react';

export function OrganizerDashboard({ onOpenCreateEvent }) {
  const [overviewEvents, setOverviewEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analytics.getOverview();
      const events = res.data || [];
      setOverviewEvents(events);
      if (events.length > 0 && !selectedEventId) {
        setSelectedEventId(events[0].id || events[0].event_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load organizer events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAnalytics = async (eventId) => {
    if (!eventId) return;
    setAnalyticsLoading(true);
    try {
      const res = await api.analytics.getEventAnalytics(eventId);
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load event metrics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventAnalytics(selectedEventId);
    }
  }, [selectedEventId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-zinc-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics on revenue, ticket sales, active reservations, and attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchOverview();
              if (selectedEventId) fetchEventAnalytics(selectedEventId);
            }}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            id="create-event-dashboard-btn"
            onClick={onOpenCreateEvent}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create New Event
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Event Selector Tabs */}
      {overviewEvents.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs uppercase font-bold text-zinc-400 dark:text-zinc-500 mr-2 shrink-0">
            Selected Event:
          </span>
          {overviewEvents.map((ev) => {
            const evId = ev.id || ev.event_id;
            const isSelected = Number(selectedEventId) === Number(evId);
            return (
              <button
                key={evId}
                onClick={() => setSelectedEventId(evId)}
                className={`px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {ev.title || `Event #${evId}`}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <Layers className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Events Published Yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Publish your first event with custom ticket tiers to start selling tickets and tracking live metrics.
          </p>
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Event
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs uppercase font-bold text-zinc-400 dark:text-zinc-500">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                ${Number(analytics.sales?.total_revenue || 0).toFixed(2)}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                From {analytics.sales?.paid_bookings || 0} completed orders
              </span>
            </div>

            {/* Tickets Sold */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs uppercase font-bold text-zinc-400 dark:text-zinc-500">Tickets Sold</span>
                <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {analytics.sales?.tickets_sold || 0}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                {analytics.sales?.remaining_seats || 0} seats remaining
              </span>
            </div>

            {/* Attendance */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs uppercase font-bold text-zinc-400 dark:text-zinc-500">Attendance Rate</span>
                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {analytics.attendance?.attendance_percentage || 0}%
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                {analytics.attendance?.checked_in_count || 0} attendee(s) checked in
              </span>
            </div>

            {/* In Checkout */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs uppercase font-bold text-zinc-400 dark:text-zinc-500">Active Holds</span>
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {analytics.seat_locks?.currently_locked || 0}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                Seats currently locked in checkout
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          {analytics.breakdown && analytics.breakdown.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
                Tier Breakdown & Inventory
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs uppercase font-bold">
                      <th className="pb-3">Tier Name</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Sold</th>
                      <th className="pb-3">Available</th>
                      <th className="pb-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {analytics.breakdown.map((t, i) => (
                      <tr key={i}>
                        <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">{t.tier_name}</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">${Number(t.price).toFixed(2)}</td>
                        <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">{t.sold_count || 0}</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">{t.available_seats || 0}</td>
                        <td className="py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          ${((t.sold_count || 0) * Number(t.price)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
