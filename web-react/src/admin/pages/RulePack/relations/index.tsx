import React from 'react'
import { useStyles } from '../../commonComponents/styled'

import { Periods } from './components/Periods'
import { PositionTypes } from './components/PositionTypes'
import { ShotTypes } from './components/ShotTypes'
import { ShotTargets } from './components/ShotTargets'
import { ShotStyles } from './components/ShotStyles'
import { GoalTypes } from './components/GoalTypes'
import { PenaltyTypes } from './components/PenaltyTypes'
import { PenaltyShotStatuses } from './components/PenaltyShotStatuses'
import { InjuryTypes } from './components/InjuryTypes'
import { ResultTypes } from './components/ResultTypes'
import { ResultPoints } from './components/ResultPoints'
import { GameEventLocations } from './components/GameEventLocations'

type TRelations = {
  rulePackId: string
}
const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
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
      <GameEventLocations {...props} />
    </div>
  )
}

export { Relations }
