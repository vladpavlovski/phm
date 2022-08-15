import React from 'react'
import { GoalTypes } from './components/GoalTypes'
import { InjuryTypes } from './components/InjuryTypes'
import { PenaltyShotStatuses } from './components/PenaltyShotStatuses'
import { PenaltyTypes } from './components/PenaltyTypes'
import { Periods } from './components/Periods'
import { PlayerLevelTypes } from './components/PlayerLevelTypes'
import { PositionTypes } from './components/PositionTypes'
import { ResultPoints } from './components/ResultPoints'
import { ResultTypes } from './components/ResultTypes'
import { ShotStyles } from './components/ShotStyles'
import { ShotTargets } from './components/ShotTargets'
import { ShotTypes } from './components/ShotTypes'

type TRelations = {
  rulePackId: string
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <PositionTypes {...props} />
      <Periods {...props} />
      <ShotTypes {...props} />
      <ShotTargets {...props} />
      <ShotStyles {...props} />
      <GoalTypes {...props} />
      <PenaltyTypes {...props} />
      <PenaltyShotStatuses {...props} />
      <InjuryTypes {...props} />
      <ResultTypes {...props} />
      <ResultPoints {...props} />
      <PlayerLevelTypes {...props} />
    </div>
  )
}

export { Relations }
