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

const DAY_MS = 24 * 60 * 60 * 1000
const pad = (value) => String(value).padStart(2, '0')

export function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7))
  return copy
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

function weekBounds(offsetWeeks = 0) {
  const start = startOfWeek()
  start.setDate(start.getDate() + offsetWeeks * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
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
    (total, set) => total + Number(set.weight_kg) * Number(set.reps),
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
      .reduce((total, set) => total + Number(set.weight_kg) * Number(set.reps), 0)
    return result
  }, {})
}

const estimateMax = (set) => Number(set.weight_kg) * (1 + Number(set.reps) / 30)

export function getStrengthComparison(history) {
  const currentBounds = weekBounds(0)
  const previousBounds = weekBounds(-1)

  const bestByWeek = (bounds) =>
    history.reduce((result, set) => {
      const date = new Date(set.created_at)
      if (date < bounds.start || date >= bounds.end) return result
      result[set.exercise_id] = Math.max(result[set.exercise_id] ?? 0, estimateMax(set))
      return result
    }, {})

  const current = bestByWeek(currentBounds)
  const previous = bestByWeek(previousBounds)

  return Object.keys(current)
    .map((id) => ({
      id,
      name: EXERCISES[id]?.name ?? id,
      current: current[id],
      previous: previous[id] ?? 0,
      delta: previous[id] ? ((current[id] - previous[id]) / previous[id]) * 100 : 0,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 5)
}

export function getBestDay(history) {
  const volumes = getDailyVolumes(history)
  const days = getWeekDays()
  return days.reduce(
    (best, day) => (volumes[day.key] > best.volume ? { label: day.label, volume: volumes[day.key] } : best),
    { label: '—', volume: 0 },
  )
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
