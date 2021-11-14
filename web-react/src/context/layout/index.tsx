import React from 'react'

const initialContextState = {
  barTitle: '',
  setBarTitle: () => {},
}
type Context = {
  barTitle: string
  setBarTitle: React.Dispatch<React.SetStateAction<string>>
}
const LayoutContext = React.createContext<Context>(initialContextState)
export { initialContextState, LayoutContext as default }
