import React from 'react'
import PropTypes from 'prop-types'
import { gql, useQuery, useMutation } from '@apollo/client'
import dayjs from 'dayjs'
import Img from 'react-cool-img'
import { useSnackbar } from 'notistack'

import EditIcon from '@material-ui/icons/Edit'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { XGrid } from '@material-ui/x-grid'

import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { getEventData } from './gameEvents'
import { setIdFromEntityId } from '../../../../../utils'

import GameEventFormContext from '../context'

export const GET_GAME_EVENTS_SIMPLE = gql`
  query getGameEventsSimple($gameId: ID!) {
    gameEventsSimple: gameEventsSimpleByGameId(gameId: $gameId) {
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
  }
`

const DELETE_GAME_EVENT_SIMPLE = gql`
  mutation deleteGameEventSimple($gameEventSimpleId: ID!) {
    DeleteGameEventSimple(gameEventSimpleId: $gameEventSimpleId) {
      gameEventSimpleId
    }
  }
`

const EventsTable = props => {
  const { gameData, gameSettings, players, teams } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [openDeleteEventDialog, setOpenDeleteEventDialog] = React.useState(
    false
  )

  const gameEventSimpleIdToDelete = React.useRef()

  const {
    eventsTableUpdate,
    setGoalsEventsCounter,
    setGameEventSettings,
    setGameEventData,
    setOpenGameEventDialog,
  } = React.useContext(GameEventFormContext)
  const { data, error, loading, refetch } = useQuery(GET_GAME_EVENTS_SIMPLE, {
    variables: {
      gameId: gameData?.gameId,
    },
    // skip: !!gameData?.gameId,
  })

  const [deleteGameEventSimple] = useMutation(DELETE_GAME_EVENT_SIMPLE, {
    update(cache) {
      try {
        console.log(
          'gameEventSimpleIdToDelete.current:',
          gameEventSimpleIdToDelete.current
        )
        const queryResult = cache.readQuery({
          query: GET_GAME_EVENTS_SIMPLE,
          variables: {
            gameId: gameData?.gameId,
          },
        })
        console.log('queryResult:', queryResult)
        const updatedEvents = queryResult?.gameEventsSimple?.filter(
          ges => ges?.gameEventSimpleId !== gameEventSimpleIdToDelete.current
        )
        console.log('updatedEvents:', updatedEvents)
        const updatedResult = {
          gameEventsSimple: [...updatedEvents],
        }
        console.log('updatedResult:', updatedResult)
        cache.writeQuery({
          query: GET_GAME_EVENTS_SIMPLE,
          data: updatedResult,
          variables: {
            gameId: gameData?.gameId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      gameEventSimpleIdToDelete.current = null
      enqueueSnackbar(`Game event was deleted`, {
        variant: 'info',
      })
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  React.useEffect(async () => {
    if (gameData?.gameId && eventsTableUpdate) {
      await refetch()
      setGoalsEventsCounter(g => g + 1)
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
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <>
              <IconButton
                type="button"
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  // find and set gameEventSettings based on eventTypeCode
                  const data = getEventData(params.row?.eventTypeCode)
                  setGameEventSettings(data)

                  // compose gameEventData object
                  const gameEventDataObject = {
                    ...params.row,
                    goalType:
                      gameSettings?.goalTypes?.find(
                        gt => gt.name === params.row?.goalType
                      ) || null,
                    goalSubType:
                      gameSettings?.goalTypes
                        ?.find(gt => gt.name === params.row?.goalType)
                        ?.subTypes?.find(
                          gst => gst.name === params.row?.goalSubType
                        ) || null,
                    shotType:
                      gameSettings?.shotTypes?.find(
                        st => st.name === params.row?.shotType
                      ) || null,
                    shotSubType:
                      gameSettings?.shotTypes
                        ?.find(st => st.name === params.row?.shotType)
                        ?.subTypes?.find(
                          sst => sst.name === params.row?.shotSubType
                        ) || null,
                    injuryType:
                      gameSettings?.injuryTypes?.find(
                        it => it.name === params.row?.injuryType
                      ) || null,
                    penaltyType:
                      gameSettings?.penaltyTypes?.find(
                        pt => pt.name === params.row?.penaltyType
                      ) || null,
                    penaltySubType:
                      gameSettings?.penaltyTypes
                        ?.find(pt => pt.name === params.row?.penaltyType)
                        ?.subTypes?.find(
                          pst => pst.name === params.row?.penaltySubType
                        ) || null,
                    scoredBy:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.scoredBy?.player?.playerId
                      ) || null,
                    firstAssist:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.firstAssist?.player?.playerId
                      ) || null,
                    secondAssist:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.secondAssist?.player?.playerId
                      ) || null,
                    wonBy:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.wonBy?.player?.playerId
                      ) || null,
                    lostBy:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.lostBy?.player?.playerId
                      ) || null,
                    suffered:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.suffered?.player?.playerId
                      ) || null,
                    penalized:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.penalized?.player?.playerId
                      ) || null,
                    executedBy:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.executedBy?.player?.playerId
                      ) || null,
                    facedAgainst:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.facedAgainst?.player?.playerId
                      ) || null,
                    savedBy:
                      players?.find(
                        p =>
                          p?.player?.playerId ===
                          params.row?.savedBy?.player?.playerId
                      ) || null,
                  }

                  // set setGameEventData
                  setGameEventData(gameEventDataObject)
                  // detect host/guest team
                  const isHost = teams?.find(
                    t => t?.team?.teamId === params.row?.team?.teamId
                  )?.host
                  // open eventType dialog
                  setOpenGameEventDialog(isHost ? 'host' : 'guest')
                }}
              >
                <Tooltip arrow title="Edit" placement="top">
                  <EditIcon />
                </Tooltip>
              </IconButton>
              <IconButton
                type="button"
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  gameEventSimpleIdToDelete.current =
                    params.row?.gameEventSimpleId
                  setOpenDeleteEventDialog(true)
                }}
              >
                <Tooltip arrow title="Delete" placement="top">
                  <DeleteForeverIcon />
                </Tooltip>
              </IconButton>
            </>
          )
        },
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
        width: 120,
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
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId === params.row?.scoredBy?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.scoredBy?.player?.name} (${jersey})`
        },
      },

      {
        field: 'firstAssist',
        headerName: 'First Assist',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId ===
                params.row?.firstAssist?.player?.playerId
            )?.jersey || null
          return (
            jersey && `${params?.row?.firstAssist?.player?.name} (${jersey})`
          )
        },
      },

      {
        field: 'secondAssist',
        headerName: 'Second Assist',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId ===
                params.row?.secondAssist?.player?.playerId
            )?.jersey || null
          return (
            jersey && `${params?.row?.secondAssist?.player?.name} (${jersey})`
          )
        },
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
        field: 'wonBy',
        headerName: 'Won By',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p => p?.player?.playerId === params.row?.wonBy?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.wonBy?.player?.name} (${jersey})`
        },
      },
      {
        field: 'lostBy',
        headerName: 'Lost By',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p => p?.player?.playerId === params.row?.lostBy?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.lostBy?.player?.name} (${jersey})`
        },
      },
      {
        field: 'penalized',
        headerName: 'Penalized',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId === params.row?.penalized?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.penalized?.player?.name} (${jersey})`
        },
      },
      {
        field: 'penaltyType',
        headerName: 'Penalty Type',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'penaltySubType',
        headerName: 'Penalty SubType',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'duration',
        headerName: 'Duration',
        width: 100,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'executedBy',
        headerName: 'Executed By',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId === params.row?.executedBy?.player?.playerId
            )?.jersey || null
          return (
            jersey && `${params?.row?.executedBy?.player?.name} (${jersey})`
          )
        },
      },
      {
        field: 'facedAgainst',
        headerName: 'Faced Against',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId ===
                params.row?.facedAgainst?.player?.playerId
            )?.jersey || null
          return (
            jersey && `${params?.row?.facedAgainst?.player?.name} (${jersey})`
          )
        },
      },
      {
        field: 'suffered',
        headerName: 'Suffered',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p =>
                p?.player?.playerId === params.row?.suffered?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.suffered?.player?.name} (${jersey})`
        },
      },
      {
        field: 'injuryType',
        headerName: 'Injury Type',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'savedBy',
        headerName: 'Saved By',
        width: 180,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
        valueGetter: params => {
          const jersey =
            players?.find(
              p => p?.player?.playerId === params.row?.savedBy?.player?.playerId
            )?.jersey || null
          return jersey && `${params?.row?.savedBy?.player?.name} (${jersey})`
        },
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
    [players, teams]
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
      <Dialog
        open={openDeleteEventDialog}
        onClose={() => {
          setOpenDeleteEventDialog(false)
          gameEventSimpleIdToDelete.current = null
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Do you really want to delete it?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will permanently delete this entity. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteEventDialog(false)
              gameEventSimpleIdToDelete.current = null
            }}
          >
            No, leave it
          </Button>
          <Button
            onClick={() => {
              setOpenDeleteEventDialog(false)
              deleteGameEventSimple({
                variables: {
                  gameEventSimpleId: gameEventSimpleIdToDelete.current,
                },
              })
            }}
          >
            Sure, delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

EventsTable.propTypes = {
  gameData: PropTypes.object,
}

export { EventsTable }
