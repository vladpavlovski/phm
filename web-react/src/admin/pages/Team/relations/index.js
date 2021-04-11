import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

import { Membership } from './components/Membership'
import { Players } from './components/players'
import { Sponsors } from './components/Sponsors'
import { Jerseys } from './components/Jerseys'
import { Positions } from './components/Positions'

const Relations = props => {
  const { teamId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Membership teamId={teamId} />
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="achievements-awards-content"
          id="achievements-awards-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Achievements &amp; Awards
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Achievements & Awards Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="team-staff-content"
          id="team-staff-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Team staff
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Team staff Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Players teamId={teamId} />
      <Jerseys teamId={teamId} />
      <Positions teamId={teamId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="transfers-content"
          id="transfers-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Transfers
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Transfers Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Sponsors teamId={teamId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="wear-content"
          id="wear-header"
        >
          <Typography className={classes.accordionFormTitle}>Wear</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>wear Table</Typography>
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
