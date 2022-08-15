import React from 'react'
import { SystemSettings } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { RulePack } from './components/RulePack'

type TRelations = {
  systemSettingsId: string
  systemSettings: SystemSettings
  updateSystemSettings: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <RulePack {...props} />
    </div>
  )
}

export { Relations }
