import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CalendarDays, 
  Plane, 
  Building, 
  CreditCard, 
  CheckSquare, 
  Globe, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { TripPlan, ChatMessage, TripPreferences, SuggestedReply } from './types/trip';
import { Header } from './components/Header';
import { AgentReasoningBar } from './components/AgentReasoningBar';
import { ChatStudio } from './components/ChatStudio';
import { ItineraryTab } from './components/ItineraryTab';
import { TransitTab } from './components/TransitTab';
import { StaysTab } from './components/StaysTab';
import { BudgetTab } from './components/BudgetTab';
import { BookingChecklistTab } from './components/BookingChecklistTab';
import { ResearchSourcesTab } from './components/ResearchSourcesTab';
import { SettingsModal } from './components/SettingsModal';
import { LiveSearchModal } from './components/LiveSearchModal';

const API_BASE = "";

const initialGreeting: ChatMessage = {
  id: 'init-msg-1',
  role: 'assistant',
  content: "Hello! I am **TripMax**, your autonomous multi-agent travel planner.\n\nWhere in the world would you love to travel to?",
  agent_name: "Discovery Agent",
  stage: "discovery",
  suggested_replies: [
    { label: "🇯🇵 Kyoto & Tokyo, Japan", value: "I want to visit Kyoto & Tokyo, Japan" },
    { label: "🇨🇭 Swiss Alps & Zurich", value: "Planning a trip to Swiss Alps & Zurich, Switzerland" },
    { label: "🇮🇹 Amalfi Coast, Italy", value: "Looking for a trip to the Amalfi Coast, Italy" },
    { label: "🇫🇷 Paris, France", value: "I'd love to explore Paris, France" },
    { label: "🇮🇩 Bali, Indonesia", value: "Want to travel to Bali, Indonesia" },
  ]
};

