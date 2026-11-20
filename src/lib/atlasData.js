import { CircleDot, Dumbbell, Footprints, Hand, Layers, Target } from 'lucide-react'

export const MUSCLE_GROUPS = [
  {
    id: 'pecho',
    name: 'Pecho',
    icon: Dumbbell,
    exerciseIds: ['press-banca', 'press-inclinado', 'aperturas'],
    gradient: 'from-sky-400/25 to-cyan-400/5',
  },
  {
    id: 'espalda',
    name: 'Espalda',
    icon: Layers,
    exerciseIds: ['dominadas', 'remo-barra', 'jalon'],
    gradient: 'from-cyan-400/25 to-sky-400/5',
  },
  {
    id: 'piernas',
    name: 'Piernas',
    icon: Footprints,
    exerciseIds: ['sentadilla', 'peso-muerto', 'zancadas'],
    gradient: 'from-sky-500/25 to-cyan-500/5',
  },
  {
    id: 'hombros',
    name: 'Hombros',
    icon: Target,
    exerciseIds: ['press-militar', 'elevaciones', 'remo-menton'],
    gradient: 'from-cyan-300/25 to-sky-500/5',
  },
  {
    id: 'brazos',
    name: 'Brazos',
    icon: Hand,
    exerciseIds: ['curl-biceps', 'fondos', 'curl-martillo'],
    gradient: 'from-sky-400/20 to-cyan-400/5',
  },
  {
    id: 'core',
    name: 'Core',
    icon: CircleDot,
    exerciseIds: ['plancha', 'abdominales', 'elevacion-piernas'],
    gradient: 'from-cyan-400/20 to-sky-400/5',
  },
]

export const EXERCISES = {
  'press-banca': { id: 'press-banca', name: 'Press banca', group: 'pecho', equipment: 'Barra' },
  'press-inclinado': { id: 'press-inclinado', name: 'Press inclinado', group: 'pecho', equipment: 'Mancuernas' },
  aperturas: { id: 'aperturas', name: 'Aperturas', group: 'pecho', equipment: 'Mancuernas' },
  dominadas: { id: 'dominadas', name: 'Dominadas', group: 'espalda', equipment: 'Barra' },
  'remo-barra': { id: 'remo-barra', name: 'Remo con barra', group: 'espalda', equipment: 'Barra' },
  jalon: { id: 'jalon', name: 'Jalón abierto', group: 'espalda', equipment: 'Máquina' },
  sentadilla: { id: 'sentadilla', name: 'Sentadilla', group: 'piernas', equipment: 'Barra' },
  'peso-muerto': { id: 'peso-muerto', name: 'Peso muerto', group: 'piernas', equipment: 'Barra' },
  zancadas: { id: 'zancadas', name: 'Zancadas', group: 'piernas', equipment: 'Mancuernas' },
  'press-militar': { id: 'press-militar', name: 'Press militar', group: 'hombros', equipment: 'Barra' },
  elevaciones: { id: 'elevaciones', name: 'Elevaciones laterales', group: 'hombros', equipment: 'Mancuernas' },
  'remo-menton': { id: 'remo-menton', name: 'Remo al mentón', group: 'hombros', equipment: 'Barra' },
  'curl-biceps': { id: 'curl-biceps', name: 'Curl de bíceps', group: 'brazos', equipment: 'Barra' },
  fondos: { id: 'fondos', name: 'Fondos', group: 'brazos', equipment: 'Paralelas' },
  'curl-martillo': { id: 'curl-martillo', name: 'Curl martillo', group: 'brazos', equipment: 'Mancuernas' },
  plancha: { id: 'plancha', name: 'Plancha', group: 'core', equipment: 'Peso corporal' },
  abdominales: { id: 'abdominales', name: 'Abdominales', group: 'core', equipment: 'Peso corporal' },
  'elevacion-piernas': { id: 'elevacion-piernas', name: 'Elevación de piernas', group: 'core', equipment: 'Peso corporal' },
}

