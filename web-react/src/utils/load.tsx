import React from 'react'
import { imported } from 'react-imported-component/macro'
import { DefaultComponentImport } from 'react-imported-component/dist/es5/types'

import { Loader } from '../components/Loader'

const Load = (component: DefaultComponentImport) => {
  if (!component) return
  return imported(component, {
    LoadingComponent: () => <Loader />,
    ErrorComponent: () => <p>Error</p>,
  })
}

export { Load as default }
