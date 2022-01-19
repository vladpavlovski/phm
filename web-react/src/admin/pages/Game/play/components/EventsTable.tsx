import React from 'react'
// import PropTypes from 'prop-types'
import { gql, useMutation } from '@apollo/client'
import dayjs from 'dayjs'
import Img from 'react-cool-img'
import { useSnackbar } from 'notistack'

// import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro'

import { useStyles } from '../../../commonComponents/styled'
import { getEventSettings, TEventType } from './gameEvents'
import { setIdFromEntityId } from 'utils'

// import GameEventFormContext from '../context'
import { prepareGameResultUpdate, ensure } from '../handlers'
import { GET_GAME_PLAY, TQueryTypeData, TQueryTypeVars } from '../index'
import { Game, Player, Team, GameEventSimple } from 'utils/types'
const DELETE_GAME_EVENT_SIMPLE = gql`
  mutation deleteGameEventSimple(
    $where: GameEventSimpleWhere
    $gameResultWhere: GameResultWhere
    $gameResultUpdateInput: GameResultUpdateInput
  ) {
    deleteGameEventSimples(where: $where) {
      nodesDeleted
    }
    updateGameResults(where: $gameResultWhere, update: $gameResultUpdateInput) {
      gameResults {
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
  }
`

type TPlayerNameFormat = {
  name: string
  jersey: number | null
}

const PlayerNameFormat: React.FC<TPlayerNameFormat> = React.memo(props => {
  const { name, jersey } = props

  return (
    <>
      {jersey && <strong>({jersey})</strong>}&nbsp;
      <span>{name}</span>
    </>
  )
})

type TEventsTable = {
  gameData: Game
  players: { node: Player; jersey: number }[]
  teams: { node: Team; host: boolean }[]
}

