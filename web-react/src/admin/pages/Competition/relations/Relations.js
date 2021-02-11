import React from 'react'
// import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

const Relations = () => {
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
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsor-content"
          id="sponsor-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Sponsors
          </Typography>
          <Typography className={classes.accordionFormDescription}>
            Sponsors info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Sponsors info</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="teams-content"
          id="teams-header"
        >
          <Typography className={classes.accordionFormTitle}>Teams</Typography>
          <Typography className={classes.accordionFormDescription}>
            Basic info about teams
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Teams Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="competitions-content"
          id="competitions-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Competitions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>competitions Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="rulePack-content"
          id="rulePack-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Rule Pack
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>rulePack Table</Typography>
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
      </Accordion>
    </div>
  )
}

Relations.propTypes = {}

export { Relations }
