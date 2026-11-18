import { supabase } from '../../lib/supabase'

// Picks one active phrase deterministically per day so every student
// sees the same phrase, and it rotates at UTC midnight.
export async function fetchDailyMotivation() {
  const { data, error } = await supabase
    .from('motivation_phrases')
    .select('id, phrase')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    return null
  }

  const dayIndex = Math.floor(Date.now() / 86400000)
  return data[dayIndex % data.length]
}

export async function fetchAllMotivationPhrases() {
  const { data, error } = await supabase
    .from('motivation_phrases')
    .select('id, phrase, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createMotivationPhrase({ phrase }) {
  const { data, error } = await supabase
    .from('motivation_phrases')
    .insert({
      phrase,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return data.id
}

export async function updateMotivationPhrase(id, { phrase, isActive }) {
  const { error } = await supabase
    .from('motivation_phrases')
    .update({
      phrase,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function deleteMotivationPhrase(id) {
  const { error } = await supabase.from('motivation_phrases').delete().eq('id', id)

  if (error) {
    throw error
  }
}
