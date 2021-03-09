import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Competitions } from './components/Competitions'
import { Teams } from './components/Teams'
import { Phases } from './components/Phases'

const Relations = props => {
  const { seasonId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Competitions seasonId={seasonId} />
      <Teams seasonId={seasonId} />
      <Phases seasonId={seasonId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="transfers-content"
          id="transfers-header"
        >
          <Typography className={classes.accordionFormTitle}>groups</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>groups Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsors-content"
          id="sponsors-header"
        >
          <Typography className={classes.accordionFormTitle}>venues</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>venues</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="wear-content"
          id="wear-header"
        >
          <Typography className={classes.accordionFormTitle}>Award</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Award Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { seasonId: PropTypes.string }

export { Relations }
