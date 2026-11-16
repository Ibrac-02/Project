import {
  DocumentIcon,
  LightbulbIcon,
  NotesIcon,
  TargetIcon,
} from './Icons'

export function resourceIconId(id) {
  switch (id) {
    case 'past-papers':
      return DocumentIcon
    case 'notes':
      return NotesIcon
    case 'scope':
      return TargetIcon
    case 'motivation':
      return LightbulbIcon
    default:
      return DocumentIcon
  }
}
