import { Error, Loader, Title } from 'components'
import { LinkButton } from 'components/LinkButton'
import placeholderPerson from 'img/placeholderPerson.jpg'
import { useSnackbar } from 'notistack'
import React from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { useTime } from 'react-timer-hook'
import { getAdminOrgGameRoute } from 'router/routes'
import { formatDate, formatTime, formatTimeValue } from 'utils'
import { useExitPrompt } from 'utils/hooks'
import {
  Game as GameType,
  GamePlayersRelationship,
  GameTeamsRelationship,
  Period,
  SystemSettings as SystemSettingsType,
} from 'utils/types'
import { gql, useMutation, useQuery } from '@apollo/client'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Grid, Stack } from '@mui/material'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useStyles } from '../../commonComponents/styled'
import { EventsTable, Finalization, GameEventWizard, Periods, Timer } from './components'

export const GET_GAME_PLAY = gql`
  query getGame(
    $whereGame: GameWhere
    $whereSystemSettings: SystemSettingsWhere
  ) {
    games(where: $whereGame) {
      gameId
      name
      type
      info
      foreignId
      description
      teamsConnection {
        edges {
          host
          node {
            teamId
            name
            nick
            logo
          }
        }
      }
      playersConnection {
        edges {
          host
          jersey
          position
          goalkeeper
          teamId
          node {
            avatar
            playerId
            name
            firstName
            lastName
            meta {
              metaPlayerId
            }
          }
        }
      }
      startDate
      endDate
      startTime
      endTime
      event {
        eventId
        name
      }
      gameEventsSimple {
        gameEventSimpleId
        timestamp
        period
        remainingTime
        gameTime
        eventType
        eventTypeCode
        goalType
        goalSubType
        shotType
        shotSubType
        penaltyType
        penaltySubType
        duration
        injuryType
        eventLocation
        goalLocation
        team {
          teamId
          nick
          logo
        }
        nextGameEvent {
          gameEventSimpleId
          timestamp
        }
        scoredBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        allowedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        firstAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        secondAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        lostBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        wonBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        penalized {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        executedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        facedAgainst {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        suffered {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        savedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
      }
      gameResult {
        gameResultId
        periodActive
        gameStartedAt
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostPenaltyShots
        guestPenaltyShots
        hostInjuries
        guestInjuries
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
        periodStatistics {
          periodStatisticId
          period
          hostGoals
          guestGoals
          hostPenalties
          guestPenalties
          hostPenaltyShots
          guestPenaltyShots
          hostInjuries
          guestInjuries
          hostSaves
          guestSaves
          hostFaceOffs
          guestFaceOffs
        }
      }
    }
    systemSettings(where: $whereSystemSettings) {
      rulePack {
        name
        periods {
          periodId
          name
          code
          duration
          priority
        }
        shotTargets {
          shotTargetId
          name
          code
          priority
        }
        shotStyles {
          shotStyleId
          name
          code
          priority
        }
        shotTypes {
          shotTypeId
          name
          code
          priority
          subTypes {
            shotSubTypeId
            name
            code
            priority
          }
        }
        goalTypes {
          goalTypeId
          name
          code
          priority
          subTypes {
            goalSubTypeId
            name
            code
            priority
          }
        }
        penaltyTypes {
          penaltyTypeId
          name
          code
          duration
          priority
          subTypes {
            penaltySubTypeId
            name
            code
            priority
          }
        }
        injuryTypes {
          injuryTypeId
          name
          priority
        }
        resultPoints {
          resultPointId
          name
          code
          points
        }
      }
    }
  }
`

const UPDATE_GAME_RESULT = gql`
  mutation updateGameResult(
    $where: GameResultWhere
    $update: GameResultUpdateInput
  ) {
    updateGameResults(where: $where, update: $update) {
      gameResults {
        gameResultId
        hostWin
        guestWin
        draw
        gameStatus
        periodActive
        gameStartedAt
      }
    }
  }
`

type TParams = {
  gameId: string
  organizationSlug: string
}

export type TQueryTypeData = {
  games: GameType[]
  systemSettings: SystemSettingsType[]
}

export type TQueryTypeVars = {
  whereGame: {
    gameId: string
  }
  whereSystemSettings: {
    systemSettingsId: string
  }
}

