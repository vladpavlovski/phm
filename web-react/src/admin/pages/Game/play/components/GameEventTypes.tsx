import { GameEventFormContext } from 'admin/pages/Game/play/components/GameEventWizard'
import { GameTimerContext } from 'admin/pages/Game/play/components/Timer'
import React from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { experimentalStyled as styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { eventTypes, getEventSettings } from './gameEvents'

const ImageButton = styled(ButtonBase)(() => ({
  position: 'relative',
  margin: '0 1% 2% 1%',
  height: 80,
  width: '48%',
  borderRadius: '4px',
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '2px solid currentColor',
      borderRadius: '4px',
    },
  },
}))

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
  borderRadius: '4px',
})

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
  borderRadius: '4px',
}))

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  borderRadius: '4px',
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}))

const ImageMarked = styled('span')(({ theme }) => ({
  height: 2,
  width: 20,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
  borderRadius: '4px',
}))

const GameEventTypes = ({ host = true }: { host?: boolean }) => {
  const { update } = React.useContext(GameEventFormContext)
  const {
    state: { tempGameTime, tempRemainingTime },
  } = React.useContext(GameTimerContext)
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {eventTypes.map(eventType => (
        <ImageButton
          focusRipple
          onClick={() => {
            const data = getEventSettings(eventType.type)
            update(state => ({
              ...state,
              openGameEventDialog: host ? 'host' : 'guest',
              gameEventSettings: data,
              gameEventData: {
                ...state.gameEventData,
                remainingTime: tempRemainingTime,
                gameTime: tempGameTime,
              },
            }))
          }}
          key={eventType.name}
        >
          <ImageSrc style={{ backgroundColor: eventType.color }} />
          <ImageBackdrop className="MuiImageBackdrop-root" />
          <Image>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              sx={{
                position: 'relative',
                p: 1,
                fontSize: '24px',
                textTransform: 'uppercase',
              }}
            >
              {eventType.name}
              <ImageMarked className="MuiImageMarked-root" />
            </Typography>
          </Image>
        </ImageButton>
      ))}
    </Box>
  )
}

export { GameEventTypes }
