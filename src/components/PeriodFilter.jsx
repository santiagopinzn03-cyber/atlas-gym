import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { PERIOD_OPTIONS, formatPeriodLabel } from '../lib/atlasData'

export default function PeriodFilter({ period, monthOffset, onChange }) {
  return (
    <section className="glass rounded-2xl p-3 sm:p-4" aria-label="Filtrar historial por periodo">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={period === option.id}
              onClick={() => onChange(option.id, 0)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                period === option.id
                  ? 'bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_-8px_rgba(34,211,238,0.9)]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {period === 'month' ? (
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onChange('month', monthOffset - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
              aria-label="Ver mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-[9rem] text-center text-xs font-semibold text-slate-200">
              {formatPeriodLabel('month', monthOffset)}
            </p>
            <button
              type="button"
              onClick={() => onChange('month', Math.min(0, monthOffset + 1))}
              disabled={monthOffset >= 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Ver mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <CalendarDays className="h-4 w-4 text-cyan-300/70" />
            {formatPeriodLabel(period, monthOffset)}
          </p>
        )}
      </div>
    </section>
  )
}
