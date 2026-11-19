import {
  DocumentIcon,
  HeartIcon,
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
    case 'study-tips':
      return LightbulbIcon
    case 'motivation':
      return HeartIcon
    default:
      return DocumentIcon
  }
}
