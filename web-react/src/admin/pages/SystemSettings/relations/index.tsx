import { MutationFunction } from '@apollo/client'
import React from 'react'

import { useStyles } from '../../commonComponents/styled'
import { RulePack } from './components/RulePack'
import { SystemSettings } from 'utils/types'

type TRelations = {
  systemSettingsId: string
  systemSettings: SystemSettings
  updateSystemSettings: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <RulePack {...props} />
    </div>
  )
}

export { Relations }
