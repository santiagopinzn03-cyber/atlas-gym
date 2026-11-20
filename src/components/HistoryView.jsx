import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Dumbbell, Layers, Weight } from 'lucide-react'
import {
  dateKey,
  formatFullDate,
  formatKg,
  formatShortDate,
  formatTime,
  formatWeight,
  getGroupName,
  groupSetsByDay,
  groupSetsByExercise,
} from '../lib/atlasData'
import { fetchUserExerciseNotes } from '../lib/historyStore'

function NotasCell({ notas }) {
  if (notas.length === 0) {
    return <span className="text-slate-600">—</span>
  }

  return (
    <div className="space-y-2">
      {notas.map((nota) => (
        <div key={nota.id}>
          <p className="text-[10px] font-semibold text-cyan-300">{formatTime(nota.createdAt)}</p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-300">
            {nota.content}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function HistoryView({ history, userId, onNavigate }) {
  const diasConSeries = useMemo(() => groupSetsByDay(history), [history])
  const [notas, setNotas] = useState([])
  const [hoy] = useState(() => dateKey(new Date()))

  const diasConNotas = useMemo(() => {
    const mapa = new Map()

    notas.forEach((nota) => {
      const fecha = new Date(nota.createdAt)
      const clave = dateKey(fecha)

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          key: clave,
          date: fecha,
          sets: [],
          volume: 0,
          exerciseCount: 0,
          groups: [],
          noteCount: 0,
        })
      }

      mapa.get(clave).noteCount += 1
    })

    return [...mapa.values()]
  }, [notas])

  const days = useMemo(() => {
    const mapa = new Map()

    diasConSeries.forEach((dia) => mapa.set(dia.key, { noteCount: 0, ...dia }))

    diasConNotas.forEach((dia) => {
      if (mapa.has(dia.key)) {
        mapa.set(dia.key, { ...mapa.get(dia.key), noteCount: dia.noteCount })
      } else {
        mapa.set(dia.key, dia)
      }
    })

    return [...mapa.values()].sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [diasConSeries, diasConNotas])

  const [selectedDay, setSelectedDay] = useState(() => days[0]?.key ?? dateKey(new Date()))

  const selected = useMemo(
    () => days.find((dia) => dia.key === selectedDay) ?? null,
    [days, selectedDay],
  )
  const selectedDate = useMemo(() => {
    const [anio, mes, dia] = selectedDay.split('-').map(Number)
    return new Date(anio, mes - 1, dia)
  }, [selectedDay])

  const notasPorEjercicio = useMemo(() => {
    const mapa = new Map()

    notas
      .filter((nota) => dateKey(new Date(nota.createdAt)) === selectedDay)
      .forEach((nota) => {
        if (!mapa.has(nota.exerciseId)) {
          mapa.set(nota.exerciseId, {
            id: nota.exerciseId,
            name: nota.exerciseName || nota.exerciseId,
            notes: [],
          })
        }

        mapa.get(nota.exerciseId).notes.push(nota)
      })

    return [...mapa.values()].map((grupo) => ({
      ...grupo,
      notes: [...grupo.notes].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    }))
  }, [notas, selectedDay])

  const ejercicios = useMemo(() => {
    const notasPorId = new Map(notasPorEjercicio.map((grupo) => [grupo.id, grupo.notes]))
    const conSeries = groupSetsByExercise(selected?.sets ?? []).map((ejercicio) => ({
      ...ejercicio,
      notas: notasPorId.get(ejercicio.id) ?? [],
    }))
    const idsConSeries = new Set(conSeries.map((ejercicio) => ejercicio.id))
    const soloNotas = notasPorEjercicio
      .filter((grupo) => !idsConSeries.has(grupo.id))
      .map((grupo) => ({
        id: grupo.id,
        name: grupo.name,
        muscleGroup: '',
        sets: [],
        volume: 0,
        notas: grupo.notes,
      }))

    return [...conSeries, ...soloNotas]
  }, [selected, notasPorEjercicio])

  useEffect(() => {
    let active = true

    fetchUserExerciseNotes(userId)
      .then((notasGuardadas) => {
        if (active) setNotas(notasGuardadas)
      })
      .catch(() => {
        if (active) setNotas([])
      })

    return () => {
      active = false
    }
  }, [userId])

  function handleDateChange(event) {
    const valor = event.target.value
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) setSelectedDay(valor)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            Bitácora de entrenamiento
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Historial por día
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Consulta qué ejercicios hiciste cada fecha, cuántas series moviste y qué notas dejaste por ejercicio.
          </p>
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

      <section className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Elegir fecha</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Cada serie y cada nota quedan guardadas en tu cuenta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-slate-400">
              <CalendarDays className="h-4 w-4 text-cyan-300/70" />
              <input
                type="date"
                value={selectedDay}
                max={hoy}
                onChange={handleDateChange}
                aria-label="Fecha del historial"
                className="bg-transparent text-xs text-slate-100 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedDay(hoy)}
              className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Hoy
            </button>
          </div>
        </div>

        {days.length > 0 && (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {days.map((dia) => (
              <button
                key={dia.key}
                type="button"
                onClick={() => setSelectedDay(dia.key)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                  dia.key === selectedDay
                    ? 'border-cyan-400/50 bg-cyan-400/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-sky-400/30'
                }`}
              >
                <span className="block text-[11px] font-semibold text-slate-200">
                  {formatShortDate(dia.date)}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {dia.exerciseCount > 0
                    ? `${formatKg(dia.volume)} kg · ${dia.exerciseCount} ejercicios`
                    : 'Solo notas'}
                  {dia.noteCount > 0 ? ` · ${dia.noteCount} notas` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div>
        <h2 className="font-display text-xl font-bold text-white">{formatFullDate(selectedDate)}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {selected?.exerciseCount
            ? 'Detalle de la sesión registrada.'
            : selected
              ? 'Solo notas registradas en esta fecha.'
              : 'No hay series ni notas registradas para esta fecha.'}
        </p>
      </div>

      {ejercicios.length > 0 ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="glass rounded-2xl p-5">
              <Weight className="h-5 w-5 text-cyan-300" />
              <p className="mt-5 font-display text-2xl font-bold text-white">
                {formatKg(selected?.volume ?? 0)} kg
              </p>
              <p className="mt-1 text-xs text-slate-400">Volumen total</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <Layers className="h-5 w-5 text-sky-300" />
              <p className="mt-5 font-display text-2xl font-bold text-white">{selected?.sets.length ?? 0}</p>
              <p className="mt-1 text-xs text-slate-400">Series registradas</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <Dumbbell className="h-5 w-5 text-violet-300" />
              <p className="mt-5 font-display text-2xl font-bold text-white">{selected?.exerciseCount ?? 0}</p>
              <p className="mt-1 text-xs text-slate-400">Ejercicios</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <CalendarDays className="h-5 w-5 text-amber-300" />
              <p className="mt-5 text-sm font-bold leading-snug text-white">
                {(selected?.groups ?? []).length > 0
                  ? selected.groups.map(getGroupName).join(' + ')
                  : 'Sin grupo'}
              </p>
              <p className="mt-1 text-xs text-slate-400">Rutina del día</p>
            </div>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-semibold text-white">Ejercicios de esta sesión</h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Orden por volumen
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {ejercicios.map((ejercicio) => (
                <div key={ejercicio.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-cyan-300/70">
                        {getGroupName(ejercicio.muscleGroup) || 'Sin grupo'}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-white">{ejercicio.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-bold text-cyan-200">
                        {formatKg(ejercicio.volume)} kg
                      </p>
                      <p className="text-[10px] text-slate-500">{ejercicio.sets.length} series</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.03] text-[10px] uppercase tracking-widest text-slate-600">
                          <th className="px-3 py-2 font-medium">Hora</th>
                          <th className="px-3 py-2 font-medium">Serie</th>
                          <th className="px-3 py-2 font-medium">Peso</th>
                          <th className="px-3 py-2 font-medium">Volumen</th>
                          <th className="min-w-[220px] px-3 py-2 font-medium">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ejercicio.sets.length > 0 ? (
                          ejercicio.sets.map((set, index) => (
                            <tr key={set.id} className="border-b border-white/5 last:border-b-0">
                              <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                                {formatTime(set.created_at)}
                              </td>
                              <td className="px-3 py-2.5 text-slate-300">
                                Serie {index + 1} · {set.reps} repeticiones
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-white">
                                {formatWeight(set.weight_kg)} kg
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-cyan-300">
                                {formatKg(Number(set.weight_kg) * Number(set.reps))} kg
                              </td>
                              {index === 0 && (
                                <td
                                  rowSpan={ejercicio.sets.length}
                                  className="min-w-[220px] px-3 py-2.5 align-top"
                                >
                                  <NotasCell notas={ejercicio.notas} />
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-white/5 last:border-b-0">
                            <td className="px-3 py-2.5 text-slate-600">—</td>
                            <td className="px-3 py-2.5 text-slate-600">—</td>
                            <td className="px-3 py-2.5 text-slate-600">—</td>
                            <td className="px-3 py-2.5 text-slate-600">—</td>
                            <td className="min-w-[220px] px-3 py-2.5 align-top">
                              <NotasCell notas={ejercicio.notas} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {ejercicio.best ? (
                    <p className="mt-3 text-[11px] text-slate-500">
                      Mejor serie: {formatWeight(ejercicio.best.weight_kg)} kg × {ejercicio.best.reps} repeticiones
                    </p>
                  ) : (
                    <p className="mt-3 text-[11px] text-slate-500">Solo notas registradas para este ejercicio.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="glass rounded-2xl p-8 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-4 text-sm font-semibold text-white">Sin series ni notas registradas</p>
          <p className="mt-2 text-xs text-slate-500">
            Registra una serie o escribe una nota en esa fecha para verla aquí con todo su detalle.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('workout')}
            className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Ir a entrenar
          </button>
        </section>
      )}

    </div>
  )
}
