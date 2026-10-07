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
  RotateCcw, 
  Settings, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

export type NavView = 'chat' | 'itinerary' | 'transit' | 'stays' | 'budget' | 'checklist' | 'sources';

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  plan: TripPlan | null;
  currency: string;
  onCurrencyChange: (c: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onResetTrip: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  plan,
  currency,
  onCurrencyChange,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onResetTrip,
  collapsed,
  onToggleCollapsed
}) => {
  const navItems = [
    { id: 'chat' as NavView, label: 'Discovery Studio', icon: MessageSquare, badge: null },
    { id: 'itinerary' as NavView, label: 'Itinerary Plan', icon: CalendarDays, badge: plan ? `${plan.duration_days}D` : null },
    { id: 'transit' as NavView, label: 'Flights & Trains', icon: Plane, badge: plan ? `${plan.flights.length + plan.trains.length}` : null },
    { id: 'stays' as NavView, label: 'Stays & Lodging', icon: Building, badge: plan ? `${plan.stays.length}` : null },
    { id: 'budget' as NavView, label: 'Budget Blueprint', icon: CreditCard, badge: plan ? `${currency} ${Math.round(plan.budget.total_estimated / 1000)}k` : null },
    { id: 'checklist' as NavView, label: 'Booking & Packing', icon: CheckSquare, badge: plan ? `${plan.checklist.length}` : null },
    { id: 'sources' as NavView, label: 'Web Intelligence', icon: Globe, badge: plan ? `${plan.research_sources.length}` : null },
  ];

  return (
    <aside
      className={`h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
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
                  Travel Architect
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

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-stone-100'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-stone-800 text-stone-300 dark:bg-stone-200 dark:text-stone-700'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Destination Snapshot Box (when plan loaded) */}
      {!collapsed && plan && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Destination</span>
          </div>
          <div className="font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
            {plan.destination}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {plan.duration_days} Days • {currency} {plan.budget.total_estimated.toLocaleString()}
          </div>
        </div>
      )}

      {/* Bottom Actions & Preferences */}
      <div className="p-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
        {/* Reset / New Trip */}
        <button
          onClick={onResetTrip}
          title={collapsed ? 'New Trip' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>New Trip</span>}
        </button>

        {/* Currency Switcher */}
        {!collapsed ? (
          <div className="px-3 py-1.5 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>Currency:</span>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        ) : null}

        {/* Theme & Settings Row */}
        <div className={`flex items-center gap-1 ${collapsed ? 'flex-col' : 'justify-between px-2 pt-1'}`}>
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Configure API Keys & Agent Engine"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
