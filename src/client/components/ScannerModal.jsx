import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  QrCode, 
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export function ScannerModal({ recentTickets = [] }) {
  const { user, isOrganizer, login, register } = useAuth();
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [switchingAuth, setSwitchingAuth] = useState(false);
  const [result, setResult] = useState(null);
  const [errorData, setErrorData] = useState(null);

  const [checkinHistory, setCheckinHistory] = useState([
    {
      id: 'chk-1',
      code: 'EP-9924-JVE',
      attendee: 'Jonathan Vance',
      event: 'Node.js Conference 2025',
      tier: 'General Admission',
      time: '09:15',
      status: 'ADMITTED',
    },
    {
      id: 'chk-2',
      code: 'EP-3310-9190',
      attendee: 'Helene Berg',
      event: 'Node.js Conference 2025',
      tier: 'General Admission',
      time: '09:05',
      status: 'ADMITTED',
    }
  ]);

  const handleSwitchToOrganizer = async () => {
    try {
      setSwitchingAuth(true);
      setErrorData(null);
      try {
        await login('organizer@eventpulse.io', 'EventPulse2026!');
      } catch (loginErr) {
        await register('Event Organizer', 'organizer@eventpulse.io', 'EventPulse2026!', 'ORGANIZER');
      }
    } catch (err) {
      setErrorData({
        message: err.message || 'Failed to switch to organizer account.',
        code: ticketInput || 'AUTH',
        isDuplicate: false,
        isAuth: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setSwitchingAuth(false);
    }
  };

  const handleValidate = async (customCode) => {
    const code = (customCode || ticketInput).trim();
    if (!code) return;

    setLoading(true);
    setResult(null);
    setErrorData(null);

    try {
      const res = await api.checkins.validate({ qr_code: code });
      const data = res.data;

      const verifiedRecord = {
        attendeeName: data.attendee_name || 'Guest Attendee',
        eventTitle: data.event_title || 'Conference Event',
        tierName: data.tier_name || 'General Admission',
        quantity: data.quantity || 1,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        code: code,
      };

      setResult(verifiedRecord);

      setCheckinHistory(prev => [
        {
          id: `chk-${Date.now()}`,
          code: code,
          attendee: verifiedRecord.attendeeName,
          event: verifiedRecord.eventTitle,
          tier: verifiedRecord.tierName,
          time: verifiedRecord.time,
          status: 'ADMITTED',
        },
        ...prev.slice(0, 15)
      ]);
    } catch (err) {
      const errorMsg = err.message || 'Ticket validation failed';
      const isDuplicate = errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('duplicate');
      const isAuth = err.statusCode === 401 || err.statusCode === 403 || errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('unauthorized');

      let displayMessage = errorMsg;
      if (isAuth) {
        displayMessage = 'Gate check-in requires an Organizer or Staff account. Please switch to an Organizer account to validate entry.';
      } else if (errorMsg.toLowerCase().includes('invalid qr-code') || err.statusCode === 404) {
        displayMessage = 'Invalid Ticket: QR code not recognized in the database.';
      }

      setErrorData({
        message: displayMessage,
        code: code,
        isDuplicate: isDuplicate,
        isAuth: isAuth,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (isDuplicate) {
        setCheckinHistory(prev => [
          {
            id: `chk-${Date.now()}`,
            code: code,
            attendee: 'Duplicate Scan Denied',
            event: '—',
            tier: '—',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'DUPLICATE DENIED',
          },
          ...prev.slice(0, 15)
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Collect test codes from active sessions + seeded records
  const availableCodes = [
    { code: 'EP-9924-JVE', label: 'Demo Ticket #1 (Jonathan Vance)' },
    { code: 'EP-3310-9190', label: 'Demo Ticket #2 (Helene Berg)' },
    ...recentTickets.map(t => ({
      code: t.qrCode || t.ticket_uuid,
      label: `My Pass: ${t.event?.title || 'Event'} (${t.tier?.tier_name || 'Pass'})`
    })).filter(item => Boolean(item.code))
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Gate Check-In Terminal
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Validate attendee tickets in real-time, inspect tier allocations, and prevent duplicate door entry.
        </p>
      </div>

      {/* Role Notice & 1-Click Switch */}
      {!isOrganizer ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {user ? `Signed in as Attendee: ${user.email}` : 'Guest Visitor Mode'}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Ticket gate scanning requires an authorized Organizer account. Switch below to validate live passes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchToOrganizer}
            disabled={switchingAuth}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {switchingAuth ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                Switch to Organizer Account
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Authorized Scanner Active: <strong className="font-semibold">{user?.email || 'Organizer'}</strong> (Role: {user?.role})
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
            Live Gate Mode
          </span>
        </div>
      )}

      {/* Input Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleValidate();
          }} 
          className="space-y-4"
        >
          <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Ticket QR Code / Pass Token
          </label>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Scan or paste ticket QR code (e.g. EP-9924-JVE or UUID)..."
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 pl-12 pr-4 py-3 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ticketInput.trim()}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Validate Entry
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Chips */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Click any test code to instantly load & validate:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableCodes.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setTicketInput(item.code);
                  handleValidate(item.code);
                }}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {item.code.length > 20 ? item.code.slice(0, 14) + '...' : item.code}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 border-l border-zinc-300 dark:border-zinc-600 pl-2">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card: Approved */}
      {result && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5">
                  Admission Approved
                </span>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  {result.time}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {result.attendeeName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Event:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.eventTitle}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Tier:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.tierName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Seats Admitted:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.quantity} Person(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Card: Error / Rejection */}
      {errorData && (
        <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 px-2.5 py-0.5">
                  {errorData.isDuplicate 
                    ? 'Duplicate Entry Rejected' 
                    : errorData.isAuth 
                      ? 'Staff Access Required' 
                      : 'Invalid Ticket'}
                </span>
                <span className="text-xs font-mono text-red-700 dark:text-red-400">
                  {errorData.time}
                </span>
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {errorData.message}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                Code scanned: {errorData.code}
              </p>

              {errorData.isAuth && (
                <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/80">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSwitchToOrganizer();
                      handleValidate(errorData.code);
                    }}
                    disabled={switchingAuth}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {switchingAuth ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      <>
                        Log In as Demo Organizer & Re-Scan
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
          Terminal Gate Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <th className="pb-3">Time</th>
                <th className="pb-3">Ticket Code</th>
                <th className="pb-3">Attendee</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {checkinHistory.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-mono text-zinc-500 dark:text-zinc-400 text-xs">{item.time}</td>
                  <td className="py-3 font-mono text-blue-600 dark:text-blue-400 text-xs">{item.code}</td>
                  <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">{item.attendee}</td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{item.tier}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 text-[11px] font-bold uppercase border ${
                      item.status === 'ADMITTED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
