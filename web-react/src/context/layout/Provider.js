import React, { useState } from 'react'
import PropTypes from 'prop-types'
import LayoutContext, { initialContextState } from './index'

const LayoutProvider = props => {
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

LayoutProvider.propTypes = {
  children: PropTypes.node,
}

export { LayoutProvider }
