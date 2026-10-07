import { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ExternalLink, 
  UtensilsCrossed, 
  Bus, 
  Tag, 
  Sun, 
  Sunset, 
  Moon
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface ItineraryTabProps {
  plan: TripPlan;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const currentDay = plan.itinerary.find((d) => d.day === selectedDay) || plan.itinerary[0];

  return (
    <div className="space-y-6">
      {/* Overview & Quick Highlights Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              Curated Destination Experience
            </span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {plan.tagline}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {plan.overview}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-700/60 border border-stone-200 dark:border-stone-600 text-xs">
              <span className="text-stone-400 block text-[10px]">Optimal Season</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {plan.best_time_to_visit.split(' ')[0]}
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-700/60 border border-stone-200 dark:border-stone-600 text-xs">
              <span className="text-stone-400 block text-[10px]">Total Days</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {plan.duration_days} Days
              </span>
            </div>
          </div>
        </div>

        {/* Local Transport Pass Tip Banner */}
        <div className="mt-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-700/80 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300">
          <Bus className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Local Transit Pass Strategy: </span>
            <span>{plan.local_transport_pass_tip}</span>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan.itinerary.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDay === d.day
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <span>Day {d.day}</span>
          </button>
        ))}
      </div>

      {/* Active Day Detail Canvas */}
      {currentDay && (
        <div className="space-y-5">
          {/* Day Title & Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 gap-2">
            <div>
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {currentDay.title}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Theme: {currentDay.theme}</span>
              </p>
            </div>
            <div className="text-xs font-medium text-stone-600 dark:text-stone-400">
              Est. Day Budget: <span className="font-bold text-stone-900 dark:text-stone-100">{plan.budget.currency} {currentDay.daily_budget_estimate}</span>
            </div>
          </div>

          {/* Morning / Afternoon / Evening Timeline Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Morning */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Morning • {currentDay.morning.time}
                  </span>
                </div>
                {currentDay.morning.estimated_cost > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    ~{plan.budget.currency} {currentDay.morning.estimated_cost}
                  </span>
                )}
              </div>

              <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {currentDay.morning.title}
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{currentDay.morning.location}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{currentDay.morning.duration}</span>
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                {currentDay.morning.description}
              </p>

              {currentDay.morning.booking_url && (
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-end">
                  <a
                    href={currentDay.morning.booking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-stone-900 dark:text-stone-100 hover:underline flex items-center gap-1"
                  >
                    <span>Reserve Priority Entrance</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Lunch Recommendation Spotlight */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Curated Midday Lunch
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {currentDay.lunch_recommendation.place}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 block">
                    Must try: <strong className="text-stone-700 dark:text-stone-300">{currentDay.lunch_recommendation.dish}</strong>
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-[11px] self-start sm:self-auto">
                {currentDay.lunch_recommendation.vibe}
              </span>
            </div>

            {/* Afternoon */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center">
                    <Sunset className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Afternoon • {currentDay.afternoon.time}
                  </span>
                </div>
                {currentDay.afternoon.estimated_cost > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    ~{plan.budget.currency} {currentDay.afternoon.estimated_cost}
                  </span>
                )}
              </div>

              <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {currentDay.afternoon.title}
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{currentDay.afternoon.location}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{currentDay.afternoon.duration}</span>
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                {currentDay.afternoon.description}
              </p>

              {currentDay.afternoon.booking_url && (
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-end">
                  <a
                    href={currentDay.afternoon.booking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-stone-900 dark:text-stone-100 hover:underline flex items-center gap-1"
                  >
                    <span>Book Experience / Guided Tour</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Evening */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Evening • {currentDay.evening.time}
                  </span>
                </div>
                {currentDay.evening.estimated_cost > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    ~{plan.budget.currency} {currentDay.evening.estimated_cost}
                  </span>
                )}
              </div>

              <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {currentDay.evening.title}
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{currentDay.evening.location}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{currentDay.evening.duration}</span>
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                {currentDay.evening.description}
              </p>
            </div>

            {/* Dinner Recommendation Spotlight */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Evening Dinner Spotlight
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {currentDay.dinner_recommendation.place}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 block">
                    Signature: <strong className="text-stone-700 dark:text-stone-300">{currentDay.dinner_recommendation.dish}</strong>
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-[11px] self-start sm:self-auto">
                {currentDay.dinner_recommendation.vibe}
              </span>
            </div>

            {/* Day transit guidance */}
            <div className="p-3 rounded-lg bg-stone-100/70 dark:bg-stone-800/40 text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <Bus className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span><strong>Day {currentDay.day} Transit Advice:</strong> {currentDay.transit_tips}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
