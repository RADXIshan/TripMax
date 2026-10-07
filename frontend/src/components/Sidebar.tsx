import React from 'react';
import { 
  Compass, 
  MessageSquare, 
  CalendarDays, 
  Plane, 
  Building, 
  CreditCard, 
  CheckSquare, 
  Globe, 
  Plus, 
  Settings, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight, 
  FolderArchive,
  MapPin
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

export type NavView = 'chat' | 'trips' | 'itinerary' | 'transit' | 'stays' | 'budget' | 'checklist' | 'sources';

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  plan: TripPlan | null;
  savedTripsCount: number;
  currency: string;
  onCurrencyChange: (c: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onNewTrip: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  plan,
  savedTripsCount,
  currency,
  onCurrencyChange,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onNewTrip,
  collapsed,
  onToggleCollapsed
}) => {
  return (
    <aside
      className={`h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Portion */}
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
        {/* Brand Bar */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shrink-0 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100 block">
                  TripMax
                </span>
                <span className="text-[10px] text-stone-400 block -mt-0.5 tracking-wide">
                  AI Travel Planner
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapsed}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Button: New Trip (Placed naturally at top) */}
        <div className="p-2.5 shrink-0">
          <button
            onClick={onNewTrip}
            title={collapsed ? 'Plan New Trip' : undefined}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Plan New Trip</span>}
          </button>
        </div>

        {/* Section 1: Main Workspaces */}
        <div className="px-2 py-1 space-y-0.5">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Workspace
            </div>
          )}

          {/* Chat Studio */}
          <button
            onClick={() => onViewChange('chat')}
            title={collapsed ? 'Trip Discovery Studio' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'chat'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Discovery Chat</span>}
          </button>

          {/* All Trips Done */}
          <button
            onClick={() => onViewChange('trips')}
            title={collapsed ? 'All Trips Archive' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'trips'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <FolderArchive className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">All Trips</span>
                {savedTripsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold">
                    {savedTripsCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Section 2: Active Itinerary Details */}
        <div className="px-2 pt-3 pb-1 space-y-0.5">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center justify-between">
              <span>Current Journey</span>
              {plan && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </div>
          )}

          {/* Active Trip Mini Callout */}
          {!collapsed && plan && (
            <div className="mx-1 mb-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{plan.destination}</span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {plan.duration_days} Days • {currency} {plan.budget.total_estimated.toLocaleString()}
              </div>
            </div>
          )}

          {/* Itinerary */}
          <button
            onClick={() => onViewChange('itinerary')}
            title={collapsed ? 'Day-by-Day Itinerary' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'itinerary'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">Day-by-Day</span>
                {plan && (
                  <span className="text-[10px] text-stone-400 font-medium">
                    {plan.duration_days}D
                  </span>
                )}
              </>
            )}
          </button>

          {/* Transit: Flights vs Trains */}
          <button
            onClick={() => onViewChange('transit')}
            title={collapsed ? 'Flights vs Trains' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'transit'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Plane className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Flights vs Trains</span>}
          </button>

          {/* Stays & Lodging */}
          <button
            onClick={() => onViewChange('stays')}
            title={collapsed ? 'Stays & Lodging' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'stays'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Building className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Stays & Lodging</span>}
          </button>

          {/* Budget Blueprint */}
          <button
            onClick={() => onViewChange('budget')}
            title={collapsed ? 'Budget Blueprint' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'budget'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Budget Blueprint</span>}
          </button>

          {/* Booking & Packing Checklist */}
          <button
            onClick={() => onViewChange('checklist')}
            title={collapsed ? 'Booking & Packing' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'checklist'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Booking & Packing</span>}
          </button>

          {/* Web Intelligence Sources */}
          <button
            onClick={() => onViewChange('sources')}
            title={collapsed ? 'Web Intelligence Citations' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'sources'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Web Citations</span>}
          </button>
        </div>
      </div>

      {/* Bottom User Controls & Preferences */}
      <div className="p-2 border-t border-stone-100 dark:border-stone-800 space-y-1 shrink-0 bg-stone-50/50 dark:bg-stone-900">
        {/* Currency Selector */}
        {!collapsed && (
          <div className="px-2.5 py-1.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium">Currency</span>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-0.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        )}

        {/* Theme & Settings Buttons */}
        <div className={`flex items-center gap-1 ${collapsed ? 'flex-col' : 'justify-between px-2 pt-1'}`}>
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Configure API Keys & Agent Settings"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <Settings className="w-4 h-4" />
            {!collapsed && <span className="text-[11px] text-stone-500">Settings</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
