import React from 'react'

const initialContextState = {
  barTitle: '',
  setBarTitle: (): void => undefined,
}

type Context = {
  barTitle: string
  setBarTitle: React.Dispatch<React.SetStateAction<string>>
}
const LayoutContext = React.createContext<Context>(initialContextState)
export { initialContextState, LayoutContext as default }