export const DAILY_TARGET_KG = 8000
export const WEEK_DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const MONTH_LABELS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const PERIOD_OPTIONS = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' },
]

const DAY_MS = 24 * 60 * 60 * 1000
const pad = (value) => String(value).padStart(2, '0')
const volumeOf = (set) => Number(set.weight_kg) * Number(set.reps)

export function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7))
  return copy
}

function startOfMonth(date = new Date(), offsetMonths = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offsetMonths, 1)
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function weekBounds(offsetWeeks = 0, reference = new Date()) {
  const start = startOfWeek(reference)
  start.setDate(start.getDate() + offsetWeeks * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

export function getPeriodBounds(period = 'week', monthOffset = 0, reference = new Date()) {
  if (period === 'month') {
    const start = startOfMonth(reference, monthOffset)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
    return { start, end }
  }

  if (period === 'year') {
    const year = reference.getFullYear()
    return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) }
  }

  return weekBounds(0, reference)
}

export function getComparisonBounds(period = 'week', monthOffset = 0, reference = new Date()) {
  if (period === 'month') return getPeriodBounds('month', monthOffset - 1, reference)

  if (period === 'year') {
    const year = reference.getFullYear() - 1
    return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) }
  }

  return weekBounds(-1, reference)
}

export function filterSetsByPeriod(history = [], period = 'week', monthOffset = 0) {
  const { start, end } = getPeriodBounds(period, monthOffset)

  return history.filter((set) => {
    const date = new Date(set.created_at)
    return date >= start && date < end
  })
}

export function getPeriodSets(history = [], period = 'week', monthOffset = 0) {
  return filterSetsByPeriod(history, period, monthOffset)
}

function tonnageBetween(history = [], bounds) {
  return history.reduce((total, set) => {
    const date = new Date(set.created_at)
    return date >= bounds.start && date < bounds.end ? total + volumeOf(set) : total
  }, 0)
}

function volumeBetween(sets = [], start, end) {
  return sets.reduce((total, set) => {
    const date = new Date(set.created_at)
    return date >= start && date < end ? total + volumeOf(set) : total
  }, 0)
}

export function getPeriodTonnage(history = [], period = 'week', monthOffset = 0) {
  return tonnageBetween(history, getPeriodBounds(period, monthOffset))
}

export function getPreviousPeriodTonnage(history = [], period = 'week', monthOffset = 0) {
  return tonnageBetween(history, getComparisonBounds(period, monthOffset))
}

export function getPeriodSessions(history = [], period = 'week', monthOffset = 0) {
  return new Set(
    getPeriodSets(history, period, monthOffset).map((set) => dateKey(new Date(set.created_at))),
  ).size
}

export function getPeriodExpectedDays(period = 'week', monthOffset = 0) {
  const now = new Date()

  if (period === 'month') {
    return daysInMonth(now.getFullYear(), now.getMonth() + monthOffset)
  }

  if (period === 'year') {
    const year = now.getFullYear()
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
  }

  return 7
}

export function getPeriodBuckets(history = [], period = 'week', monthOffset = 0) {
  const sets = getPeriodSets(history, period, monthOffset)
  const now = new Date()
  const { start } = getPeriodBounds(period, monthOffset, now)

  if (period === 'year') {
    const year = start.getFullYear()

    return MONTH_LABELS_SHORT.map((label, index) => {
      const bucketStart = new Date(year, index, 1)
      const bucketEnd = new Date(year, index + 1, 1)

      return {
        key: `${year}-${pad(index + 1)}`,
        label,
        volume: volumeBetween(sets, bucketStart, bucketEnd),
        target: DAILY_TARGET_KG * daysInMonth(year, index),
        isToday: year === now.getFullYear() && index === now.getMonth(),
        isFuture: bucketStart > now,
      }
    })
  }

  if (period === 'month') {
    const totalDays = daysInMonth(start.getFullYear(), start.getMonth())

    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), index + 1)
      const next = new Date(date)
      next.setDate(next.getDate() + 1)

      return {
        key: dateKey(date),
        label: String(index + 1),
        volume: volumeBetween(sets, date, next),
        target: DAILY_TARGET_KG,
        isToday: dateKey(date) === dateKey(now),
        isFuture: date > now,
      }
    })
  }

  return WEEK_DAY_LABELS.map((label, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const next = new Date(date)
    next.setDate(next.getDate() + 1)

    return {
      key: dateKey(date),
      label,
      volume: volumeBetween(sets, date, next),
      target: DAILY_TARGET_KG,
      isToday: dateKey(date) === dateKey(now),
      isFuture: date > now,
    }
  })
}

