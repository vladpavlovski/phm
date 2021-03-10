import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Competitions } from './components/Competitions'
import { Seasons } from './components/Seasons'

const Relations = props => {
  const { venueId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Competitions venueId={venueId} />
      <Seasons venueId={venueId} />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="achievements-awards-content"
          id="achievements-awards-header"
        >
          <Typography className={classes.accordionFormTitle}>Awards</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Achievements & Awards Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { venueId: PropTypes.string }

export { Relations }
