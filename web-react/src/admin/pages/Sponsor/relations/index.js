import React from 'react'
// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Typography from '@mui/material/Typography'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Teams } from './components/Teams'
import { Players } from './components/Players'
import { Awards } from './components/Awards'
import { Competitions } from './components/Competitions'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams {...props} />
      <Players {...props} />
      <Awards {...props} />
      <Competitions {...props} />
      <Phases {...props} />
      <Groups {...props} />

      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="transfers-content"
          id="transfers-header"
        >
          <Typography className={classes.accordionFormTitle}>staff</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>staff Table</Typography>
        </AccordionDetails>
      </Accordion> */}

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

export { Relations }
