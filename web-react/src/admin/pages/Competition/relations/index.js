import React from 'react'
import PropTypes from 'prop-types'
// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Typography from '@mui/material/Typography'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Organization } from './components/Organization'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Seasons } from './components/Seasons'
import { Venues } from './components/Venues'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      {/* <Accordion>
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
      </Accordion> */}

      <Organization {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Seasons {...props} />
      <Venues {...props} />
      <Sponsors {...props} />
      <Teams {...props} />

      {/* <Accordion>
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
      </Accordion> */}
    </div>
  )
}

Relations.propTypes = {
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  updateCompetition: PropTypes.func,
}

export { Relations }
