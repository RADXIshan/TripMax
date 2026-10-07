import { 
  Plane, 
  Train, 
  ExternalLink, 
  Check, 
  Leaf, 
  Clock, 
  Luggage 
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface TransitTabProps {
  plan: TripPlan;
}

export const TransitTab: React.FC<TransitTabProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div>
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          Transit Intelligence: Flights vs Trains
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Multi-agent logistical comparison connecting {plan.origin} to {plan.destination}
        </p>
      </div>

      {/* Head-to-Head Tradeoff Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flights Profile Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">Air Travel (Flights)</h4>
                <span className="text-[11px] text-stone-500">Fastest long-distance traversal</span>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-700">
              From ~{plan.budget.currency} {plan.flights[0]?.estimated_price.toLocaleString() || '350'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Transit Time: <strong>{plan.flights[0]?.duration || 'Direct / Fast'}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Luggage className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Airport Time: Requires 2-3 hours prior arrival for security & boarding</span>
            </div>
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Best for: Tight schedules and cross-continental long-hauls</span>
            </div>
          </div>
        </div>

        {/* Trains Profile Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">High-Speed & Scenic Rail</h4>
                <span className="text-[11px] text-stone-500">City-center to city-center comfort</span>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-700">
              From ~{plan.budget.currency} {plan.trains[0]?.estimated_price.toLocaleString() || '110'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Transit Time: <strong>{plan.trains[0]?.duration || 'City-to-city high speed'}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Sustainability: Up to 85% less CO2 emissions; zero airport queues</span>
            </div>
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Best for: Relaxed immersion, working with Wi-Fi, and panoramic countryside</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5" />
          <span>Recommended Flight Connections</span>
        </h4>
        <div className="space-y-3">
          {plan.flights.map((f, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {f.airline}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                    {f.stops}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {f.departure} ➔ {f.arrival} ({f.duration})
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] text-stone-600 dark:text-stone-300 pt-1">
                  {f.pros.map((p, pIdx) => (
                    <span key={pIdx} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-700">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Estimated fare</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {f.currency} {f.estimated_price.toLocaleString()}
                  </span>
                </div>
                <a
                  href={f.booking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Book on {f.provider}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Train Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
          <Train className="w-3.5 h-3.5" />
          <span>Recommended Rail & Scenic Train Options</span>
        </h4>
        <div className="space-y-3">
          {plan.trains.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {t.train_name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
                    {t.operator}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {t.route} • Class: {t.class_tier}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 italic pt-1">
                  Scenic highlight: "{t.scenic_highlights}"
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-700">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Estimated fare</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {t.currency} {t.estimated_price.toLocaleString()}
                  </span>
                </div>
                <a
                  href={t.booking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Book on {t.provider}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
