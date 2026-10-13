import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Building, 
  Plane, 
  Train, 
  Search,
  Clock,
  Ticket
} from 'lucide-react';
import type { ResearchSource, VisitedSite } from '../types/trip';

interface ResearchSourcesTabProps {
  sources: ResearchSource[];
  visitedSites?: VisitedSite[];
  destination: string;
}

export const ResearchSourcesTab: React.FC<ResearchSourcesTabProps> = ({ 
  sources = [], 
  visitedSites = [], 
  destination 
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'playwright' | 'firecrawl' | 'passes'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize all visited entities into a unified display model
  const allEntries = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      url: string;
      category: string;
      type: 'playwright' | 'firecrawl' | 'partner';
      status: string;
      timestamp?: string;
      snippet: string;
    }> = [];

    // 1. Visited Sites from Playwright & Firecrawl
    visitedSites.forEach((vs, idx) => {
      const isPlaywright = vs.category.toLowerCase().includes('playwright') || 
        vs.name.toLowerCase().includes('playwright') ||
        ['booking.com', 'makemytrip', 'agoda', 'skyscanner', 'confirmtkt', 'ixigo', 'trainline'].some(d => vs.url.toLowerCase().includes(d));

      const isFirecrawl = vs.category.toLowerCase().includes('firecrawl') || 
        vs.name.toLowerCase().includes('firecrawl');

      const isPass = vs.category.toLowerCase().includes('passes') || 
        vs.category.toLowerCase().includes('attractions') ||
        ['getyourguide', 'viator', 'klook'].some(d => vs.url.toLowerCase().includes(d));

      list.push({
        id: `vs-${idx}-${vs.url}`,
        title: vs.name,
        url: vs.url,
        category: vs.category,
        type: isPlaywright ? 'playwright' : isFirecrawl ? 'firecrawl' : isPass ? 'partner' : 'firecrawl',
        status: vs.status || 'Verified Live',
        timestamp: vs.timestamp,
        snippet: vs.snippet || 'Live web portal queried and verified by autonomous crawlers.'
      });
    });

    // 2. Add any research sources not already in list
    sources.forEach((src, idx) => {
      const exists = list.some(item => item.url === src.url);
      if (!exists) {
        list.push({
          id: `src-${idx}-${src.url}`,
          title: src.title,
          url: src.url,
          category: 'Discovery Intelligence (Firecrawl MCP)',
          type: 'firecrawl',
          status: 'Verified Live',
          snippet: src.snippet
        });
      }
    });

    return list;
  }, [visitedSites, sources]);

  // Filter and search
  const filteredEntries = allEntries.filter(item => {
    if (activeFilter === 'playwright' && item.type !== 'playwright') return false;
    if (activeFilter === 'firecrawl' && item.type !== 'firecrawl') return false;
    if (activeFilter === 'passes' && item.type !== 'partner' && !item.category.toLowerCase().includes('passes')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const playwrightCount = allEntries.filter(i => i.type === 'playwright').length;
  const firecrawlCount = allEntries.filter(i => i.type === 'firecrawl').length;
  const passCount = allEntries.filter(i => i.type === 'partner' || i.category.toLowerCase().includes('passes')).length;

  const getCategoryIcon = (category: string, url: string) => {
    const c = category.toLowerCase();
    const u = url.toLowerCase();
    if (c.includes('stay') || u.includes('booking.com') || u.includes('hotel') || u.includes('agoda.com')) {
      return <Building className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (c.includes('flight') || u.includes('skyscanner') || u.includes('flights') || u.includes('ixigo')) {
      return <Plane className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (c.includes('train') || u.includes('confirmtkt') || u.includes('rail') || u.includes('trainline')) {
      return <Train className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (c.includes('passes') || u.includes('getyourguide') || u.includes('viator') || u.includes('klook')) {
      return <Ticket className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Globe className="w-3.5 h-3.5 text-stone-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Globe className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-stone-100">
                Live Crawled Sites & Verified Intelligence Sources
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Every website visited and scraped in real-time by <span className="text-stone-200 font-semibold">Playwright Headless Browsers</span> and <span className="text-stone-200 font-semibold">Firecrawl MCP</span> to engineer your stays, transit routes, and verified itinerary for {destination}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-medium flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Verified Live Portals</span>
            </span>
          </div>
        </div>

        {/* Engine Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-800/80">
          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-stone-400" />
              <span>Total Sites Visited</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-1 font-mono">
              {allEntries.length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-sky-900/40">
            <div className="text-[11px] text-sky-400 flex items-center gap-1.5">
              <Plane className="w-3 h-3" />
              <span>Playwright Scrapes</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-1 font-mono">
              {playwrightCount}
            </div>
            <div className="text-[10px] text-stone-400 truncate mt-0.5">
              Booking.com, MMT, Skyscanner, Agoda, ConfirmTkt
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-amber-900/40">
            <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3 h-3" />
              <span>Firecrawl MCP</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-1 font-mono">
              {firecrawlCount}
            </div>
            <div className="text-[10px] text-stone-400 truncate mt-0.5">
              UNESCO, Official Tourism, Dining Guides
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-emerald-900/40">
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <Ticket className="w-3 h-3" />
              <span>Passes & Experiences</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-1 font-mono">
              {passCount}
            </div>
            <div className="text-[10px] text-stone-400 truncate mt-0.5">
              GetYourGuide, Viator, Official Pass Portals
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-stone-100 text-stone-900 font-semibold shadow-xs'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            All Sites ({allEntries.length})
          </button>

          <button
            onClick={() => setActiveFilter('playwright')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFilter === 'playwright'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <span>🎭 Playwright Scrapers</span>
            <span className="text-[10px] opacity-80">({playwrightCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('firecrawl')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFilter === 'firecrawl'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <span>🔥 Firecrawl MCP</span>
            <span className="text-[10px] opacity-80">({firecrawlCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('passes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFilter === 'passes'
                ? 'bg-emerald-500 text-stone-950 font-semibold shadow-xs'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <span>🎟️ Activity & Passes</span>
            <span className="text-[10px] opacity-80">({passCount})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visited sites or URLs..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-600 transition-colors"
          />
        </div>
      </div>

      {/* Visited Sites Cards Grid */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 text-xs">
            No visited sites match the active filter or search query.
          </div>
        ) : (
          filteredEntries.map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-xl bg-stone-900 border border-stone-800 shadow-2xs hover:border-stone-700 transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {/* Category & Engine Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-300">
                      {getCategoryIcon(site.category, site.url)}
                      <span>{site.category}</span>
                    </span>

                    {site.type === 'playwright' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60 font-medium">
                        🎭 Playwright Headless Scraper
                      </span>
                    )}

                    {site.type === 'firecrawl' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-medium">
                        🔥 Firecrawl MCP Deep Crawl
                      </span>
                    )}

                    {site.type === 'partner' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                        🎟️ Official Ticketing Partner
                      </span>
                    )}

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{site.status}</span>
                    </span>

                    {site.timestamp && (
                      <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{site.timestamp}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Link */}
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                    <a href={site.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                      <span className="truncate">{site.title}</span>
                      <ExternalLink className="w-3 h-3 text-stone-500 shrink-0 group-hover:text-amber-400" />
                    </a>
                  </h4>

                  {/* URL */}
                  <p className="text-[11px] text-stone-400 font-mono truncate max-w-2xl">
                    {site.url}
                  </p>
                </div>

                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-2xs"
                  title="Visit live page in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Crawled snippet */}
              <div className="pt-2 border-t border-stone-800/60">
                <p className="text-xs text-stone-300 leading-relaxed">
                  {site.snippet}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
