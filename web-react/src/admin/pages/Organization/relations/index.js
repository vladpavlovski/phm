import React from 'react'
import PropTypes from 'prop-types'
// import Accordion from '@material-ui/core/Accordion'
// import AccordionSummary from '@material-ui/core/AccordionSummary'
// import AccordionDetails from '@material-ui/core/AccordionDetails'
// import Typography from '@material-ui/core/Typography'
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Competitions } from './components/Competitions'
import { RulePacks } from './components/RulePacks'
import { Occupations } from './components/Occupations'
import { Persons } from './components/persons'

const Relations = props => {
  const { organizationId, data } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="manager-content"
          id="manager-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Manager
          </Typography>
          <Typography className={classes.accordionFormDescription}>
            Manager info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Manager info</Typography>
        </AccordionDetails>
      </Accordion> */}
      <Persons organizationId={organizationId} organization={data} />
      <Sponsors organizationId={organizationId} />
      <Teams organizationId={organizationId} />
      <Competitions organizationId={organizationId} />
      <RulePacks organizationId={organizationId} />
      <Occupations organizationId={organizationId} />

      {/* <Accordion>
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
  organizationId: PropTypes.string,
}

export { Relations }
