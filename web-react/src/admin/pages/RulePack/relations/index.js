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

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="goal-subtypes-content"
          id="goal-subtypes-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Goal SubTypes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Goal SubTypes Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="penalty-types-content"
          id="penalty-types-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Penalty Types
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Penalty Types Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="penalty-subtypes-content"
          id="penalty-subtypes-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Penalty SubTypes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Penalty SubTypes Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="penalty-shot-statuses-content"
          id="penalty-shot-statuses-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Penalty Shot Statuses
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Penalty Shot Statuses Table</Typography>
        </AccordionDetails>
      </Accordion>

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

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="injury-types-content"
          id="injury-types-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Injury Types
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Injury Types Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="result-types-content"
          id="result-types-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Result Types
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Result Types Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="result-points-content"
          id="result-points-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Result Points
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Result Points Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { rulePackId: PropTypes.string }

export { Relations }
