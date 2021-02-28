import React from 'react'
import PropTypes from 'prop-types'
import { useStyles } from '../../commonComponents/styled'

import { Periods } from './components/Periods'
import { PositionTypes } from './components/PositionTypes'
import { ShotTypes } from './components/ShotTypes'
import { ShotSubTypes } from './components/ShotSubTypes'
import { ShotTargets } from './components/ShotTargets'
import { ShotStyles } from './components/ShotStyles'
import { GoalTypes } from './components/GoalTypes'
import { GoalSubTypes } from './components/GoalSubTypes'
import { PenaltyTypes } from './components/PenaltyTypes'
import { PenaltySubTypes } from './components/PenaltySubTypes'
import { PenaltyShotStatuses } from './components/PenaltyShotStatuses'
import { InjuryTypes } from './components/InjuryTypes'
import { ResultTypes } from './components/ResultTypes'
import { ResultPoints } from './components/ResultPoints'
import { GameEventLocations } from './components/GameEventLocations'

const Relations = props => {
  const { rulePackId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <PositionTypes rulePackId={rulePackId} />
      <Periods rulePackId={rulePackId} />
      <ShotTypes rulePackId={rulePackId} />
      <ShotSubTypes rulePackId={rulePackId} />
      <ShotTargets rulePackId={rulePackId} />
      <ShotStyles rulePackId={rulePackId} />
      <GoalTypes rulePackId={rulePackId} />
      <GoalSubTypes rulePackId={rulePackId} />
      <PenaltyTypes rulePackId={rulePackId} />
      <PenaltySubTypes rulePackId={rulePackId} />
      <PenaltyShotStatuses rulePackId={rulePackId} />
      <InjuryTypes rulePackId={rulePackId} />
      <ResultTypes rulePackId={rulePackId} />
      <ResultPoints rulePackId={rulePackId} />
      <GameEventLocations rulePackId={rulePackId} />
    </div>
  )
}

Relations.propTypes = { rulePackId: PropTypes.string }

export { Relations }
