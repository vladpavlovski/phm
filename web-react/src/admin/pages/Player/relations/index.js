import React from 'react'
import PropTypes from 'prop-types'
// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Typography from '@mui/material/Typography'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useStyles } from '../../commonComponents/styled'

import { Teams } from './components/Teams'
import { Positions } from './components/Positions'
import { Jerseys } from './components/Jerseys'
import { Sponsors } from './components/Sponsors'

const Relations = props => {
  const { playerId, player, updatePlayer } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="achievements-awards-content"
          id="achievements-awards-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Account
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Account info</Typography>
        </AccordionDetails>
      </Accordion> */}
      <Teams playerId={playerId} player={player} updatePlayer={updatePlayer} />
      <Positions
        playerId={playerId}
        player={player}
        updatePlayer={updatePlayer}
      />
      <Jerseys
        playerId={playerId}
        player={player}
        updatePlayer={updatePlayer}
      />
      <Sponsors
        playerId={playerId}
        player={player}
        updatePlayer={updatePlayer}
      />

      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="wear-content"
          id="wear-header"
        >
          <Typography className={classes.accordionFormTitle}>
            achievements &amp; award
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>aa Table</Typography>
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

Relations.propTypes = {
  playerId: PropTypes.string,
  player: PropTypes.object,
  updatePlayer: PropTypes.func,
}

export { Relations }
