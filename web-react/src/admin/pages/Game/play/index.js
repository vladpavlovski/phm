import React from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import { Helmet } from 'react-helmet'
import { LinkButton } from '../../../../components/LinkButton'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Img from 'react-cool-img'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useStyles } from '../../commonComponents/styled'
import { Title } from '../../../../components/Title'
import { Loader } from '../../../../components/Loader'
import { Error } from '../../../../components/Error'
import { getAdminOrgGameRoute } from '../../../../routes'

import placeholderPerson from '../../../../img/placeholderPerson.jpg'

import { formatDate, formatTime } from '../../../../utils'

import { GET_GAME_EVENTS_SIMPLE } from './components/EventsTable'

import { Periods, GameEventWizard, EventsTable } from './components'

import GameEventFormContext from './context'
import Finalization from './components/Finalization'

export const GET_GAME_PLAY = gql`
  query getGame(
    $whereGame: GameWhere
    $whereSystemSettings: SystemSettingsWhere
  ) {
    game: games(where: $whereGame) {
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
        eventType
        team {
          teamId
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

const Play = () => {
  const classes = useStyles()
  const { gameId, organizationSlug } = useParams()

  const client = useApolloClient()
  const { goalsEventsCounter } = React.useContext(GameEventFormContext)

  const [goalsCounter, setGoalsCounter] = React.useState({
    host: 0,
    guest: 0,
    loaded: false,
  })

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

  const gameData = queryData?.game?.[0] || null
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

  React.useEffect(() => {
    // console.log('gameData:', gameData)
    // console.log('gameSettings:', gameSettings)
    if (gameData) {
      const allGoals = gameData?.gameEventsSimple?.filter(
        ges => ges.eventType.toLowerCase() === 'goal'
      )
      const goalsHost =
        allGoals?.filter(g => g.team.teamId === teamHost.teamId)?.length || 0
      const goalsGuest =
        allGoals?.filter(g => g.team.teamId === teamGuest.teamId)?.length || 0
      setGoalsCounter({ host: goalsHost, guest: goalsGuest, loaded: true })
    }
  }, [gameData])

  React.useEffect(() => {
    if (goalsEventsCounter) {
      const { gameEventSimples } = client.readQuery({
        query: GET_GAME_EVENTS_SIMPLE,
        variables: {
          where: {
            game: {
              gameId,
            },
          },
        },
      })

      const allGoals = gameEventSimples?.filter(
        ges => ges.eventType.toLowerCase() === 'goal'
      )
      const goalsHost =
        allGoals?.filter(g => g.team.teamId === teamHost.teamId)?.length || 0
      const goalsGuest =
        allGoals?.filter(g => g.team.teamId === teamGuest.teamId)?.length || 0
      setGoalsCounter({ host: goalsHost, guest: goalsGuest, loaded: true })
    }
  }, [goalsEventsCounter])

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
                    {goalsCounter?.loaded && (
                      <div style={{ fontSize: '100px' }}>
                        <span>{goalsCounter?.host}</span>:
                        <span>{goalsCounter?.guest}</span>
                      </div>
                    )}
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
                <div>
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
                <div>
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
                  <Periods gameSettings={gameSettings} />
                </Grid>
                <Grid item xs={12}>
                  <Finalization
                    gameSettings={gameSettings}
                    gameData={gameData}
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
