import { useState } from 'react'
import { BarChart3, Brain, Flame, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../supabaseClient'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  )
}

const FEATURES = [
  {
    icon: Brain,
    title: 'Memoria inteligente',
    description: 'Atlas recuerda tu último peso y tus repeticiones por ejercicio.',
  },
  {
    icon: Flame,
    title: 'Racha imbatable',
    description: 'Cada sesión suma. La constancia se vuelve parte de tu identidad.',
  },
  {
    icon: BarChart3,
    title: 'Progreso real',
    description: 'Tonelaje, fuerza y consistencia semana a semana, sin ruido.',
  },
]

export default function AtlasLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' },
        },
      })

      if (signInError) throw signInError
    } catch (signInError) {
      setError(signInError.message || 'No se pudo iniciar sesión con Google.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-obsidian text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-aurora" />

      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-cyan-400/5 font-display text-xl font-bold text-cyan-300 shadow-[0_0_30px_-8px_rgba(34,211,238,0.8)]">
              A
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-[0.24em] text-white">ATLAS</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">Kinetic Obsidian</p>
            </div>
          </div>
          <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-cyan-400/70" />
            Sesión segura
          </span>
        </header>

        <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:py-16">
          <section className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Entrenamiento inteligente
            </div>

            <h1 className="mt-7 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu cuerpo recuerda.
              <br />
              <span className="shimmer-text">Atlas también.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Entrena con la precisión de un laboratorio. Cada serie queda guardada, cada
              incremento se sugiere solo y tu progreso deja de ser una intuición.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="glass rounded-2xl p-4">
                    <Icon className="h-5 w-5 text-cyan-300" strokeWidth={1.8} />
                    <p className="mt-4 text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{feature.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                +2,5 kg por semana
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
                Datos offline
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
                Diseñado para PWA
              </span>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-7 sm:p-9">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-500/5 font-display text-2xl font-bold text-cyan-200">
                  A
                </div>

                <h2 className="mt-7 font-display text-2xl font-bold text-white">Bienvenido de nuevo</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Accede para continuar exactamente donde lo dejaste.
                </p>

                {error && (
                  <div className="mt-6 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                >
                  {loading ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  {loading ? 'Conectando…' : 'Continuar con Google'}
                </button>

                <p className="mt-7 text-center text-[11px] leading-relaxed text-slate-600">
                  Acceso sin contraseñas · Tus datos permanecen privados
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 border-t border-white/5 pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Atlas Training Systems</span>
          <span>Instalable en web y móvil · PWA</span>
        </footer>
      </div>
    </div>
  )
}
