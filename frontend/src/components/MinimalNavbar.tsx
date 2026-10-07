import React from 'react';
import { 
  Compass, 
  Download, 
  ChevronRight,
  Loader2,
  Bookmark
} from 'lucide-react';
import type { TripPlan } from '../types/trip';
import type { NavView } from './Sidebar';
import { CurrencyDropdown } from './CurrencyDropdown';

interface MinimalNavbarProps {
  currentView: NavView;
  plan: TripPlan | null;
  currency: string;
  onCurrencyChange: (c: string) => void;
  onExport: () => void;
  onLoadSample: () => void;
  onSaveTrip?: () => void;
  isLoading: boolean;
  isGeneratingPlan: boolean;
}

export const MinimalNavbar: React.FC<MinimalNavbarProps> = ({
  currentView,
  plan,
  currency,
  onCurrencyChange,
  onExport,
  onLoadSample,
  onSaveTrip,
  isLoading,
  isGeneratingPlan
}) => {
  const viewTitles: Record<NavView, string> = {
    chat: 'Discovery & Clarification Studio',
    trips: 'All Trips & Journey Archive',
    itinerary: 'Day-by-Day Travel Architecture',
    transit: 'Transit Logistics: Air & Rail',
    stays: 'Curated Accommodations & Neighborhoods',
    budget: 'Financial Blueprint & Allocations',
    checklist: 'Booking Milestones & Packing',
    sources: 'Live Web Intelligence & Citations'
  };

  return (
    <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 transition-colors shrink-0 select-none">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 text-xs truncate">
        <span className="font-semibold text-stone-900 dark:text-stone-100">
          TripMax
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span className="text-stone-500 dark:text-stone-400 font-medium truncate">
          {plan ? plan.destination : 'New Trip'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:inline" />
        <span className="text-stone-700 dark:text-stone-300 font-semibold truncate hidden sm:inline">
          {viewTitles[currentView]}
        </span>
      </div>

      {/* Generating Status Indicator (Only appears while building plan) */}
      {isGeneratingPlan && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 animate-pulse">
          <Loader2 className="w-3 h-3 text-stone-600 dark:text-stone-300 animate-spin" />
          <span>Architecting Trip Itinerary...</span>
        </div>
      )}

      {/* Right Action Icons & Currency Dropdown */}
      <div className="flex items-center gap-2">
        {/* Sleek Currency Selector */}
        <CurrencyDropdown
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          align="right"
        />

        {!plan && (
          <button
            onClick={onLoadSample}
            disabled={isLoading || isGeneratingPlan}
            className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span>Sample Trip</span>
          </button>
        )}

        {plan && onSaveTrip && (
          <button
            onClick={onSaveTrip}
            title="Save trip into All Trips archive"
            className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow"
          >
            <Bookmark className="w-3.5 h-3.5 text-stone-700" />
            <span>Save Trip</span>
          </button>
        )}

        {plan && (
          <button
            onClick={onExport}
            title="Export Trip Plan as Markdown"
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
