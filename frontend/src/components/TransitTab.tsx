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
  X,
  Navigation,
  Bus,
  Compass,
  MapPin,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import type { TripPlan } from '../types/trip';
import { AutoBookingModal, type BookingPayload } from './AutoBookingModal';

interface TransitTabProps {
  plan: TripPlan;
}

export const TransitTab: React.FC<TransitTabProps> = ({ plan }) => {
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [autoBookingItem, setAutoBookingItem] = useState<BookingPayload | null>(null);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const flightFallback = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80';
  const trainFallback = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80';

  const hasTrains = Boolean(plan.trains && plan.trains.length > 0);

  return (
    <div className="space-y-6">
      {/* Intro Header & Travel Window */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-stone-100">
            {hasTrains 
              ? "Transit Intelligence: Flights vs High-Speed Rail" 
              : "Transit Intelligence: Commercial Flights & Ground Mobility"}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {hasTrains
              ? `Real operating carriers and rail networks connecting ${plan.origin} to ${plan.destination}`
              : `Real operating commercial flight routes connecting ${plan.origin} to ${plan.destination} (Cross-Country Route)`}
          </p>
        </div>

        {plan.dates && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-stone-850 border border-stone-750 text-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-semibold text-stone-200">
              {plan.dates}
            </span>
          </div>
        )}
      </div>

      {/* Head-to-Head Tradeoff Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flights Profile Card */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">Air Travel (Commercial Flights)</h4>
                <span className="text-[11px] text-stone-400">Fastest long-distance traversal</span>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-100 px-2.5 py-1 rounded-md bg-stone-800">
              From ~{plan.budget.currency} {plan.flights[0]?.estimated_price.toLocaleString() || '350'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Transit Time: <strong>{plan.flights[0]?.duration || 'Direct / Fast'}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-stone-300">
              <Luggage className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Airport Time: Requires 2-3 hours prior arrival for security & boarding</span>
            </div>
            <div className="flex items-start gap-2 text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Best for: Intercontinental routing and time-compressed schedules</span>
            </div>
          </div>
        </div>

        {/* Trains Profile Card or Cross-Border Notice Card */}
        {hasTrains ? (
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100">High-Speed & Scenic Rail</h4>
                  <span className="text-[11px] text-stone-400">City-center to city-center comfort</span>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-100 px-2.5 py-1 rounded-md bg-stone-800">
                From ~{plan.budget.currency} {plan.trains[0]?.estimated_price.toLocaleString() || '110'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-stone-300">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>Transit Time: <strong>{plan.trains[0]?.duration || 'City-to-city high speed'}</strong></span>
              </div>
              <div className="flex items-start gap-2 text-stone-300">
                <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sustainability: Up to 85% lower CO2 emissions; zero check-in queues</span>
              </div>
              <div className="flex items-start gap-2 text-stone-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Best for: Relaxed travel, working with Wi-Fi, and luggage flexibility</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100">Cross-Country Transit Route</h4>
                  <span className="text-[11px] text-stone-400">International Border Traversal</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800/40">
                Air Travel Only
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-stone-300">
                <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Route: Direct passenger rail does not connect {plan.origin} to {plan.destination}.</span>
              </div>
              <div className="flex items-start gap-2 text-stone-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Primary Transit: Long-distance commercial flights above provide optimal routing.</span>
              </div>
              <div className="flex items-start gap-2 text-stone-300">
                <Train className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Ground Transit: City metro systems, airport express, and regional excursions inside {plan.destination} are detailed below.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-sky-400" />
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
                className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row"
              >
                {/* Flight Image Thumbnail */}
                <div className="relative w-full md:w-56 h-36 md:h-auto shrink-0 bg-stone-950 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={f.airline}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(flightKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
                  
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
                        <span className="text-base font-bold text-stone-100">
                          {f.airline}
                        </span>
                        {f.flight_number && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            {f.flight_number}
                          </span>
                        )}
                      </div>

                      {f.dates && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-stone-300 bg-stone-850 px-2 py-0.5 rounded-md border border-stone-750">
                          <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{f.dates}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-medium text-stone-300">
                      {f.departure} ➔ {f.arrival} <span className="text-stone-400">({f.duration})</span>
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-stone-300 pt-0.5">
                      {f.pros.map((p, pIdx) => (
                        <span key={pIdx} className="flex items-center gap-1 bg-stone-850 px-2 py-0.5 rounded border border-stone-750">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>

                    {/* Verified Schedule Web Citation */}
                    {f.source_name && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-400">
                        <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Live timetable & fares verified via:</span>
                        {f.source_url ? (
                          <a
                            href={f.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-stone-200 underline decoration-stone-600 hover:text-emerald-400 flex items-center gap-0.5"
                          >
                            {f.source_name}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-semibold text-stone-200">{f.source_name}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Multi-Site Booking Comparison Links */}
                  {f.booking_links && f.booking_links.length > 0 && (
                    <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                        <span>Compare Rates Across Travel Sites:</span>
                        <span className="text-emerald-400">Best Fare Guarantee</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {f.booking_links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-750 flex items-center gap-1 transition-all cursor-pointer"
                            title={link.price_hint || link.label}
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing and Primary Deep Booking Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Roundtrip Total (Per Person)</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-stone-100">
                          {f.currency} {f.estimated_price.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          (~{f.currency} {Math.round(f.estimated_price / 2).toLocaleString()} one-way)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAutoBookingItem({
                          itemType: 'flight',
                          title: `${f.airline} (${f.flight_number || 'Direct'})`,
                          provider: f.provider,
                          bookingUrl: f.booking_url,
                          price: f.estimated_price,
                          currency: f.currency,
                          dates: f.dates || plan.dates,
                          origin: plan.origin,
                          destination: plan.destination
                        })}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                        title="Run Playwright agent to auto-book flight and add to cart"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Book</span>
                      </button>

                      <a
                        href={f.booking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border border-stone-700"
                      >
                        <span>{f.provider}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Train Routes Detailed List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
          <Train className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {hasTrains 
              ? "Recommended Rail & Scenic Train Options" 
              : `Passenger Rail Status (${plan.origin} ➔ ${plan.destination})`}
          </span>
        </h4>
        {hasTrains ? (
          <div className="space-y-4">
          {plan.trains.map((t, idx) => {
            const trainKey = `train-${idx}`;
            const isFailed = failedImages[trainKey];
            const displayImg = (!isFailed && t.image_url) ? t.image_url : trainFallback;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row"
              >
                {/* Train Image Thumbnail */}
                <div className="relative w-full md:w-56 h-36 md:h-auto shrink-0 bg-stone-950 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={t.train_name}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(trainKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

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
                      <span className="text-base font-bold text-stone-100">
                        {t.train_name}
                      </span>

                      {t.dates && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-stone-300 bg-stone-850 px-2 py-0.5 rounded-md border border-stone-750">
                          <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{t.dates}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-300">
                      {t.route} • <span className="font-semibold">{t.class_tier}</span> • {t.duration}
                    </p>

                    <p className="text-xs text-stone-300 italic bg-stone-850 p-2 rounded-lg border border-stone-750">
                      ✨ Scenic highlight: "{t.scenic_highlights}"
                    </p>

                    {/* Verified Schedule Web Citation */}
                    {t.source_name && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-400">
                        <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Live timetable & reservations verified via:</span>
                        {t.source_url ? (
                          <a
                            href={t.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-stone-200 underline decoration-stone-600 hover:text-emerald-400 flex items-center gap-0.5"
                          >
                            {t.source_name}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-semibold text-stone-200">{t.source_name}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Multi-Site Train Rail Booking Comparison */}
                  {t.booking_links && t.booking_links.length > 0 && (
                    <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                        <span>Compare Rail Networks & Seat Passes:</span>
                        <span className="text-emerald-400">Direct Pass Integration</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.booking_links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-750 flex items-center gap-1 transition-all cursor-pointer"
                            title={link.price_hint || link.label}
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing and Deep Booking Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Ticket Fare (Direct Express)</span>
                      <span className="text-base font-bold text-stone-100">
                        {t.currency} {t.estimated_price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAutoBookingItem({
                          itemType: 'train',
                          title: `${t.train_name} (${t.operator})`,
                          provider: t.provider,
                          bookingUrl: t.booking_url,
                          price: t.estimated_price,
                          currency: t.currency,
                          dates: t.dates || plan.dates,
                          origin: plan.origin,
                          destination: plan.destination
                        })}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                        title="Run Playwright agent to auto-book train and add to cart"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Book</span>
                      </button>

                      <a
                        href={t.booking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border border-stone-700"
                      >
                        <span>{t.provider}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-stone-850 border border-stone-750 flex items-center justify-center text-stone-400 shrink-0">
            <Train className="w-5 h-5 text-stone-400" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-stone-200 text-sm">
              Direct Passenger Rail Not Applicable for Cross-Country Route
            </p>
            <p className="text-stone-400 leading-relaxed">
              Traveling from {plan.origin} to {plan.destination} crosses international borders across seas or non-contiguous rail territories with no direct passenger rail service. Long-distance traversal is operated by commercial air travel.
            </p>
            <p className="text-emerald-400 font-medium">
              Looking for scenic rail or high-speed excursions inside {plan.destination}? Regional high-speed trains, heritage day-trip rail lines, and city metros are detailed in the Ground Mobility section below.
            </p>
          </div>
        </div>
      )}
    </div>

      {/* Local Ground Mobility & Intra-Destination Transit */}
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                  <span>Getting Around Inside {plan.destination}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    City Ground Mobility
                  </span>
                </h4>
              </div>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {plan.local_mobility?.overview || plan.local_transport_pass_tip}
              </p>
            </div>
          </div>
        </div>

        {/* City Transit Modes Grid */}
        {plan.local_mobility?.transit_modes && plan.local_mobility.transit_modes.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Local City Transit Modes</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.local_mobility.transit_modes.map((mode, mIdx) => (
                <div 
                  key={mIdx}
                  className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                        {mode.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {mode.estimated_cost}
                      </span>
                    </div>
                    <h6 className="text-xs font-bold text-stone-100">{mode.name}</h6>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-stone-400 truncate">
                      <span className="text-stone-500">Pass/App: </span>
                      <strong className="text-stone-200">{mode.recommended_pass_or_app}</strong>
                    </div>
                    {mode.official_link && (
                      <a
                        href={mode.official_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-0.5 shrink-0"
                      >
                        <span>Official Info</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regional Day-Trip Excursions */}
        {plan.local_mobility?.regional_excursions && plan.local_mobility.regional_excursions.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inter-City & Regional Day-Trip Excursions ({plan.destination} Region)</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.local_mobility.regional_excursions.map((exc, eIdx) => (
                <div 
                  key={eIdx}
                  className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h6 className="text-xs font-bold text-stone-100 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{exc.destination_name}</span>
                      </h6>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 shrink-0">
                        {exc.distance_and_duration}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-300">
                      <span className="text-stone-500">Transit: </span>
                      <strong>{exc.transit_mode}</strong>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      <span className="text-stone-500">Highlights: </span>
                      {exc.highlights}
                    </p>
                  </div>

                  {exc.booking_or_info_url && (
                    <div className="pt-2.5 mt-2.5 border-t border-stone-800/80 flex justify-end">
                      <a
                        href={exc.booking_or_info_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Check Route & Tickets</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insider Mobility Tips */}
        {plan.local_mobility?.insider_tips && plan.local_mobility.insider_tips.length > 0 && (
          <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <h6 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Local Mobility Insider Guidance</span>
            </h6>
            <ul className="space-y-1.5 text-xs text-stone-300">
              {plan.local_mobility.insider_tips.map((tip, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <span className="text-amber-400 text-sm leading-none">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Auto-Booking Playwright Agent Modal */}
      <AutoBookingModal
        isOpen={!!autoBookingItem}
        onClose={() => setAutoBookingItem(null)}
        bookingData={autoBookingItem}
      />

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

