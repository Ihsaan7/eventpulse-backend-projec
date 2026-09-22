import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, authMode, closeAuth, login, register, openAuth } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ATTENDEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!authModalOpen) return null;

  const isRegister = authMode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(name.trim(), email.trim(), password, role);
      } else {
        await login(email.trim(), password);
      }
      closeAuth();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError(null);
    setLoading(true);
    const demoEmail = demoRole === 'ORGANIZER' ? 'organizer@eventpulse.io' : 'attendee@eventpulse.io';
    const demoPass = 'EventPulse2026!';
    const demoName = demoRole === 'ORGANIZER' ? 'Event Organizer' : 'Sarah Jenkins';

    try {
      try {
        await login(demoEmail, demoPass);
        closeAuth();
      } catch (loginErr) {
        await register(demoName, demoEmail, demoPass, demoRole);
        closeAuth();
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="auth-modal"
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-8 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {isRegister ? 'Create an Account' : 'Sign in to EventPulse'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isRegister ? 'Set up an account to manage tickets and host events' : 'Access your tickets and reservations'}
            </p>
          </div>
          <button 
            onClick={closeAuth}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ATTENDEE')}
                  className={`py-2.5 px-3 text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    role === 'ATTENDEE'
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Attendee / Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ORGANIZER')}
                  className={`py-2.5 px-3 text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    role === 'ORGANIZER'
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Event Organizer
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center mb-3">
            Quick Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('ATTENDEE')}
              className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Demo Attendee
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ORGANIZER')}
              className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Demo Organizer
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </>
          ) : (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
