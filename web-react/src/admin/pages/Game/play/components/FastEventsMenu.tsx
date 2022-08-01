import { getPlayerObject } from 'admin/pages/Game/play/components/eventTypeForms/components'
import { getEventSettings } from 'admin/pages/Game/play/components/gameEvents'
import { GameEventTypes } from 'admin/pages/Game/play/components/GameEventTypes'
import {
  GameEventFormContext,
  getInputVarsForGES,
  TWizardGameEventSimple,
  useGameEventMutations,
} from 'admin/pages/Game/play/components/GameEventWizard'
import { GameTimerContext } from 'admin/pages/Game/play/components/Timer'
import { prepareGameResultUpdate } from 'admin/pages/Game/play/handlers'
import { Title } from 'components'
import { useLayoutSidebarState } from 'components/Layout'
import dayjs from 'dayjs'
import React from 'react'
import Img from 'react-cool-img'
import { useKeyPress } from 'utils/hooks'
import { Game, GamePlayersRelationship, Team } from 'utils/types'
import ClickAwayListener from '@mui/base/ClickAwayListener'
import WidgetsIcon from '@mui/icons-material/Widgets'
import { Grid } from '@mui/material'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  gameData: Game
  teamHost: Team
  teamGuest: Team
  playersHost: GamePlayersRelationship[]
  playersGuest: GamePlayersRelationship[]
}

const spaceKeyBlock = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    e.preventDefault()
    e.stopPropagation()
  }
}

export const FastEventsMenu = ({
  gameData,
  teamHost,
  playersHost,
  teamGuest,
  playersGuest,
}: Props) => {
  const containerRef = React.useRef(null)
  const [openMenu, setOpenMenu] = React.useState(false)
  const [isSidebarOpen] = useLayoutSidebarState(true)
  const spacePress = useKeyPress('Space')

  React.useEffect(() => {
    window.addEventListener('keydown', spaceKeyBlock)
    return () => {
      window.removeEventListener('keydown', spaceKeyBlock)
    }
  }, [])

  React.useEffect(() => {
    if (spacePress && !!gameData?.gameResult?.periodActive) {
      setOpenMenu(prev => !prev)
    }
  }, [spacePress, gameData])

  return gameData ? (
    <ClickAwayListener
      onClickAway={() => {
        if (openMenu) {
          setOpenMenu(false)
        }
      }}
    >
      <Box ref={containerRef}>
        <Slide direction="up" in={openMenu} container={containerRef.current}>
          <Box
            sx={{
              width: `calc(100% - ${isSidebarOpen ? '240px' : '73px'})`,
              height: '75%',
              position: 'fixed',
              bottom: '56px',
            }}
          >
            <Paper
              elevation={24}
              sx={{ borderRadius: 0, height: '100%', p: 2 }}
            >
              <TeamFastEvents
                host
                team={teamHost}
                players={playersHost}
                gameData={gameData}
              />
              <Divider sx={{ my: 2 }} />
              <TeamFastEvents
                host={false}
                team={teamGuest}
                players={playersGuest}
                gameData={gameData}
              />
            </Paper>
          </Box>
        </Slide>
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation showLabels>
            <BottomNavigationAction
              disabled={!gameData?.gameResult?.periodActive}
              label="Fast Menu"
              sx={{ maxWidth: '100%' }}
              icon={<WidgetsIcon />}
              onClick={() => {
                setOpenMenu(prev => !prev)
              }}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </ClickAwayListener>
  ) : null
}

const useFastSaveClick = ({
  gameData,
  team,
  eventType,
  eventRelationType,
}: {
  gameData: Game
  team: Team
  eventType: string
  eventRelationType: keyof TWizardGameEventSimple
}) => {
  const { createGameEventSimple } = useGameEventMutations(gameData)
  const {
    state: { gameEventData },
  } = React.useContext(GameEventFormContext)
  const {
    state: { tempGameTime, tempRemainingTime },
  } = React.useContext(GameTimerContext)

  return (player?: GamePlayersRelationship) => {
    const data = getEventSettings(eventType)
    if (data) {
      const { where, update } = prepareGameResultUpdate({
        gameData,
        gameEventSettings: data,
        host: true,
      })
      const input = getInputVarsForGES({
        gameEventData: {
          ...getPlayerObject({
            player,
            playerTitle: eventRelationType,
            playerToCheck: gameEventData?.[
              eventRelationType
            ] as GamePlayersRelationship,
          }),
        },
        team,
        gameData,
        gameEventSettings: data,
      })
      createGameEventSimple({
        variables: {
          input: {
            ...input,
            timestamp: dayjs().format(),
            remainingTime: tempRemainingTime,
            gameTime: tempGameTime,
          },
          gameResultWhere: where,
          gameResultUpdateInput: update,
        },
      })
    }
  }
}

const TeamFastEvents = ({
  team,
  players,
  gameData,
  host,
}: {
  team: Team
  players: GamePlayersRelationship[]
  gameData: Game
  host: boolean
}) => {
  const saveClick = useFastSaveClick({
    gameData,
    team,
    eventType: 'save',
    eventRelationType: 'savedBy' as keyof TWizardGameEventSimple,
  })

  const faceOffClick = useFastSaveClick({
    gameData,
    team,
    eventType: 'faceOff',
    eventRelationType: 'wonBy' as keyof TWizardGameEventSimple,
  })

  return (
    <Box sx={{ height: '50%', overflow: 'auto' }}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          width: '100%',
          position: 'fixed',
          backgroundColor: 'white',
          zIndex: 1,
        }}
      >
        <Img
          src={team?.logo}
          style={{
            width: '3rem',
            height: '3rem',
          }}
          alt={team?.name}
        />

        <Typography variant="h6" sx={{ ml: 2 }}>
          {team?.name ?? 'Host team'}
        </Typography>
      </Stack>

      <Grid container spacing={0} sx={{ overflow: 'scroll', mt: 6 }}>
        <Grid item xs={4}>
          <Title sx={{ textAlign: 'center' }}>Saves</Title>
          <Button
            onClick={() => {
              const goalkeeper = players.find(p => p.goalkeeper)
              saveClick(goalkeeper)
            }}
            type="button"
            variant={'contained'}
            sx={{ mb: 1, width: '100%', fontSize: 28 }}
          >
            Save
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Title sx={{ textAlign: 'center' }}>Events</Title>
          <GameEventTypes host={host} />
        </Grid>
        <Grid item xs={4}>
          <Title sx={{ textAlign: 'center' }}>Face Off</Title>
          <PlayersButtonsByJersey players={players} onClick={faceOffClick} />
        </Grid>
      </Grid>
    </Box>
  )
}

const PlayersButtonsByJersey = ({
  onClick,
  players,
}: {
  onClick: (player: GamePlayersRelationship) => void
  players: GamePlayersRelationship[]
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 300,
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      {players
        .sort((a, b) => (a?.jersey || 0) - (b?.jersey || 0))
        .map(player => (
          <Button
            key={player.node.playerId}
            onClick={() => {
              onClick && onClick(player)
            }}
            type="button"
            variant={'contained'}
            sx={{ mb: 1, fontSize: 28 }}
          >
            {player.jersey}
          </Button>
        ))}
    </div>
  )
}
