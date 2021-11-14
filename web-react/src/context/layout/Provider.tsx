import React, { useState } from 'react'
import LayoutContext, { initialContextState } from './index'

type Props = {
  children: React.ReactChild
}

const LayoutProvider = (props: Props) => {
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
