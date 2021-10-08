import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

const Relations = () => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="achievements-awards-content"
          id="achievements-awards-header"
        >
          <Typography className={classes.accordionFormTitle}>Player</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Player info</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="media-content"
          id="media-header"
        >
          <Typography className={classes.accordionFormTitle}>Person</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Person Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="media-content"
          id="media-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Settings Table</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

Relations.propTypes = { teamId: PropTypes.string }

export { Relations }
