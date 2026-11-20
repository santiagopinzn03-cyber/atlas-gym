import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Mic,
  Minus,
  NotebookPen,
  Plus,
  Sparkles,
  Square,
  TrendingUp,
} from 'lucide-react'
import {
  EXERCISES,
  MUSCLE_GROUPS,
  formatKg,
  formatShortDate,
  formatTime,
  formatWeight,
  getDaysAgoLabel,
  getLastSet,
} from '../lib/atlasData'
import { fetchExerciseNotes, insertCustomExercise, insertExerciseNote, insertSet } from '../lib/historyStore'

function Stepper({ label, value, suffix, onStep, steps }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onStep(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          aria-label={`Reducir ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="text-center">
          <span className="font-display text-4xl font-bold text-white">{formatWeight(value)}</span>
          <span className="ml-1 text-sm text-slate-500">{suffix}</span>
        </div>
        <button
          type="button"
          onClick={() => onStep(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 transition hover:bg-cyan-400/20"
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {steps.map((step) => (
          <button
            key={step.label}
            type="button"
            onClick={() => onStep(step.value)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function WorkoutView({
  group,
  history,
  customExercises = [],
  userId,
  onBack,
  onSetsSaved,
  onCustomExerciseAdded,
  onNavigate,
}) {
  const activeGroup = group ?? MUSCLE_GROUPS[0]
  const baseExercises = useMemo(
    () => activeGroup.exerciseIds.map((id) => EXERCISES[id]).filter(Boolean),
    [activeGroup],
  )
  const exercises = useMemo(
    () => [...baseExercises, ...customExercises.filter((item) => item.group === activeGroup.id)],
    [baseExercises, customExercises, activeGroup],
  )

  const speechSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const [exerciseId, setExerciseId] = useState(() => exercises[0]?.id ?? '')
  const [weightOverride, setWeightOverride] = useState(null)
  const [repsOverride, setRepsOverride] = useState(null)
  const [sessionSets, setSessionSets] = useState([])
  const [noteText, setNoteText] = useState('')
  const [notesLoading, setNotesLoading] = useState(true)
  const [noteSaving, setNoteSaving] = useState(false)
  const [exerciseNotes, setExerciseNotes] = useState([])
  const [voiceState, setVoiceState] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [customFormOpen, setCustomFormOpen] = useState(false)
  const [customNombre, setCustomNombre] = useState('')
  const [customEquipo, setCustomEquipo] = useState('')
  const [customError, setCustomError] = useState('')
  const [customSaving, setCustomSaving] = useState(false)

  const recognitionRef = useRef(null)
  const toastTimer = useRef(null)

  const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0]
  const lastSet = useMemo(() => getLastSet(history, exercise.id), [history, exercise.id])
  const weight = weightOverride ?? (lastSet ? Number(lastSet.weight_kg) : 0)
  const reps = repsOverride ?? (lastSet ? Number(lastSet.reps) : 0)

  function selectExercise(id) {
    setExerciseId(id)
    setWeightOverride(null)
    setRepsOverride(null)
    setNoteText('')
    setExerciseNotes([])
    setNotesLoading(true)
    stopVoice()
  }

  function adjustWeight(delta) {
    setWeightOverride(Math.max(0, Math.round(((weightOverride ?? weight) + delta) * 10) / 10))
  }

  function adjustReps(delta) {
    setRepsOverride(Math.max(0, (repsOverride ?? reps) + delta))
  }

  useEffect(() => {
    let active = true

    fetchExerciseNotes(userId, exercise.id)
      .then((notas) => {
        if (active) {
          setExerciseNotes(notas)
          setNotesLoading(false)
        }
      })
      .catch(() => {
        if (active) setNotesLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, exercise.id])

  useEffect(
    () => () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  function showToast(message) {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2800)
  }

  function stopVoice() {
    if (recognitionRef.current) recognitionRef.current.stop()
    setVoiceState('idle')
    setTranscript('')
  }

  function toggleVoice() {
    if (voiceState === 'listening') {
      stopVoice()
      return
    }

    if (!speechSupported) {
      showToast('El dictado por voz no está disponible en este navegador.')
      return
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = 'es-CO'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let textoFinal = ''
        let textoParcial = ''

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index]
          if (result.isFinal) textoFinal += result[0].transcript
          else textoParcial += result[0].transcript
        }

        const final = textoFinal.trim()
        if (final) {
          setNoteText((anterior) => (anterior.trim() ? `${anterior.trim()} ${final}` : final))
        }
        setTranscript((textoParcial || final).trim())
      }

      recognition.onerror = (event) => {
        setVoiceState('idle')
        setTranscript('')
        const errores = {
          'not-allowed': 'Permiso de micrófono denegado.',
          'service-not-allowed': 'El servicio de voz no está disponible.',
          'no-speech': 'No se detectó voz. Inténtalo de nuevo.',
          network: 'No se pudo conectar con el servicio de voz.',
        }
        showToast(errores[event.error] || 'No se pudo usar el micrófono.')
      }

      recognition.onend = () => {
        setVoiceState('idle')
        setTranscript('')
      }

      recognitionRef.current = recognition
    }

    setVoiceState('listening')
    setTranscript('Escuchando…')

    try {
      recognitionRef.current.start()
    } catch {
      showToast('El dictado ya estaba en marcha.')
    }
  }

  async function handleCustomSubmit(event) {
    event.preventDefault()
    setCustomError('')

    const nombre = customNombre.trim()
    if (!nombre) {
      setCustomError('Escribe el nombre del ejercicio.')
      return
    }

    setCustomSaving(true)

    try {
      const nuevo = await insertCustomExercise(userId, {
        muscle_group: activeGroup.id,
        name: nombre,
        equipment: customEquipo.trim() || 'Sin equipo',
      })

      onCustomExerciseAdded?.(nuevo)
      selectExercise(nuevo.id)
      setCustomNombre('')
      setCustomEquipo('')
      setCustomFormOpen(false)
      showToast('Ejercicio agregado a tu entrenamiento')
    } catch {
      setCustomError('No se pudo guardar el ejercicio. Inténtalo de nuevo.')
    } finally {
      setCustomSaving(false)
    }
  }

  async function handleSaveSet() {
    setSaving(true)

    try {
      const record = await insertSet(userId, {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: activeGroup.id,
        weight_kg: weight,
        reps,
      })

      setSessionSets((previous) => [record, ...previous])
      showToast(`${formatWeight(record.weight_kg)} kg × ${record.reps} guardados`)
      await onSetsSaved?.()
    } catch (error) {
      showToast(error.message || 'No se pudo guardar la serie')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveExerciseNote() {
    const contenido = noteText.trim()
    if (!contenido) {
      showToast('Escribe una nota antes de guardarla.')
      return
    }

    setNoteSaving(true)

    try {
      const nota = await insertExerciseNote(userId, {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        content: contenido,
      })

      setExerciseNotes((anteriores) => [...anteriores, nota])
      stopVoice()
      setNoteText('')
      showToast('Nota guardada para este ejercicio')
    } catch {
      showToast('No se pudo guardar la nota')
    } finally {
      setNoteSaving(false)
    }
  }

  function handleFinish() {
    onNavigate('summary')
  }

  const sessionVolume = sessionSets.reduce(
    (total, set) => total + Number(set.weight_kg) * Number(set.reps),
    0,
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/70">
              Sesión activa
            </p>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {activeGroup.name}
            </h1>
          </div>
        </div>

        <div className="glass inline-flex w-fit items-center gap-3 rounded-full px-4 py-2 text-xs text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          {sessionSets.length} series · {formatKg(sessionVolume)} kg movidos
        </div>
      </header>

      <div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {exercises.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectExercise(item.id)}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                item.id === exercise.id
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-sky-400/30 hover:text-slate-200'
              }`}
            >
              {item.name}
              {item.custom && (
                <span className="ml-1.5 text-[9px] uppercase tracking-wider text-cyan-400/60">propio</span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setCustomFormOpen((abierto) => !abierto)
            setCustomError('')
          }}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          {customFormOpen ? 'Ocultar formulario' : '+ Agregar ejercicio'}
        </button>

        {customFormOpen && (
          <form onSubmit={handleCustomSubmit} className="glass mt-3 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white">
              Nuevo ejercicio para {activeGroup.name}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Se guardará en tu cuenta y aparecerá también en el panel.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-400">Nombre del ejercicio</span>
                <input
                  type="text"
                  value={customNombre}
                  onChange={(event) => setCustomNombre(event.target.value)}
                  placeholder="Ej. Remo con cable cerrado"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-400">Equipo</span>
                <input
                  type="text"
                  value={customEquipo}
                  onChange={(event) => setCustomEquipo(event.target.value)}
                  placeholder="Ej. Máquina, barra, mancuernas"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </label>
            </div>

            {customError && (
              <p className="mt-3 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                {customError}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomFormOpen(false)
                  setCustomError('')
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={customSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
              >
                {customSaving ? 'Guardando…' : 'Guardar ejercicio'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-7">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{exercise.equipment}</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">{exercise.name}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/5 px-3 py-1.5 text-[11px] font-semibold text-cyan-200">
                {lastSet ? <Brain className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {lastSet ? 'Memoria activa' : 'Sin historial'}
              </span>
            </div>

            {lastSet ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-cyan-300" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Última vez: {formatWeight(lastSet.weight_kg)} kg × {lastSet.reps} repeticiones
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {getDaysAgoLabel(lastSet.created_at)} · valores cargados automáticamente
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Listo para superarlos
                </span>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500">
                Sin historial para este ejercicio. Empieza desde 0 kg y 0 repeticiones.
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Stepper
                label="Peso"
                value={weight}
                suffix="kg"
                onStep={adjustWeight}
                steps={[
                  { label: '+2,5', value: 2.5 },
                  { label: '+5', value: 5 },
                  { label: '+10', value: 10 },
                ]}
              />
              <Stepper
                label="Repeticiones"
                value={reps}
                suffix="repeticiones"
                onStep={adjustReps}
                steps={[
                  { label: '+1', value: 1 },
                  { label: '+2', value: 2 },
                  { label: '+5', value: 5 },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSet}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4 text-sm font-bold text-slate-950 shadow-[0_12px_40px_-14px_rgba(34,211,238,0.9)] transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar serie'}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4 text-cyan-300" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Notas de {exercise.name}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Escribe o dicta una nota técnica solo para este ejercicio.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-600">
                  Dictado en español
                </span>
              </div>

              <button
                type="button"
                onClick={toggleVoice}
                disabled={!speechSupported}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition disabled:opacity-40 ${
                  voiceState === 'listening'
                    ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                    : 'border-cyan-400/25 bg-cyan-400/5 text-cyan-100 hover:bg-cyan-400/10'
                }`}
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  {voiceState === 'listening' && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400/40 animate-ping-ring" />
                  )}
                  {voiceState === 'listening' ? (
                    <Square className="relative h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Mic className="relative h-4 w-4" />
                  )}
                </span>
                {voiceState === 'listening'
                  ? 'Detener dictado'
                  : speechSupported
                    ? 'Dictar nota con voz'
                    : 'Dictado no disponible'}
              </button>

              {transcript && (
                <p className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-[11px] text-cyan-200/90">
                  “{transcript}”
                </p>
              )}

              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                rows={4}
                disabled={notesLoading}
                placeholder={
                  notesLoading
                    ? 'Cargando notas…'
                    : 'Técnica, sensaciones, ajustes para la próxima serie…'
                }
                className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />

              <button
                type="button"
                onClick={handleSaveExerciseNote}
                disabled={noteSaving || !noteText.trim()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                {noteSaving ? 'Guardando nota…' : 'Guardar nota'}
              </button>

              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Historial de notas
                </p>

                {exerciseNotes.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-500">
                    Aún no hay notas guardadas para este ejercicio.
                  </p>
                ) : (
                  <ol className="no-scrollbar mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {exerciseNotes.map((nota) => (
                      <li key={nota.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
                        <p className="text-[10px] font-semibold text-cyan-300">
                          {formatShortDate(new Date(nota.createdAt))} · {formatTime(nota.createdAt)}
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                          {nota.content}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white">Series de esta sesión</h2>
            {sessionSets.length === 0 ? (
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Aún no hay series registradas. Guarda tu primera serie para empezar.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {sessionSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="truncate text-xs text-slate-300">{set.exercise_name}</span>
                    <span className="shrink-0 text-xs font-semibold text-cyan-200">
                      {formatWeight(set.weight_kg)} kg × {set.reps}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">¿Todo listo por hoy?</p>
          <p className="mt-0.5 text-xs text-slate-500">Cierra la sesión y revisa tu resumen semanal.</p>
        </div>
        <button
          type="button"
          onClick={handleFinish}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Finalizar entrenamiento
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan-400/30 bg-slate-950/95 px-5 py-2.5 text-xs font-semibold text-cyan-100 shadow-2xl backdrop-blur lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  )
}
