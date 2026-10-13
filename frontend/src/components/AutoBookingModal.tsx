import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Maximize2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export interface BookingPayload {
  itemType: 'stay' | 'flight' | 'train';
  title: string;
  provider: string;
  bookingUrl: string;
  price: number;
  currency: string;
  dates: string;
  partyType?: string;
}

interface AutoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingPayload | null;
}

export const AutoBookingModal: React.FC<AutoBookingModalProps> = ({
  isOpen,
  onClose,
  bookingData
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);

  const steps = [
    { title: 'Initializing Playwright Engine', desc: 'Spawning headless browser with anti-detection headers' },
    { title: `Navigating to ${bookingData?.provider || 'Booking Portal'}`, desc: 'Bypassing overlays and loading live availability' },
    { title: 'Evaluating Personalized Rates', desc: 'Matching traveler budget, party size, and dates' },
    { title: 'Adding to Booking Cart', desc: 'Selecting room/fare tier and reserving item in cart' },
    { title: 'Capturing Verified Live Proof', desc: 'Extracting live screenshot & direct checkout session' }
  ];

  useEffect(() => {
    if (!isOpen || !bookingData) {
      setResult(null);
      setError(null);
      setStepIndex(0);
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setStepIndex(0);
    setError(null);
    setResult(null);

    // Step ticker animation
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    const runAutoBook = async () => {
      try {
        const response = await fetch('/api/booking/auto-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_type: bookingData.itemType,
            title: bookingData.title,
            provider: bookingData.provider,
            booking_url: bookingData.bookingUrl,
            price: bookingData.price,
            currency: bookingData.currency,
            dates: bookingData.dates,
            party_type: bookingData.partyType || 'Travelers'
          })
        });

        if (!response.ok) {
          throw new Error(`Agent execution failed with code ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setResult(data);
          setStepIndex(steps.length - 1);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Auto book error:', err);
          setError(err.message || 'Auto-booking automation encountered a temporary issue.');
          setIsLoading(false);
        }
      } finally {
        clearInterval(interval);
      }
    };

    runAutoBook();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, bookingData]);

  if (!isOpen || !bookingData) return null;

  const checkoutUrl = result?.cart_url || bookingData.bookingUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>Playwright Autonomous Booking Agent</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Agent
                </span>
              </h4>
              <p className="text-xs text-stone-400">
                Automated reservation & cart placement for {bookingData.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Reservation Item Summary Card */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                {bookingData.itemType.toUpperCase()} SELECTION
              </span>
              <h5 className="text-base font-bold text-stone-100">
                {bookingData.title}
              </h5>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  {bookingData.provider}
                </span>
                {bookingData.dates && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    {bookingData.dates}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                Target Rate
              </span>
              <div className="text-lg font-bold text-emerald-400">
                {bookingData.currency} {bookingData.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress / Step Timeline */}
          {isLoading && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span>Playwright browser subagent is actively executing on {bookingData.provider}...</span>
              </div>

              <div className="space-y-2.5">
                {steps.map((st, i) => {
                  const isDone = i < stepIndex;
                  const isCurrent = i === stepIndex;
                  return (
                    <div 
                      key={i}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isCurrent 
                          ? 'bg-stone-800/80 border border-stone-700' 
                          : isDone 
                            ? 'bg-stone-950/40 text-stone-400' 
                            : 'opacity-40 text-stone-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-700 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isCurrent ? 'text-stone-100' : 'text-stone-300'}`}>
                          {st.title}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success State */}
          {!isLoading && result && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="text-sm font-bold text-emerald-200">
                    Item Added to Cart on {bookingData.provider}!
                  </h6>
                  <p className="text-xs text-emerald-300/90 mt-1 leading-relaxed">
                    The Playwright agent selected the best-priced tier, satisfied all party requirements, and locked the reservation in your session cart.
                  </p>
                </div>
              </div>

              {/* Live Screenshot Proof */}
              {result.screenshot && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                    <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Live Playwright Session Capture
                    </span>
                    <button
                      onClick={() => setIsScreenshotExpanded(!isScreenshotExpanded)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      {isScreenshotExpanded ? 'Collapse' : 'Expand View'}
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-stone-800 bg-black">
                    <img
                      src={result.screenshot}
                      alt="Cart Screenshot"
                      className={`w-full object-cover transition-all cursor-pointer ${
                        isScreenshotExpanded ? 'max-h-[500px] object-contain' : 'max-h-56'
                      }`}
                      onClick={() => setIsScreenshotExpanded(!isScreenshotExpanded)}
                    />
                  </div>
                </div>
              )}

              {/* Step Logs Accordion */}
              {result.logs && result.logs.length > 0 && (
                <details className="rounded-xl bg-stone-950 border border-stone-800 p-3 text-xs text-stone-400 group">
                  <summary className="font-medium text-stone-300 cursor-pointer flex items-center justify-between select-none">
                    <span>Inspect Agent Execution Audit ({result.logs.length} steps)</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-stone-500" />
                  </summary>
                  <div className="mt-2.5 space-y-1 font-mono text-[11px] text-stone-400 pt-2 border-t border-stone-800/80 max-h-36 overflow-y-auto">
                    {result.logs.map((lg: string, idx: number) => (
                      <div key={idx} className="leading-relaxed">
                        {lg}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Error State with Fallback */}
          {!isLoading && error && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <p className="font-bold text-rose-200 mb-1">Notice during automated checkout</p>
                <p>{error}</p>
                <p className="mt-2 text-stone-400">
                  You can proceed directly with the pre-filled deep reservation link below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            Secure checkout powered by {bookingData.provider}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>Proceed to Final Payment & Confirmation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
