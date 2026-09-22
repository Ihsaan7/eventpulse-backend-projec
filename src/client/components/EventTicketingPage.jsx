import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, ArrowLeft, Clock, ShieldCheck, CheckCircle2, Ticket, Printer, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export function EventTicketingPage({ event, onBack, onBookingSuccess }) {
  const { user, openAuth } = useAuth();

  const tiers = event?.tiers || [];
  const [selectedTierId, setSelectedTierId] = useState(tiers[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  // Seat lock state
  const [lockedBooking, setLockedBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [lockExpired, setLockExpired] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tiers.length > 0 && !selectedTierId) {
      setSelectedTierId(tiers[0].id);
    }
  }, [tiers]);

  // Countdown timer for locked seat
  useEffect(() => {
    let timer;
    if (lockedBooking && lockedBooking.seat_lock_expires_at) {
      const expires = new Date(lockedBooking.seat_lock_expires_at).getTime();

      const updateClock = () => {
        const now = new Date().getTime();
        const diffInSeconds = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeLeft(diffInSeconds);

        if (diffInSeconds <= 0) {
          setLockExpired(true);
          clearInterval(timer);
        }
      };

      updateClock();
      timer = setInterval(updateClock, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockedBooking]);

  const activeTier = tiers.find(t => t.id === Number(selectedTierId)) || tiers[0];
  const totalPrice = activeTier ? (activeTier.price * quantity) : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dateFormatted = (() => {
    try {
      const d = new Date(event.start_time);
      if (isNaN(d.getTime())) return event.start_time;
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(d);
    } catch {
      return event.start_time;
    }
  })();

  // Step 1: Hold / Lock seats
  const handleLockSeats = async () => {
    if (!user) {
      openAuth('login');
      return;
    }

    if (!selectedTierId) {
      setError('Please select a ticket tier.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.bookings.lockSeat({
        tier_id: selectedTierId,
        quantity: quantity,
      });

      if (res.data) {
        setLockedBooking(res.data);
        setLockExpired(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to lock seats. Not enough seats available.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm & Pay
  const handlePayBooking = async () => {
    if (!lockedBooking?.id) return;
    setPaying(true);
    setError(null);

    try {
      const res = await api.bookings.pay({
        booking_id: lockedBooking.id,
      });

      if (res.data?.qr_code) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#1d4ed8', '#10b981', '#18181b']
          });
        } catch (e) {}

        const ticketData = {
          bookingId: lockedBooking.id,
          qrCode: res.data.qr_code,
          event,
          tier: activeTier,
          quantity,
          totalPrice,
        };

        setConfirmedTicket(ticketData);
        if (onBookingSuccess) {
          onBookingSuccess(ticketData);
        }
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-64px)] py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all events
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {event.image_url && (
                <div className="h-64 sm:h-80 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mb-4">
                  {event.title}
                </h1>

                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 border-y border-zinc-200 dark:border-zinc-800 py-5 my-5">
                  <div className="flex items-center gap-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-2">
                    <h2 className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-3">
                      About this event
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Ticketing Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sticky top-24 shadow-sm">
              {confirmedTicket ? (
                /* Confirmed State */
                <div className="text-center space-y-6">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      You're going!
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Your reservation is confirmed. Present this QR code at the entrance.
                    </p>
                  </div>

                  {/* QR pass container - pure white bg inside for maximum scanning contrast */}
                  <div className="p-4 bg-white border border-zinc-200 dark:border-zinc-700 max-w-[210px] mx-auto shadow-sm">
                    <QRCodeSVG
                      value={confirmedTicket.qrCode}
                      size={178}
                      level="H"
                      fgColor="#18181b"
                      bgColor="#ffffff"
                    />
                    <span className="block mt-2 text-[11px] font-mono text-zinc-600 font-bold uppercase tracking-wider">
                      Entrance Pass
                    </span>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-sm text-left space-y-2">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Tier:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">{confirmedTicket.tier?.tier_name}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Seats:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">{confirmedTicket.quantity}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Ticket Code:</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono truncate max-w-[150px]">{confirmedTicket.qrCode}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedTicket.qrCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 px-4 bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Print Ticket
                    </button>
                  </div>
                </div>
              ) : (
                /* Ticket Selection State */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Select Tickets
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Choose your ticket tier and reserve your spots.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Tier List */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Available Tiers
                    </label>
                    {tiers.map((tier) => {
                      const isSelected = selectedTierId === tier.id;
                      const isSoldOut = tier.available_seats <= 0;

                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            if (!isSoldOut && !lockedBooking) {
                              setSelectedTierId(tier.id);
                            }
                          }}
                          className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                              : isSoldOut
                              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 opacity-60 cursor-not-allowed'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {tier.tier_name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {isSoldOut ? (
                                <span className="text-red-600 dark:text-red-400 font-semibold">Sold Out</span>
                              ) : (
                                `${tier.available_seats} seats remaining`
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                              ${tier.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quantity */}
                  {!lockedBooking && (
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quantity</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-base w-6 text-center text-zinc-900 dark:text-zinc-100">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= (activeTier?.available_seats || 1)}
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 h-9 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Lock Countdown Banner */}
                  {lockedBooking && (
                    <div className={`p-4 border ${
                      lockExpired
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-pulse text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {lockExpired ? 'Reservation expired' : 'Seats held for you'}
                          </span>
                        </div>
                        <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">
                          {lockExpired ? '00:00' : formatTime(timeLeft)}
                        </span>
                      </div>
                      {!lockExpired && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Complete checkout now to secure your tickets before they are released.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price Total */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-bold block">
                        Total Amount
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {quantity} × {activeTier?.tier_name}
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  {!lockedBooking ? (
                    <button
                      onClick={handleLockSeats}
                      disabled={loading || !activeTier || activeTier.available_seats <= 0}
                      className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Lock Seats & Proceed
                        </>
                      )}
                    </button>
                  ) : lockExpired ? (
                    <button
                      onClick={() => {
                        setLockedBooking(null);
                        setLockExpired(false);
                      }}
                      className="w-full py-3.5 px-5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Retry Reservation
                    </button>
                  ) : (
                    <button
                      onClick={handlePayBooking}
                      disabled={paying}
                      className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {paying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="w-4 h-4" />
                          Confirm & Pay (${totalPrice.toFixed(2)})
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
