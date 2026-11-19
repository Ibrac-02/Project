const STORAGE_KEY = 'studywise-recently-viewed'

export function addToRecentlyViewed(id, title, type) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const current = stored ? JSON.parse(stored) : []
    const filtered = current.filter((item) => item.id !== id)
    const updated = [{ id, title, type }, ...filtered].slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}
