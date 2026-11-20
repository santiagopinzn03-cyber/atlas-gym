import { useMemo } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Flame,
  Pencil,
  Sparkles,
  Target,
  TrendingUp,
  Weight,
} from 'lucide-react'
import {
  EXERCISES,
  MUSCLE_GROUPS,
  formatKg,
  formatLongDate,
  getDailyVolumes,
  getDaysAgoLabel,
  getStreak,
  getWeeklySessions,
  getWeeklyTonnage,
  getWeekDays,
} from '../lib/atlasData'

function StatCard({ icon: Icon, label, value, detail, tone = 'cyan' }) {
  const toneClass = tone === 'amber' ? 'text-amber-300' : tone === 'violet' ? 'text-violet-300' : 'text-cyan-300'

  return (
    <div className="glass glass-interactive rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-white/5 p-2.5 ${toneClass}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <TrendingUp className="h-4 w-4 text-slate-600" />
      </div>
      <p className="mt-5 font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </div>
  )
}

export default function Dashboard({ history, customExercises, firstName, onEditName, onSelectGroup, onNavigate }) {
  const contarEjercicios = (group) => {
    const total = group.exerciseIds.length + customExercises.filter((item) => item.group === group.id).length
    return `${total} ${total === 1 ? 'ejercicio' : 'ejercicios'}`
  }

  const stats = useMemo(
    () => ({
      streak: getStreak(history),
      tonnage: getWeeklyTonnage(history),
      sessions: getWeeklySessions(history),
      lastSet: history[0] ?? null,
      volumes: getDailyVolumes(history),
      days: getWeekDays(),
    }),
    [history],
  )

  const lastGroup = stats.lastSet
    ? MUSCLE_GROUPS.find((group) => group.id === stats.lastSet.muscle_group) ?? MUSCLE_GROUPS[0]
    : MUSCLE_GROUPS[0]

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            Panel de control
          </p>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hola, {firstName}
              <span className="text-cyan-400">.</span>
            </h1>
            <button
              type="button"
              onClick={onEditName}
              aria-label="Editar nombre"
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-500 transition hover:border-cyan-400/30 hover:text-cyan-200"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Hoy es un buen día para superar tu propia memoria. Elige un grupo muscular y empieza.
          </p>
        </div>
        <div className="glass inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-xs text-slate-300">
          <CalendarDays className="h-4 w-4 text-sky-400" />
          {formatLongDate()}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={Flame}
          label="Días de racha"
          value={stats.streak}
          detail="Constancia imparable"
          tone="amber"
        />
        <StatCard
          icon={Weight}
          label="Tonelaje semanal"
          value={`${formatKg(stats.tonnage)} kg`}
          detail="Volumen acumulado"
        />
        <StatCard
          icon={CalendarDays}
          label="Sesiones"
          value={`${stats.sessions}/7`}
          detail="Esta semana"
          tone="violet"
        />
        <StatCard
          icon={Target}
          label="Próximo reto"
          value={history.length ? '+2,5 kg' : '0 kg'}
          detail={history.length ? 'Incremento sugerido' : 'Registra tu primera serie'}
        />
      </section>

      {stats.lastSet && (
        <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-3 text-cyan-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Memoria inteligente
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                    {getDaysAgoLabel(stats.lastSet.created_at)}
                  </span>
                </div>
                <p className="mt-2 font-display text-xl font-bold text-white">
                  {EXERCISES[stats.lastSet.exercise_id]?.name ?? stats.lastSet.exercise_name}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Tu último registro:{' '}
                  <span className="font-semibold text-sky-300">
                    {formatKg(stats.lastSet.weight_kg)} kg × {stats.lastSet.reps} repeticiones
                  </span>
                  <span className="text-slate-600"> · {lastGroup.name}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectGroup(lastGroup.id)}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_40px_-12px_rgba(34,211,238,0.9)] transition hover:brightness-110"
            >
              Continuar entrenamiento
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Elige tu grupo muscular</h2>
            <p className="mt-1 text-xs text-slate-500">Cada tarjeta carga tu historial automáticamente.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('workout')}
            className="hidden text-xs font-semibold text-cyan-300 transition hover:text-cyan-200 sm:block"
          >
            Ver entrenamiento actual
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {MUSCLE_GROUPS.map((group) => {
            const Icon = group.icon
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className="glass glass-interactive group flex flex-col items-start rounded-2xl p-4 text-left"
              >
                <div className={`rounded-xl bg-gradient-to-br ${group.gradient} p-2.5 text-cyan-200`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <p className="mt-5 font-display text-base font-semibold text-white">{group.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">{contarEjercicios(group)}</p>
                <div className="mt-4 flex w-full items-center justify-between text-slate-600">
                  <span className="text-[10px] uppercase tracking-widest">Entrenar</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-white">Consistencia de la semana</h2>
          <p className="text-[11px] text-slate-500">Objetivo diario · 8.000 kg</p>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {stats.days.map((day) => {
            const volume = stats.volumes[day.key] ?? 0
            const intensity = Math.min(volume / 8000, 1)
            return (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <span className={`text-[11px] ${day.isToday ? 'font-bold text-cyan-300' : 'text-slate-500'}`}>
                  {day.label}
                </span>
                <div
                  className={`flex h-14 w-full items-end justify-center rounded-xl border ${
                    day.isToday ? 'border-cyan-400/40 bg-cyan-400/5' : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <div
                    className="w-2/3 rounded-lg bg-gradient-to-t from-sky-600 to-cyan-300 transition-all duration-500"
                    style={{ height: `${Math.max(intensity * 100, volume > 0 ? 12 : 4)}%`, opacity: volume ? 0.35 + intensity * 0.65 : 0.12 }}
                  />
                </div>
                <span className="text-[9px] text-slate-600">{volume ? `${Math.round(volume / 1000)}k` : '—'}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
