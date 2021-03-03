import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Competitions } from './components/Competitions'
import { RulePacks } from './components/RulePacks'

const Relations = props => {
  const { associationId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Accordion>
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
      </Accordion>
      <Sponsors associationId={associationId} />
      <Teams associationId={associationId} />
      <Competitions associationId={associationId} />
      <RulePacks associationId={associationId} />

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
  associationId: PropTypes.string,
}

export { Relations }
