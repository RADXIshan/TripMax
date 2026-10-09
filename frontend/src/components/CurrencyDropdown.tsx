import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number; // approximate conversion relative to USD
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateToUSD: 84.0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateToUSD: 152.0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateToUSD: 1.52 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', rateToUSD: 1.36 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rateToUSD: 0.88 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateToUSD: 1.32 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToUSD: 3.67 },
];

interface CurrencyDropdownProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  compact?: boolean;
  align?: 'left' | 'right';
}

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  currency,
  onCurrencyChange,
  compact = false,
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.includes(searchQuery)
  );

  const handleSelect = (code: string) => {
    onCurrencyChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800/90 hover:bg-stone-800 hover:border-stone-600 text-stone-200 transition-all duration-150 shadow-2xs cursor-pointer select-none ${
          compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
        title={`Change currency (current: ${selectedCurrency.code} ${selectedCurrency.symbol})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm leading-none">{selectedCurrency.flag}</span>
        <span className="font-semibold tracking-tight text-stone-100">
          {selectedCurrency.code}
        </span>
        <span className="text-stone-400 font-medium text-[11px]">
          ({selectedCurrency.symbol})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-stone-200' : 'group-hover:text-stone-300'
          }`}
        />
      </button>

      {/* Flyout Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-60 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header & Quick Filter */}
          <div className="p-2 border-b border-stone-800 bg-stone-900/90">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search currency..."
              autoFocus
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-stone-800/60">
            {filteredCurrencies.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400">
                No matching currencies
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === currency;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-stone-800 font-semibold text-stone-100'
                        : 'hover:bg-stone-800/60 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-100">{c.code}</span>
                          <span className="text-stone-400 font-medium">({c.symbol})</span>
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {c.name}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-stone-100 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
