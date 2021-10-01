import React from 'react'

import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { DataGridPro } from '@mui/x-data-grid-pro'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Img from 'react-cool-img'
import dayjs from 'dayjs'
import { useStyles } from 'admin/pages/commonComponents/styled'
import { Error } from 'components/Error'
import { Loader } from 'components/Loader'

import { setIdFromEntityId } from 'utils'

const GET_GAME_PLAY = gql`
  query getGame($whereGame: GameWhere) {
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
            logo
          }
        }
      }
      playersConnection {
        edges {
          host
          jersey
          node {
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
      phase {
        name
        competition {
          name
        }
      }
      group {
        name
        competition {
          name
        }
      }
      startDate
      startTime
      venue {
        name
      }
      gameEventsSimple {
        gameEventSimpleId
        eventType
        period
        remainingTime
        eventType
        eventTypeCode
        goalType
        timestamp
        shotType
        penaltyType
        penaltySubType
        duration
        team {
          teamId
          nick
          logo
        }
        scoredBy {
          metaPlayerId
        }
        firstAssist {
          metaPlayerId
        }
        secondAssist {
          metaPlayerId
        }
        penalized {
          metaPlayerId
        }
      }
      gameResult {
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
      }
    }
  }
`

const GameReport = () => {
  const { gameId } = useParams()
  const classes = useStyles()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_GAME_PLAY, {
    variables: {
      whereGame: { gameId },
    },
  })

  const gameData = queryData?.games?.[0] || null

  const teamHost = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => t.host)?.node,
    [gameData]
  )

  const teamGuest = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => !t.host)?.node,
    [gameData]
  )

  const getPlayerByMetaId = React.useCallback(
    id =>
      id
        ? gameData?.playersConnection?.edges?.find(
            edge => edge?.node?.meta?.metaPlayerId === id
          )
        : null,

    [gameData]
  )
  const theme = useTheme()

  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  const upMd = useMediaQuery(theme.breakpoints.up('md'))

  const columns = React.useMemo(
    () => [
      {
        field: 'period',
        headerName: 'Period',
        width: 100,
        hide: !upSm,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'remainingTime',
        headerName: 'Remaining Time',
        width: 80,
        hide: !upSm,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'team',
        headerName: 'Team',
        width: upSm ? 200 : 50,
        disableColumnMenu: !upSm,
        resizable: true,
        sortable: false,
        renderCell: params => {
          return (
            <>
              <Img
                src={params?.row?.team?.logo}
                style={{
                  display: 'inline',
                  width: upSm ? '2rem' : '1.5rem',
                  height: upSm ? '2rem' : '1.5rem',
                  marginRight: '1rem',
                }}
                alt={params?.row?.team?.name}
              />
              {upSm && <span>{params?.row?.team?.nick}</span>}
            </>
          )
        },
      },
      {
        field: 'eventType',
        headerName: 'Event',
        width: upSm ? 120 : 80,
        resizable: true,
        disableColumnMenu: !upSm,
        sortable: false,
      },
      {
        field: 'eventDescription',
        headerName: 'Info',
        width: 550,
        resizable: true,
        sortable: false,
        renderCell: params => {
          let playerMeta1
          let playerMeta2
          let playerMeta3
          let player1
          let player2
          let player3
          let template
          switch (params?.row?.eventTypeCode) {
            case 'goal':
              playerMeta1 = params?.row?.scoredBy
              playerMeta2 = params?.row?.firstAssist
              playerMeta3 = params?.row?.secondAssist
              player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
              player2 = getPlayerByMetaId(playerMeta2?.metaPlayerId)
              player3 = getPlayerByMetaId(playerMeta3?.metaPlayerId)
              template = (
                <div>
                  {player1 && (
                    <strong>
                      {`(${player1?.jersey || ''}) - ${player1?.node?.name}`}
                    </strong>
                  )}
                  {player2 && (
                    <span>{` (${player2?.jersey} ${player2?.node?.name}${
                      player3 ? ', ' : ')'
                    }`}</span>
                  )}
                  {player3 && (
                    <span>{`${player3?.jersey} ${player3?.node?.name})`}</span>
                  )}
                  {params?.row?.goalType && (
                    <span>{` - ${params?.row?.goalType} ${
                      params?.row?.shotType && ' - ' + params?.row?.shotType
                    }`}</span>
                  )}
                </div>
              )
              break
            case 'penalty':
              playerMeta1 = params?.row?.penalized
              player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
              template = (
                <div>
                  {player1 && (
                    <strong>
                      {`(${player1?.jersey || ''}) - ${player1?.node?.name}`}
                    </strong>
                  )}
                  {params?.row?.penaltyType && (
                    <span>{` - ${params?.row?.penaltyType}`}</span>
                  )}
                  {params?.row?.duration && (
                    <span>{` - ${params?.row?.duration}min`}</span>
                  )}
                  {params?.row?.penaltySubType && (
                    <span>{` - ${params?.row?.penaltySubType}`}</span>
                  )}
                </div>
              )
              break
            case 'penaltyShot':
              playerMeta1 = params?.row?.executedBy
              playerMeta2 = params?.row?.facedAgainst
              player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
              player2 = getPlayerByMetaId(playerMeta2?.metaPlayerId)
              template = (
                <div>
                  {player1 && (
                    <strong>
                      {`(${player1?.jersey || ''}) - ${player1?.node?.name}`}
                    </strong>
                  )}
                  {player2 && (
                    <span>{`${player2?.jersey} ${player2?.node?.name}`}</span>
                  )}
                </div>
              )
              break
          }

          return <>{template}</>
        },
      },
    ],
    [upSm]
  )

  return (
    <Container maxWidth={false} disableGutters={!upMd}>
      {queryLoading && <Loader />}
      {queryError && <Error message={queryError.message} />}
      {gameData && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="h4" component="div">
                  {`${gameData?.name}`}
                </Typography>
                <Typography variant="subtitle1" component="div">
                  {`${gameData?.description}`}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {upSm && (
                  <>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ textAlign: 'center' }}
                      component="div"
                    >
                      {`${dayjs(gameData?.startDate).format('LL')}, ${dayjs(
                        gameData?.startTime,
                        'HH:mm:ss'
                      ).format('HH:mm')} - ${gameData?.venue?.name}
                     - ${gameData?.phase?.competition?.name} - ${
                        gameData?.phase?.name
                      } - ${gameData?.group?.name}`}
                    </Typography>
                    <Typography
                      sx={{ textAlign: 'center' }}
                      variant="subtitle2"
                      gutterBottom
                      component="div"
                    >
                      {`${gameData?.foreignId}`}
                    </Typography>
                  </>
                )}
                {!upSm && (
                  <>
                    <Typography variant="caption" gutterBottom component="div">
                      {`${dayjs(gameData?.startDate).format('LL')}, ${dayjs(
                        gameData?.startTime,
                        'HH:mm:ss'
                      ).format('HH:mm')} - ${gameData?.venue?.name}`}
                    </Typography>
                    <Typography variant="caption" gutterBottom component="div">
                      {gameData?.phase?.competition?.name ||
                        gameData?.group?.competition?.name}
                    </Typography>
                    <Typography variant="caption" gutterBottom component="div">
                      {gameData?.phase?.name}
                    </Typography>
                    <Typography variant="caption" gutterBottom component="div">
                      {gameData?.group?.name}
                    </Typography>
                    <Typography variant="caption" gutterBottom component="div">
                      {gameData?.foreignId}
                    </Typography>
                  </>
                )}
                <Divider />
                <Toolbar disableGutters className={classes.toolbarForm}>
                  <Typography
                    sx={{ textAlign: 'left' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamHost?.name ?? 'Host team'}
                  </Typography>

                  <Typography
                    sx={{ textAlign: 'right' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamGuest?.name ?? 'Guest team'}
                  </Typography>
                </Toolbar>
                <Grid container spacing={0}>
                  <Grid item xs={4}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamHost?.logo}
                        className={classes.gamePlayTeamLogo}
                        alt={teamHost?.name}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Digital Numbers Regular',
                      }}
                      component="div"
                      className={classes.gamePlayScore}
                    >
                      {`${gameData?.gameResult?.hostGoals}:${gameData?.gameResult?.guestGoals}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamGuest?.logo}
                        className={classes.gamePlayTeamLogo}
                        alt={teamGuest?.name}
                      />
                    </div>
                  </Grid>
                  {upSm && (
                    <Grid item xs={6}>
                      <div>
                        <Divider sx={{ margin: '1rem 0' }} />
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          component="div"
                        >
                          {`Saves: ${gameData?.gameResult?.hostSaves}`}
                          {` | `}
                          {`FaceOffs: ${gameData?.gameResult?.hostFaceOffs}`}
                          {` | `}
                          {`Penalties: ${gameData?.gameResult?.hostPenalties}`}
                        </Typography>
                      </div>
                    </Grid>
                  )}
                  {upSm && (
                    <Grid item xs={6}>
                      <div style={{ textAlign: 'right' }}>
                        <Divider sx={{ margin: '1rem 0' }} />
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          component="div"
                        >
                          {`Saves: ${gameData?.gameResult?.guestSaves}`}
                          {` | `}
                          {`FaceOffs: ${gameData?.gameResult?.guestFaceOffs}`}
                          {` | `}
                          {`Penalties: ${gameData?.gameResult?.guestPenalties}`}
                        </Typography>
                      </div>
                    </Grid>
                  )}
                </Grid>
                {!upSm && (
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell scope="row" align="left">
                          {gameData?.gameResult?.hostSaves}
                        </TableCell>
                        <TableCell component="th" align="center">
                          Saves
                        </TableCell>
                        <TableCell align="right">
                          {gameData?.gameResult?.guestSaves}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell scope="row" align="left">
                          {gameData?.gameResult?.hostFaceOffs}
                        </TableCell>
                        <TableCell component="th" align="center">
                          FaceOffs
                        </TableCell>
                        <TableCell align="right">
                          {gameData?.gameResult?.guestFaceOffs}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell scope="row" align="left">
                          {gameData?.gameResult?.hostPenalties}
                        </TableCell>
                        <TableCell component="th" align="center">
                          Penalties
                        </TableCell>
                        <TableCell align="right">
                          {gameData?.gameResult?.guestPenalties}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <div style={{ height: '60rem' }} className={classes.xGridWrapper}>
                <DataGridPro
                  columns={columns}
                  rows={setIdFromEntityId(
                    [
                      ...gameData?.gameEventsSimple.filter(
                        ges =>
                          ges?.eventTypeCode === 'goal' ||
                          ges?.eventTypeCode === 'penalty' ||
                          ges?.eventTypeCode === 'penaltyShot'
                      ),
                    ].sort((x, y) => {
                      const date1 = new Date(x.timestamp)
                      const date2 = new Date(y.timestamp)
                      return date2 - date1
                    }),
                    'gameEventSimpleId'
                  )}
                  loading={queryLoading}
                  density="compact"
                  disableColumnSelector
                  disableSelectionOnClick
                  disableMultipleSelection
                  hideFooterRowCount
                />
              </div>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export { GameReport as default }
