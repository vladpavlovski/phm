import React from 'react'
import PropTypes from 'prop-types'
import { gql, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import Img from 'react-cool-img'

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { XGrid } from '@material-ui/x-grid'

import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

import { setIdFromEntityId } from '../../../../../utils'

import GameEventFormContext from '../context'

const GET_GAME_EVENTS_SIMPLE = gql`
  query getGameEventsSimple($gameId: ID!) {
    gameEventsSimple: gameEventsSimpleByGameId(gameId: $gameId) {
      gameEventSimpleId
      timestamp
      period
      remainingTime
      eventType
      goalType
      goalSubType
      shotType
      shotSubType
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
    }
  }
`

const EventsTable = props => {
  const { gameData } = props
  const classes = useStyles()

  const { eventsTableUpdate } = React.useContext(GameEventFormContext)
  const { data, error, loading, refetch } = useQuery(GET_GAME_EVENTS_SIMPLE, {
    variables: {
      gameId: gameData?.gameId,
    },
  })

  React.useEffect(() => {
    if (gameData?.gameId) {
      refetch()
    }
  }, [gameData?.gameId, eventsTableUpdate])

  const columns = React.useMemo(
    () => [
      {
        field: 'period',
        headerName: 'Period',
        width: 80,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'remainingTime',
        headerName: 'Remaining Time',
        width: 140,
        disableColumnMenu: true,
        resizable: false,
      },
      {
        field: 'team',
        headerName: 'Team',
        width: 200,
        disableColumnMenu: true,
        resizable: false,
        valueGetter: params => params?.row?.team?.nick,
        renderCell: params => {
          return (
            <>
              <Img
                src={params?.row?.team?.logo}
                style={{
                  display: 'inline',
                  width: '2rem',
                  height: '2rem',
                  marginRight: '1rem',
                }}
                alt={params?.row?.team?.nick}
              />
              <span>{params?.row?.team?.nick}</span>
            </>
          )
        },
      },
      {
        field: 'eventType',
        headerName: 'Event',
        width: 100,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },

      {
        field: 'scoredBy',
        headerName: 'Scored by',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => params?.row?.scoredBy?.player?.name,
      },

      {
        field: 'firstAssist',
        headerName: 'First Assist',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => params?.row?.firstAssist?.player?.name,
      },

      {
        field: 'secondAssist',
        headerName: 'Second Assist',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => params?.row?.secondAssist?.player?.name,
      },
      {
        field: 'goalType',
        headerName: 'Goal Type',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'goalSubType',
        headerName: 'Goal subType',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'shotType',
        headerName: 'Shot Type',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'shotSubType',
        headerName: 'Shot subType',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        width: 120,
        disableColumnMenu: true,
        resizable: false,
        valueFormatter: params => dayjs(params?.value).format('HH:mm:ss'),
      },
    ],
    []
  )

  return (
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
          {`Events table: ${gameData?.name}`}
        </Typography>
      </div>
      {error && !loading && <Error message={error.message} />}
      {data && (
        <div style={{ height: '60rem' }} className={classes.xGridWrapper}>
          <XGrid
            columns={columns}
            rows={setIdFromEntityId(
              [...data?.gameEventsSimple].sort((x, y) => {
                const date1 = new Date(x.timestamp)
                const date2 = new Date(y.timestamp)
                return date2 - date1
              }),
              'gameEventSimpleId'
            )}
            loading={loading}
            density="compact"
            disableColumnMenu
            disableColumnSelector
            disableSelectionOnClick
            disableMultipleSelection
          />
        </div>
      )}
    </Paper>
  )
}

EventsTable.propTypes = {
  gameData: PropTypes.object,
}

export { EventsTable }
