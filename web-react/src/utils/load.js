import React from 'react'
import { imported } from 'react-imported-component/macro'
import { Loader } from '../components/Loader'

const Load = component => {
  if (!component) return
  return imported(component, {
    LoadingComponent: () => <Loader />,
    ErrorComponent: () => <p>Error</p>,
  })
}

export { Load as default }
