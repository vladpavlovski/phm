import React from 'react'

// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Typography from '@mui/material/Typography'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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
