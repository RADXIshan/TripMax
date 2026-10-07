import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  ArrowRight, 
  MessageSquare,
  FolderArchive
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
import { SettingsModal } from './components/SettingsModal';
import { LiveSearchModal } from './components/LiveSearchModal';

const API_BASE = "";

const initialGreeting: ChatMessage = {
  id: 'init-msg-1',
  role: 'assistant',
  content: "Hello! I am TripMax, your autonomous multi-agent travel planner.\n\nWhere in the world would you love to travel to?",
  agent_name: "Discovery Agent",
  stage: "discovery",
  suggested_replies: [
    { label: "Kyoto & Tokyo, Japan", value: "I want to visit Kyoto & Tokyo, Japan" },
    { label: "Swiss Alps & Zurich", value: "Planning a trip to Swiss Alps & Zurich, Switzerland" },
    { label: "Amalfi Coast, Italy", value: "Looking for a trip to the Amalfi Coast, Italy" },
    { label: "Paris, France", value: "I would love to explore Paris, France" },
    { label: "Bali, Indonesia", value: "Want to travel to Bali, Indonesia" },
  ]
};

export const App = () => {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [preferences, setPreferences] = useState<TripPreferences>({
    interests: [],
    budget_currency: 'USD',
    duration_days: 5,
    travel_pace: 'balanced',
    transport_preference: 'both'
  });
  const [currentView, setCurrentView] = useState<NavView>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveSearchOpen, setIsLiveSearchOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tripmax_theme') === 'dark';
  });

  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>(() => {
    try {
      const stored = localStorage.getItem('tripmax_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tripmax_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tripmax_theme', 'light');
    }
  }, [darkMode]);

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
          preferences: preferences
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
          preferences: currentPrefs,
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
      duration_days: 5,
      travel_pace: 'balanced',
      transport_preference: 'both'
    });
  };

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    setPreferences((prev) => ({
      ...prev,
      budget_currency: newCurr
    }));
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
    <div className="h-screen w-screen overflow-hidden bg-[#FAF9F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex font-sans transition-colors">
      {/* Sleek, User-Friendly Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        plan={plan}
        savedTripsCount={savedTrips.length}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewTrip={handleNewTrip}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Minimal Slender Navbar */}
        <MinimalNavbar
          currentView={currentView}
          plan={plan}
          onOpenLiveSearch={() => setIsLiveSearchOpen(true)}
          onExport={handleExportPlan}
          onLoadSample={loadSamplePlan}
          isLoading={isLoading}
          isGeneratingPlan={isGeneratingPlan}
        />

        {/* Viewport Canvas (fits naturally in screen) */}
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
                  onResetChat={handleNewTrip}
                  isLoading={isLoading}
                  isGeneratingPlan={isGeneratingPlan}
                  isPlanReady={!!plan}
                />
              </div>

              {/* Side Glance Pane if plan is active */}
              {plan && (
                <div className="hidden xl:flex w-96 border-l border-stone-200 dark:border-stone-800 p-5 flex-col justify-between bg-white dark:bg-stone-900/60 overflow-y-auto">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Active Plan Glance
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {plan.destination}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {plan.tagline}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                        <span className="text-stone-400">Duration:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{plan.duration_days} Days</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                        <span className="text-stone-400">Est. Total:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{plan.budget.currency} {plan.budget.total_estimated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-400">Flights / Trains:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{plan.flights.length} flights, {plan.trains.length} rail</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('itinerary')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>View Full Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                onNewTrip={handleNewTrip}
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
                /* Empty state prompting chat or sample */
                <div className="py-16 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mx-auto flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-2xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    No Trip Generated Yet
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Begin chatting in the Discovery Studio to define your trip, or load our instant sample preview.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Discovery Studio</span>
                    </button>
                    <button
                      onClick={loadSamplePlan}
                      className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer"
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiBase={API_BASE}
      />

      {/* Live Search Modal */}
      <LiveSearchModal
        isOpen={isLiveSearchOpen}
        onClose={() => setIsLiveSearchOpen(false)}
        apiBase={API_BASE}
      />
    </div>
  );
};

export default App;