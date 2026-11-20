import { supabase } from '../supabaseClient'

const SET_COLUMNS = 'id, usuario_id, ejercicio_id, nombre_ejercicio, grupo_muscular, peso_kg, repeticiones, creado_en'
const CUSTOM_EXERCISE_COLUMNS = 'id, user_id, muscle_group, name, equipment, created_at'
const NOTE_COLUMNS = 'id, user_id, ejercicio_id, nombre_ejercicio, content, creado_en'

function getClient() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

function toComponentSet(record) {
  return {
    id: record.id,
    exercise_id: record.ejercicio_id,
    exercise_name: record.nombre_ejercicio,
    muscle_group: record.grupo_muscular,
    weight_kg: Number(record.peso_kg),
    reps: Number(record.repeticiones),
    created_at: record.creado_en,
  }
}

function toCustomExercise(record) {
  return {
    id: record.id,
    group: record.muscle_group,
    name: record.name,
    equipment: record.equipment,
    created_at: record.created_at,
    custom: true,
  }
}

function toExerciseNote(record) {
  return {
    id: record.id,
    userId: record.user_id,
    exerciseId: record.ejercicio_id,
    exerciseName: record.nombre_ejercicio,
    content: record.content,
    createdAt: record.creado_en,
  }
}

export async function fetchHistory(userId) {
  const client = getClient()
  const { data, error } = await client
    .from('series_registro')
    .select(SET_COLUMNS)
    .eq('usuario_id', userId)
    .order('creado_en', { ascending: false })
    .limit(600)

  if (error) throw error
  return (data ?? []).map(toComponentSet)
}

export async function insertSet(userId, set) {
  const client = getClient()
  const { data, error } = await client
    .from('series_registro')
    .insert({
      usuario_id: userId,
      ejercicio_id: set.ejercicio_id ?? set.exercise_id,
      nombre_ejercicio: set.nombre_ejercicio ?? set.exercise_name,
      grupo_muscular: set.grupo_muscular ?? set.muscle_group,
      peso_kg: Number(set.peso_kg ?? set.weight_kg),
      repeticiones: Number(set.repeticiones ?? set.reps),
    })
    .select(SET_COLUMNS)
    .single()

  if (error) throw error
  return toComponentSet(data)
}

export async function fetchCustomExercises(userId) {
  const client = getClient()
  const { data, error } = await client
    .from('ejercicios_personalizados')
    .select(CUSTOM_EXERCISE_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toCustomExercise)
}

export async function insertCustomExercise(userId, { muscle_group, name, equipment }) {
  const client = getClient()
  const { data, error } = await client
    .from('ejercicios_personalizados')
    .insert({
      user_id: userId,
      muscle_group,
      name: name.trim(),
      equipment: (equipment ?? '').trim() || 'Sin equipo',
    })
    .select(CUSTOM_EXERCISE_COLUMNS)
    .single()

  if (error) throw error
  return toCustomExercise(data)
}

export async function fetchExerciseNotes(userId, exerciseId) {
  if (!userId || !exerciseId) return []

  const client = getClient()
  const { data, error } = await client
    .from('notas_entrenamiento')
    .select(NOTE_COLUMNS)
    .eq('user_id', userId)
    .eq('ejercicio_id', exerciseId)
    .order('creado_en', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toExerciseNote)
}

export async function fetchUserExerciseNotes(userId) {
  if (!userId) return []

  const client = getClient()
  const { data, error } = await client
    .from('notas_entrenamiento')
    .select(NOTE_COLUMNS)
    .eq('user_id', userId)
    .order('creado_en', { ascending: false })
    .limit(600)

  if (error) throw error
  return (data ?? []).map(toExerciseNote)
}

export async function insertExerciseNote(userId, { exercise_id, exercise_name, content }) {
  const client = getClient()
  const { data, error } = await client
    .from('notas_entrenamiento')
    .insert({
      user_id: userId,
      ejercicio_id: exercise_id,
      nombre_ejercicio: exercise_name,
      content: content.trim(),
    })
    .select(NOTE_COLUMNS)
    .single()

  if (error) throw error
  return toExerciseNote(data)
}
