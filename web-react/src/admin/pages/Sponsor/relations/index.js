import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStyles } from '../../commonComponents/styled'
import { Teams } from './components/Teams'
import { Players } from './components/Players'
import { Awards } from './components/Awards'

const Relations = props => {
  const { sponsorId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams sponsorId={sponsorId} />
      <Players sponsorId={sponsorId} />
      <Awards sponsorId={sponsorId} />

      <Accordion>
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
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="wear-content"
          id="wear-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Competition
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Competition Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="media-content"
          id="media-header"
        >
          <Typography className={classes.accordionFormTitle}>Phase</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Phase Table</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="media-content"
          id="media-header"
        >
          <Typography className={classes.accordionFormTitle}>Group</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Group Table</Typography>
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

Relations.propTypes = { sponsorId: PropTypes.string }

export { Relations }
