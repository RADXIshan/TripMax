import { 
  Award, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface StaysTabProps {
  plan: TripPlan;
}

export const StaysTab: React.FC<StaysTabProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          Curated Accommodations & Neighborhoods
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Handpicked for your style, safety, and convenient transit across {plan.destination}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.stays.map((stay) => (
          <div
            key={stay.id}
            className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div>
              {/* Top badge & rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                {stay.badge ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                    {stay.badge}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    {stay.type}
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-700/60 px-2 py-0.5 rounded-md">
                  <Award className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                  <span>{stay.rating}</span>
                  <span className="text-stone-400 font-normal text-[10px]">({stay.review_count} reviews)</span>
                </div>
              </div>

              {/* Title & Neighborhood */}
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {stay.name}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{stay.neighborhood}</span>
              </p>

              {/* Why Recommended */}
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
                {stay.why_recommended}
              </p>

              {/* Amenities chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {stay.key_amenities.map((amenity, aIdx) => (
                  <span
                    key={aIdx}
                    className="text-[11px] px-2 py-1 rounded-md bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom pricing & direct booking link */}
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                  {plan.duration_days} Nights Total
                </span>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {stay.currency} {stay.total_price.toLocaleString()}
                  <span className="text-xs font-normal text-stone-500 ml-1">
                    ({stay.currency} {stay.price_per_night}/nt)
                  </span>
                </div>
              </div>

              <a
                href={stay.booking_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:shadow"
              >
                <span>Reserve on {stay.provider}</span>
                <ExternalLink className="w-3 h-3 text-stone-900" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
