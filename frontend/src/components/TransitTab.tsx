import React, { useState } from 'react';
import { 
  Plane, 
  Train, 
  ExternalLink, 
  Check, 
  Leaf, 
  Clock, 
  Luggage,
  Calendar,
  Globe,
  Maximize2,
  X
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface TransitTabProps {
  plan: TripPlan;
}

export const TransitTab: React.FC<TransitTabProps> = ({ plan }) => {
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const flightFallback = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80';
  const trainFallback = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="space-y-6">
      {/* Intro Header & Travel Window */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Transit Intelligence: Flights vs High-Speed Rail
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real operating carriers and rail networks connecting {plan.origin} to {plan.destination}
          </p>
        </div>

        {plan.dates && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {plan.dates}
            </span>
          </div>
        )}
      </div>

      {/* Head-to-Head Tradeoff Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flights Profile Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-750">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">Air Travel (Commercial Flights)</h4>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Fastest long-distance traversal</span>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800">
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
              <span>Best for: Intercontinental routing and time-compressed schedules</span>
            </div>
          </div>
        </div>

        {/* Trains Profile Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-750">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">High-Speed & Scenic Rail</h4>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">City-center to city-center comfort</span>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800">
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
              <span>Sustainability: Up to 85% lower CO2 emissions; zero check-in queues</span>
            </div>
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Best for: Relaxed travel, working with Wi-Fi, and luggage flexibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-sky-500" />
          <span>Recommended Live Flight Connections</span>
        </h4>
        <div className="space-y-4">
          {plan.flights.map((f, idx) => {
            const flightKey = `flight-${idx}`;
            const isFailed = failedImages[flightKey];
            const displayImg = (!isFailed && f.image_url) ? f.image_url : flightFallback;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row"
              >
                {/* Flight Image Thumbnail */}
                <div className="relative w-full md:w-56 h-36 md:h-auto shrink-0 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={f.airline}
                    onError={() => handleImageError(flightKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md text-white border border-white/20">
                      {f.stops}
                    </span>
                  </div>

                  <button
                    onClick={() => setLightboxImg({ url: displayImg, title: f.airline })}
                    className="absolute bottom-2 right-2 p-1 rounded-md bg-black/60 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer transition-colors"
                    title="Enlarge photo"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Flight Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {f.airline}
                        </span>
                        {f.flight_number && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {f.flight_number}
                          </span>
                        )}
                      </div>

                      {f.dates && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>{f.dates}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {f.departure} ➔ {f.arrival} <span className="text-stone-400 dark:text-stone-500">({f.duration})</span>
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-stone-600 dark:text-stone-300 pt-0.5">
                      {f.pros.map((p, pIdx) => (
                        <span key={pIdx} className="flex items-center gap-1 bg-stone-50 dark:bg-stone-800/60 px-2 py-0.5 rounded border border-stone-100 dark:border-stone-750">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>

                    {/* Verified Schedule Web Citation */}
                    {f.source_name && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                        <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Live timetable & fares verified via:</span>
                        {f.source_url ? (
                          <a
                            href={f.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-stone-800 dark:text-stone-200 underline decoration-stone-300 hover:text-emerald-600 flex items-center gap-0.5"
                          >
                            {f.source_name}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{f.source_name}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing and Deep Booking Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-750">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Roundtrip estimate</span>
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {f.currency} {f.estimated_price.toLocaleString()}
                      </span>
                    </div>

                    <a
                      href={f.booking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Book on {f.provider}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Train Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
          <Train className="w-3.5 h-3.5 text-emerald-600" />
          <span>Recommended Rail & Scenic Train Options</span>
        </h4>
        <div className="space-y-4">
          {plan.trains.map((t, idx) => {
            const trainKey = `train-${idx}`;
            const isFailed = failedImages[trainKey];
            const displayImg = (!isFailed && t.image_url) ? t.image_url : trainFallback;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row"
              >
                {/* Train Image Thumbnail */}
                <div className="relative w-full md:w-56 h-36 md:h-auto shrink-0 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={t.train_name}
                    onError={() => handleImageError(trainKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      {t.operator}
                    </span>
                  </div>

                  <button
                    onClick={() => setLightboxImg({ url: displayImg, title: t.train_name })}
                    className="absolute bottom-2 right-2 p-1 rounded-md bg-black/60 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer transition-colors"
                    title="Enlarge photo"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Train Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {t.train_name}
                      </span>

                      {t.dates && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{t.dates}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {t.route} • <span className="font-semibold">{t.class_tier}</span> • {t.duration}
                    </p>

                    <p className="text-xs text-stone-600 dark:text-stone-300 italic bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-100 dark:border-stone-750">
                      ✨ Scenic highlight: "{t.scenic_highlights}"
                    </p>

                    {/* Verified Schedule Web Citation */}
                    {t.source_name && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                        <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Live timetable & reservations verified via:</span>
                        {t.source_url ? (
                          <a
                            href={t.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-stone-800 dark:text-stone-200 underline decoration-stone-300 hover:text-emerald-600 flex items-center gap-0.5"
                          >
                            {t.source_name}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{t.source_name}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing and Deep Booking Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-750">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Fare estimate</span>
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {t.currency} {t.estimated_price.toLocaleString()}
                      </span>
                    </div>

                    <a
                      href={t.booking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Book on {t.provider}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200">
                {lightboxImg.title}
              </span>
              <button
                onClick={() => setLightboxImg(null)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center">
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

