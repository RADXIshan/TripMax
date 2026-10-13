import { useState } from 'react';
import { 
  Bot, 
  Globe, 
  Plane, 
  Building, 
  CalendarDays, 
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AgentReasoningBarProps {
  logs: string[];
  isGenerating: boolean;
  onViewSources?: () => void;
  visitedSitesCount?: number;
}

export const AgentReasoningBar: React.FC<AgentReasoningBarProps> = ({ 
  logs, 
  isGenerating,
  onViewSources,
  visitedSitesCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const agents = [
    { name: 'Discovery (Firecrawl + LLM)', icon: Bot, color: 'text-stone-600 dark:text-stone-300' },
    { name: 'Web Intelligence (Firecrawl MCP)', icon: Globe, color: 'text-amber-500 dark:text-amber-400' },
    { name: 'Transit Scraper (Playwright)', icon: Plane, color: 'text-sky-500 dark:text-sky-400' },
    { name: 'Lodging Scraper (Playwright)', icon: Building, color: 'text-indigo-500 dark:text-indigo-400' },
    { name: 'Itinerary Architect (LLM Mind)', icon: CalendarDays, color: 'text-purple-500 dark:text-purple-400' },
    { name: 'Auto-Booking Agent (Playwright)', icon: CreditCard, color: 'text-emerald-500 dark:text-emerald-400' },
  ];

  return (
    <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Agent icons pipeline */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mr-1">
              Multi-Agent Team:
            </span>
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div 
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs whitespace-nowrap"
                >
                  <Icon className={`w-3.5 h-3.5 ${agent.color}`} />
                  <span className="font-medium text-stone-700 dark:text-stone-300 text-[11px]">
                    {agent.name}
                  </span>
                  {isGenerating && (
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100 animate-ping"></span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Visited Sites Jump */}
            {onViewSources && (
              <button
                onClick={onViewSources}
                className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Globe className="w-3 h-3 text-amber-500" />
                <span>{visitedSitesCount ? `${visitedSitesCount} Visited Sites` : 'Visited Sites'}</span>
              </button>
            )}

            {/* Reasoning logs toggle */}
            {logs.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer transition-colors"
              >
                <span>{logs.length} Agent Executions</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Agent Reasoning Log Drawer */}
        {isExpanded && logs.length > 0 && (
          <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 font-mono text-[11px] text-stone-600 dark:text-stone-400 max-h-48 overflow-y-auto space-y-1 shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-stone-400 dark:text-stone-600 select-none">{String(index + 1).padStart(2, '0')}.</span>
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
