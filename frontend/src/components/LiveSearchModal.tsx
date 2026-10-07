import { useState } from 'react';
import { X, Search, Globe, ExternalLink, Loader2 } from 'lucide-react';
import type { ResearchSource } from '../types/trip';

interface LiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({ isOpen, onClose, apiBase }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${apiBase}/api/search/live?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Live Web Research Console
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kyoto hidden tea houses or Eurostar train tickets from London..."
              className="flex-1 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600 text-stone-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length === 0 && !isSearching && (
            <div className="text-center py-10 text-stone-400 text-xs">
              Enter any query to inspect real-time live search intelligence and citations.
            </div>
          )}

          {isSearching && (
            <div className="text-center py-10 text-stone-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying global web sources...</span>
            </div>
          )}

          {results.map((res, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-stone-900 dark:text-stone-100 hover:underline flex items-center gap-1.5"
                >
                  <span>{res.title}</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
              <p className="text-[10px] text-stone-400 truncate">{res.url}</p>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed pt-1">
                {res.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
