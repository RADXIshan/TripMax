import { 
  Compass, 
  Moon, 
  Sun, 
  Settings, 
  Download, 
  Search,
  Sparkles
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface HeaderProps {
  plan: TripPlan | null;
  currency: string;
  onCurrencyChange: (c: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenLiveSearch: () => void;
  onExport: () => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plan,
  currency,
  onCurrencyChange,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenLiveSearch,
  onExport,
  onLoadSample,
  isLoading
}) => {
  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-stone-900 dark:text-stone-100">
                TripMax
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                Multi-Agent
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Intelligent Itinerary & Booking Architect
            </p>
          </div>
        </div>

        {/* Center destination pill if loaded */}
        {plan && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300">
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
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              <span>Sample Trip</span>
            </button>
          )}

          {/* Live Search Trigger */}
          <button
            onClick={onOpenLiveSearch}
            title="Explore Live Web Search"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="text-xs font-medium bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-stone-700 dark:text-stone-300 cursor-pointer focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>

          {/* Export Plan */}
          {plan && (
            <button
              onClick={onExport}
              title="Export Trip Plan"
              className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            title="Configure API Keys & Agent Settings"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dark Mode */}
          <button
            onClick={onToggleDarkMode}
            title="Toggle Theme"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
