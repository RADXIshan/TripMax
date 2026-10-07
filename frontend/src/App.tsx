import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  ArrowRight, 
  MessageSquare,
  BookmarkCheck
} from 'lucide-react';
import type { TripPlan, ChatMessage, TripPreferences, SuggestedReply } from './types/trip';
import { Sidebar, type NavView } from './components/Sidebar';
import { MinimalNavbar } from './components/MinimalNavbar';
import { ChatStudio } from './components/ChatStudio';
import { ItineraryTab } from './components/ItineraryTab';
import { TransitTab } from './components/TransitTab';
import { StaysTab } from './components/StaysTab';
import { BudgetTab } from './components/BudgetTab';
import { BookingChecklistTab } from './components/BookingChecklistTab';
import { ResearchSourcesTab } from './components/ResearchSourcesTab';
import { SavedTripsTab, type SavedTripRecord } from './components/SavedTripsTab';
import { LiveSearchModal } from './components/LiveSearchModal';
import { ResetTripModal } from './components/ResetTripModal';
import { SUPPORTED_CURRENCIES } from './components/CurrencyDropdown';

const API_BASE = "";

const initialGreeting: ChatMessage = {
  id: 'init-msg-1',
  role: 'assistant',
  content: "Welcome to TripMax! I am your Trip Discovery Architect. Let's design your perfect journey step-by-step.\n\nFirst, where in the world would you love to travel?",
  agent_name: "Discovery Agent",
  stage: "discovery",
  question_key: "destination",
  suggested_replies: [
    { label: "🌸 Tokyo & Kyoto, Japan", value: "Tokyo & Kyoto, Japan" },
    { label: "🏔️ Swiss Alps & Zurich, Switzerland", value: "Swiss Alps & Zurich, Switzerland" },
    { label: "🏛️ Rome & Amalfi Coast, Italy", value: "Rome & Amalfi Coast, Italy" },
    { label: "🥐 Paris & French Riviera, France", value: "Paris & French Riviera, France" },
    { label: "🌴 Bali, Indonesia", value: "Bali, Indonesia" },
    { label: "✏️ Other (Write your own)", value: "other", is_other: true, placeholder: "Enter destination (e.g. Barcelona, Iceland, Hawaii)..." }
  ]
};

const RATES_MAP: Record<string, number> = SUPPORTED_CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c.rateToUSD;
  return acc;
}, {} as Record<string, number>);