export const App: React.FC = () => {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [preferences, setPreferences] = useState<TripPreferences>({
    interests: [],
    budget_currency: 'USD',
    duration_days: 5,
    travel_pace: 'balanced',
    transport_preference: 'both'
  });
  const [activeTab, setActiveTab] = useState<'itinerary' | 'transit' | 'stays' | 'budget' | 'checklist' | 'sources'>('itinerary');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveSearchOpen, setIsLiveSearchOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tripmax_theme') === 'dark';
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

        // If user explicitly prompted plan creation or answered the final step
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
          content: "I encountered a network connection issue reaching the backend service. Please ensure the backend is running.",
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
        setActiveTab('itinerary');

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        // Add confirmation message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            role: 'assistant',
            content: `🎉 Your complete, day-by-day travel architecture for **${data.destination}** is generated!\n\nReview your **Itinerary**, compare **Flights vs Trains**, browse handpicked **Accommodations**, and inspect your **Budget Blueprint** on the right. You can refine anything anytime by chatting with me.`,
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
            content: `Loaded sample 5-day curated journey for **${data.destination}**! Feel free to ask questions or customize any day.`,
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

  const handleResetChat = () => {
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
**Origin**: ${plan.origin}
**Duration**: ${plan.duration_days} Days
**Dates**: ${plan.dates}
**Projected Budget**: ${plan.budget.currency} ${plan.budget.total_estimated}

## Overview
${plan.overview}

## Transit Options
### Flights
${plan.flights.map((f) => `- ${f.airline} (${f.departure} to ${f.arrival}): ${f.currency} ${f.estimated_price} [Book: ${f.booking_url}]`).join('\n')}

### Trains
${plan.trains.map((t) => `- ${t.train_name} (${t.operator}): ${t.currency} ${t.estimated_price} [Book: ${t.booking_url}]`).join('\n')}

## Curated Stays
${plan.stays.map((s) => `- ${s.name} (${s.neighborhood}): ${s.currency} ${s.price_per_night}/night [Book: ${s.booking_url}]`).join('\n')}

## Day-by-Day Schedule
${plan.itinerary.map((d) => `### Day ${d.day}: ${d.title}
- **Morning**: ${d.morning.title} (${d.morning.location})
- **Afternoon**: ${d.afternoon.title} (${d.afternoon.location})
- **Evening**: ${d.evening.title} (${d.evening.location})
- **Lunch**: ${d.lunch_recommendation.place} (Dish: ${d.lunch_recommendation.dish})
- **Dinner**: ${d.dinner_recommendation.place} (Dish: ${d.dinner_recommendation.dish})
- **Transit Tip**: ${d.transit_tips}
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
    <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        plan={plan}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLiveSearch={() => setIsLiveSearchOpen(true)}
        onExport={handleExportPlan}
        onLoadSample={loadSamplePlan}
        isLoading={isLoading}
      />

      {/* Multi-Agent Reasoning Bar */}
      <AgentReasoningBar
        logs={plan?.agent_logs || []}
        isGenerating={isGeneratingPlan}
      />

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left Side: Conversational Studio (5 cols on lg) */}
        <section className="lg:col-span-5 h-[calc(100vh-6.5rem)] flex flex-col">
          <ChatStudio
            messages={messages}
            preferences={preferences}
            onSendMessage={handleSendMessage}
            onSelectReply={handleSelectReply}
            onGeneratePlan={() => generatePlan()}
            onResetChat={handleResetChat}
            isLoading={isLoading}
            isGeneratingPlan={isGeneratingPlan}
            isPlanReady={!!plan}
          />
        </section>

        {/* Right Side: Live Trip Canvas & Tabs (7 cols on lg) */}
        <section className="lg:col-span-7 h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/40">
          {plan ? (
            <div className="flex flex-col h-full">
              {/* Navigation Tabs Bar */}
              <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'itinerary'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Itinerary ({plan.itinerary.length} Days)</span>
                </button>

                <button
                  onClick={() => setActiveTab('transit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'transit'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flights vs Trains</span>
                </button>

                <button
                  onClick={() => setActiveTab('stays')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'stays'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Stays & Lodging</span>
                </button>

                <button
                  onClick={() => setActiveTab('budget')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'budget'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Budget Breakdown</span>
                </button>

                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'checklist'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Booking & Packing</span>
                </button>

                <button
                  onClick={() => setActiveTab('sources')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'sources'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Web Sources ({plan.research_sources.length})</span>
                </button>
              </div>

              {/* Tab Content Canvas with Smooth Scroll */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {activeTab === 'itinerary' && <ItineraryTab plan={plan} />}
                {activeTab === 'transit' && <TransitTab plan={plan} />}
                {activeTab === 'stays' && <StaysTab plan={plan} />}
                {activeTab === 'budget' && <BudgetTab plan={plan} />}
                {activeTab === 'checklist' && <BookingChecklistTab plan={plan} />}
                {activeTab === 'sources' && (
                  <ResearchSourcesTab
                    sources={plan.research_sources}
                    destination={plan.destination}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Empty State Placeholder with Rich Guidance */
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center text-stone-700 dark:text-stone-300 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Your Interactive Travel Dashboard
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Answer the quick questions in the Discovery Studio on the left, or click <strong>Sample Trip</strong> in the header to load a live 5-day itinerary instantly.
              </p>

              <div className="mt-6 flex flex-col w-full gap-2 text-left">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    1. Discovery & Clarification
                  </span>
                  <span className="text-stone-500">
                    Agent asks progressive questions on origin, budget, travel party, and pace.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    2. Web Search & Multi-Agent Synthesis
                  </span>
                  <span className="text-stone-500">
                    Live research retrieves top attractions, high-speed rail routes, and authentic food.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    3. Deep Booking Links & Budgeting
                  </span>
                  <span className="text-stone-500">
                    Direct 1-click links to Google Flights, Trainline, Booking.com, and attraction portals.
                  </span>
                </div>
              </div>

              <button
                onClick={loadSamplePlan}
                disabled={isLoading}
                className="mt-6 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>Load Live Sample Preview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
      </main>

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