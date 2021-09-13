import React from 'react'
import PropTypes from 'prop-types'
// import Accordion from '@material-ui/core/Accordion'
// import AccordionSummary from '@material-ui/core/AccordionSummary'
// import AccordionDetails from '@material-ui/core/AccordionDetails'
// import Typography from '@material-ui/core/Typography'
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

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
