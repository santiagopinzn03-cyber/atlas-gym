import { supabase } from '../supabaseClient'

const SET_COLUMNS = 'id, exercise_id, exercise_name, muscle_group, weight_kg, reps, created_at'

function getClient() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

export async function fetchHistory(userId) {
  const client = getClient()
  const { data, error } = await client
    .from('workout_sets')
    .select(SET_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(600)

  if (error) throw error
  return data ?? []
}

export async function insertSet(userId, set) {
  const client = getClient()
  const { data, error } = await client
    .from('workout_sets')
    .insert({
      user_id: userId,
      exercise_id: set.exercise_id,
      exercise_name: set.exercise_name,
      muscle_group: set.muscle_group,
      weight_kg: Number(set.weight_kg),
      reps: Number(set.reps),
    })
    .select(SET_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function loadDayNote(userId, dayKey) {
  const client = getClient()
  const { data, error } = await client
    .from('workout_notes')
    .select('content')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .maybeSingle()

  if (error) throw error
  return data?.content ?? ''
}

export async function saveDayNote(userId, dayKey, content) {
  const client = getClient()
  const { error } = await client.from('workout_notes').upsert(
    {
      user_id: userId,
      day_key: dayKey,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id, day_key' },
  )

  if (error) throw error
  return content
}