const EventsTable: React.FC<TEventsTable> = props => {
  //gameSettings
  const { gameData, players, teams } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [openDeleteEventDialog, setOpenDeleteEventDialog] =
    React.useState(false)

  const [eventsView, setEventsView] = React.useState('filtered')

  const gameEventSimpleIdToDelete = React.useRef<GameEventSimple | null>(null)

  // const { setGameEventSettings, setGameEventData, setOpenGameEventDialog } =
  //   React.useContext(GameEventFormContext)

  const [deleteGameEventSimple] = useMutation(DELETE_GAME_EVENT_SIMPLE, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_GAME_PLAY,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })

        const updatedEvents =
          queryResult?.games?.[0]?.gameEventsSimple?.filter(
            ges =>
              ges?.gameEventSimpleId !==
              gameEventSimpleIdToDelete.current?.gameEventSimpleId
          ) || []

        const updatedResult = {
          games: [
            {
              ...(queryResult?.games?.[0] || []),
              gameResult: data?.updateGameResults?.gameResults?.[0],
              gameEventsSimple: updatedEvents,
            },
          ],
          systemSettings: queryResult?.systemSettings,
        }

        cache.writeQuery({
          query: GET_GAME_PLAY,
          data: updatedResult,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
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

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'period',
        headerName: 'Period',
        width: 100,
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
              {/* <IconButton
                type="button"
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  // find and set gameEventSettings based on eventTypeCode
                  const data = getEventSettings(params.row?.eventTypeCode)
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
                          p?.node?.playerId ===
                          params.row?.scoredBy?.player?.playerId
                      ) || null,
                    firstAssist:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.firstAssist?.player?.playerId
                      ) || null,
                    secondAssist:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.secondAssist?.player?.playerId
                      ) || null,
                    wonBy:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.wonBy?.player?.playerId
                      ) || null,
                    lostBy:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.lostBy?.player?.playerId
                      ) || null,
                    suffered:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.suffered?.player?.playerId
                      ) || null,
                    penalized:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.penalized?.player?.playerId
                      ) || null,
                    executedBy:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.executedBy?.player?.playerId
                      ) || null,
                    facedAgainst:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
                          params.row?.facedAgainst?.player?.playerId
                      ) || null,
                    savedBy:
                      players?.find(
                        p =>
                          p?.node?.playerId ===
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
              </IconButton> */}
              <IconButton
                type="button"
                size="small"
                color="primary"
                onClick={() => {
                  gameEventSimpleIdToDelete.current = params.row
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
        width: 80,
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
        resizable: true,
        sortable: false,
      },

      {
        field: 'scoredBy',
        headerName: 'Scored by',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.scoredBy?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.scoredBy?.player?.name}
            />
          )
        },
      },

      {
        field: 'firstAssist',
        headerName: 'First Assist',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p =>
                p?.node?.playerId === params.row?.firstAssist?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.firstAssist?.player?.name}
            />
          )
        },
      },

      {
        field: 'secondAssist',
        headerName: 'Second Assist',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p =>
                p?.node?.playerId === params.row?.secondAssist?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.secondAssist?.player?.name}
            />
          )
        },
      },
      {
        field: 'goalType',
        headerName: 'Goal Type',
        width: 200,
        disableColumnMenu: true,
        resizable: false,
        sortable: false,
      },
      {
        field: 'penalized',
        headerName: 'Penalized',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.penalized?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.penalized?.player?.name}
            />
          )
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
        field: 'duration',
        headerName: 'Duration',
        width: 100,
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
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.wonBy?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.wonBy?.player?.name}
            />
          )
        },
      },
      {
        field: 'lostBy',
        headerName: 'Lost By',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.lostBy?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.lostBy?.player?.name}
            />
          )
        },
      },

      {
        field: 'executedBy',
        headerName: 'Executed By',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.executedBy?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.executedBy?.player?.name}
            />
          )
        },
      },
      {
        field: 'facedAgainst',
        headerName: 'Faced Against',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p =>
                p?.node?.playerId === params.row?.facedAgainst?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.facedAgainst?.player?.name}
            />
          )
        },
      },
      {
        field: 'suffered',
        headerName: 'Suffered',
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.suffered?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.suffered?.player?.name}
            />
          )
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
        resizable: true,
        sortable: false,
        renderCell: params => {
          const jersey =
            players?.find(
              p => p?.node?.playerId === params.row?.savedBy?.player.playerId
            )?.jersey || null
          return (
            <PlayerNameFormat
              jersey={jersey}
              name={params?.row?.savedBy?.player?.name}
            />
          )
        },
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        width: 120,
        disableColumnMenu: true,
        resizable: false,
        valueFormatter: params =>
          params?.value ? dayjs(Number(params.value)).format('HH:mm:ss') : '',
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
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={eventsView === 'all' ? 'contained' : 'outlined'}
            onClick={() => {
              setEventsView('all')
            }}
          >
            All
          </Button>
          <Button
            variant={eventsView === 'filtered' ? 'contained' : 'outlined'}
            onClick={() => {
              setEventsView('filtered')
            }}
          >
            Filtered
          </Button>
        </ButtonGroup>
      </div>
      {gameData?.gameEventsSimple && (
        <div style={{ height: '60rem' }} className={classes.xGridWrapper}>
          <DataGridPro
            columns={columns}
            rows={setIdFromEntityId(
              [
                ...gameData?.gameEventsSimple?.filter(ges =>
                  eventsView === 'filtered'
                    ? ges?.eventTypeCode !== 'save' &&
                      ges?.eventTypeCode !== 'faceOff'
                    : true
                ),
              ].sort((x, y) => {
                const date1 = new Date(x.timestamp).valueOf()
                const date2 = new Date(y.timestamp).valueOf()
                return date2 - date1
              }),
              'gameEventSimpleId'
            )}
            density="compact"
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
            disabled={!!gameEventSimpleIdToDelete.current}
            onClick={() => {
              if (gameEventSimpleIdToDelete.current) {
                setOpenDeleteEventDialog(false)
                const gameEventSettings = getEventSettings(
                  gameEventSimpleIdToDelete.current.eventTypeCode
                ) as TEventType

                const isHost = ensure(
                  teams?.find(
                    t =>
                      t?.node?.teamId ===
                      gameEventSimpleIdToDelete.current?.team?.teamId
                  )?.host
                )

                const { where, update } = prepareGameResultUpdate({
                  gameData,
                  gameEventSettings,
                  host: isHost,
                  changeUp: false,
                })
                deleteGameEventSimple({
                  variables: {
                    where: {
                      gameEventSimpleId:
                        gameEventSimpleIdToDelete.current?.gameEventSimpleId,
                    },
                    gameResultWhere: where,
                    gameResultUpdateInput: update,
                  },
                })
              }
            }}
          >
            Sure, delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export { EventsTable }
