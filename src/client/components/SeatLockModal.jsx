import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { X, Clock, ShieldAlert, CheckCircle2, Ticket, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function SeatLockModal({ event, isOpen, onClose, onBookingSuccess }) {
  const { user, openAuth } = useAuth();
  
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Active lock state
  const [lockedBooking, setLockedBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [lockExpired, setLockExpired] = useState(false);
  const [paying, setPaying] = useState(false);

  // Initialize selected tier
  useEffect(() => {
    if (event?.tiers && event.tiers.length > 0) {
      setSelectedTierId(event.tiers[0].id);
    }
  }, [event]);

  // Handle ticking countdown when a seat is locked
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

  if (!isOpen || !event) return null;

  const tiers = event.tiers || [];
  const activeTier = tiers.find(t => t.id === Number(selectedTierId)) || tiers[0];
  const totalPrice = activeTier ? (activeTier.price * quantity) : 0;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Lock Seats
  const handleLockSeats = async () => {
    if (!user) {
      openAuth('login');
      return;
    }

    if (!selectedTierId) {
      setError('Please select a ticket tier');
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
      setError(err.message || 'Failed to lock seat. Maybe not enough seats available.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Pay Booking
  const handlePayBooking = async () => {
    if (!lockedBooking?.id) return;
    setPaying(true);
    setError(null);

    try {
      const res = await api.bookings.pay({
        booking_id: lockedBooking.id,
      });

      if (res.data?.qr_code) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#e5c158', '#10b981', '#f1f3f7']
          });
        } catch (e) {
          // ignore confetti if blocked
        }

        onBookingSuccess({
          bookingId: lockedBooking.id,
          qrCode: res.data.qr_code,
          event,
          tier: activeTier,
          quantity,
          totalPrice,
        });
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleClose = () => {
    setLockedBooking(null);
    setLockExpired(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="seat-lock-modal"
        className="w-full max-w-lg bg-[#121620] border border-[#272e40] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1f2533]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold">
              {lockedBooking ? 'Atomic Seat Reservation' : 'Curated Salon & Tier Selection'}
            </span>
            <h2 className="font-serif-luxury text-xl font-bold text-[#f5ebd7] leading-snug">
              {event.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#8c94a6] hover:text-[#f1f3f7] hover:bg-[#1a202c] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice if any */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PHASE A: Select Tier & Quantity (Before Locking) */}
        {!lockedBooking && (
          <div className="space-y-5">
            {/* Tiers list */}
            <div>
              <label className="text-xs uppercase font-mono tracking-wider text-[#8c94a6] block mb-2">
                Choose Ticket Tier
              </label>
              <div className="grid gap-2.5">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    id={`tier-select-${tier.id}`}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedTierId === tier.id
                        ? 'bg-[#1a2130] border-[#d4af37] text-[#f1f3f7] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'bg-[#151924] border-[#252b3b] text-[#9ca3af] hover:border-[#38435c]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#f1f3f7] flex items-center gap-2">
                        {tier.tier_name}
                        {selectedTierId === tier.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#8c94a6]">
                        {tier.available_seats} seats remaining
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-[#e5c158]">
                        {tier.price === 0 ? 'FREE' : `$${Number(tier.price).toFixed(2)}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="text-xs uppercase font-mono tracking-wider text-[#8c94a6] block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#252b3b] bg-[#151924] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-2 text-sm text-[#9ca3af] hover:text-[#f1f3f7] hover:bg-[#1f2536] disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-mono text-sm font-semibold text-[#f1f3f7]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10 || (activeTier && quantity >= activeTier.available_seats)}
                    className="px-3.5 py-2 text-sm text-[#9ca3af] hover:text-[#f1f3f7] hover:bg-[#1f2536] disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-[#8c94a6] font-mono">
                  Total: <span className="font-bold text-[#e5c158] text-sm">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Lock Action */}
            <div className="pt-2">
              <button
                id="lock-seats-submit-btn"
                type="button"
                onClick={handleLockSeats}
                disabled={loading || tiers.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-[#0c0e12] font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking Seats in Database...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Lock Seats for 10 Minutes
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#6b758b] text-center mt-2.5">
                Our backend atomic seat-lock reserves your seats and prevents overselling while you confirm.
              </p>
            </div>
          </div>
        )}

        {/* PHASE B: Seat Locked! Live Countdown & Payment */}
        {lockedBooking && (
          <div className="space-y-5">
            {/* Live Countdown Clock Banner */}
            <div className={`p-4 rounded-xl border text-center transition-all ${
              lockExpired
                ? 'bg-red-950/30 border-red-800/60 text-red-300'
                : timeLeft < 120
                ? 'bg-amber-950/40 border-amber-800/70 text-amber-200 animate-pulse'
                : 'bg-[#171e2c] border-[#d4af37]/40 text-[#f1f3f7]'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-amber-400' : 'text-[#d4af37]'}`} />
                <span className="text-xs uppercase font-mono tracking-widest text-[#8c94a6]">
                  {lockExpired ? 'Lock Expired' : 'Time Remaining to Pay'}
                </span>
              </div>
              <div className="font-mono text-3xl font-extrabold tracking-wider text-[#e5c158]">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] text-[#8c94a6] mt-1">
                {lockExpired 
                  ? 'Your seat reservation has expired. The seats have been released.'
                  : 'Your seats are securely locked in the database.'}
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-[#151924] border border-[#232838] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#8c94a6]">
                <span>Booking Reference</span>
                <span className="font-mono font-medium text-[#f1f3f7]">#{lockedBooking.id}</span>
              </div>
              <div className="flex justify-between text-[#8c94a6]">
                <span>Tier</span>
                <span className="font-mono font-medium text-[#f1f3f7]">{activeTier?.tier_name}</span>
              </div>
              <div className="flex justify-between text-[#8c94a6]">
                <span>Quantity</span>
                <span className="font-mono font-medium text-[#f1f3f7]">{lockedBooking.quantity || quantity}</span>
              </div>
              <div className="pt-2 border-t border-[#232838] flex justify-between font-semibold text-sm">
                <span className="text-[#f1f3f7]">Total Due</span>
                <span className="font-mono text-[#e5c158] font-bold">
                  ${Number(lockedBooking.total_price || totalPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Trigger */}
            <div className="pt-2">
              {lockExpired ? (
                <button
                  type="button"
                  onClick={() => setLockedBooking(null)}
                  className="w-full py-3 px-4 rounded-xl bg-[#1f2536] hover:bg-[#283045] text-[#f1f3f7] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start New Booking
                </button>
              ) : (
                <button
                  id="confirm-pay-booking-btn"
                  type="button"
                  onClick={handlePayBooking}
                  disabled={paying}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-[#0c0e12] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.99] disabled:opacity-50"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Payment & Generating Ticket...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Complete Payment & Issue Ticket
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
