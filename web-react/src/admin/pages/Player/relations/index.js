import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

import { Teams } from './components/Teams'
import { Positions } from './components/Positions'
import { Jerseys } from './components/Jerseys'
import { Sponsors } from './components/Sponsors'

const Relations = props => {
  const { playerId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="achievements-awards-content"
          id="achievements-awards-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Account
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Account info</Typography>
        </AccordionDetails>
      </Accordion>
      <Teams playerId={playerId} />
      <Positions playerId={playerId} />
      <Jerseys playerId={playerId} />
      <Sponsors playerId={playerId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="wear-content"
          id="wear-header"
        >
          <Typography className={classes.accordionFormTitle}>
            achievements &amp; award
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>aa Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="media-content"
          id="media-header"
        >
          <Typography className={classes.accordionFormTitle}>Media</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>media Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { teamId: PropTypes.string }

export { Relations }
