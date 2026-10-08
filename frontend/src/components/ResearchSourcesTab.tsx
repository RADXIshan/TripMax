import { Globe, ExternalLink } from 'lucide-react';
import type { ResearchSource } from '../types/trip';

interface ResearchSourcesTabProps {
  sources: ResearchSource[];
  destination: string;
}

export const ResearchSourcesTab: React.FC<ResearchSourcesTabProps> = ({ sources, destination }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-stone-100">
          Live Web Intelligence & Citations
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Real-time web queries researched by WebResearchAgent for {destination}
        </p>
      </div>

      <div className="space-y-3">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-stone-900 border border-stone-800 shadow-2xs hover:border-stone-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 hover:text-amber-400">
                    <a href={src.url} target="_blank" rel="noreferrer">
                      {src.title}
                    </a>
                  </h4>
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-xl">
                  {src.url}
                </p>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  {src.snippet}
                </p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white transition-colors shrink-0"
                title="Open Source Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
