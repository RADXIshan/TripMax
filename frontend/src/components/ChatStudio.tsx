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
  Bookmark
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    { label: "🇯🇵 Kyoto & Tokyo (6 Days)", prompt: "I want to plan a 6-day trip to Kyoto and Tokyo focusing on food and temples" },
    { label: "🇨🇭 Swiss Alps Trains (5 Days)", prompt: "5-day trip to Swiss Alps focusing on scenic rail routes and mountain hiking" },
    { label: "🇮🇹 Amalfi Coast (7 Days)", prompt: "7 days in Amalfi Coast, romantic pace with scenic coastal views and local pasta" },
    { label: "🇫🇷 Paris Arts & Cafes (4 Days)", prompt: "4 days in Paris exploring art galleries, historic streets, and charming bistros" }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-colors">
      {/* Studio Header & Preferences Pill Bar */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Trip Discovery Studio
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Conversational reasoning & requirement gathering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Trip Button */}
          {onSaveTrip && (
            <button
              onClick={onSaveTrip}
              title="Save all current trip data into All Trips archive"
              className="px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-800 hover:border-stone-600 text-stone-200 hover:text-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-400" />
              <span>Save Trip</span>
            </button>
          )}

          {/* Reset Trip Button */}
          <button
            onClick={onResetChat}
            title="Reset trip"
            className="px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-800 hover:border-stone-600 text-stone-300 hover:text-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>Reset Trip</span>
          </button>
        </div>
      </div>

      {/* Extracted Trip Profile Summary Tag Cloud */}
      {(preferences.destination || preferences.origin || preferences.budget_amount) && (
        <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-stone-400 font-medium">Locked Criteria:</span>
          {preferences.destination && (
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap">
              📍 {preferences.destination}
            </span>
          )}
          {preferences.origin && (
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap">
              🛫 From {preferences.origin}
            </span>
          )}
          {preferences.duration_days && (
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap">
              ⏱️ {preferences.duration_days} Days
            </span>
          )}
          {preferences.budget_amount && (
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap">
              💰 {preferences.budget_currency} {preferences.budget_amount.toLocaleString()}
            </span>
          )}
          {preferences.party_type && (
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap">
              👥 {preferences.party_type}
            </span>
          )}
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preset quick starters if chat has only 1 greeting */}
        {messages.length <= 1 && (
          <div className="mb-4 p-3 rounded-xl bg-stone-850/50 dark:bg-stone-800/40 border border-stone-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Destination Inspiration:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(preset.prompt)}
                  className="group text-left text-xs p-2.5 rounded-lg bg-stone-900/80 dark:bg-stone-800/70 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs"
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
              <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              {msg.role !== 'user' && msg.agent_name && (
                <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 mb-1">
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

              {/* Suggested reply chips attached to message */}
              {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {msg.suggested_replies.map((reply, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => onSelectReply(reply)}
                      disabled={isLoading || isGeneratingPlan}
                      className="text-xs px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700 hover:border-stone-600 transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <span>{reply.label}</span>
                    </button>
                  ))}
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

        {/* Generation in progress pill */}
        {isGeneratingPlan && (
          <div className="p-4 rounded-xl bg-stone-850 border border-stone-700 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-stone-300 animate-spin" />
            <div>
              <p className="text-xs font-semibold text-stone-100">
                Multi-Agent Synthesis Underway
              </p>
              <p className="text-[11px] text-stone-400">
                Web Researcher, Transit Specialist, Lodging Agent, and Itinerary Architect are synchronizing...
              </p>
            </div>
          </div>
        )}

        {/* Generate Plan Prominent CTA Banner */}
        {!isGeneratingPlan && (preferences.destination || isPlanReady) && (
          <div className="p-3.5 rounded-xl bg-stone-850/95 border border-stone-700 text-stone-100 flex items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5 text-stone-100">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>Ready to Build Trip Architecture?</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {preferences.destination ? `Destination: ${preferences.destination}` : 'Ready to synthesize complete plan'}
              </p>
            </div>
            <button
              onClick={onGeneratePlan}
              disabled={isGeneratingPlan}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              {isPlanReady ? "Regenerate Plan" : "Generate Plan"}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-800 bg-stone-900">
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
