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
  onNewTrip: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  plan,
  savedTripsCount,
  onNewTrip,
  collapsed,
  onToggleCollapsed
}) => {
  const getNavItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer border-[1.5px] ${
      isActive
        ? 'border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
        : 'border-transparent text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
    } ${collapsed ? 'justify-center px-0' : ''}`;

  return (
    <aside
      className={`h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Portion */}
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
        {/* Brand Bar */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 shrink-0 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-stone-100 block">
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
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer border-[1.5px] border-transparent hover:border-stone-700 transition-all"
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
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border-[1.5px] border-stone-700 hover:border-stone-600 text-stone-100 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
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
            className={getNavItemClass(currentView === 'chat')}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Discovery Chat</span>}
          </button>

          {/* All Trips Done */}
          <button
            onClick={() => onViewChange('trips')}
            title={collapsed ? 'All Trips Archive' : undefined}
            className={getNavItemClass(currentView === 'trips')}
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
            <div className="mx-1 mb-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border-[1.5px] border-stone-300/80 dark:border-stone-700">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{plan.destination}</span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {plan.duration_days} Days • {plan.budget.currency} {plan.budget.total_estimated.toLocaleString()}
              </div>
            </div>
          )}

          {/* Itinerary */}
          <button
            onClick={() => onViewChange('itinerary')}
            title={collapsed ? 'Day-by-Day Itinerary' : undefined}
            className={getNavItemClass(currentView === 'itinerary')}
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
            className={getNavItemClass(currentView === 'transit')}
          >
            <Plane className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Flights vs Trains</span>}
          </button>

          {/* Stays & Lodging */}
          <button
            onClick={() => onViewChange('stays')}
            title={collapsed ? 'Stays & Lodging' : undefined}
            className={getNavItemClass(currentView === 'stays')}
          >
            <Building className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Stays & Lodging</span>}
          </button>

          {/* Budget Blueprint */}
          <button
            onClick={() => onViewChange('budget')}
            title={collapsed ? 'Budget Blueprint' : undefined}
            className={getNavItemClass(currentView === 'budget')}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Budget Blueprint</span>}
          </button>

          {/* Booking & Packing Checklist */}
          <button
            onClick={() => onViewChange('checklist')}
            title={collapsed ? 'Booking & Packing' : undefined}
            className={getNavItemClass(currentView === 'checklist')}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Booking & Packing</span>}
          </button>

          {/* Web Intelligence Sources */}
          <button
            onClick={() => onViewChange('sources')}
            title={collapsed ? 'Web Intelligence Citations' : undefined}
            className={getNavItemClass(currentView === 'sources')}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Web Citations</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
