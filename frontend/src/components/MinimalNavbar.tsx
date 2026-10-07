import React from 'react';
import { 
  Compass, 
  Search, 
  Download, 
  ChevronRight,
  ShieldCheck,
  FolderArchive
} from 'lucide-react';
import type { TripPlan } from '../types/trip';
import type { NavView } from './Sidebar';

interface MinimalNavbarProps {
  currentView: NavView;
  plan: TripPlan | null;
  onOpenLiveSearch: () => void;
  onExport: () => void;
  onLoadSample: () => void;
  isLoading: boolean;
  isGeneratingPlan: boolean;
}

export const MinimalNavbar: React.FC<MinimalNavbarProps> = ({
  currentView,
  plan,
  onOpenLiveSearch,
  onExport,
  onLoadSample,
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
    <header className="h-12 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 transition-colors shrink-0 select-none">
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

      {/* Center Multi-Agent Sync Status Pill */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
        {isGeneratingPlan ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100 animate-ping"></span>
            <span>Agents Synchronizing Intelligence...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>6 Autonomous Agents Ready</span>
          </>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5">
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

        <button
          onClick={onOpenLiveSearch}
          title="Direct Web Search Console"
          className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {plan && (
          <button
            onClick={onExport}
            title="Export Trip Plan as Markdown"
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
