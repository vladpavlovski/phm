import React from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Helmet } from 'react-helmet'
import { useSnackbar } from 'notistack'
import { LinkButton } from 'components/LinkButton'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Img from 'react-cool-img'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useStyles } from '../../commonComponents/styled'
import { Title } from 'components/Title'
import { Loader } from 'components/Loader'
import { Error } from 'components/Error'
import { getAdminOrgGameRoute } from 'router/routes'
import { useExitPrompt } from 'utils/hooks'
import placeholderPerson from 'img/placeholderPerson.jpg'

import { formatDate, formatTime } from 'utils'

import {
  Periods,
  GameEventWizard,
  EventsTable,
  Finalization,
} from './components'

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

const Play = () => {
  const classes = useStyles()
  const { gameId, organizationSlug } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [showExitPrompt, setShowExitPrompt] = useExitPrompt(true)

  React.useEffect(() => {
    return () => {
      setShowExitPrompt(!showExitPrompt)
    }
  }, [])

  const {
    loading: queryLoading,
    data: queryData,
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
        const queryResult = cache.readQuery({
          query: GET_GAME_PLAY,
          variables: {
            whereGame: { gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })

        console.log(queryResult)
        console.log(data?.updateGameResults?.gameResults?.[0])

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

  // const [
  //   updateGame,
  //   // { loading: mutationLoadingMerge, error: mutationErrorMerge },
  // ] = useMutation(UPDATE_GAME, {
  // update(cache, { data }) {
  //   try {
  //     const queryResult = cache.readQuery({
  //       query: GET_GAME_PLAY,
  //       variables: {
  //         where: { gameId },
  //         whereSystemSettings: { systemSettingsId: 'system-settings' },
  //       },
  //     })

  //     cache.writeQuery({
  //       query: GET_GAME_PLAY,
  //       data: {
  //         games: data?.updateGame?.games,
  //         systemSettings: queryResult?.systemSettings,
  //       },
  //       variables: {
  //         where: { gameId },
  //         whereSystemSettings: { systemSettingsId: 'system-settings' },
  //       },
  //     })
  //   } catch (error) {
  //     console.error(error)
  //   }
  // },
  //   // onCompleted: () => {
  //   //   enqueueSnackbar('Game updated!', { variant: 'success' })
  //   // },
  //   // onError: error => {
  //   //   enqueueSnackbar(`Error: ${error}`, {
  //   //     variant: 'error',
  //   //   })
  //   // },
  // })

  const gameData = queryData?.games?.[0] || null
  const gameSettings = queryData?.systemSettings[0]?.rulePack || null

  const teamHost = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => t.host)?.node,
    [gameData]
  )

  const teamGuest = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => !t.host)?.node,
    [gameData]
  )
  const playersHost = React.useMemo(
    () => gameData?.playersConnection?.edges?.filter(t => t.host),
    [gameData]
  )
  const playersGuest = React.useMemo(
    () => gameData?.playersConnection?.edges?.filter(t => !t.host),
    [gameData]
  )

  return (
    <Container maxWidth={false} className={classes.container}>
      <Helmet>
        <title>{`Game Live ${gameData?.name || ''}`}</title>
      </Helmet>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {gameData && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  flexShrink: 3,
                }}
              >
                <Typography variant="h6" component="div">
                  <LinkButton
                    startIcon={<ArrowBackIcon />}
                    to={getAdminOrgGameRoute(organizationSlug, gameId)}
                  >
                    {gameData?.name}
                  </LinkButton>
                </Typography>
                <Typography variant="h6" component="div">
                  {gameData?.type}
                </Typography>
                <Typography variant="h6" component="div">
                  {formatTime(gameData?.startTime)} -{' '}
                  {formatTime(gameData?.endTime)}
                  {', '}
                  {formatDate(gameData?.startDate)}
                </Typography>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Paper className={classes.paper}>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div>
                  <Title>{teamHost?.name ?? 'Host team'}</Title>
                </div>
                <div>
                  <Title>{teamGuest?.name ?? 'Guest team'}</Title>
                </div>
              </Toolbar>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <Img
                    placeholder={placeholderPerson}
                    src={teamHost?.logo}
                    className={classes.gamePlayTeamLogo}
                    alt={teamHost?.name}
                  />
                </div>
                <div>
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: 'Digital Numbers Regular',
                    }}
                  >
                    <div style={{ fontSize: '100px' }}>
                      <span>{gameData?.gameResult?.hostGoals}</span>:
                      <span>{gameData?.gameResult?.guestGoals}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Img
                    placeholder={placeholderPerson}
                    src={teamGuest?.logo}
                    className={classes.gamePlayTeamLogo}
                    alt={teamGuest?.name}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'grid' }}>
                  <GameEventWizard
                    host={true}
                    team={teamHost}
                    players={playersHost}
                    teamRival={teamGuest}
                    playersRival={playersGuest}
                    gameSettings={gameSettings}
                    gameData={gameData}
                  />
                </div>
                <div></div>
                <div style={{ display: 'grid' }}>
                  <GameEventWizard
                    host={false}
                    team={teamGuest}
                    players={playersGuest}
                    teamRival={teamHost}
                    playersRival={playersHost}
                    gameSettings={gameSettings}
                    gameData={gameData}
                  />
                </div>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper className={classes.paper}>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div>
                  <Title>{'Live game'}</Title>
                </div>
                <div></div>
              </Toolbar>
              <Grid container>
                <Grid item xs={12}>
                  <Periods
                    gameSettings={gameSettings}
                    gameData={gameData}
                    updateGameResult={updateGameResult}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Finalization
                    gameSettings={gameSettings}
                    gameData={gameData}
                    updateGameResult={updateGameResult}
                  />
                </Grid>
              </Grid>
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

export default Play
