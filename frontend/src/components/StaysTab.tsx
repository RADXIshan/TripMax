import React, { useState } from 'react';
import { 
  Award, 
  MapPin, 
  ExternalLink,
  Calendar,
  CheckCircle2,
  Maximize2,
  X,
  Globe
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface StaysTabProps {
  plan: TripPlan;
}

export const StaysTab: React.FC<StaysTabProps> = ({ plan }) => {
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="space-y-6">
      {/* Header with Dates Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-stone-100">
            Curated Accommodations & Neighborhoods
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Verified highly-rated hotels (rated 9.0+/10) handpicked for your budget and travel pace in {plan.destination}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-stone-850 border border-stone-750 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-semibold text-stone-200">
            {plan.dates} ({plan.duration_days} Nights)
          </span>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plan.stays.map((stay) => {
          const isFailed = failedImages[stay.id];
          const displayImg = (!isFailed && stay.image_url) ? stay.image_url : fallbackImage;

          return (
            <div
              key={stay.id}
              className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow group"
            >
              {/* Hotel Photo Header */}
              <div className="relative h-48 w-full bg-stone-950 overflow-hidden">
                <img
                  src={displayImg}
                  alt={stay.name}
                  onError={() => handleImageError(stay.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3">
                  {stay.badge ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
                      {stay.badge}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white border border-white/20">
                      {stay.type}
                    </span>
                  )}
                </div>

                {/* Rating Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-bold text-white bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stay.rating}</span>
                  <span className="text-stone-300 font-normal text-[10px]">({stay.review_count})</span>
                </div>

                {/* Expand Image */}
                <button
                  onClick={() => setLightboxImg({ url: displayImg, title: stay.name })}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 cursor-pointer transition-colors"
                  title="View Hotel Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Title & Neighborhood over image */}
                <div className="absolute bottom-3 left-3 right-12 text-white">
                  <h4 className="text-base font-bold drop-shadow-sm truncate">
                    {stay.name}
                  </h4>
                  <p className="text-[11px] text-stone-200 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{stay.neighborhood}</span>
                  </p>
                </div>
              </div>

              {/* Hotel Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {stay.why_recommended}
                  </p>

                  {/* Verified Guest Review Snippet */}
                  {stay.verified_review_snippet && (
                    <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-[11px] text-stone-300 italic flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{stay.verified_review_snippet}</span>
                    </div>
                  )}

                  {/* Amenities chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stay.key_amenities.map((amenity, aIdx) => (
                      <span
                        key={aIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Verified Citation Source */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800">
                    <span className="flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{stay.source_name || "Booking.com Live Verified Listing"}</span>
                    </span>
                    {stay.source_url && (
                      <a
                        href={stay.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Verified Listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom pricing & direct booking link */}
                <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                      {plan.duration_days} Nights Total ({plan.dates})
                    </span>
                    <div className="text-sm font-bold text-stone-100">
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
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:shadow cursor-pointer"
                  >
                    <span>Check {stay.provider}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.title}
              className="w-full h-auto max-h-[75vh] object-contain bg-black"
            />
            <div className="p-4 bg-stone-900 text-white">
              <h5 className="font-bold text-sm">{lightboxImg.title}</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