const Play: React.FC = () => {
  const classes = useStyles()
  const { gameId, organizationSlug } = useParams<TParams>()
  const { enqueueSnackbar } = useSnackbar()

  const [showExitPrompt, setShowExitPrompt] = useExitPrompt(true)

  React.useEffect(() => {
    return () => {
      setShowExitPrompt(!showExitPrompt)
    }
  }, [])

  const {
    loading: queryLoading,
    data: {
      games: [gameData],
      systemSettings: [{ rulePack: gameSettings }],
    } = {
      games: [],
      systemSettings: [{ rulePack: null }],
    },
    error: queryError,
  } = useQuery(GET_GAME_PLAY, {
    variables: {
      whereGame: { gameId },
      whereSystemSettings: { systemSettingsId: 'system-settings' },
    },
    skip: gameId === 'new',
  })

  const [updateGameResult] = useMutation(UPDATE_GAME_RESULT, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_GAME_PLAY,
          variables: {
            whereGame: { gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })

        cache.writeQuery({
          query: GET_GAME_PLAY,
          data: {
            games: [
              {
                ...queryResult?.games?.[0],
                gameResult: {
                  ...queryResult?.games?.[0]?.gameResult,
                  ...data?.updateGameResults?.gameResults?.[0],
                },
              },
            ],
            systemSettings: queryResult?.systemSettings,
          },
          variables: {
            whereGame: { gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Game Result updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const teamHost = gameData?.teamsConnection?.edges?.find(
    (t: GameTeamsRelationship) => t.host
  )?.node

  const teamGuest = gameData?.teamsConnection?.edges?.find(
    (t: GameTeamsRelationship) => !t.host
  )?.node
  const playersHost = gameData?.playersConnection?.edges?.filter(
    (t: GamePlayersRelationship) => t.host
  )
  const playersGuest = gameData?.playersConnection?.edges?.filter(
    (t: GamePlayersRelationship) => !t.host
  )

  return (
    <Container maxWidth={false}>
      <Helmet>
        <title>{`${gameData?.name || ''}`}</title>
      </Helmet>
      {queryLoading && <Loader />}
      <Error message={queryError?.message} />
      {gameData && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">
                  <LinkButton
                    startIcon={<ArrowBackIcon />}
                    to={getAdminOrgGameRoute(organizationSlug, gameId)}
                  >
                    {gameData?.name}
                  </LinkButton>
                </Typography>
                <Typography variant="h6">{gameData?.type}</Typography>
                <Stack direction="row">
                  <Time />
                  &nbsp;
                  <Typography variant="h6">
                    {formatTime(gameData?.startTime)} -{' '}
                    {formatTime(gameData?.endTime)}
                    {', '}
                    {formatDate(gameData?.startDate)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Periods
              gameSettings={gameSettings}
              gameData={gameData}
              updateGameResult={updateGameResult}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Paper className={classes.paper}>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <Title>{teamHost?.name ?? 'Host team'}</Title>
                <Title>{teamGuest?.name ?? 'Guest team'}</Title>
              </Toolbar>
              <Stack direction="row" justifyContent="space-between">
                <Img
                  placeholder={placeholderPerson}
                  src={teamHost?.logo}
                  className={classes.gamePlayTeamLogo}
                  alt={teamHost?.name}
                />

                <Typography
                  sx={{
                    fontSize: '100px',
                    textAlign: 'center',
                    fontFamily: 'Digital Numbers Regular',
                  }}
                >
                  {gameData?.gameResult?.hostGoals}:
                  {gameData?.gameResult?.guestGoals}
                </Typography>

                <Img
                  placeholder={placeholderPerson}
                  src={teamGuest?.logo}
                  className={classes.gamePlayTeamLogo}
                  alt={teamGuest?.name}
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <GameEventWizard
                  host={true}
                  team={teamHost}
                  players={playersHost}
                  teamRival={teamGuest}
                  playersRival={playersGuest}
                  gameSettings={gameSettings}
                  gameData={gameData}
                />
                <GameEventWizard
                  host={false}
                  team={teamGuest}
                  players={playersGuest}
                  teamRival={teamHost}
                  playersRival={playersHost}
                  gameSettings={gameSettings}
                  gameData={gameData}
                />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper>
              <Timer
                gameSettings={gameSettings}
                gameData={gameData}
                updateGameResult={updateGameResult}
                timeInMinutes={
                  gameSettings?.periods?.find(
                    (p: Period) => p.name === gameData?.gameResult?.periodActive
                  )?.duration || 20
                }
              />

              <Finalization
                gameData={gameData}
                updateGameResult={updateGameResult}
                teamHost={teamHost}
                teamGuest={teamGuest}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <EventsTable
              teams={gameData?.teamsConnection?.edges}
              players={gameData?.playersConnection?.edges}
              gameData={gameData}
              gameSettings={gameSettings}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

const Time = () => {
  const {
    seconds: timeSeconds,
    minutes: timeMinutes,
    hours: timeHours,
  } = useTime({ format: undefined })

  return (
    <Typography variant="h6">
      {`${formatTimeValue(timeHours)}:${formatTimeValue(
        timeMinutes
      )}:${formatTimeValue(timeSeconds)}`}
    </Typography>
  )
}

export default Play
