export function stringToColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `hsl(${h} 70% 35%)`
}

export function getInitials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email ? email.split('@')[0] : '')
  if (!base) return '?'
  const parts = base.split(/\s+|_|\./).filter(Boolean)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || base[0].toUpperCase()
}