export const App = () => {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [preferences, setPreferences] = useState<TripPreferences>({
    interests: [],
    budget_currency: 'USD',
    duration_days: undefined,
    travel_pace: undefined,
    transport_preference: undefined,
    current_question_key: 'destination'
  });
  const [currentView, setCurrentView] = useState<NavView>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isLiveSearchOpen, setIsLiveSearchOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>(() => {
    try {
      const stored = localStorage.getItem('tripmax_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savePlanToHistory = (newPlan: TripPlan) => {
    setSavedTrips((prev) => {
      const filtered = prev.filter((t) => t.id !== newPlan.id && t.destination !== newPlan.destination);
      const record: SavedTripRecord = {
        id: newPlan.id,
        destination: newPlan.destination,
        origin: newPlan.origin,
        duration_days: newPlan.duration_days,
        dates: newPlan.dates,
        total_budget: newPlan.budget.total_estimated,
        currency: newPlan.budget.currency,
        tagline: newPlan.tagline,
        savedAt: new Date().toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        plan: newPlan
      };
      const updated = [record, ...filtered];
      try {
        localStorage.setItem('tripmax_saved_trips', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleDeleteTrip = (id: string) => {
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem('tripmax_saved_trips', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    if (plan?.id === id) {
      setPlan(null);
      setCurrentView('chat');
    }
  };

  const handleSelectTrip = (selectedPlan: TripPlan) => {
    setPlan(selectedPlan);
    setCurrency(selectedPlan.budget.currency || 'USD');
    setPreferences({
      destination: selectedPlan.destination,
      origin: selectedPlan.origin,
      duration_days: selectedPlan.duration_days,
      budget_amount: selectedPlan.budget.target_budget || 2800,
      budget_currency: selectedPlan.budget.currency,
      interests: ['culture & history', 'food'],
      travel_pace: 'balanced',
      party_type: 'Travelers'
    });
    setCurrentView('itinerary');
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages,
          preferences: {
            ...preferences,
            budget_currency: currency
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setPreferences(data.preferences);

        if (data.ready_for_plan) {
          await generatePlan(data.preferences, text);
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "I encountered a network issue communicating with the backend server. Please verify the server is running.",
          agent_name: "Discovery Agent"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReply = (reply: SuggestedReply) => {
    handleSendMessage(reply.value);
  };

  const generatePlan = async (currentPrefs = preferences, prompt?: string) => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch(`${API_BASE}/api/plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            ...currentPrefs,
            budget_currency: currency
          },
          user_prompt: prompt
        })
      });

      if (res.ok) {
        const data: TripPlan = await res.json();
        setPlan(data);
        savePlanToHistory(data);
        setCurrentView('itinerary');

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        setMessages((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            role: 'assistant',
            content: `Your complete, day-by-day travel architecture for ${data.destination} has been generated and saved to your trips archive!\n\nUse the sidebar to explore your Itinerary, compare Flights vs Trains, view Stays, and inspect your Budget Blueprint. Ask me anytime if you wish to adjust any detail.`,
            agent_name: "Orchestrator",
            stage: "plan_ready"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const loadSamplePlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/plan/sample`);
      if (res.ok) {
        const data: TripPlan = await res.json();
        setPlan(data);
        savePlanToHistory(data);
        setCurrentView('itinerary');
        setPreferences({
          destination: data.destination,
          origin: data.origin,
          duration_days: data.duration_days,
          budget_amount: data.budget.target_budget || 2800,
          budget_currency: data.budget.currency,
          interests: ['culture & history', 'food', 'photography & viewpoints'],
          travel_pace: 'balanced',
          party_type: 'Couple'
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `sample-${Date.now()}`,
            role: 'assistant',
            content: `Loaded sample 5-day curated journey for ${data.destination}! You can inspect the itinerary on the dashboard or tell me any adjustments you would like to make.`,
            agent_name: "Discovery Agent",
            stage: "plan_ready"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTrip = () => {
    setPlan(null);
    setCurrentView('chat');
    setMessages([initialGreeting]);
    setPreferences({
      interests: [],
      budget_currency: currency,
      duration_days: undefined,
      travel_pace: undefined,
      transport_preference: undefined,
      current_question_key: 'destination'
    });
  };

  const buildDraftPlan = (): TripPlan => {
    const destination = preferences.destination || (messages.length > 1 ? messages.find(m => m.role === 'user')?.content.slice(0, 30) : 'Custom Adventure') || 'Custom Adventure';
    return {
      id: `draft-trip-${Date.now()}`,
      destination: destination,
      origin: preferences.origin || 'Home',
      dates: preferences.dates || 'Upcoming Travel',
      duration_days: preferences.duration_days || 5,
      tagline: `Custom trip exploration for ${destination}`,
      overview: messages[messages.length - 1]?.content || `Trip discovery created for ${destination}`,
      best_time_to_visit: 'Year-round',
      local_transport_pass_tip: 'Check local travel cards upon arrival',
      budget: {
        total_estimated: preferences.budget_amount || 2500,
        currency: currency,
        target_budget: preferences.budget_amount || 2500,
        budget_status: 'within_budget',
        transit_cost: 0,
        stay_cost: 0,
        activities_cost: 0,
        food_dining_cost: 0,
        buffer_local_transit_cost: 0,
        insights: ['Initial exploratory draft saved from Discovery Studio']
      },
      flights: [],
      trains: [],
      stays: [],
      itinerary: [],
      checklist: [
        { id: 'chk-1', task: `Confirm travel dates for ${destination}`, category: 'prep', timeline: '2 weeks before', completed: false }
      ],
      packing_list: [],
      research_sources: [],
      agent_logs: ['Draft journey preserved in All Trips archive']
    };
  };

  const handleSaveTrip = (customPlan?: TripPlan) => {
    const targetPlan = customPlan || plan || buildDraftPlan();
    savePlanToHistory(targetPlan);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setToastMessage(`✓ Saved "${targetPlan.destination}" into All Trips!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isChatOngoing = () => {
    const hasUserMessages = messages.some((m) => m.role === 'user');
    const hasUnsavedPlan = plan !== null && !savedTrips.some((t) => t.id === plan.id);
    return hasUserMessages || hasUnsavedPlan;
  };

  const promptResetTrip = () => {
    if (isChatOngoing()) {
      setIsResetModalOpen(true);
    } else {
      // If no chat is going on, cleanly reset and arrive at the discovery page
      handleNewTrip();
    }
  };

  const handleDeleteAndReset = () => {
    handleNewTrip();
    setIsResetModalOpen(false);
    setToastMessage('Current trip discarded. Ready to plan a new trip.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveAndReset = () => {
    handleSaveTrip();
    handleNewTrip();
    setIsResetModalOpen(false);
  };

  const handleCurrencyChange = (newCurr: string) => {
    const oldCurr = currency;
    setCurrency(newCurr);
    setPreferences((prev) => ({
      ...prev,
      budget_currency: newCurr
    }));

    // If an active plan is already displayed, dynamically convert all prices
    if (plan && oldCurr !== newCurr) {
      const oldRate = RATES_MAP[oldCurr] || 1.0;
      const newRate = RATES_MAP[newCurr] || 1.0;
      const ratio = newRate / oldRate;

      setPlan((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          budget: {
            ...prev.budget,
            currency: newCurr,
            total_estimated: Math.round(prev.budget.total_estimated * ratio),
            target_budget: prev.budget.target_budget ? Math.round(prev.budget.target_budget * ratio) : undefined,
            stay_cost: Math.round(prev.budget.stay_cost * ratio),
            transit_cost: Math.round(prev.budget.transit_cost * ratio),
            food_dining_cost: Math.round(prev.budget.food_dining_cost * ratio),
            activities_cost: Math.round(prev.budget.activities_cost * ratio),
            buffer_local_transit_cost: Math.round(prev.budget.buffer_local_transit_cost * ratio),
          },
          flights: prev.flights.map((f) => ({
            ...f,
            currency: newCurr,
            estimated_price: Math.round(f.estimated_price * ratio)
          })),
          trains: prev.trains.map((t) => ({
            ...t,
            currency: newCurr,
            estimated_price: Math.round(t.estimated_price * ratio)
          })),
          stays: prev.stays.map((s) => ({
            ...s,
            currency: newCurr,
            price_per_night: Math.round(s.price_per_night * ratio),
            total_price: Math.round(s.total_price * ratio)
          })),
          itinerary: prev.itinerary.map((day) => ({
            ...day,
            morning: {
              ...day.morning,
              estimated_cost: Math.round(day.morning.estimated_cost * ratio)
            },
            afternoon: {
              ...day.afternoon,
              estimated_cost: Math.round(day.afternoon.estimated_cost * ratio)
            },
            evening: {
              ...day.evening,
              estimated_cost: Math.round(day.evening.estimated_cost * ratio)
            }
          }))
        };
      });
    }
  };

  const handleExportPlan = () => {
    if (!plan) return;
    const content = `# TripMax Travel Plan: ${plan.destination}
Origin: ${plan.origin}
Duration: ${plan.duration_days} Days
Dates: ${plan.dates}
Projected Budget: ${plan.budget.currency} ${plan.budget.total_estimated}

## Overview
${plan.overview}

## Transit Options
### Flights
${plan.flights.map((f) => `• ${f.airline} (${f.departure} to ${f.arrival}): ${f.currency} ${f.estimated_price} [Book: ${f.booking_url}]`).join('\n')}

### Trains
${plan.trains.map((t) => `• ${t.train_name} (${t.operator}): ${t.currency} ${t.estimated_price} [Book: ${t.booking_url}]`).join('\n')}

## Curated Stays
${plan.stays.map((s) => `• ${s.name} (${s.neighborhood}): ${s.currency} ${s.price_per_night}/night [Book: ${s.booking_url}]`).join('\n')}

## Day-by-Day Schedule
${plan.itinerary.map((d) => `### Day ${d.day}: ${d.title}
• Morning: ${d.morning.title} (${d.morning.location})
• Afternoon: ${d.afternoon.title} (${d.afternoon.location})
• Evening: ${d.evening.title} (${d.evening.location})
• Lunch: ${d.lunch_recommendation.place} (Dish: ${d.lunch_recommendation.dish})
• Dinner: ${d.dinner_recommendation.place} (Dish: ${d.dinner_recommendation.dish})
• Transit Tip: ${d.transit_tips}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TripMax-${plan.destination.replace(/[^a-zA-Z0-9]/g, '_')}-Plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121110] text-stone-100 flex font-sans transition-colors">
      {/* Sleek, User-Friendly Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        plan={plan}
        savedTripsCount={savedTrips.length}
        onNewTrip={promptResetTrip}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Minimal Slender Navbar */}
        <MinimalNavbar
          currentView={currentView}
          plan={plan}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onExport={handleExportPlan}
          onLoadSample={loadSamplePlan}
          onSaveTrip={handleSaveTrip}
          isLoading={isLoading}
          isGeneratingPlan={isGeneratingPlan}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {currentView === 'chat' && (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Chat Studio Pane */}
              <div className="flex-1 h-full min-h-0">
                <ChatStudio
                  messages={messages}
                  preferences={preferences}
                  onSendMessage={handleSendMessage}
                  onSelectReply={handleSelectReply}
                  onGeneratePlan={() => generatePlan()}
                  onResetChat={promptResetTrip}
                  onSaveTrip={handleSaveTrip}
                  isLoading={isLoading}
                  isGeneratingPlan={isGeneratingPlan}
                  isPlanReady={!!plan}
                />
              </div>

              {/* Side Glance Pane if plan is active */}
              {plan && (
                <div className="hidden xl:flex w-96 border-l border-stone-800 p-5 flex-col justify-between bg-stone-900/60 overflow-y-auto">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Active Plan Glance
                    </span>
                    <h3 className="text-base font-bold text-stone-100">
                      {plan.destination}
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {plan.tagline}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-800 text-xs">
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Duration:</span>
                        <span className="font-semibold text-stone-200">{plan.duration_days} Days</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Est. Total:</span>
                        <span className="font-semibold text-stone-200">{plan.budget.currency} {plan.budget.total_estimated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-400">Flights / Trains:</span>
                        <span className="font-semibold text-stone-200">{plan.flights.length} flights, {plan.trains.length} rail</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('itinerary')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow"
                  >
                    <span>View Full Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-900" />
                  </button>
                </div>
              )}
            </div>
          )}

          {currentView === 'trips' && (
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
              <SavedTripsTab
                savedTrips={savedTrips}
                currentTripId={plan?.id || null}
                onSelectTrip={handleSelectTrip}
                onDeleteTrip={handleDeleteTrip}
                onNewTrip={promptResetTrip}
                onLoadPreset={() => loadSamplePlan()}
              />
            </div>
          )}

          {currentView !== 'chat' && currentView !== 'trips' && (
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
              {plan ? (
                <>
                  {currentView === 'itinerary' && <ItineraryTab plan={plan} />}
                  {currentView === 'transit' && <TransitTab plan={plan} />}
                  {currentView === 'stays' && <StaysTab plan={plan} />}
                  {currentView === 'budget' && <BudgetTab plan={plan} />}
                  {currentView === 'checklist' && <BookingChecklistTab plan={plan} />}
                  {currentView === 'sources' && (
                    <ResearchSourcesTab
                      sources={plan.research_sources}
                      destination={plan.destination}
                    />
                  )}
                </>
              ) : (
                <div className="py-16 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-850 border border-stone-700 mx-auto flex items-center justify-center text-stone-300 shadow-2xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-100">
                    No Trip Generated Yet
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Begin chatting in the Discovery Studio to define your trip, or load our instant sample preview.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600 text-stone-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Discovery Studio</span>
                    </button>
                    <button
                      onClick={loadSamplePlan}
                      className="px-4 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                    >
                      Load Sample Preview
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Live Search Modal */}
      <LiveSearchModal
        isOpen={isLiveSearchOpen}
        onClose={() => setIsLiveSearchOpen(false)}
        apiBase={API_BASE}
      />

      {/* Reset Trip Modal */}
      <ResetTripModal
        isOpen={isResetModalOpen}
        destinationName={plan?.destination || preferences.destination}
        onClose={() => setIsResetModalOpen(false)}
        onDeleteAndReset={handleDeleteAndReset}
        onSaveAndReset={handleSaveAndReset}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;