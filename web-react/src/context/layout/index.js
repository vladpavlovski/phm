import React from 'react'

const initialContextState = {
  barTitle: '',
}
const LayoutContext = React.createContext(initialContextState)
export { initialContextState, LayoutContext as default }
