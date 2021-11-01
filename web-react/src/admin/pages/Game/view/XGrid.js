import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Img from 'react-cool-img'
import dayjs from 'dayjs'
import createPersistedState from 'use-persisted-state'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import ButtonGroup from '@mui/material/ButtonGroup'
// import DatePicker from '@mui/lab/DatePicker'

import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import StarIcon from '@mui/icons-material/Star'
import BalconyIcon from '@mui/icons-material/Balcony'
// import TodayIcon from '@mui/icons-material/Today'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgGameRoute } from 'router/routes'
import { LinkButton } from 'components/LinkButton'

import { Error } from 'components/Error'
import { useWindowSize, useXGridSearch } from 'utils/hooks'
import { Loader } from 'components/Loader'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import {
  setIdFromEntityId,
  getXGridHeight,
  formatDate,
  formatTime,
} from 'utils'

const useGamesViewState = createPersistedState('HMS-GamesView')
const useGamesColumnsTypeState = createPersistedState('HMS-GamesColumnsType')

export const GET_GAMES = gql`
  query getGames($where: GameWhere, $whereGameEvents: GameEventSimpleWhere) {
    games(where: $where) {
      gameId
      name
      type
      foreignId
      startDate
      startTime
      description
      info
      timekeeper
      referee
      paymentHost
      paymentGuest
      paymentTimekeeper
      paymentReferee
      headline
      perex
      body
      flickrAlbum
      venue {
        name
      }
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
      playersConnection(
        where: { edge: { OR: [{ star: true }, { goalkeeper: true }] } }
      ) {
        edges {
          star
          jersey
          goalkeeper
          host
          node {
            playerId
            name
            firstName
            lastName
          }
        }
        totalCount
      }
      phase {
        phaseId
        name
        competition {
          name
        }
      }
      group {
        groupId
        name
        competition {
          name
        }
      }
      gameEventsSimple(where: $whereGameEvents) {
        gameEventSimpleId
        eventTypeCode
        team {
          teamId
        }
      }
      gameResult {
        gameStatus
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

export const getColumns = organizationSlug => [
  {
    field: 'gameId',
    headerName: 'Edit',
    width: 140,
    disableColumnMenu: true,
    renderCell: params => {
      return (
        <LinkButton
          startIcon={<EditIcon />}
          to={getAdminOrgGameRoute(organizationSlug, params.value)}
        >
          Edit
        </LinkButton>
      )
    },
  },
  {
    field: 'startDate',
    headerName: 'Date',
    width: 150,
    disableColumnMenu: true,
    valueGetter: params => params?.row?.startDate,
    valueFormatter: params => formatDate(params?.value, 'dddd, DD.MM.YYYY'),
  },
  {
    field: 'startTime',
    headerName: 'Time',
    width: 70,
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.startTime,
    valueFormatter: params => {
      return typeof params?.value === 'string' ? formatTime(params?.value) : ''
    },
  },
  {
    field: 'venue',
    headerName: 'Venue',
    width: 150,
    valueGetter: params => params?.row?.venue?.name,
  },
  {
    field: 'hostTeam',
    headerName: 'Host team',
    width: 230,
    renderCell: params => {
      const team = params?.row?.teamsConnection?.edges?.find(t => t?.host)?.node

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <span>{team?.name}</span>
          <Img
            src={team?.logo}
            style={{ width: '4rem', height: '4rem', marginLeft: '1rem' }}
            alt={team?.name}
          />
        </div>
      )
    },
  },
  {
    field: 'score',
    headerName: 'Score',
    disableColumnMenu: true,
    resizable: false,
    width: 130,
    renderCell: params => {
      const teamHost = params?.row?.teamsConnection?.edges?.find(
        t => t?.host
      )?.node

      const teamGuest = params?.row?.teamsConnection?.edges?.find(
        t => !t?.host
      )?.node
      const goalsHost = params?.row?.gameEventsSimple?.filter(
        ges => ges?.team?.teamId === teamHost?.teamId
      )?.length
      const goalsGuest = params?.row?.gameEventsSimple?.filter(
        ges => ges?.team?.teamId === teamGuest?.teamId
      )?.length

      return (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            fontFamily: 'Digital Numbers Regular',
          }}
        >
          <div style={{ fontSize: '1.8rem' }}>
            <span>{goalsHost}</span>:<span>{goalsGuest}</span>
          </div>
        </div>
      )
    },
  },
  {
    field: 'guestTeam',
    headerName: 'Guest team',
    width: 230,
    renderCell: params => {
      const team = params?.row?.teamsConnection?.edges?.find(
        t => !t?.host
      )?.node

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Img
            src={team?.logo}
            style={{ width: '4rem', height: '4rem', marginRight: '1rem' }}
            alt={team?.name}
          />
          <span>{team?.name}</span>
        </div>
      )
    },
  },
  {
    field: 'gameStatus',
    headerName: 'Status',
    width: 100,
    valueGetter: params => params?.row?.gameResult?.gameStatus || '',
  },
  {
    field: 'hostStar',
    headerName: 'Host Star',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        e => e.host && e.star
      )

      return (
        <Stack spacing={1} direction="row">
          {stars?.map(hs => {
            return (
              <Chip
                size="small"
                key={hs?.node?.playerId}
                icon={<StarIcon />}
                label={`${hs?.node?.name} ${
                  hs?.jersey && '(' + hs?.jersey + ')'
                }`}
                color="info"
              />
            )
          })}
        </Stack>
      )
    },
  },
  {
    field: 'guestStar',
    headerName: 'Guest Star',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        e => !e.host && e.star
      )

      return (
        <Stack spacing={1} direction="row">
          {stars?.map(hs => {
            return (
              <Chip
                size="small"
                key={hs?.node?.playerId}
                icon={<StarIcon />}
                label={`${hs?.node?.name} ${
                  hs?.jersey && '(' + hs?.jersey + ')'
                }`}
                color="info"
              />
            )
          })}
        </Stack>
      )
    },
  },
  {
    field: 'goalieHost',
    headerName: 'Goalie Host',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        e => e.host && e.goalkeeper
      )

      return (
        goalkeeper && (
          <Stack spacing={1} direction="row">
            <Chip
              size="small"
              key={goalkeeper?.node?.playerId}
              icon={<BalconyIcon />}
              label={`${goalkeeper?.node?.name} ${
                goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
              }`}
              color="info"
            />
          </Stack>
        )
      )
    },
  },
  {
    field: 'goalieGuest',
    headerName: 'Goalie Guest',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        e => !e.host && e.goalkeeper
      )

      return (
        goalkeeper && (
          <Stack spacing={1} direction="row">
            <Chip
              size="small"
              key={goalkeeper?.node?.playerId}
              icon={<BalconyIcon />}
              label={`${goalkeeper?.node?.name} ${
                goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
              }`}
              color="info"
            />
          </Stack>
        )
      )
    },
  },
  {
    field: 'paymentHost',
    headerName: 'Host Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentGuest',
    headerName: 'Guest Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentTimekeeper',
    headerName: 'Timekeeper Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentReferee',
    headerName: 'Referee Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'timekeeper',
    headerName: 'Timekeeper',
    width: 200,
  },
  {
    field: 'referee',
    headerName: 'Referee',
    width: 200,
  },
  {
    field: 'foreignId',
    headerName: 'Foreign Id',
    width: 150,
  },
  {
    field: 'info',
    headerName: 'Info',
    width: 250,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 250,
  },

  {
    field: 'phase',
    headerName: 'Phase',
    width: 120,
    valueGetter: params => params?.row?.phase?.name,
  },
  {
    field: 'group',
    headerName: 'Group',
    width: 120,
    valueGetter: params => params?.row?.group?.name,
  },
  {
    field: 'competition',
    headerName: 'Competition',
    width: 200,
    valueGetter: params => {
      const phaseCompetition = params?.row?.phase?.competition?.name
      const groupCompetition = params?.row?.group?.competition?.name
      return phaseCompetition || groupCompetition
    },
  },
  {
    field: 'headline',
    headerName: 'Headline',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'perex',
    headerName: 'Perex',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'body',
    headerName: 'Body',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'flickrAlbum',
    headerName: 'Flickr Album',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
  },
  {
    field: 'hostGoals',
    headerName: 'Goals Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostGoals,
  },
  {
    field: 'guestGoals',
    headerName: 'Goals Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestGoals,
  },
  {
    field: 'hostPenalties',
    headerName: 'Penalties Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostPenalties,
  },
  {
    field: 'guestPenalties',
    headerName: 'Penalties Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestPenalties,
  },
  {
    field: 'hostSaves',
    headerName: 'Saves Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostSaves,
  },
  {
    field: 'guestSaves',
    headerName: 'Saves Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestSaves,
  },
  {
    field: 'hostFaceOffs',
    headerName: 'FaceOffs Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostFaceOffs,
  },
  {
    field: 'guestFaceOffs',
    headerName: 'FaceOffs Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestFaceOffs,
  },
]

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()

  const [gamesView, setGamesView] = useGamesViewState('all')
  const [gamesColumnsType, setGamesColumnsType] =
    useGamesColumnsTypeState('admin')
  const [getGames, { error: errorGames, loading: loadingGames, data }] =
    useLazyQuery(GET_GAMES)

  React.useEffect(() => {
    const variables = {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
        ...(gamesView === 'today' && {
          startDate: dayjs().format('YYYY-MM-DD'),
        }),
        ...(gamesView === 'past' && {
          startDate_LT: dayjs().format('YYYY-MM-DD'),
        }),
        ...(gamesView === 'future' && {
          startDate_GT: dayjs().format('YYYY-MM-DD'),
        }),
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
    }
    getGames({ variables })
  }, [gamesView])

  const columns = React.useMemo(() => {
    const columnsBase = getColumns(organizationSlug)
    let cols
    let stopList
    switch (gamesColumnsType) {
      case 'admin':
        stopList = [
          'hostStar',
          'guestStar',
          'headline',
          'perex',
          'body',
          'flickrAlbum',
          'foreignId',
          'hostGoals',
          'guestGoals',
          'hostPenalties',
          'guestPenalties',
          'hostSaves',
          'guestSaves',
          'hostFaceOffs',
          'guestFaceOffs',
          'goalieGuest',
          'goalieHost',
        ]
        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      case 'reporter':
        stopList = [
          'paymentHost',
          'paymentGuest',
          'paymentTimekeeper',
          'paymentReferee',
          'timekeeper',
          'referee',
          'description',
          'info',
          'name',
          'gameStatus',
          'foreignId',
          'hostGoals',
          'guestGoals',
          'hostPenalties',
          'guestPenalties',
          'hostSaves',
          'guestSaves',
          'hostFaceOffs',
          'guestFaceOffs',
        ]
        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      case 'statistics':
        stopList = [
          'paymentHost',
          'paymentGuest',
          'paymentTimekeeper',
          'paymentReferee',
          'timekeeper',
          'referee',
          'headline',
          'perex',
          'body',
          'flickrAlbum',
          'description',
          'info',
          'name',
          'gameStatus',
          'foreignId',
        ]

        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      default:
        cols = columnsBase
        break
    }
    return cols
  }, [organizationSlug, gamesColumnsType])

  const gameData = React.useMemo(() => {
    const preparedData = setIdFromEntityId(data?.games || [], 'gameId').map(
      g => {
        const hostTeamName = g.teamsConnection?.edges?.find(e => e.host)?.node
          ?.name
        const guestTeamName = g.teamsConnection?.edges?.find(e => !e.host)?.node
          ?.name
        return { ...g, hostTeamName, guestTeamName }
      }
    )

    return preparedData
  }, [data])

  const searchIndexes = React.useMemo(
    () => [
      'name',
      'description',
      'info',
      'foreignId',
      'referee',
      'startDate',
      'startTime',
      'timekeeper',
      'type',
      'hostTeamName',
      'guestTeamName',
      ['venue', 'name'],
      ['group', 'name'],
      ['group', 'competition', 'name'],
      ['phase', 'name'],
      ['phase', 'competition', 'name'],
    ],
    []
  )

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: gameData,
  })

  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()

  // const [datepickerIsOpen, setDatepickerIsOpen] = React.useState(false)
  // const [selectedDate, setSelectedDate] = React.useState()
  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                {/* <Title sx={{ display: 'inline-flex', marginRight: '0.4rem' }}>
                  {'Games'}
                </Title> */}
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    variant={gamesView === 'all' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setGamesView('all')
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={gamesView === 'today' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setGamesView('today')
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant={gamesView === 'past' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setGamesView('past')
                    }}
                  >
                    Past
                  </Button>
                  <Button
                    variant={gamesView === 'future' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setGamesView('future')
                    }}
                  >
                    Future
                  </Button>
                  {/* <DatePicker
                  // should fix bug with anchorEl prop :( )
                    open={datepickerIsOpen}
                    onChange={setSelectedDate}
                    onClose={() => setDatepickerIsOpen(false)}
                    inputFormat={'DD/MM/YYYY'}
                    inputRef={ref}
                    renderInput={({ ref }) => (
                      <Button
                        ref={ref}
                        variant="outlined"
                        color="primary"
                        onClick={() => setDatepickerIsOpen(isOpen => !isOpen)}
                        startIcon={<TodayIcon />}
                      >
                        {dayjs(selectedDate).format('DD/MM/YYYY')}
                      </Button>
                    )}
                    value={selectedDate}
                  /> */}
                </ButtonGroup>
              </div>
              <div>
                {/* <Title sx={{ display: 'inline-flex', marginRight: '0.4rem' }}>
                  {'Games'}
                </Title> */}
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    variant={
                      gamesColumnsType === 'admin' ? 'contained' : 'outlined'
                    }
                    onClick={() => {
                      setGamesColumnsType('admin')
                    }}
                  >
                    Admin
                  </Button>
                  <Button
                    variant={
                      gamesColumnsType === 'reporter' ? 'contained' : 'outlined'
                    }
                    onClick={() => {
                      setGamesColumnsType('reporter')
                    }}
                  >
                    Reporter
                  </Button>
                  <Button
                    variant={
                      gamesColumnsType === 'statistics'
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() => {
                      setGamesColumnsType('statistics')
                    }}
                  >
                    Statistics
                  </Button>
                </ButtonGroup>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgGameRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
          </Paper>
          {loadingGames && <Loader />}
          {errorGames && <Error message={errorGames.message} />}
          {data && (
            <div
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                density="compact"
                columns={columns}
                rows={searchData}
                loading={loadingGames}
                components={{
                  Toolbar: QuickSearchToolbar,
                }}
                componentsProps={{
                  toolbar: {
                    value: searchText,
                    onChange: event => requestSearch(event.target.value),
                    clearSearch: () => requestSearch(''),
                  },
                }}
                sortModel={[
                  {
                    field: 'startDate',
                    sort: 'asc',
                  },
                ]}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
