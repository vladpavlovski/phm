import React from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import { Helmet } from 'react-helmet'

import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import { Grid } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import Img from 'react-cool-img'

import { useStyles } from '../../commonComponents/styled'
import { Title } from '../../../../components/Title'
import { Loader } from '../../../../components/Loader'
import { Error } from '../../../../components/Error'

import placeholderPerson from '../../../../img/placeholderPerson.jpg'

import { formatDate, formatTime } from '../../../../utils'

import { GET_GAME_EVENTS_SIMPLE } from './components/EventsTable'

import { Periods, GameEventWizard, EventsTable } from './components'

import GameEventFormContext from './context'

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
        }
        shotStyles {
          shotStyleId
          name
          code
        }
        shotTypes {
          shotTypeId
          name
          code
          subTypes {
            shotSubTypeId
            name
            code
          }
        }
        goalTypes {
          goalTypeId
          name
          code
          subTypes {
            goalSubTypeId
            name
            code
          }
        }
        penaltyTypes {
          penaltyTypeId
          name
          code
          duration
          subTypes {
            penaltySubTypeId
            name
            code
          }
        }
        injuryTypes {
          injuryTypeId
          name
        }
      }
    }
  }
`

const Play = () => {
  const classes = useStyles()
  const { gameId } = useParams()

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
    fetchPolicy: 'network-only',
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
    console.log('gameData:', gameData)
    console.log('gameSettings:', gameSettings)
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
      const { gameEventsSimple } = client.readQuery({
        query: GET_GAME_EVENTS_SIMPLE,
        variables: {
          where: {
            game: {
              gameId,
            },
          },
        },
      })

      const allGoals = gameEventsSimple?.filter(
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
                  {gameData?.name}
                </Typography>
                <Typography variant="h6" component="div">
                  {gameData?.type}
                </Typography>
                <Typography variant="h6" component="div">
                  {formatDate(gameData?.startDate?.formatted)} -{' '}
                  {formatDate(gameData?.endDate?.formatted)}
                </Typography>
                <Typography variant="h6" component="div">
                  {formatTime(gameData?.startTime?.formatted)} -{' '}
                  {formatTime(gameData?.endTime?.formatted)}
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
