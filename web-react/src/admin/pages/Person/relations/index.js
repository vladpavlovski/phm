import React from 'react'
import PropTypes from 'prop-types'
// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Typography from '@mui/material/Typography'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

// import { Teams } from './components/Teams'

const Relations = () => {
  // const { personId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
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
  personId: PropTypes.string,
}

export { Relations }
