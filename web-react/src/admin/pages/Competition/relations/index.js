import React from 'react'
// import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Association } from './components/Association'
const Relations = props => {
  const { competitionId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="manager-content"
          id="manager-header"
        >
          <Typography className={classes.accordionFormTitle}>Staff</Typography>
          <Typography className={classes.accordionFormDescription}>
            Staff info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Staff info</Typography>
        </AccordionDetails>
      </Accordion>

      <Association competitionId={competitionId} />

      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsor-content"
          id="Association-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Association
          </Typography>
          <Typography className={classes.accordionFormDescription}>
            Association info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Association info</Typography>
        </AccordionDetails>
      </Accordion> */}

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsor-content"
          id="Association-header"
        >
          <Typography className={classes.accordionFormTitle}>phases</Typography>
          <Typography className={classes.accordionFormDescription}>
            phases info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>phases info</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsor-content"
          id="Association-header"
        >
          <Typography className={classes.accordionFormTitle}>groups</Typography>
          <Typography className={classes.accordionFormDescription}>
            groups info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>groups info</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sponsor-content"
          id="Association-header"
        >
          <Typography className={classes.accordionFormTitle}>
            seasons
          </Typography>
          <Typography className={classes.accordionFormDescription}>
            seasons info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>seasons info</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
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
          aria-controls="rulePack-content"
          id="rulePack-header"
        >
          <Typography className={classes.accordionFormTitle}>Venue</Typography>
          <Typography className={classes.accordionFormDescription}>
            Venue info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Venue info</Typography>
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
          <Typography className={classes.accordionFormTitle}>teams</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>teams Table</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="rulePack-content"
          id="rulePack-header"
        >
          <Typography className={classes.accordionFormTitle}>
            metaHistories
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>metaHistories Table</Typography>
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
