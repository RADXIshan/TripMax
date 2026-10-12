import React from 'react';
import { 
  FolderArchive, 
  ArrowRight, 
  Trash2, 
  Plus, 
  MapPin,
  Clock,
  LogIn,
  AlertCircle,
  Sparkles,
  Bookmark
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

export interface SavedTripRecord {
  id: string;
  destination: string;
  origin: string;
  duration_days: number;
  dates: string;
  total_budget: number;
  currency: string;
  tagline: string;
  savedAt: string;
  plan: TripPlan;
}

interface SavedTripsTabProps {
  savedTrips: SavedTripRecord[];
  currentTripId: string | null;
  currentPlan?: TripPlan | null;
  isLoggedIn: boolean;
  onOpenAuth?: () => void;
  onSelectTrip: (plan: TripPlan) => void;
  onDeleteTrip: (id: string) => void;
  onNewTrip: () => void;
  onLoadPreset: (destination: string) => void;
  onSaveCurrentTrip?: () => void;
}

export const SavedTripsTab: React.FC<SavedTripsTabProps> = ({
  savedTrips,
  currentTripId,
  currentPlan,
  isLoggedIn,
  onOpenAuth,
  onSelectTrip,
  onDeleteTrip,
  onNewTrip,
  onLoadPreset,
  onSaveCurrentTrip,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-stone-200">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                All Trips & Journey Archive
              </h3>
              <p className="text-xs text-stone-400">
                {isLoggedIn 
                  ? `Browse and switch between all itineraries saved to your cloud account (${savedTrips.length} saved)`
                  : 'Trips are only saved to All Trips when you are logged in'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isLoggedIn && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={onNewTrip}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow"
          >
            <Plus className="w-3.5 h-3.5 text-stone-900" />
            <span>Plan New Journey</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Warning & Active Session Trip Notice */}
      {!isLoggedIn && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-200">
                Guest Mode • Trips Not Saved to Archive
              </h4>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                You are currently browsing as a guest. Generated trips are active across your Discovery Chat, Itinerary, Transit, Stays, and Budget tabs, but will <strong>not be saved</strong> to All Trips until you sign in or create an account.
              </p>
            </div>
          </div>

          {/* If there's an active unsaved trip right now */}
          {currentPlan && (
            <div className="mt-2 p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-100">
                      Active Trip: {currentPlan.destination}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/50">
                      Unsaved Session
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {currentPlan.duration_days} Days • {currentPlan.budget.currency} {currentPlan.budget.total_estimated.toLocaleString()} budget
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onSelectTrip(currentPlan)}
                  className="px-3 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  View in Tabs
                </button>
                {onSaveCurrentTrip && (
                  <button
                    onClick={onSaveCurrentTrip}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Create Account to Save</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of Saved Trips */}
      {savedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTrips.map((record) => {
            const isCurrent = record.plan.id === currentTripId;
            return (
              <div
                key={record.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-stone-850 border-amber-500/60 shadow-xs ring-1 ring-amber-500/20'
                    : 'bg-stone-900 border-stone-800 shadow-2xs hover:border-stone-700'
                }`}
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{record.savedAt}</span>
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300">
                        Active Plan
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h4 className="text-base font-bold text-stone-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{record.destination}</span>
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {record.tagline}
                  </p>

                  {/* Details metadata */}
                  <div className="mt-4 pt-3 border-t border-stone-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-400">Duration:</span>
                      <span className="font-semibold">{record.duration_days} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-400">Origin:</span>
                      <span className="font-semibold">{record.origin}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-400">Total Budget:</span>
                      <span className="font-bold text-stone-100">
                        {record.currency} {record.total_budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onDeleteTrip(record.id)}
                    title="Delete saved trip"
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectTrip(record.plan)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:shadow"
                  >
                    <span>{isCurrent ? 'Viewing Now' : 'Open Plan'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-900" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-stone-900 border border-stone-800 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 mx-auto flex items-center justify-center text-stone-300">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-stone-100">
            {isLoggedIn ? 'No Trips Saved Yet' : 'No Saved Trips (Guest Mode)'}
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isLoggedIn 
              ? 'Any itinerary you generate or plan will automatically be archived here in your personal cloud collection.'
              : 'Sign in or create an account to save trips into your cloud archive. While browsing as guest, your trips are only displayed in the discovery chat and active workspace tabs.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {!isLoggedIn && onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer transition-all shadow-xs hover:shadow"
              >
                Sign In / Create Account
              </button>
            )}
            <button
              onClick={() => onLoadPreset('Kyoto')}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-750 hover:bg-stone-800 text-stone-300 cursor-pointer"
            >
              Load Kyoto Sample
            </button>
            <button
              onClick={onNewTrip}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-semibold cursor-pointer transition-all shadow-xs hover:shadow"
            >
              Start New Discovery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
