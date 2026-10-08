import React, { useState } from 'react';
import { 
  Compass, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  X,
  Bookmark
} from 'lucide-react';
import type { AuthUser } from '../types/trip';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: AuthUser) => void;
  onClose?: () => void;
  subtitleHint?: string;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onAuthSuccess, 
  onClose, 
  subtitleHint,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!username.trim() || username.trim().length < 2) {
        setError('Please enter a username of at least 2 characters.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirmation.');
        return;
      }
    } else {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'signup'
        ? {
            username: username.trim(),
            email: email.trim(),
            password,
            confirm_password: confirmPassword
          }
        : {
            email: email.trim(),
            password
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check your details.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-200 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-100 my-auto transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 shrink-0 shadow-2xs">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                TripMax Account
              </h3>
              <p className="text-xs text-stone-400">
                {mode === 'login' ? 'Sign in to access and sync your journeys' : 'Create an account to save itineraries'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Optional Context Callout (e.g. Save Trip prompted) */}
        {subtitleHint && (
          <div className="mt-4 p-3 rounded-xl bg-stone-850 border border-stone-750 text-xs text-stone-300 flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-relaxed">{subtitleHint}</span>
          </div>
        )}

        {/* Smooth Tab Switcher */}
        <div className="mt-5 flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 relative">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              mode === 'login'
                ? 'bg-stone-800 text-stone-100 shadow-2xs border border-stone-700'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              mode === 'signup'
                ? 'bg-stone-800 text-stone-100 shadow-2xs border border-stone-700'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {/* Animated Form Fields */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Username Field with smooth expand/collapse */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              mode === 'signup' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none -my-1'
            }`}
          >
            <div className="pb-1">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required={mode === 'signup'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. voyager_alex"
                  className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 rounded-xl pl-9 pr-9 py-2 text-xs text-stone-100 placeholder-stone-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field with smooth expand/collapse */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              mode === 'signup' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none -my-1'
            }`}
          >
            <div className="pb-1">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={mode === 'signup'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 rounded-xl pl-9 pr-9 py-2 text-xs text-stone-100 placeholder-stone-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-900" />
                  <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Start Planning' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-900 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch Mode Prompt */}
        <div className="mt-4 pt-3 border-t border-stone-800 text-center text-xs text-stone-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-stone-200 hover:text-white font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-stone-200 hover:text-white font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
