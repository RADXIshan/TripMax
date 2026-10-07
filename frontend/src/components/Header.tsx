import { 
  Compass, 
  Download
} from 'lucide-react';
import type { TripPlan } from '../types/trip';
import { CurrencyDropdown } from './CurrencyDropdown';

interface HeaderProps {
  plan: TripPlan | null;
  currency: string;
  onCurrencyChange: (c: string) => void;
  onOpenLiveSearch?: () => void;
  onExport: () => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plan,
  currency,
  onCurrencyChange,
  onExport,
  onLoadSample,
  isLoading
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-stone-900">
                TripMax
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Intelligent Itinerary & Booking Architect
            </p>
          </div>
        </div>

        {/* Center destination pill if loaded */}
        {plan && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{plan.destination}</span>
            <span className="text-stone-400">•</span>
            <span>{plan.duration_days} Days</span>
            <span className="text-stone-400">•</span>
            <span>{plan.budget.currency} {plan.budget.total_estimated.toLocaleString()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Sample Button */}
          {!plan && (
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              <span>Sample Trip</span>
            </button>
          )}

          {/* Currency Dropdown */}
          <CurrencyDropdown
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            align="right"
          />

          {/* Export Plan */}
          {plan && (
            <button
              onClick={onExport}
              title="Export Trip Plan"
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
