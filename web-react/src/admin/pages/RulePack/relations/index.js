import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

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
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="game-event-location-content"
          id="game-event-location-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Game Event Location
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Game Event Location Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { rulePackId: PropTypes.string }

export { Relations }
