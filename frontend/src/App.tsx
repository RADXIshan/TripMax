import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  ArrowRight, 
  MessageSquare,
  BookmarkCheck
} from 'lucide-react';
import type { TripPlan, ChatMessage, TripPreferences, SuggestedReply, AuthUser } from './types/trip';
import { Sidebar, type NavView } from './components/Sidebar';
import { MinimalNavbar } from './components/MinimalNavbar';
import { AuthPage } from './components/AuthPage';
import { ChatStudio } from './components/ChatStudio';
import { ItineraryTab } from './components/ItineraryTab';
import { TransitTab } from './components/TransitTab';
import { StaysTab } from './components/StaysTab';
import { BudgetTab } from './components/BudgetTab';
import { BookingChecklistTab } from './components/BookingChecklistTab';
import { SavedTripsTab, type SavedTripRecord } from './components/SavedTripsTab';
import { LiveSearchModal } from './components/LiveSearchModal';
import { ResetTripModal } from './components/ResetTripModal';
import { ExportModal } from './components/ExportModal';
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
    { label: "🏛️ Rome, Florence & Amalfi Coast, Italy", value: "Rome & Amalfi Coast, Italy" },
    { label: "🥐 Paris & French Riviera, France", value: "Paris & French Riviera, France" },
    { label: "🌴 Bali & Ubud, Indonesia", value: "Bali & Ubud, Indonesia" },
    { label: "🏰 Jaipur & Udaipur, Rajasthan, India", value: "Jaipur & Udaipur, Rajasthan, India" },
    { label: "🌿 Kerala Backwaters & Munnar, India", value: "Kerala & Munnar, India" },
    { label: "🏖️ Goa & Konkan Coast, India", value: "Goa, India" },
    { label: "✏️ Other (Write your own)", value: "other", is_other: true, placeholder: "Enter destination (e.g. Barcelona, Iceland, Hawaii, Kashmir)..." }
  ]
};

const RATES_MAP: Record<string, number> = SUPPORTED_CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c.rateToUSD;
  return acc;
}, {} as Record<string, number>);

