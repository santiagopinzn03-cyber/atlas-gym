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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mensajeAutenticacion(error) {
  const mensaje = error?.message?.toLowerCase() ?? ''

  if (mensaje.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (mensaje.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.'
  if (mensaje.includes('already registered')) return 'Ya existe una cuenta con este correo.'
  if (mensaje.includes('weak password')) return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.'
  if (mensaje.includes('too many requests')) return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.'

  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}

export default function AtlasLogin() {
  const [modo, setModo] = useState('login')
  const [formulario, setFormulario] = useState({ nombre: '', correo: '', contrasena: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function cambiarModo(siguienteModo) {
    setModo(siguienteModo)
    setError('')
    setSuccess('')
  }

  function actualizarCampo(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function handleGoogleSignIn() {
    setError('')
    setSuccess('')
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
      setError(mensajeAutenticacion(signInError))
      setLoading(false)
    }
  }

  async function handleCorreoSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const nombre = formulario.nombre.trim()
    const correo = formulario.correo.trim()
    const contrasena = formulario.contrasena

    if (modo === 'register' && !nombre) {
      setError('Escribe tu nombre completo.')
      return
    }
    if (!correo) {
      setError('Escribe tu correo electrónico.')
      return
    }
    if (!EMAIL_PATTERN.test(correo)) {
      setError('El correo electrónico no tiene un formato válido.')
      return
    }
    if (!contrasena) {
      setError('Escribe tu contraseña.')
      return
    }
    if (modo === 'register' && contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      if (modo === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: { data: { full_name: nombre } },
        })

        if (signUpError) throw signUpError
        if (!data.session) {
          setSuccess('Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena,
        })

        if (signInError) throw signInError
      }
    } catch (authError) {
      setError(mensajeAutenticacion(authError))
    } finally {
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">Fuerza Pura</p>
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
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
                Sincronización en la nube
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
                Instalable en móvil
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

                <h2 className="mt-7 font-display text-2xl font-bold text-white">
                  {modo === 'register' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {modo === 'register'
                    ? 'Empieza tu historial hoy y deja que Atlas recuerde cada avance.'
                    : 'Accede para continuar exactamente donde lo dejaste.'}
                </p>

                {error && (
                  <div className="mt-6 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
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

                <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  <span className="h-px flex-1 bg-white/10" />
                  o continúa con correo
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => cambiarModo('login')}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      modo === 'login'
                        ? 'bg-cyan-400/10 text-cyan-200'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarModo('register')}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      modo === 'register'
                        ? 'bg-cyan-400/10 text-cyan-200'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    Crear cuenta
                  </button>
                </div>

                <form onSubmit={handleCorreoSubmit} className="mt-5 space-y-3">
                  {modo === 'register' && (
                    <label className="block">
                      <span className="text-[11px] font-semibold text-slate-400">Nombre completo</span>
                      <input
                        type="text"
                        value={formulario.nombre}
                        onChange={(event) => actualizarCampo('nombre', event.target.value)}
                        placeholder="Tu nombre y apellido"
                        autoComplete="name"
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="text-[11px] font-semibold text-slate-400">Correo electrónico</span>
                    <input
                      type="email"
                      value={formulario.correo}
                      onChange={(event) => actualizarCampo('correo', event.target.value)}
                      placeholder="nombre@correo.com"
                      autoComplete="email"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold text-slate-400">Contraseña</span>
                    <input
                      type="password"
                      value={formulario.contrasena}
                      onChange={(event) => actualizarCampo('contrasena', event.target.value)}
                      placeholder={modo === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                      autoComplete={modo === 'register' ? 'new-password' : 'current-password'}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_12px_40px_-14px_rgba(34,211,238,0.9)] transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {loading ? 'Procesando…' : modo === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
                  </button>
                </form>

                <p className="mt-7 text-center text-[11px] leading-relaxed text-slate-600">
                  Acceso seguro · Tus datos permanecen privados
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 border-t border-white/5 pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Atlas · Sistemas de Entrenamiento</span>
          <span>Instalable en web y móvil · PWA</span>
        </footer>
      </div>
    </div>
  )
}
