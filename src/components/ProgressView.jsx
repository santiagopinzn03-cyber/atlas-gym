import { useMemo } from 'react'
import {
  Activity,
  ArrowDownRight,
  CalendarDays,
  Check,
  Flame,
  Target,
  TrendingUp,
  Trophy,
  Weight,
  X,
} from 'lucide-react'
import {
  DAILY_TARGET_KG,
  formatKg,
  getDailyVolumes,
  getStreak,
  getStrengthComparison,
  getWeeklySessions,
  getWeeklyTonnage,
  getWeekDays,
} from '../lib/atlasData'

function TrafficDay({ day, volume }) {
  const status = day.isFuture
    ? 'pending'
    : volume >= DAILY_TARGET_KG
      ? 'ok'
      : volume > 0
        ? 'partial'
        : 'missed'

  const styles = {
    ok: 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300 shadow-[0_0_24px_-6px_rgba(52,211,153,0.8)]',
    partial: 'border-amber-400/50 bg-amber-400/15 text-amber-300',
    missed: 'border-rose-400/30 bg-rose-500/10 text-rose-300/70',
    pending: 'border-white/5 bg-white/[0.02] text-slate-600',
  }

  const Icon = status === 'ok' ? Check : status === 'missed' ? X : status === 'partial' ? Activity : null

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`text-[11px] ${day.isToday ? 'font-bold text-cyan-300' : 'text-slate-500'}`}>
        {day.label}
      </span>
      <div className={`flex h-12 w-full items-center justify-center rounded-xl border sm:h-14 ${styles[status]}`}>
        {Icon ? <Icon className="h-5 w-5" strokeWidth={2.5} /> : <span className="text-xs">·</span>}
      </div>
      <span className="text-[9px] text-slate-600">
        {day.isFuture ? '—' : volume ? `${Math.round(volume / 1000)}k` : '0'}
      </span>
    </div>
  )
}

export default function ProgressView({ history }) {
  const data = useMemo(
    () => ({
      days: getWeekDays(),
      volumes: getDailyVolumes(history),
      tonnage: getWeeklyTonnage(history),
      previousTonnage: getWeeklyTonnage(history, -1),
      sessions: getWeeklySessions(history),
      streak: getStreak(history),
      comparison: getStrengthComparison(history),
      sets: history.filter((set) => {
        const date = new Date(set.created_at)
        const today = new Date()
        const monday = new Date(today)
        monday.setHours(0, 0, 0, 0)
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
        return date >= monday
      }).length,
    }),
    [history],
  )

  const tonnageDelta = data.previousTonnage
    ? ((data.tonnage - data.previousTonnage) / data.previousTonnage) * 100
    : 0
  const consistency = Math.round((data.sessions / 7) * 100)
  const maxStrength = Math.max(
    ...data.comparison.flatMap((item) => [item.current, item.previous]),
    1,
  )

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
          Analítica de rendimiento
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Tu progreso
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Semáforo semanal y evolución de fuerza con datos reales de tus series.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <Weight className="h-5 w-5 text-cyan-300" />
          <p className="mt-5 font-display text-2xl font-bold text-white">{formatKg(data.tonnage)} kg</p>
          <p className="mt-1 text-xs text-slate-400">Tonelaje semanal</p>
          <p className={`mt-2 flex items-center gap-1 text-[11px] ${tonnageDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {tonnageDelta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {tonnageDelta >= 0 ? '+' : ''}
            {tonnageDelta.toFixed(1)}% vs semana anterior
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <CalendarDays className="h-5 w-5 text-sky-300" />
          <p className="mt-5 font-display text-2xl font-bold text-white">{data.sessions}/7</p>
          <p className="mt-1 text-xs text-slate-400">Sesiones completadas</p>
          <p className="mt-2 text-[11px] text-slate-500">{data.sets} series registradas</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <Flame className="h-5 w-5 text-amber-300" />
          <p className="mt-5 font-display text-2xl font-bold text-white">{data.streak} días</p>
          <p className="mt-1 text-xs text-slate-400">Racha activa</p>
          <p className="mt-2 text-[11px] text-slate-500">Sin excusas, sin reinicios</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <Trophy className="h-5 w-5 text-violet-300" />
          <p className="mt-5 font-display text-2xl font-bold text-white">{consistency}%</p>
          <p className="mt-1 text-xs text-slate-400">Consistencia</p>
          <p className="mt-2 text-[11px] text-slate-500">Objetivo: 7 de 7 días</p>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-white">Semáforo semanal</h2>
            <p className="mt-1 text-xs text-slate-500">Objetivo diario: {formatKg(DAILY_TARGET_KG)} kg de volumen</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" /> Objetivo</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" /> Parcial</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-400" /> Pendiente</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3">
          {data.days.map((day) => (
            <TrafficDay key={day.key} day={day} volume={data.volumes[day.key] ?? 0} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-white">Comparativa de fuerza</h2>
              <p className="mt-1 text-xs text-slate-500"> Estimación 1RM · esta semana vs anterior</p>
            </div>
            <Target className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mt-6 space-y-5">
            {data.comparison.length === 0 && (
              <p className="text-xs text-slate-500">Registra series para ver la comparativa.</p>
            )}
            {data.comparison.map((item) => (
              <div key={item.id}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Anterior: {formatKg(item.previous)} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-cyan-200">
                      {formatKg(item.current)} kg
                    </p>
                    <p className={`text-[10px] ${item.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {item.delta >= 0 ? '+' : ''}
                      {item.delta.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5">
                  <div className="relative h-full w-full">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-slate-500/25"
                      style={{ width: `${(item.previous / maxStrength) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 shadow-[0_0_16px_-4px_rgba(34,211,238,0.9)]"
                      style={{ width: `${(item.current / maxStrength) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass flex flex-col items-center justify-center rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Constancia</p>
          <div
            className="relative mt-5 h-40 w-40 rounded-full"
            style={{
              background: `conic-gradient(#22d3ee ${consistency}%, rgba(148,163,184,0.12) ${consistency}% 100%)`,
            }}
          >
            <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-obsidian">
              <span className="font-display text-3xl font-bold text-white">{consistency}%</span>
              <span className="mt-1 text-[11px] text-slate-500">{data.sessions} de 7 días</span>
            </div>
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
            La fuerza se construye con repeticiones constantes, no con sesiones perfectas.
          </p>
        </section>
      </div>
    </div>
  )
}