export const App = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tripmax_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('tripmax_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authSubtitleHint, setAuthSubtitleHint] = useState<string | undefined>(undefined);
  const [pendingPlanToSave, setPendingPlanToSave] = useState<TripPlan | null>(null);

  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [preferences, setPreferences] = useState<TripPreferences>({
    interests: [],
    budget_currency: 'INR',
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState('INR');

  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>(() => {
    try {
      const savedToken = localStorage.getItem('tripmax_token');
      if (!savedToken) return [];
      const stored = localStorage.getItem('tripmax_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchUserTrips = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/trips`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const dbTrips: SavedTripRecord[] = await res.json();
        setSavedTrips(dbTrips);
        try {
          localStorage.setItem('tripmax_saved_trips', JSON.stringify(dbTrips));
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to load trips from Neon database:', err);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const verifySession = async () => {
      const savedToken = localStorage.getItem('tripmax_token');
      if (!savedToken) {
        setToken(null);
        setUser(null);
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        if (res.ok) {
          const userData: AuthUser = await res.json();
          setUser(userData);
          setToken(savedToken);
          localStorage.setItem('tripmax_user', JSON.stringify(userData));
          await fetchUserTrips(savedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('tripmax_token');
          localStorage.removeItem('tripmax_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Network issue during session check:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  const handleAuthSuccess = async (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('tripmax_token', newToken);
    localStorage.setItem('tripmax_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    await fetchUserTrips(newToken);

    const tripToSave = pendingPlanToSave || plan;
    if (tripToSave) {
      await savePlanToHistory(tripToSave, newToken);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setToastMessage(`✓ "${tripToSave.destination}" saved to your account!`);
      setPendingPlanToSave(null);
    } else {
      setToastMessage(`Welcome back, ${newUser.username}!`);
    }

    setIsAuthOpen(false);
    setAuthSubtitleHint(undefined);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('tripmax_token');
    localStorage.removeItem('tripmax_user');
    localStorage.removeItem('tripmax_saved_trips');
    setToken(null);
    setUser(null);
    setPlan(null);
    setSavedTrips([]);
    setMessages([initialGreeting]);
    setCurrentView('chat');
    setToastMessage('Signed out. Continuing as Guest.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const savePlanToHistory = async (newPlan: TripPlan, explicitToken?: string) => {
    const activeToken = explicitToken || token || localStorage.getItem('tripmax_token');
    // Guest trips are never saved to All Trips until user is logged in
    if (!activeToken) {
      return;
    }

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

    setSavedTrips((prev) => {
      const filtered = prev.filter((t) => t.id !== newPlan.id && t.destination !== newPlan.destination);
      const updated = [record, ...filtered];
      try {
        localStorage.setItem('tripmax_saved_trips', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (activeToken) {
      try {
        const res = await fetch(`${API_BASE}/api/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({ plan: newPlan })
        });
        if (res.ok) {
          const savedDbRecord = await res.json();
          setSavedTrips((prev) => [
            savedDbRecord,
            ...prev.filter((t) => t.id !== savedDbRecord.id)
          ]);
        }
      } catch (err) {
        console.error('Failed to persist trip to Neon PostgreSQL:', err);
      }
    }
  };

  const handleDeleteTrip = async (id: string) => {
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

    if (token) {
      try {
        await fetch(`${API_BASE}/api/trips/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Failed to delete trip from Neon PostgreSQL:', err);
      }
    }
  };

  const handleSelectTrip = (selectedPlan: TripPlan) => {
    setPlan(selectedPlan);
    setCurrency(selectedPlan.budget.currency || 'INR');
    setPreferences({
      destination: selectedPlan.destination,
      origin: selectedPlan.origin,
      duration_days: selectedPlan.duration_days,
      budget_amount: selectedPlan.budget.target_budget || 220000,
      budget_currency: selectedPlan.budget.currency || 'INR',
      interests: ['culture & history', 'food'],
      travel_pace: 'balanced',
      party_type: 'Couple / Romantic'
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
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: authHeaders,
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
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`${API_BASE}/api/plan/generate`, {
        method: 'POST',
        headers: authHeaders,
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
        if (token && user) {
          savePlanToHistory(data);
        }
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
            content: (token && user)
              ? `Your complete, day-by-day travel architecture for ${data.destination} has been generated and saved to your cloud trips archive!\n\nUse the sidebar to explore your Itinerary, compare Flights vs Trains, view Stays, and inspect your Budget Blueprint. Ask me anytime if you wish to adjust any detail.`
              : `Your complete, day-by-day travel architecture for ${data.destination} has been generated!\n\nNote: You are currently browsing as a guest. Your trip is live across all tabs (Itinerary, Transit, Stays, Budget), but will not be saved to your All Trips archive until you create an account.\n\nAsk me anytime if you wish to adjust any detail.`,
            agent_name: "Orchestrator",
            stage: "plan_ready"
          }
        ]);
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.detail || "Unable to generate travel blueprint. Please check parameters and try again.";
        setToastMessage(`⚠️ Plan Generation Notice: ${errMsg}`);
        setTimeout(() => setToastMessage(null), 4000);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `I encountered a delay generating the plan: ${errMsg}. Please click 'Generate Plan' again to retry.`,
            agent_name: "Orchestrator"
          }
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setToastMessage("⚠️ Network error during plan generation. Please retry.");
      setTimeout(() => setToastMessage(null), 3000);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Network connection was interrupted while synchronizing agents. Please check connection and try again.",
          agent_name: "Orchestrator"
        }
      ]);
    } finally {
      setIsGeneratingPlan(false);
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
    if (!token || !user) {
      setPendingPlanToSave(targetPlan);
      setAuthSubtitleHint(`Sign in or create an account to save "${targetPlan.destination}" to your cloud account.`);
      setIsAuthOpen(true);
      return;
    }
    savePlanToHistory(targetPlan);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setToastMessage(`✓ Saved "${targetPlan.destination}" into your account!`);
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
    setIsExportModalOpen(true);
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center text-stone-100 select-none">
        <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mb-4 shadow-xl shadow-black/60">
          <Compass className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
        <div className="text-sm font-semibold tracking-wide text-stone-200">
          Connecting to TripMax...
        </div>
        <div className="text-xs text-stone-500 mt-1">
          Verifying session...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121110] text-stone-100 flex font-sans transition-colors relative">
      {/* Sleek, User-Friendly Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        plan={plan}
        savedTripsCount={savedTrips.length}
        onNewTrip={promptResetTrip}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthSubtitleHint(undefined);
          setIsAuthOpen(true);
        }}
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
          onSaveTrip={handleSaveTrip}
          isLoading={isLoading}
          isGeneratingPlan={isGeneratingPlan}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
          {currentView === 'chat' && (
            <div className="h-full w-full min-w-0 max-w-full flex flex-col lg:flex-row overflow-hidden">
              {/* Chat Studio Pane */}
              <div className="flex-1 h-full min-h-0 min-w-0 max-w-full overflow-hidden flex flex-col">
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
                        <span className="text-stone-400">Transit:</span>
                        <span className="font-semibold text-stone-200">
                          {plan.trains.length > 0 
                            ? `${plan.flights.length} flights, ${plan.trains.length} rail` 
                            : `${plan.flights.length} flights (Air Transit)`}
                        </span>
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
                currentPlan={plan}
                isLoggedIn={!!user && !!token}
                onOpenAuth={() => {
                  setAuthSubtitleHint('Sign in or create an account to view and sync your All Trips cloud archive.');
                  setIsAuthOpen(true);
                }}
                onSaveCurrentTrip={() => handleSaveTrip(plan || undefined)}
                onSelectTrip={handleSelectTrip}
                onDeleteTrip={handleDeleteTrip}
                onNewTrip={promptResetTrip}
              />
            </div>
          )}

          {currentView !== 'chat' && currentView !== 'trips' && (
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
              {plan ? (
                <>
                  {(currentView === 'itinerary' || currentView === 'sources') && <ItineraryTab plan={plan} />}
                  {currentView === 'transit' && <TransitTab plan={plan} />}
                  {currentView === 'stays' && <StaysTab plan={plan} />}
                  {currentView === 'budget' && <BudgetTab plan={plan} />}
                  {currentView === 'checklist' && <BookingChecklistTab plan={plan} />}
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
                    Begin chatting in the Discovery Studio to define and architect your trip.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600 text-stone-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Discovery Studio</span>
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
        isLoggedIn={!!user && !!token}
        onClose={() => setIsResetModalOpen(false)}
        onDeleteAndReset={handleDeleteAndReset}
        onSaveAndReset={handleSaveAndReset}
        onAuthToSave={() => {
          setIsResetModalOpen(false);
          handleSaveTrip();
        }}
      />

      {/* Export Trip Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        plan={plan}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Auth Modal Overlay */}
      {isAuthOpen && (
        <AuthPage 
          onAuthSuccess={handleAuthSuccess} 
          onClose={() => {
            setIsAuthOpen(false);
            setAuthSubtitleHint(undefined);
          }}
          subtitleHint={authSubtitleHint}
        />
      )}

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