export function getPeriodBestDay(history = [], period = 'week', monthOffset = 0) {
  return getPeriodBuckets(history, period, monthOffset).reduce(
    (best, bucket) => (bucket.volume > best.volume ? { label: bucket.label, volume: bucket.volume } : best),
    { label: '—', volume: 0 },
  )
}

export function formatPeriodLabel(period = 'week', monthOffset = 0) {
  const now = new Date()

  if (period === 'month') {
    const text = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
      startOfMonth(now, monthOffset),
    )
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  if (period === 'year') return String(now.getFullYear())

  return 'Semana actual'
}

export function getTonnageLabel(period = 'week', monthOffset = 0) {
  if (period === 'week') return 'Tonelaje semanal'
  return `Tonelaje de ${formatPeriodLabel(period, monthOffset).toLowerCase()}`
}

export function getComparisonLabel(period = 'week', monthOffset = 0) {
  if (period === 'week') return 'frente a la semana anterior'
  if (period === 'month') return `frente a ${formatPeriodLabel('month', monthOffset - 1).toLowerCase()}`
  return `frente a ${new Date().getFullYear() - 1}`
}

export function getSemaphoreLabel(period = 'week', monthOffset = 0) {
  if (period === 'week') return 'Semáforo semanal'
  if (period === 'month') return `Semáforo de ${formatPeriodLabel('month', monthOffset).toLowerCase()}`
  return `Semáforo de ${new Date().getFullYear()}`
}

export function getPeriodTitle(period = 'week') {
  if (period === 'month') return 'Tu mes en números'
  if (period === 'year') return 'Tu año en números'
  return 'Tu semana en números'
}

export function getLastSet(history, exerciseId) {
  return history.find((set) => set.exercise_id === exerciseId) ?? null
}

export function getStreak(history) {
  const days = new Set(history.map((set) => dateKey(new Date(set.created_at))))
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)

  if (!days.has(dateKey(cursor))) {
    cursor.setTime(cursor.getTime() - DAY_MS)
  }

  let streak = 0
  while (days.has(dateKey(cursor))) {
    streak += 1
    cursor.setTime(cursor.getTime() - DAY_MS)
  }
  return streak
}

export function getWeekDays() {
  const now = new Date()
  const monday = startOfWeek(now)
  return WEEK_DAY_LABELS.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      label,
      key: dateKey(date),
      isToday: dateKey(date) === dateKey(now),
      isFuture: date.getTime() > now.getTime(),
    }
  })
}

export function getWeekSets(history, offsetWeeks = 0) {
  const { start, end } = weekBounds(offsetWeeks)
  return history.filter((set) => {
    const date = new Date(set.created_at)
    return date >= start && date < end
  })
}

export function getWeeklyTonnage(history, offsetWeeks = 0) {
  return getWeekSets(history, offsetWeeks).reduce(
    (total, set) => total + volumeOf(set),
    0,
  )
}

export function getWeeklySessions(history, offsetWeeks = 0) {
  return new Set(getWeekSets(history, offsetWeeks).map((set) => dateKey(new Date(set.created_at)))).size
}

