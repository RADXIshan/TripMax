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
  Sparkles
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    { label: "🇯🇵 Kyoto & Tokyo (6 Days)", prompt: "I want to plan a 6-day trip to Kyoto and Tokyo focusing on food and temples" },
    { label: "🇨🇭 Swiss Alps Trains (5 Days)", prompt: "5-day trip to Swiss Alps focusing on scenic rail routes and mountain hiking" },
    { label: "🇮🇹 Amalfi Coast (7 Days)", prompt: "7 days in Amalfi Coast, romantic pace with scenic coastal views and local pasta" },
    { label: "🇫🇷 Paris Arts & Cafes (4 Days)", prompt: "4 days in Paris exploring art galleries, historic streets, and charming bistros" }
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50 border-r border-stone-200 text-stone-900 transition-colors">
      {/* Studio Header & Preferences Pill Bar */}
      <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Trip Discovery Studio
            </h2>
            <p className="text-[11px] text-stone-500">
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
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-600" />
              <span>Save Trip</span>
            </button>
          )}

          {/* Reset Trip Button */}
          <button
            onClick={onResetChat}
            title="Reset trip"
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Reset Trip</span>
          </button>
        </div>
      </div>

      {/* Extracted Trip Profile Summary Tag Cloud */}
      {(preferences.destination || preferences.origin || preferences.budget_amount) && (
        <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-stone-500 font-medium">Locked Criteria:</span>
          {preferences.destination && (
            <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200/80 text-stone-800 font-medium whitespace-nowrap shadow-2xs">
              📍 {preferences.destination}
            </span>
          )}
          {preferences.origin && (
            <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200/80 text-stone-800 font-medium whitespace-nowrap shadow-2xs">
              🛫 From {preferences.origin}
            </span>
          )}
          {preferences.duration_days && (
            <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200/80 text-stone-800 font-medium whitespace-nowrap shadow-2xs">
              ⏱️ {preferences.duration_days} Days
            </span>
          )}
          {preferences.budget_amount && (
            <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200/80 text-stone-800 font-medium whitespace-nowrap shadow-2xs">
              💰 {preferences.budget_currency} {preferences.budget_amount.toLocaleString()}
            </span>
          )}
          {preferences.party_type && (
            <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200/80 text-stone-800 font-medium whitespace-nowrap shadow-2xs">
              👥 {preferences.party_type}
            </span>
          )}
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {/* Preset quick starters if chat has only 1 greeting */}
        {messages.length <= 1 && (
          <div className="mb-4 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Destination Inspiration:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(preset.prompt)}
                  className="group text-left text-xs p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100/90 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-900 transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <span className="truncate">{preset.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
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
              <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              {msg.role !== 'user' && msg.agent_name && (
                <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                  {msg.agent_name}
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white rounded-br-xs shadow-2xs'
                    : 'bg-white text-stone-800 rounded-bl-xs border border-stone-200/80 shadow-2xs'
                }`}
              >
                {renderCleanMessage(msg.content)}
              </div>

              {/* Interactive MCQ Choice Cards & Other option */}
              {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                    <Sparkles className="w-3 h-3 text-stone-500" />
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
                                ? 'bg-stone-100 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                                : 'bg-white hover:bg-stone-50 border-dashed border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-semibold text-stone-600 group-hover:text-stone-900 shrink-0">
                                <PenLine className="w-3 h-3" />
                              </span>
                              <span className="font-medium truncate">{reply.label}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-normal px-2 py-0.5 rounded bg-stone-100 border border-stone-200 shrink-0 ml-2">
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
                          className="group text-left text-xs p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-800 hover:text-stone-950 transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-semibold text-stone-600 group-hover:text-stone-900 shrink-0">
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
                      className="mt-2 p-3 rounded-xl bg-white border border-stone-300 shadow-md animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5 px-0.5">
                        <span className="font-medium flex items-center gap-1.5 text-stone-700">
                          <PenLine className="w-3 h-3 text-stone-500" />
                          <span>Write Your Own Response:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOtherMsgId(null);
                            setOtherCustomText('');
                          }}
                          className="text-[10px] text-stone-500 hover:text-stone-800 cursor-pointer"
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
                          className="flex-1 bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!otherCustomText.trim() || isLoading || isGeneratingPlan}
                          className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
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
              <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner / Agent Thinking */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 italic py-2">
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-ping"></span>
            <span>Agent analyzing parameters...</span>
          </div>
        )}

        {/* Generation in progress pill */}
        {isGeneratingPlan && (
          <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-center gap-3 shadow-2xs">
            <Loader2 className="w-5 h-5 text-stone-600 animate-spin" />
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Multi-Agent Synthesis Underway
              </p>
              <p className="text-[11px] text-stone-500">
                Web Researcher, Transit Specialist, Lodging Agent, and Itinerary Architect are synchronizing...
              </p>
            </div>
          </div>
        )}

        {/* Generate Plan Prominent CTA Banner */}
        {!isGeneratingPlan && (preferences.destination || isPlanReady) && (
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-stone-900 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5 text-stone-900">
                <Compass className="w-3.5 h-3.5 text-stone-600" />
                <span>Ready to Build Trip Architecture?</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {preferences.destination ? `Destination: ${preferences.destination}` : 'Ready to synthesize complete plan'}
              </p>
            </div>
            <button
              onClick={onGeneratePlan}
              disabled={isGeneratingPlan}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlanReady ? "Regenerate Plan" : "Generate Plan"}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type preferences, change budget, or ask questions..."
            disabled={isLoading || isGeneratingPlan}
            className="flex-1 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isGeneratingPlan}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
