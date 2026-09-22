import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, LogOut, QrCode, BarChart3, Sun, Moon } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenCreateEvent }) {
  const { user, isOrganizer, logout, openAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Left Nav */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('events')} 
            className="flex items-center gap-2 cursor-pointer text-left"
          >
            {/* Tito-like clean energetic blue branding */}
            <span className="font-extrabold text-2xl tracking-tight text-blue-600 dark:text-blue-500">
              EventPulse
            </span>
          </button>

          {/* Navigation Links (sharp clean borders/edges) */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'events' || activeTab === 'event-detail'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Events
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'tickets'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              My Tickets
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'scanner'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Gate Scanner
            </button>

            {isOrganizer && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-500'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Organizer Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right Side Actions - Tito Style Sign in / Sign up sharp buttons + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer flex items-center justify-center"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {isOrganizer && (
            <button
              onClick={onOpenCreateEvent}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Event
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {user.role === 'ORGANIZER' ? 'Organizer' : 'Attendee'}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth('login')}
                className="px-5 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuth('register')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