export function getDailyVolumes(history) {
  return getWeekDays().reduce((result, day) => {
    result[day.key] = getWeekSets(history)
      .filter((set) => dateKey(new Date(set.created_at)) === day.key)
      .reduce((total, set) => total + volumeOf(set), 0)
    return result
  }, {})
}

const estimateMax = (set) => Number(set.weight_kg) * (1 + Number(set.reps) / 30)

export function getStrengthComparison(history = [], period = 'week', monthOffset = 0) {
  const currentBounds = getPeriodBounds(period, monthOffset)
  const previousBounds = getComparisonBounds(period, monthOffset)

  const names = history.reduce((result, set) => {
    if (!result[set.exercise_id]) {
      result[set.exercise_id] = set.exercise_name || EXERCISES[set.exercise_id]?.name || set.exercise_id
    }
    return result
  }, {})

  const bestByBounds = (bounds) =>
    history.reduce((result, set) => {
      const date = new Date(set.created_at)
      if (date < bounds.start || date >= bounds.end) return result
      result[set.exercise_id] = Math.max(result[set.exercise_id] ?? 0, estimateMax(set))
      return result
    }, {})

  const current = bestByBounds(currentBounds)
  const previous = bestByBounds(previousBounds)

  return Object.keys(current)
    .map((id) => ({
      id,
      name: names[id] ?? EXERCISES[id]?.name ?? id,
      current: current[id],
      previous: previous[id] ?? 0,
      delta: previous[id] ? ((current[id] - previous[id]) / previous[id]) * 100 : 0,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 5)
}

export function getBestDay(history) {
  return getPeriodBestDay(history, 'week')
}

export function getDaysAgoLabel(isoDate) {
  const then = new Date(isoDate)
  then.setHours(12, 0, 0, 0)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const days = Math.round((today.getTime() - then.getTime()) / DAY_MS)

  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

export function formatKg(value) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Math.round(value))
}

export function formatShortDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatFullDate(date = new Date()) {
  const text = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatTime(isoDate) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function getGroupName(id) {
  return MUSCLE_GROUPS.find((group) => group.id === id)?.name ?? id
}

export function groupSetsByDay(history = []) {
  const dias = new Map()

  history.forEach((set) => {
    const fecha = new Date(set.created_at)
    const clave = dateKey(fecha)

    if (!dias.has(clave)) {
      dias.set(clave, { key: clave, date: fecha, sets: [] })
    }

    dias.get(clave).sets.push(set)
  })

  return [...dias.values()]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((dia) => ({
      ...dia,
      sets: [...dia.sets].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
      volume: dia.sets.reduce((total, set) => total + volumeOf(set), 0),
      exerciseCount: new Set(dia.sets.map((set) => set.exercise_id)).size,
      groups: [...new Set(dia.sets.map((set) => set.muscle_group).filter(Boolean))],
    }))
}

export function groupSetsByExercise(sets = []) {
  const ejercicios = new Map()

  sets.forEach((set) => {
    if (!ejercicios.has(set.exercise_id)) {
      ejercicios.set(set.exercise_id, {
        id: set.exercise_id,
        name: set.exercise_name || EXERCISES[set.exercise_id]?.name || set.exercise_id,
        muscleGroup: set.muscle_group,
        sets: [],
      })
    }

    ejercicios.get(set.exercise_id).sets.push(set)
  })

  return [...ejercicios.values()]
    .map((ejercicio) => ({
      ...ejercicio,
      volume: ejercicio.sets.reduce((total, set) => total + volumeOf(set), 0),
      best: ejercicio.sets.reduce(
        (mejor, set) => (volumeOf(set) > volumeOf(mejor) ? set : mejor),
        ejercicio.sets[0],
      ),
    }))
    .sort((a, b) => b.volume - a.volume)
}

export function formatLongDate(date = new Date()) {
  const text = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatWeight(value) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value)
}
