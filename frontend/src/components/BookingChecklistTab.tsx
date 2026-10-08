import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  CalendarClock, 
  Luggage 
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface BookingChecklistTabProps {
  plan: TripPlan;
}

export const BookingChecklistTab: React.FC<BookingChecklistTabProps> = ({ plan }) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const toggleChecklist = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const togglePacked = (key: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalChecklist = plan.checklist.length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Concierge Progress */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-100">
              Trip Preparation & Booking Concierge
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Time-sequenced action milestones to execute your journey stress-free
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-xs font-semibold text-stone-200">
              {completedCount} of {totalChecklist} Tasks Done ({progressPercent}%)
            </span>
            <div className="w-36 h-2 rounded-full bg-stone-800 mt-1.5 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-amber-400 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Timeline Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Sequenced Booking Milestones</span>
        </h4>

        <div className="space-y-2.5">
          {plan.checklist.map((item) => {
            const isDone = !!completedItems[item.id];
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-stone-950/50 border-stone-850 opacity-60'
                    : 'bg-stone-900 border-stone-800 shadow-2xs hover:border-stone-750'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    className="mt-0.5 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isDone
                          ? 'line-through text-stone-500'
                          : 'text-stone-100'
                      }`}
                    >
                      {item.task}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-medium border border-stone-750">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {item.timeline}
                      </span>
                    </div>
                  </div>
                </div>

                {item.booking_url && (
                  <a
                    href={item.booking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <span>Launch Booking</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weather & Destination Tailored Packing List */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5" />
            <span>Curated Packing List for {plan.destination}</span>
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Optimized for local climate, temple etiquette, and 15,000+ daily steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.packing_list.map((group, gIdx) => (
            <div
              key={gIdx}
              className="p-4 rounded-xl bg-stone-900 border border-stone-800 shadow-2xs"
            >
              <h5 className="text-xs font-bold text-stone-200 pb-2 border-b border-stone-800">
                {group.category}
              </h5>
              <div className="mt-3 space-y-2">
                {group.items.map((it, iIdx) => {
                  const itemKey = `${gIdx}-${iIdx}`;
                  const isChecked = !!packedItems[itemKey];
                  return (
                    <div
                      key={iIdx}
                      onClick={() => togglePacked(itemKey)}
                      className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer select-none group"
                    >
                      <button className="text-stone-500 group-hover:text-stone-200 transition-colors">
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className={isChecked ? 'line-through text-stone-500' : ''}>
                        {it}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
