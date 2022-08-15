import React from 'react'
import { Sponsor } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Awards } from './components/Awards'
import { Competitions } from './components/Competitions'
import { Groups } from './components/Groups'
import { Phases } from './components/Phases'
import { Players } from './components/Players'
import { Teams } from './components/Teams'

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <Teams {...props} />
      <Players {...props} />
      <Awards {...props} />
      <Competitions {...props} />
      <Phases {...props} />
      <Groups {...props} />
    </div>
  )
}

export { Relations }
