import { 
  FolderArchive, 
  ArrowRight, 
  Trash2, 
  Plus, 
  MapPin,
  Clock
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
  onSelectTrip: (plan: TripPlan) => void;
  onDeleteTrip: (id: string) => void;
  onNewTrip: () => void;
  onLoadPreset: (destination: string) => void;
}

export const SavedTripsTab: React.FC<SavedTripsTabProps> = ({
  savedTrips,
  currentTripId,
  onSelectTrip,
  onDeleteTrip,
  onNewTrip,
  onLoadPreset
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                All Trips & Journey Archive
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Browse and switch between all itineraries created till now ({savedTrips.length} saved)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onNewTrip}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-xs hover:shadow"
        >
          <Plus className="w-3.5 h-3.5 text-stone-900" />
          <span>Plan New Journey</span>
        </button>
      </div>

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
                    ? 'bg-stone-50 dark:bg-stone-800/90 border-stone-900 dark:border-stone-400 shadow-xs ring-1 ring-stone-900/10'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{record.savedAt}</span>
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-700 border border-stone-600 text-stone-200">
                        Active Plan
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{record.destination}</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {record.tagline}
                  </p>

                  {/* Details metadata */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Duration:</span>
                      <span className="font-semibold">{record.duration_days} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Origin:</span>
                      <span className="font-semibold">{record.origin}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Total Budget:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {record.currency} {record.total_budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-700/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onDeleteTrip(record.id)}
                    title="Delete saved trip"
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectTrip(record.plan)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:shadow"
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
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-700 mx-auto flex items-center justify-center text-stone-600 dark:text-stone-300">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
            No Trips Saved Yet
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Any itinerary you generate or explore will automatically be archived here for easy reference.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onLoadPreset('Kyoto')}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              Load Kyoto Sample
            </button>
            <button
              onClick={onNewTrip}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 font-semibold cursor-pointer transition-all shadow-xs hover:shadow"
            >
              Start New Discovery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
