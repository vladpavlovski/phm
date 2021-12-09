import React from 'react'

const initialContextState = {
  barTitle: '',
  setBarTitle: () => undefined,
}

type Context = {
  barTitle: string
  setBarTitle: React.Dispatch<React.SetStateAction<string>>
}
const LayoutContext = React.createContext<Context>(initialContextState)
export { initialContextState, LayoutContext as default }
