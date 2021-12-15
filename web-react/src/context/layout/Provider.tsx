import React, { useState } from 'react'
import LayoutContext, { initialContextState } from './index'

type TLayoutProvider = {
  children: React.ReactNode
}

const LayoutProvider: React.FC<TLayoutProvider> = props => {
  const [barTitle, setBarTitle] = useState(initialContextState.barTitle)

  return (
    <LayoutContext.Provider
      value={{
        barTitle,
        setBarTitle,
      }}
    >
      {props.children}
    </LayoutContext.Provider>
  )
}

export { LayoutProvider }
