import { useMemo, useState } from 'react'
import { NavigationContext } from './navigationContext'

export default function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')

  const value = useMemo(
    () => ({
      page,
      navigate: setPage,
    }),
    [page],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}
