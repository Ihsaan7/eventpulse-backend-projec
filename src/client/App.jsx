import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventTicketingPage } from './components/EventTicketingPage';
import { TicketPassModal } from './components/TicketPassModal';
import { ScannerModal } from './components/ScannerModal';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import { 
  Search, 
  RefreshCw, 
  Ticket, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Users
} from 'lucide-react';

export function App() {
  const { user, isOrganizer, openAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'event-detail' | 'tickets' | 'scanner' | 'dashboard'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modals
  const [activeTicketPass, setActiveTicketPass] = useState(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // User issued passes
  const [userTickets, setUserTickets] = useState([]);

  // Load saved passes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`eventpulse_passes_${user?.id || 'patron'}`);
      if (saved) {
        setUserTickets(JSON.parse(saved));
      } else {
        setUserTickets([]);
      }
    } catch (e) {
      setUserTickets([]);
    }
  }, [user]);

  // Fetch events from backend
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.events.getAll();
      setEvents(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // When booking & payment complete
  const handleBookingSuccess = (newTicket) => {
    const updated = [newTicket, ...userTickets];
    setUserTickets(updated);
    try {
      localStorage.setItem(`eventpulse_passes_${user?.id || 'patron'}`, JSON.stringify(updated));
    } catch (e) {}
    setActiveTicketPass(newTicket);
    fetchEvents();
  };

  // Extract venue filter categories from actual backend events
  const availableVenues = ['All', ...new Set(events.map(e => {
    if (!e.venue) return null;
    const parts = e.venue.split(',');
    return (parts[parts.length - 1] || parts[0]).trim();
  }).filter(Boolean))].slice(0, 5);

  // Filter events based on search & city
  const filteredEvents = events.filter((ev) => {
    const matchesCity = selectedCity === 'All' || ev.venue?.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesQuery = !searchQuery.trim() || 
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  // Handle Event selection -> switch to Ticketing Page
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setActiveTab('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'events') setSelectedEvent(null);
        }} 
        onOpenCreateEvent={() => {
          if (!isOrganizer) openAuth('login');
          else setCreateEventOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: LANDING PAGE & EVENTS CATALOG */}
        {activeTab === 'events' && (
          <div>
            {/* HERO SECTION - TITO STYLE: Full big, 2-column Left & Right */}
            <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                  {/* Left Column: Big Bold Headline & Value Proposition & Sharp CTA Buttons */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold uppercase tracking-wider">
                      <span>EventPulse Ticketing Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.08]">
                      Sell tickets, not your soul.
                    </h1>

                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl">
                      EventPulse is the simple, powerful, and delightfully quick platform for tech conferences, summits, and gatherings of any size. Guaranteed seat reservations, zero spam, and instant entry passes.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <a
                        href="#events-catalog"
                        className="py-3.5 px-7 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-bold tracking-wide transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Explore Events
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          if (isOrganizer) setCreateEventOpen(true);
                          else openAuth('register');
                        }}
                        className="py-3.5 px-7 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-200 text-zinc-900 dark:text-zinc-100 text-sm font-bold tracking-wide transition-colors cursor-pointer"
                      >
                        {isOrganizer ? 'Create Event' : 'Start Selling Tickets'}
                      </button>
                    </div>

                    {/* Social proof trust points */}
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        <span>No buyer account required</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        <span>Real-time seat holds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        <span>Fast gate validation</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tito-style Interactive Live Preview Card */}
                  <div className="lg:col-span-5">
                    <div className="border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/90 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(59,130,246,0.3)] space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-4">
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold block">
                            Featured Conference
                          </span>
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {events[0]?.title || 'Node.js Summit 2026'}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                          Live Now
                        </span>
                      </div>

                      {/* Tier pricing preview */}
                      <div className="space-y-2.5">
                        <div className="p-3.5 bg-white dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">General Admission</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Access to all conference stages</div>
                          </div>
                          <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            $49.00
                          </div>
                        </div>

                        <div className="p-3.5 bg-white dark:bg-zinc-800/90 border-2 border-blue-600 dark:border-blue-500 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>VIP All-Access</span>
                              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-bold">Popular</span>
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Backstage access & afterparty</div>
                          </div>
                          <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                            $129.00
                          </div>
                        </div>
                      </div>

                      {/* Seat hold guarantee indicator */}
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold">Atomic seat locking:</span>
                        </div>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">10:00 reservation hold</span>
                      </div>

                      {events.length > 0 && (
                        <button
                          onClick={() => handleSelectEvent(events[0])}
                          className="w-full py-3 bg-zinc-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Book Tickets For This Event
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TITO-STYLE FEATURE CALLOUT BAR */}
            <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                  <div className="px-6 py-4 space-y-2 first:pl-0">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Built for speed & conversion</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      A frictionless checkout experience that lets attendees book in under 60 seconds without mandatory registration walls.
                    </p>
                  </div>

                  <div className="px-6 py-4 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Guaranteed seat reservations</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Database-level concurrency locks guarantee that seats are held for 10 minutes while attendees enter their payment details.
                    </p>
                  </div>

                  <div className="px-6 py-4 space-y-2 last:pr-0">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Dedicated gate validator</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Instant entrance scanning terminal verifies genuine tickets in real time and automatically rejects duplicate barcode attempts.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* EVENTS CATALOG SECTION */}
            <section id="events-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Upcoming Events
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Select an event below to choose tiers and reserve your tickets.
                  </p>
                </div>

                {/* Clean Tito-Style Search & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search events or venue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 pl-10 pr-4 py-2 focus:outline-none transition-colors w-52 sm:w-64"
                    />
                  </div>

                  {availableVenues.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedCity === city
                          ? 'bg-zinc-900 dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Cards Grid */}
              {loading ? (
                <div className="py-24 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading published events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={idx}
                      onSelect={handleSelectEvent}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 max-w-lg mx-auto">
                  <Ticket className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No events found</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
                    Try adjusting your search criteria or check back later.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('All');
                    }}
                    className="px-5 py-2.5 bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: DEDICATED EVENT TICKETING PAGE */}
        {activeTab === 'event-detail' && selectedEvent && (
          <EventTicketingPage
            event={selectedEvent}
            onBack={() => {
              setActiveTab('events');
              setSelectedEvent(null);
            }}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {/* VIEW 3: MY TICKETS / RESERVATIONS */}
        {activeTab === 'tickets' && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  My Tickets
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Access your confirmed tickets and present digital QR passes at the entrance.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                {userTickets.length} Ticket{userTickets.length === 1 ? '' : 's'}
              </span>
            </div>

            {userTickets.length === 0 ? (
              <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8">
                <Ticket className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Tickets Yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
                  When you book tickets, your digital QR passes will be saved here.
                </p>
                <button
                  onClick={() => setActiveTab('events')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  Browse Upcoming Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((t, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveTicketPass(t)}
                    className="p-6 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-mono font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 border border-blue-200 dark:border-blue-800">
                          Pass #{t.bookingId}
                        </span>
                        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                          Confirmed
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {t.event?.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {t.event?.venue} • {t.tier?.tier_name} ({t.quantity} seat{t.quantity > 1 ? 's' : ''})
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTicketPass(t);
                      }}
                      className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 self-end sm:self-center"
                    >
                      View QR Pass
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 4: GATE SCANNER */}
        {activeTab === 'scanner' && (
          <ScannerModal recentTickets={userTickets} />
        )}

        {/* VIEW 5: ORGANIZER DASHBOARD */}
        {activeTab === 'dashboard' && isOrganizer && (
          <OrganizerDashboard onOpenCreateEvent={() => setCreateEventOpen(true)} />
        )}
      </main>

      {/* Clean Website Footer */}
      <footer className="w-full py-12 px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 mt-auto text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">EventPulse</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>Simple, powerful event ticketing & gate check-in.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button 
              onClick={() => {
                setActiveTab('events');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Events
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              My Tickets
            </button>
            <button 
              onClick={() => setActiveTab('scanner')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Gate Scanner
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <TicketPassModal
        ticket={activeTicketPass}
        isOpen={!!activeTicketPass}
        onClose={() => setActiveTicketPass(null)}
      />

      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onCreated={() => {
          fetchEvents();
          setActiveTab('events');
        }}
      />

      <AuthModal />
    </div>
  );
}
