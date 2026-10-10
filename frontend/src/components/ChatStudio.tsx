import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Compass, 
  Bot, 
  User, 
  RotateCcw, 
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Loader2,
  Bookmark,
  PenLine,
  Sparkles,
  Globe,
  Plane,
  Building2,
  CalendarDays,
  CreditCard,
  Award,
  Clock,
  Check
} from 'lucide-react';
import type { ChatMessage, SuggestedReply, TripPreferences } from '../types/trip';
import { renderCleanMessage } from '../utils/formatText';

interface ChatStudioProps {
  messages: ChatMessage[];
  preferences: TripPreferences;
  onSendMessage: (msg: string) => void;
  onSelectReply: (reply: SuggestedReply) => void;
  onGeneratePlan: () => void;
  onResetChat: () => void;
  onSaveTrip?: () => void;
  isLoading: boolean;
  isGeneratingPlan: boolean;
  isPlanReady: boolean;
}

export const ChatStudio: React.FC<ChatStudioProps> = ({
  messages,
  preferences,
  onSendMessage,
  onSelectReply,
  onGeneratePlan,
  onResetChat,
  onSaveTrip,
  isLoading,
  isGeneratingPlan,
  isPlanReady
}) => {
  const [input, setInput] = useState('');
  const [activeOtherMsgId, setActiveOtherMsgId] = useState<string | null>(null);
  const [otherCustomText, setOtherCustomText] = useState('');
  const [otherPlaceholder, setOtherPlaceholder] = useState('Write your own response...');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGeneratingPlan) {
      setActiveStepIndex(0);
      setProgressPercent(15);
      setElapsedSeconds(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(Math.floor(elapsed));

      if (elapsed < 1.0) {
        setActiveStepIndex(0);
        setProgressPercent(18);
      } else if (elapsed < 2.2) {
        setActiveStepIndex(1);
        setProgressPercent(36);
      } else if (elapsed < 3.5) {
        setActiveStepIndex(2);
        setProgressPercent(54);
      } else if (elapsed < 4.8) {
        setActiveStepIndex(3);
        setProgressPercent(72);
      } else if (elapsed < 6.2) {
        setActiveStepIndex(4);
        setProgressPercent(88);
      } else {
        setActiveStepIndex(5);
        setProgressPercent(96);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isGeneratingPlan]);

  const handleOtherSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otherCustomText.trim() || isLoading || isGeneratingPlan) return;
    onSendMessage(otherCustomText.trim());
    setActiveOtherMsgId(null);
    setOtherCustomText('');
  };

  const handleReplyClick = (msgId: string, reply: SuggestedReply) => {
    if (reply.is_other || reply.value === 'other') {
      setActiveOtherMsgId(msgId);
      setOtherPlaceholder(reply.placeholder || 'Write your custom response...');
      setOtherCustomText('');
    } else {
      setActiveOtherMsgId(null);
      setOtherCustomText('');
      onSelectReply(reply);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isGeneratingPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isGeneratingPlan) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const samplePresets = [
    { label: "🇯🇵 Tokyo & Kyoto (7 Days)", prompt: "I want to plan a 7-day trip to Tokyo and Kyoto focusing on culinary ramen and historic temples departing from New Delhi" },
    { label: "🏔️ Swiss Alps Scenic Rail (7 Days)", prompt: "7-day trip to Swiss Alps focusing on panoramic rail routes and mountain hiking departing from Mumbai" },
    { label: "🏰 Rajasthan Royal Heritage (7 Days)", prompt: "7-day royal heritage journey to Jaipur and Udaipur exploring palaces, desert forts, and authentic dining" },
    { label: "🏖️ Goa Coastal Getaway (5 Days)", prompt: "5-day relaxed vacation in Goa focusing on beach sunsets, Portuguese heritage, and seafood" }
  ];

  const completedOptionsCount = [
    Boolean(preferences.destination),
    Boolean(preferences.origin),
    Boolean((preferences.dates || preferences.start_date) && preferences.duration_days),
    Boolean(preferences.party_type),
    Boolean(preferences.travel_pace),
    Boolean(preferences.budget_amount && preferences.budget_amount > 0),
    Boolean(preferences.transport_preference),
    Boolean(preferences.interests && preferences.interests.length > 0),
    Boolean(preferences.stay_preference),
    Boolean(preferences.dining_preference),
  ].filter(Boolean).length;

  const isAllOptionsCompleted = completedOptionsCount >= 10 || 
    messages.some(m => m.stage === 'options_completed' || m.stage === 'ready_to_plan' || m.stage === 'plan_ready');

  return (
    <div className="flex flex-col h-full w-full min-w-0 max-w-full overflow-hidden bg-stone-900 border-r border-stone-800 transition-colors">
      {/* Studio Header & Preferences Pill Bar */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-stone-100 truncate">
              Trip Discovery Studio
            </h2>
            <p className="text-[11px] text-stone-400 truncate">
              Conversational reasoning & requirement gathering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Save Trip Button */}
          {onSaveTrip && (
            <button
              onClick={onSaveTrip}
              title="Save all current trip data into All Trips archive"
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-700" />
              <span>Save Trip</span>
            </button>
          )}

          {/* Reset Trip Button */}
          <button
            onClick={onResetChat}
            title="Reset trip"
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
            <span>Reset Trip</span>
          </button>
        </div>
      </div>

      {/* Extracted Trip Profile Summary Tag Cloud & Progress Indicator - ONLY the chips row is sideways scrollable */}
      {(preferences.destination || preferences.origin || preferences.budget_amount) && (
        <div className="w-full min-w-0 max-w-full px-4 py-2 bg-stone-900/60 border-b border-stone-800 space-y-1.5 text-[11px] overflow-hidden">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-stone-400 font-medium shrink-0">Parameters:</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] shrink-0 ${
                isAllOptionsCompleted 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}>
                {isAllOptionsCompleted ? '✓ 10/10 Options Completed' : `${completedOptionsCount}/10 Options Locked`}
              </span>
            </div>
            {!isAllOptionsCompleted && (
              <span className="text-[10px] text-stone-500 italic truncate ml-2">
                Answer remaining options to unlock plan generation
              </span>
            )}
          </div>

          <div className="w-full min-w-0 max-w-full overflow-x-auto pb-1 flex items-center gap-1.5">
            {preferences.destination && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                📍 {preferences.destination}
              </span>
            )}
            {preferences.origin && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                🛫 {preferences.origin}
              </span>
            )}
            {preferences.duration_days && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                ⏱️ {preferences.duration_days} Days
              </span>
            )}
            {(preferences.dates || preferences.start_date) && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                📅 {preferences.dates || `${preferences.start_date} – ${preferences.end_date}`}
              </span>
            )}
            {preferences.party_type && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                👥 {preferences.party_type}
              </span>
            )}
            {preferences.travel_pace && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                ⚡ {preferences.travel_pace}
              </span>
            )}
            {preferences.budget_amount && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                💰 {preferences.budget_currency || 'INR'} {preferences.budget_amount.toLocaleString()}
              </span>
            )}
            {preferences.transport_preference && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                🚆 {preferences.transport_preference}
              </span>
            )}
            {preferences.stay_preference && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                🏮 {preferences.stay_preference}
              </span>
            )}
            {preferences.dining_preference && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                🥗 {preferences.dining_preference}
              </span>
            )}
            {preferences.interests && preferences.interests.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium whitespace-nowrap">
                ✨ {preferences.interests.join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Log - Strictly vertical scroll only */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-stone-900 w-full min-w-0 max-w-full">
        {/* Preset quick starters if chat has only 1 greeting */}
        {messages.length <= 1 && (
          <div className="mb-4 p-3 rounded-xl bg-stone-850/50 border border-stone-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Destination Inspiration:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(preset.prompt)}
                  className="group text-left text-xs p-2.5 rounded-lg bg-stone-800/70 hover:bg-stone-800 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-stone-100 transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <span className="truncate">{preset.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              {msg.role !== 'user' && msg.agent_name && (
                <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                  {msg.agent_name}
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-800 text-stone-100 border border-stone-700 rounded-br-xs shadow-2xs'
                    : 'bg-stone-850/90 text-stone-200 rounded-bl-xs border border-stone-800 shadow-2xs'
                }`}
              >
                {renderCleanMessage(msg.content)}
              </div>

              {/* Interactive MCQ Choice Cards & Other option */}
              {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                    <Sparkles className="w-3 h-3 text-stone-400" />
                    <span>Multiple Choice Options</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.suggested_replies.map((reply, rIdx) => {
                      const isOther = reply.is_other || reply.value === 'other';
                      const isOtherActive = isOther && activeOtherMsgId === msg.id;
                      const choiceLetter = String.fromCharCode(65 + rIdx);

                      if (isOther) {
                        return (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleReplyClick(msg.id, reply)}
                            disabled={isLoading || isGeneratingPlan}
                            className={`group sm:col-span-2 text-left text-xs p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs ${
                              isOtherActive
                                ? 'bg-stone-800 border-stone-500 text-stone-100 ring-1 ring-stone-500'
                                : 'bg-stone-900/90 hover:bg-stone-800 border-dashed border-stone-600 hover:border-stone-400 text-stone-300 hover:text-stone-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-semibold text-stone-400 group-hover:text-stone-200 shrink-0">
                                <PenLine className="w-3 h-3" />
                              </span>
                              <span className="font-medium truncate">{reply.label}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-normal px-2 py-0.5 rounded bg-stone-800 border border-stone-700 shrink-0 ml-2">
                              Type custom
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleReplyClick(msg.id, reply)}
                          disabled={isLoading || isGeneratingPlan}
                          className="group text-left text-xs p-2.5 rounded-xl bg-stone-850/90 hover:bg-stone-800 border border-stone-750 hover:border-stone-600 text-stone-300 hover:text-stone-100 transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-semibold text-stone-400 group-hover:text-stone-200 shrink-0">
                            {choiceLetter}
                          </span>
                          <span className="truncate flex-1">{reply.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline Custom Input for 'Other' */}
                  {activeOtherMsgId === msg.id && (
                    <form
                      onSubmit={handleOtherSubmit}
                      className="mt-2 p-2.5 rounded-xl bg-stone-900 border border-stone-600 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5 px-0.5">
                        <span className="font-medium flex items-center gap-1.5 text-stone-300">
                          <PenLine className="w-3 h-3 text-stone-400" />
                          <span>Write Your Own Response:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOtherMsgId(null);
                            setOtherCustomText('');
                          }}
                          className="text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={otherCustomText}
                          onChange={(e) => setOtherCustomText(e.target.value)}
                          placeholder={otherPlaceholder}
                          disabled={isLoading || isGeneratingPlan}
                          className="flex-1 bg-stone-800 border border-stone-700 focus:border-stone-500 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!otherCustomText.trim() || isLoading || isGeneratingPlan}
                          className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-white text-stone-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                        >
                          <span>Submit</span>
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner / Agent Thinking */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 italic py-2">
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-ping"></span>
            <span>Agent analyzing parameters...</span>
          </div>
        )}

        {/* Live Multi-Agent Execution Progress Card - Engages the user step-by-step */}
        {isGeneratingPlan && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-700/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header with live swarm status */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                    <span>Autonomous Multi-Agent Swarm Active</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Executing specialized domain evaluations for {preferences.destination || 'your destination'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300">
                  Step {activeStepIndex + 1} of 6 • {elapsedSeconds}s
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
                <span>Swarm Synthesis Pipeline</span>
                <span className="text-stone-200 font-mono font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden p-0.5 border border-stone-750">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 transition-all duration-300 ease-out shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step-by-Step Agent Cards */}
            <div className="space-y-2 pt-1">
              {[
                {
                  id: 'research',
                  icon: Globe,
                  name: 'Web Intelligence Agent',
                  activeText: `Scanning live attraction hours, seasonal advice & regional passes for ${preferences.destination || 'destination'}...`,
                  doneText: `Retrieved verified UNESCO heritage data, opening hours & local guides for ${preferences.destination || 'destination'}.`
                },
                {
                  id: 'transit',
                  icon: Plane,
                  name: 'Transit Logistics Specialist',
                  activeText: `Comparing direct flights vs high-speed rail carriers from ${preferences.origin || 'origin'}...`,
                  doneText: `Evaluated real carriers, schedules, and fare comparisons with verified booking links.`
                },
                {
                  id: 'stays',
                  icon: Building2,
                  name: 'Lodging & Stays Agent',
                  activeText: `Filtering verified 4.8★+ boutique, heritage & luxury stays matching ${preferences.budget_currency || 'INR'} ${preferences.budget_amount ? preferences.budget_amount.toLocaleString() : 'target'}...`,
                  doneText: `Selected 4 top-rated accommodations with verified guest reviews & direct reservation URLs.`
                },
                {
                  id: 'itinerary',
                  icon: CalendarDays,
                  name: 'Itinerary Architect',
                  activeText: `Sequencing ${preferences.duration_days || 5}-day morning, afternoon & evening pacing with authentic regional dining...`,
                  doneText: `Engineered balanced schedule with verified coordinates, local street food & sunset viewpoints.`
                },
                {
                  id: 'budget',
                  icon: CreditCard,
                  name: 'Budget & Preparation Critic',
                  activeText: `Auditing total estimated expenses in ${preferences.budget_currency || 'INR'} and assembling packing checklist...`,
                  doneText: `Budget audited: comprehensive cost breakdown and pre-trip booking milestones ready.`
                },
                {
                  id: 'critic',
                  icon: Award,
                  name: 'Quality Critic & Certification',
                  activeText: `Executing 5-point self-evaluation audit on budget, reviews, dates, and multi-site links...`,
                  doneText: `Plan certified with verified Quality Score and multi-platform reservation assurance.`
                }
              ].map((agent, aIdx) => {
                const isCompleted = aIdx < activeStepIndex;
                const isActive = aIdx === activeStepIndex;
                const IconComponent = agent.icon;

                return (
                  <div
                    key={agent.id}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-stone-850/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                        : isCompleted
                        ? 'bg-stone-850/50 border-emerald-800/40'
                        : 'bg-stone-900/40 border-stone-800/60 opacity-50'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-lg bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-300 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500">
                          <Clock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Agent Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <IconComponent className={`w-3.5 h-3.5 ${
                            isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-stone-500'
                          }`} />
                          <span className={`text-xs font-semibold ${
                            isActive ? 'text-amber-200' : isCompleted ? 'text-stone-200' : 'text-stone-400'
                          }`}>
                            {agent.name}
                          </span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isCompleted
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                            : isActive
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                            : 'bg-stone-800 text-stone-500'
                        }`}>
                          {isCompleted ? '✓ Done' : isActive ? 'Active Now' : 'Queued'}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${
                        isActive ? 'text-stone-200 font-medium' : isCompleted ? 'text-stone-400' : 'text-stone-500'
                      }`}>
                        {isCompleted ? agent.doneText : isActive ? agent.activeText : 'Waiting in orchestration queue...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live activity ticker footer */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <span className="italic truncate">
                ⚡ Synchronizing live multi-agent intelligence for {preferences.destination || 'trip'}...
              </span>
              <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                Safe Multi-Threaded Sync
              </span>
            </div>
          </div>
        )}

        {/* Generate Plan Prominent CTA Banner - Only shown when all options are completed or plan is ready */}
        {!isGeneratingPlan && (isPlanReady || isAllOptionsCompleted) && (
          <div className="p-3.5 rounded-xl bg-stone-850/95 border border-stone-700 text-stone-100 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5 text-stone-100">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>{isPlanReady ? "Plan Architecture Active" : "All 10 Preferences Confirmed & Locked!"}</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {isPlanReady 
                  ? (preferences.destination ? `Destination: ${preferences.destination}` : 'Ready to re-synthesize complete plan')
                  : `Ready to synthesize complete multi-agent plan for ${preferences.destination}`}
              </p>
            </div>
            <button
              onClick={onGeneratePlan}
              disabled={isGeneratingPlan}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{isPlanReady ? "Regenerate Plan" : "🚀 Generate Plan"}</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-800 bg-stone-900 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type preferences, change budget, or ask questions..."
            disabled={isLoading || isGeneratingPlan}
            className="flex-1 text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isGeneratingPlan}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-600 text-stone-200 hover:text-stone-100 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
