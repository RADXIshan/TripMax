import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Plane, 
  Building, 
  Compass, 
  UtensilsCrossed 
} from 'lucide-react';
import type { TripPlan } from '../types/trip';

interface BudgetTabProps {
  plan: TripPlan;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ plan }) => {
  const { budget } = plan;
  const curr = budget.currency;
  const total = budget.total_estimated || 1;

  const categories = [
    { name: 'Lodging & Stays', amount: budget.stay_cost, icon: Building, color: 'bg-stone-800 dark:bg-stone-200' },
    { name: 'Transit & Rail/Flights', amount: budget.transit_cost, icon: Plane, color: 'bg-stone-600 dark:bg-stone-400' },
    { name: 'Food & Culinary', amount: budget.food_dining_cost, icon: UtensilsCrossed, color: 'bg-stone-500 dark:bg-stone-500' },
    { name: 'Activities & Entry Fees', amount: budget.activities_cost, icon: Compass, color: 'bg-stone-400 dark:bg-stone-600' },
    { name: 'Local Cabs & Buffer', amount: budget.buffer_local_transit_cost, icon: CreditCard, color: 'bg-stone-300 dark:bg-stone-700' },
  ];

  const getStatusBadge = () => {
    switch (budget.budget_status) {
      case 'within_budget':
        return {
          label: 'Comfortably Within Budget',
          color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle
        };
      case 'tight':
        return {
          label: 'Near Budget Boundary',
          color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: AlertTriangle
        };
      case 'luxury_stretch':
        return {
          label: 'Premium Stretch',
          color: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'Balanced Financial Blueprint',
          color: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700',
          icon: ShieldCheck
        };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          Financial Blueprint & Budget Analysis
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Audited breakdown per traveler for {plan.duration_days} days in {plan.destination}
        </p>
      </div>

      {/* Primary KPI Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              Total Projected Spend
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5 tracking-tight">
              {curr} {budget.total_estimated.toLocaleString()}
            </div>
            {budget.target_budget && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Target Cap: <strong className="text-stone-700 dark:text-stone-300">{curr} {budget.target_budget.toLocaleString()}</strong>
              </p>
            )}
          </div>

          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Proportional Progress Distribution Bar */}
        <div className="mt-6">
          <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden flex">
            {categories.map((cat, idx) => {
              const pct = (cat.amount / total) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  title={`${cat.name}: ${curr} ${cat.amount.toLocaleString()} (${pct.toFixed(0)}%)`}
                  className={`${cat.color} h-full transition-all`}
                />
              );
            })}
          </div>

          {/* Category breakdown legend & cards */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const pct = Math.round((cat.amount / total) * 100);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-700/80 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate text-[11px]">{cat.name}</span>
                  </div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    {curr} {cat.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {pct}% of budget
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Financial Insights */}
      {budget.insights && budget.insights.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Agent Budget Advisory & Optimization Notes</span>
          </h4>
          <div className="space-y-1.5">
            {budget.insights.map((note, idx) => (
              <p key={idx} className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
