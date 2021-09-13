import React from 'react'

// import Accordion from '@material-ui/core/Accordion'
// import AccordionSummary from '@material-ui/core/AccordionSummary'
// import AccordionDetails from '@material-ui/core/AccordionDetails'
// import Typography from '@material-ui/core/Typography'
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Competitions } from './components/Competitions'
import { Teams } from './components/Teams'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Venues } from './components/Venues'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Competitions {...props} />
      <Teams {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Venues {...props} />

      {/* <Accordion>
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
      </Accordion> */}
    </div>
  )
}

export { Relations }
