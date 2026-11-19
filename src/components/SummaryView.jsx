import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Share2,
  Sparkles,
  Trophy,
  Weight,
} from 'lucide-react'
import {
  formatKg,
  getBestDay,
  getStreak,
  getStrengthComparison,
  getWeeklySessions,
  getWeeklyTonnage,
} from '../lib/atlasData'

export default function SummaryView({ history, onNavigate }) {
  const [slide, setSlide] = useState(0)
  const [toast, setToast] = useState('')

  const data = useMemo(
    () => ({
      tonnage: getWeeklyTonnage(history),
      previous: getWeeklyTonnage(history, -1),
      sessions: getWeeklySessions(history),
      sets: history.length,
      streak: getStreak(history),
      bestDay: getBestDay(history),
      comparison: getStrengthComparison(history),
    }),
    [history],
  )

  const delta = data.previous ? ((data.tonnage - data.previous) / data.previous) * 100 : 0
  const topLift = data.comparison[0]
  const slides = [0, 1, 2]

  async function handleShare() {
    const text = `Atlas · Esta semana moví ${formatKg(data.tonnage)} kg en ${data.sessions} sesiones. Racha de ${data.streak} días. La fuerza se construye.`

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi semana en Atlas', text, url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(text)
      setToast('Resumen copiado al portapapeles')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setToast('No se pudo compartir automáticamente')
      }
    }
    window.setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            Weekly story
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tu semana en números
          </h1>
          <p className="mt-2 text-sm text-slate-400">Una historia de constancia, lista para compartir.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>
      </header>

      <div className="mx-auto w-full max-w-xl">
        <div className="glass-strong relative overflow-hidden rounded-[2rem]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex gap-1.5 p-4">
            {slides.map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlide(index)}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
                aria-label={`Ir a la diapositiva ${index + 1}`}
              >
                <span
                  className={`block h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-500 ${
                    index <= slide ? 'w-full' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="relative flex min-h-[400px] flex-col justify-center px-7 pb-9 pt-4 sm:px-10">
            {slide === 0 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <Weight className="h-3.5 w-3.5" />
                  Volumen total
                </div>
                <p className="mt-8 font-display text-6xl font-bold tracking-tight text-white text-glow sm:text-7xl">
                  {formatKg(data.tonnage)}
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-cyan-300">kg movidos</p>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
                  Cada kilo suma. Esta semana tu cuerpo hizo el trabajo que tu disciplina decidió.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="font-display text-xl font-bold text-white">{data.sessions}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Sesiones</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className={`font-display text-xl font-bold ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">vs semana anterior</p>
                  </div>
                </div>
              </div>
            )}

            {slide === 1 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                  <Flame className="h-3.5 w-3.5" />
                  Constancia
                </div>
                <p className="mt-8 font-display text-6xl font-bold tracking-tight text-white sm:text-7xl">
                  {data.streak}
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-cyan-300">
                  días consecutivos
                </p>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
                  La racha no es un número: es la prueba de que vuelves, incluso cuando no apetece.
                </p>
                <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-cyan-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Tu mejor día</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Día {data.bestDay.label} · {formatKg(data.bestDay.volume)} kg de volumen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide === 2 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Evolución de fuerza
                </div>
                <p className="mt-8 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
                  {topLift ? `+${topLift.delta.toFixed(1)}%` : '—'}
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-cyan-300">
                  {topLift ? topLift.name : 'Sin datos suficientes'}
                </p>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
                  {topLift
                    ? `Tu estimación de 1RM pasó de ${formatKg(topLift.previous)} kg a ${formatKg(topLift.current)} kg. Eso es progreso medible.`
                    : 'Registra entrenamientos para desbloquear tu comparativa de fuerza.'}
                </p>
                <div className="mt-10 flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5">
                  <Sparkles className="h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="text-xs leading-relaxed text-cyan-100/80">
                    Atlas sugiere +2,5 kg en tu próxima serie. Tu memoria inteligente ya tiene los datos.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-between border-t border-white/5 px-5 py-4">
            <button
              type="button"
              onClick={() => setSlide((current) => Math.max(0, current - 1))}
              disabled={slide === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-cyan-200 disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <span className="text-[11px] font-medium text-slate-500">
              {slide + 1} / {slides.length}
            </span>
            {slide < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setSlide((current) => current + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-100"
        >
          {toast ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              {toast}
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Compartir mi semana
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
