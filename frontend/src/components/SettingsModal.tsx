import { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiBase }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${apiBase}/api/config`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_key: geminiKey || undefined,
          tavily_key: tavilyKey || undefined,
        })
      });
      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
        await fetchConfig();
        setGeminiKey('');
        setTavilyKey('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              TripMax Engine & API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Engine Status Callout */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Web Research Engine:</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{status?.search_engine || 'DuckDuckGo Live (Built-in Free)'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Gemini LLM Synthesis:</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {status?.gemini_configured ? (
                  <span className="text-emerald-600">Active ({status.gemini_masked})</span>
                ) : (
                  <span className="text-stone-500">Autonomous Heuristic Mode</span>
                )}
              </span>
            </div>
          </div>

          {/* Gemini API Key input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>Google Gemini API Key (Optional)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-stone-500 hover:underline"
              >
                Get free key ↗
              </a>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <p className="text-[10px] text-stone-400">
              TripMax runs out of the box with zero keys, but adding your Gemini key enables enhanced generative editorial synthesis.
            </p>
          </div>

          {/* Tavily API Key input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>Tavily Search API Key (Optional)</span>
              <a
                href="https://tavily.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-stone-500 hover:underline"
              >
                Tavily portal ↗
              </a>
            </label>
            <input
              type="password"
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              placeholder="tvly-..."
              className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <p className="text-[10px] text-stone-400">
              DuckDuckGo live web search is already enabled for all destination research without any key.
            </p>
          </div>

          {savedMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>API key configuration updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving || (!geminiKey && !tavilyKey)}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
            >
              {isSaving ? "Saving..." : "Save Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
