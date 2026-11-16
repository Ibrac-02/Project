import {
  HelpCircleIcon,
  InfoIcon,
  ProgressIcon,
  SearchIcon,
} from './Icons'

export function quickAccessIconId(id) {
  switch (id) {
    case 'search':
      return SearchIcon
    case 'progress':
      return ProgressIcon
    case 'help':
      return HelpCircleIcon
    case 'about':
      return InfoIcon
    default:
      return SearchIcon
  }
}
