import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Association } from './components/Association'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Seasons } from './components/Seasons'
import { Venues } from './components/Venues'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'

const Relations = props => {
  const { competitionId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="manager-content"
          id="manager-header"
        >
          <Typography className={classes.accordionFormTitle}>Staff</Typography>
          <Typography className={classes.accordionFormDescription}>
            Staff info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Staff info</Typography>
        </AccordionDetails>
      </Accordion>

      <Association competitionId={competitionId} />
      <Phases competitionId={competitionId} />
      <Groups competitionId={competitionId} />
      <Seasons competitionId={competitionId} />
      <Venues competitionId={competitionId} />
      <Sponsors competitionId={competitionId} />
      <Teams competitionId={competitionId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="rulePack-content"
          id="rulePack-header"
        >
          <Typography className={classes.accordionFormTitle}>
            rulePack
          </Typography>
          <Typography className={classes.accordionFormDescription}>
            rulePack info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>rulePack info</Typography>
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

Relations.propTypes = {
  competitionId: PropTypes.string,
}

export { Relations }
