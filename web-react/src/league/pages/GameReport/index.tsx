import { XGridLogo } from 'admin/pages/commonComponents/XGridLogo'
import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { Error } from 'components/Error'
import { Loader } from 'components/Loader'
import dayjs from 'dayjs'
import placeholderPerson from 'img/placeholderPerson.jpg'
import { FlickrGallery } from 'league/pages/GameReport/Flickr'
import React from 'react'
import Img from 'react-cool-img'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId } from 'utils'
import { Game, GameEventSimple, Player } from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import BalconyIcon from '@mui/icons-material/Balcony'
import StarIcon from '@mui/icons-material/Star'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro'

const GET_GAME_PLAY = gql`
  query getGame($whereGame: GameWhere) {
    games(where: $whereGame) {
      gameId
      name
      type
      info
      headline
      perex
      body
      foreignId
      description
      flickrAlbum
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
          position
          captain
          goalkeeper
          star
          node {
            playerId
            avatar
            name
            firstName
            lastName
            name
            levelCode
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
          player {
            playerId
          }
        }
        firstAssist {
          metaPlayerId
          player {
            playerId
          }
        }
        secondAssist {
          metaPlayerId
          player {
            playerId
          }
        }
        penalized {
          metaPlayerId
          player {
            playerId
          }
        }
      }
      gameResult {
        hostWin
        guestWin
        draw
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

const countPlayerStatistics = (player: Player, events: GameEventSimple[]) => {
  const playerId = player.playerId
  let ts = {
    scoredByCount: 0,
    assistsCount: 0,
    points: 0,
    penaltyMinutesCount: 0,
  }

  events
    .filter(e => e.eventTypeCode === 'goal' || e.eventTypeCode === 'penalty')
    .forEach(event => {
      if (event.eventTypeCode === 'goal') {
        if (event.scoredBy?.player?.playerId === playerId) {
          ts.scoredByCount++
          ts.points++
        }

        if (event.firstAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
        if (event.secondAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
      }
      if (event.eventTypeCode === 'penalty') {
        if (event.penalized?.player?.playerId === playerId) {
          ts.penaltyMinutesCount += parseFloat(event.duration)
        }
      }
    })

  return { ...player, ...ts }
}

type TGameReportParams = {
  gameId: string
}

const GameReport: React.FC = () => {
  const { gameId } = useParams<TGameReportParams>()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_GAME_PLAY, {
    variables: {
      whereGame: { gameId },
    },
  })

  const gameData: Game = queryData?.games?.[0] || null

  const teamHost = gameData?.teamsConnection?.edges?.find(t => t.host)?.node

  const teamGuest = gameData?.teamsConnection?.edges?.find(t => !t.host)?.node

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

  const columns: GridColumns = [
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

        switch (params?.row?.eventTypeCode) {
          case 'goal':
            playerMeta1 = params?.row?.scoredBy
            playerMeta2 = params?.row?.firstAssist
            playerMeta3 = params?.row?.secondAssist
            player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
            player2 = getPlayerByMetaId(playerMeta2?.metaPlayerId)
            player3 = getPlayerByMetaId(playerMeta3?.metaPlayerId)
            return (
              <div>
                {player1 && (
                  <strong>
                    {`${player1?.jersey ? `(${player1?.jersey}) - ` : ''}${
                      player1?.node?.name
                    }`}
                  </strong>
                )}
                {player2 && (
                  <span>
                    {` (${player2?.jersey || ''} ${player2?.node?.name}${
                      player3 ? ', ' : ')'
                    }`}
                  </span>
                )}
                {player3 && (
                  <span>{`${!player2 ? ' (' : ''}${player3?.jersey || ''} ${
                    player3?.node?.name
                  })`}</span>
                )}
                {params?.row?.goalType && (
                  <span>{` - ${params?.row?.goalType} ${
                    params?.row?.shotType && ' - ' + params?.row?.shotType
                  }`}</span>
                )}
              </div>
            )
          case 'penalty':
            playerMeta1 = params?.row?.penalized
            player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
            return (
              <div>
                {player1 && (
                  <strong>
                    {`${player1?.jersey ? `(${player1?.jersey}) - ` : ''}${
                      player1?.node?.name
                    }`}
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
          case 'penaltyShot':
            playerMeta1 = params?.row?.executedBy
            playerMeta2 = params?.row?.facedAgainst
            player1 = getPlayerByMetaId(playerMeta1?.metaPlayerId)
            player2 = getPlayerByMetaId(playerMeta2?.metaPlayerId)
            return (
              <div>
                {player1 && (
                  <strong>
                    {`${player1?.jersey ? `(${player1?.jersey}) - ` : ''}${
                      player1?.node?.name
                    }`}
                  </strong>
                )}
                {player2 && (
                  <span>{`${player2?.jersey} ${player2?.node?.name}`}</span>
                )}
              </div>
            )
        }
      },
    },
  ]

  const playersHost = React.useMemo(
    () =>
      gameData?.playersConnection?.edges
        ?.filter(p => p.host)
        .map(p => {
          const { node, ...rest } = p
          return { ...rest, ...node }
        })
        .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) ||
      null ||
      [],
    [gameData]
  )

  const playersGuest = React.useMemo(
    () =>
      gameData?.playersConnection?.edges
        ?.filter(p => !p.host)
        .map(p => {
          const { node, ...rest } = p
          return { ...rest, ...node }
        })
        .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) ||
      null ||
      [],
    [gameData]
  )

  return (
    <Container maxWidth={false} disableGutters={!upMd}>
      {queryLoading && <Loader />}
      <Error message={queryError?.message} />
      {gameData && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: '16px' }}>
                <Typography variant="h4" component="div">
                  {`${gameData?.headline}`}
                </Typography>
                <Typography variant="subtitle1" component="div">
                  {`${gameData?.perex}`}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: '16px' }}>
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
                <Toolbar
                  disableGutters
                  sx={{
                    p: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{ textAlign: 'left' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamHost?.name ?? 'Host team'}

                    <Divider
                      sx={{
                        borderColor: gameData?.gameResult?.draw
                          ? theme?.palette?.warning?.main
                          : gameData?.gameResult?.hostWin
                          ? theme?.palette?.success?.main
                          : theme?.palette?.error?.main,
                      }}
                    />
                  </Typography>

                  <Typography
                    sx={{ textAlign: 'right' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamGuest?.name ?? 'Guest team'}
                    <Divider
                      sx={{
                        borderColor: gameData?.gameResult?.draw
                          ? theme?.palette?.warning?.main
                          : gameData?.gameResult?.guestWin
                          ? theme?.palette?.success?.main
                          : theme?.palette?.error?.main,
                      }}
                    />
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
                        style={{
                          width: '100px',
                          height: '100px',
                          borderWidth: '0.2rem',
                          borderStyle: 'solid',
                          borderRadius: '50%',
                          borderColor: gameData?.gameResult?.draw
                            ? theme?.palette?.warning?.main
                            : gameData?.gameResult?.hostWin
                            ? theme?.palette?.success?.main
                            : theme?.palette?.error?.main,
                        }}
                        src={teamHost?.logo}
                        alt={teamHost?.name}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Digital Numbers Regular',
                        fontSize: upMd ? '6rem' : upSm ? '4rem' : '2.5rem',
                      }}
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
                        style={{
                          width: '100px',
                          height: '100px',
                          borderWidth: '0.2rem',
                          borderStyle: 'solid',
                          borderRadius: '50%',
                          borderColor: gameData?.gameResult?.draw
                            ? theme?.palette?.warning?.main
                            : gameData?.gameResult?.guestWin
                            ? theme?.palette?.success?.main
                            : theme?.palette?.error?.main,
                        }}
                        src={teamGuest?.logo}
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
              <Paper sx={{ p: '16px' }}>
                <Typography variant="body1" component="div">
                  {`${gameData?.perex}`}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <div
                style={{ height: '50rem' }}
                //  className={classes.xGridWrapper}
              >
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
                      const date1 = new Date(x.timestamp).valueOf()
                      const date2 = new Date(y.timestamp).valueOf()
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
            <Grid item xs={12} md={6}>
              <GameLineup players={playersHost} />
            </Grid>
            <Grid item xs={12} md={6}>
              <GameLineup players={playersGuest} />
            </Grid>
          </Grid>
          <FlickrGallery albumId={gameData?.flickrAlbum} />
        </>
      )}
    </Container>
  )
}

const GameLineup = (props: { players: Player[] }) => {
  const { players } = props

  const gameLineupColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'status',
        headerName: 'Status',
        width: 50,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          const isCaptain = !!params?.row?.captain
          const isGoalkeeper = !!params?.row?.goalkeeper
          const isStar = !!params?.row?.star

          return (
            <>
              {isCaptain && (
                <Tooltip arrow title="Captain" placement="top">
                  <VerifiedUserIcon />
                </Tooltip>
              )}
              {isGoalkeeper && (
                <Tooltip arrow title="Goalkeeper" placement="top">
                  <BalconyIcon />
                </Tooltip>
              )}
              {isStar && (
                <Tooltip arrow title={'Game Star'} placement="top">
                  <StarIcon sx={{ color: 'rgb(250, 175, 0)' }} />
                </Tooltip>
              )}
            </>
          )
        },
      },
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 120,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'jersey',
        headerName: 'Jersey',
        width: 50,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'position',
        headerName: 'Position',
        width: 100,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'levelCode',
        headerName: 'Level',
        width: 150,
        renderCell: params => {
          return <PlayerLevel code={params.value} />
        },
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
      },
      {
        field: 'scoredByCount',
        headerName: 'G',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'assistsCount',
        headerName: 'A',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'points',
        headerName: 'PTS',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'penaltyMinutesCount',
        headerName: 'PIM',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'info',
        headerName: 'Info',
        width: 120,
        disableColumnMenu: true,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          const isHattrick = params.row?.scoredByCount >= 3
          const is3Points = params.row?.points >= 3
          return (
            <>
              {isHattrick && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0faf00',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  Hattrick!
                </Typography>
              )}
              {!isHattrick && is3Points && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0672b1',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  3+ Points!
                </Typography>
              )}
            </>
          )
        },
      },
    ],
    []
  )

  return (
    <div
      style={{ height: '30rem' }}
      //  className={classes.xGridWrapper}
    >
      <DataGridPro
        columns={gameLineupColumns}
        rows={setIdFromEntityId(players, 'playerId')}
        density="compact"
        disableColumnSelector
        disableSelectionOnClick
        disableMultipleSelection
        hideFooterRowCount
      />
    </div>
  )
}

export { GameReport as default }
