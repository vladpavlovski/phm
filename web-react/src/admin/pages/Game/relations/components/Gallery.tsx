import { Media } from 'components'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Game } from 'utils/types'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { useStyles } from '../../../commonComponents/styled'

type TParams = {
  organizationSlug: string
}

type TGallery = {
  gameData: Game
}

const Gallery: React.FC<TGallery> = props => {
  const { gameData } = props
  const classes = useStyles()
  const { organizationSlug } = useParams<TParams>()

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="gallery-content"
        id="gallery-header"
      >
        <Typography className={classes.accordionFormTitle}>Gallery</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Media
          mediaId={gameData?.media?.mediaId}
          parentId={gameData.gameId!}
          parentType={'game'}
          folderName={`${organizationSlug}/games/${gameData.gameId}/images`}
        />
      </AccordionDetails>
    </Accordion>
  )
}

export { Gallery }
