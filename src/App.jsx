import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  Dumbbell,
  History,
  Home,
  LoaderCircle,
  LogOut,
  Pencil,
  ShieldAlert,
  Trophy,
  UserRound,
} from 'lucide-react'
import AtlasLogin from './components/AtlasLogin'
import Dashboard from './components/Dashboard'
import HistoryView from './components/HistoryView'
import ProgressView from './components/ProgressView'
import SummaryView from './components/SummaryView'
import WorkoutView from './components/WorkoutView'
import { MUSCLE_GROUPS } from './lib/atlasData'
import { fetchCustomExercises, fetchHistory } from './lib/historyStore'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'workout', label: 'Entrenar', icon: Dumbbell },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'progress', label: 'Progreso', icon: BarChart3 },
  { id: 'summary', label: 'Resumen', icon: Trophy },
]

function nombreDelUsuario(user) {
  const metadata = user?.user_metadata ?? {}
  return metadata.display_name || metadata.full_name || metadata.name || ''
}

function primerNombre(nombre) {
  return nombre.trim().split(/\s+/)[0] || 'atleta'
}

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-cyan-400/5 font-display text-xl font-bold text-cyan-300 shadow-[0_0_28px_-10px_rgba(34,211,238,0.9)]">
        A
      </div>
      {!compact && (
        <div>
          <p className="font-display text-base font-bold tracking-[0.22em] text-white">ATLAS</p>
          <p className="text-[9px] uppercase tracking-[0.26em] text-cyan-300/60">Fuerza Pura</p>
        </div>
      )}
    </div>
  )
}

function NavButton({ item, active, onClick, compact = false }) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-3 rounded-xl text-sm font-semibold transition ${
        compact ? 'flex-1 flex-col gap-1 px-1 py-2 text-[10px]' : 'w-full px-4 py-3'
      } ${
        active
          ? 'border border-cyan-400/25 bg-cyan-400/10 text-cyan-200'
          : 'border border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon className={compact ? 'h-5 w-5' : 'h-[18px] w-[18px]'} strokeWidth={active ? 2.2 : 1.8} />
      {item.label}
      {active && !compact && (
        <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
      )}
    </button>
  )
}

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-obsidian text-slate-400">
      <div className="animate-float">
        <Brand />
      </div>
      <div className="flex items-center gap-2 text-xs tracking-wide">
        <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
        Verificando tu sesión…
      </div>
    </div>
  )
}

function ConfigurationScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-obsidian px-5 text-slate-300">
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8">
        <ShieldAlert className="h-8 w-8 text-amber-300" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Configuración requerida</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Atlas no muestra datos hasta validar la sesión con Supabase. Configura las variables de
          entorno y vuelve a desplegar la aplicación.
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-cyan-200">
          VITE_SUPABASE_URL
          <br />
          VITE_SUPABASE_ANON_KEY
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [history, setHistory] = useState([])
  const [customExercises, setCustomExercises] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [view, setView] = useState('dashboard')
  const [period, setPeriod] = useState('week')
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(MUSCLE_GROUPS[0])
  const [retryToken, setRetryToken] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const nombre = nombreDelUsuario(session?.user)
  const saludo = primerNombre(nombre)
  const avatarUrl = session?.user?.user_metadata?.avatar_url || ''

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setAuthLoading(false)
      setDataLoading(Boolean(data.session))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setAuthLoading(false)
      setDataLoading(Boolean(nextSession))
      if (!nextSession) {
        setHistory([])
        setCustomExercises([])
        setDataError('')
        setView('dashboard')
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return

    let active = true

    Promise.all([fetchHistory(session.user.id), fetchCustomExercises(session.user.id)])
      .then(([records, exercises]) => {
        if (active) {
          setHistory(records)
          setCustomExercises(exercises)
        }
      })
      .catch((error) => {
        if (active) setDataError(error.message || 'No se pudieron cargar tus datos.')
      })
      .finally(() => {
        if (active) setDataLoading(false)
      })

    return () => {
      active = false
    }
  }, [session, retryToken])

  const refreshData = useCallback(async () => {
    if (!session) return
    setDataError('')
    const [records, exercises] = await Promise.all([
      fetchHistory(session.user.id),
      fetchCustomExercises(session.user.id),
    ])
    setHistory(records)
    setCustomExercises(exercises)
  }, [session])

  const handleCustomExerciseAdded = useCallback((exercise) => {
    setCustomExercises((anterior) => [exercise, ...anterior])
  }, [])

  const handlePeriodChange = useCallback((nextPeriod, nextMonthOffset = 0) => {
    setPeriod(nextPeriod)
    setMonthOffset(nextPeriod === 'month' ? nextMonthOffset : 0)
  }, [])

  function abrirPerfil() {
    setProfileName(nombre)
    setProfileError('')
    setProfileOpen(true)
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    const nuevoNombre = profileName.trim()

    if (!nuevoNombre) {
      setProfileError('Escribe tu nombre para guardarlo.')
      return
    }

    setProfileSaving(true)
    setProfileError('')

    const { error } = await supabase.auth.updateUser({
      data: { ...(session?.user?.user_metadata ?? {}), display_name: nuevoNombre },
    })

    if (error) {
      setProfileError('No se pudo guardar tu nombre. Inténtalo de nuevo.')
    } else {
      setSession((actual) =>
        actual
          ? {
              ...actual,
              user: {
                ...actual.user,
                user_metadata: { ...actual.user.user_metadata, display_name: nuevoNombre },
              },
            }
          : actual,
      )
      setProfileOpen(false)
    }

    setProfileSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setHistory([])
    setCustomExercises([])
    setDataError('')
    setView('dashboard')
  }

  function handleSelectGroup(groupId) {
    const group = MUSCLE_GROUPS.find((item) => item.id === groupId) ?? MUSCLE_GROUPS[0]
    setSelectedGroup(group)
    setView('workout')
  }

  if (!isSupabaseConfigured) {
    return <ConfigurationScreen />
  }

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <AtlasLogin />
  }

  function renderView() {
    switch (view) {
      case 'workout':
        return (
          <WorkoutView
            group={selectedGroup}
            history={history}
            customExercises={customExercises}
            userId={session.user.id}
            onBack={() => setView('dashboard')}
            onSetsSaved={refreshData}
            onCustomExerciseAdded={handleCustomExerciseAdded}
            onNavigate={setView}
          />
        )
      case 'history':
        return (
          <HistoryView
            history={history}
            userId={session.user.id}
            onNavigate={setView}
          />
        )
      case 'progress':
        return (
          <ProgressView
            history={history}
            period={period}
            monthOffset={monthOffset}
            onPeriodChange={handlePeriodChange}
          />
        )
      case 'summary':
        return (
          <SummaryView
            history={history}
            period={period}
            monthOffset={monthOffset}
            onPeriodChange={handlePeriodChange}
            onNavigate={setView}
          />
        )
      default:
        return (
          <Dashboard
            history={history}
            customExercises={customExercises}
            firstName={saludo}
            onEditName={abrirPerfil}
            onSelectGroup={handleSelectGroup}
            onNavigate={setView}
          />
        )
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-obsidian text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed inset-0 bg-aurora" />

      <div className="relative flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/5 bg-black/25 px-4 py-6 backdrop-blur-xl lg:flex">
          <div className="px-2">
            <Brand />
          </div>

          <nav className="mt-10 space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={view === item.id}
                onClick={() => setView(item.id)}
              />
            ))}
          </nav>

          <div className="mt-auto">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                  <UserRound className="h-5 w-5" />
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white" title={nombre || 'Atleta'}>
                      {nombre || 'Atleta'}
                    </p>
                    <button
                      type="button"
                      onClick={abrirPerfil}
                      aria-label="Editar nombre"
                      className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-cyan-200"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">Sesión activa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-400 transition hover:border-rose-400/30 hover:text-rose-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] tracking-[0.2em] text-slate-700">ATLAS · V 1.0</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-obsidian/85 px-4 py-3 backdrop-blur-xl lg:hidden">
            <Brand compact />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
            {dataLoading && (
              <div className="mb-5 flex items-center gap-2 text-[11px] text-slate-500">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                Sincronizando datos…
              </div>
            )}

            {dataError && (
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-rose-100">
                  No se pudieron cargar tus datos: {dataError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDataLoading(true)
                    setDataError('')
                    setRetryToken((token) => token + 1)
                  }}
                  className="shrink-0 rounded-lg border border-rose-400/30 px-3 py-1.5 text-[11px] font-semibold text-rose-100 transition hover:bg-rose-400/10"
                >
                  Reintentar
                </button>
              </div>
            )}

            {renderView()}
          </main>

          <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-obsidian/95 px-2 pt-2 backdrop-blur-xl lg:hidden">
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={view === item.id}
                onClick={() => setView(item.id)}
                compact
              />
            ))}
          </nav>
        </div>
      </div>

      {profileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="glass-strong w-full max-w-md rounded-3xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-perfil"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
              <Pencil className="h-5 w-5" />
            </div>
            <h2 id="titulo-perfil" className="mt-5 font-display text-xl font-bold text-white">
              Editar nombre
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Así te saludaremos en tu panel de Atlas.
            </p>

            {profileError && (
              <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {profileError}
              </p>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-5">
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-400">Nombre completo</span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  autoFocus
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </label>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {profileSaving ? 'Guardando…' : 'Guardar nombre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
