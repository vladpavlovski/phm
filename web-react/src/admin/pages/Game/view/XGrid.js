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
import ButtonGroup from '@mui/material/ButtonGroup'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgGameRoute } from 'router/routes'
import { LinkButton } from 'components/LinkButton'
import { Title } from 'components/Title'
import { Error } from 'components/Error'
import { useWindowSize, useDebounce } from 'utils/hooks'
import { Loader } from 'components/Loader'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import {
  setIdFromEntityId,
  getXGridHeight,
  formatDate,
  formatTime,
} from 'utils'

import * as JsSearch from 'js-search'

const useGamesViewState = createPersistedState('HMS-GamesView')

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
    field: 'name',
    headerName: 'Name',
    width: 150,
    hide: true,
  },
  {
    field: 'foreignId',
    headerName: 'Foreign Id',
    width: 150,
    hide: true,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 250,
  },
  {
    field: 'info',
    headerName: 'Info',
    width: 250,
  },
]
const searchGames = new JsSearch.Search('name')
searchGames.addIndex('description')
searchGames.addIndex('info')
searchGames.addIndex('foreignId')
searchGames.addIndex(['group', 'name'])
searchGames.addIndex(['group', 'competition', 'name'])
searchGames.addIndex(['phase', 'name'])
searchGames.addIndex(['phase', 'competition', 'name'])
searchGames.addIndex('referee')
searchGames.addIndex('startDate')
searchGames.addIndex('startTime')
searchGames.addIndex('timekeeper')
searchGames.addIndex('type')
searchGames.addIndex(['venue', 'name'])
searchGames.addIndex('hostTeamName')
searchGames.addIndex('guestTeamName')

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()

  const [gamesView, setGamesView] = useGamesViewState('all')
  const [
    getAllGames,
    { error: errorGamesAll, loading: loadingGamesAll, data: dataGamesAll },
  ] = useLazyQuery(GET_GAMES, {
    variables: {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
    },
  })

  const [
    getTodayGames,
    {
      error: errorGamesToday,
      loading: loadingGamesToday,
      data: dataGamesToday,
    },
  ] = useLazyQuery(GET_GAMES, {
    variables: {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
        startDate: dayjs().format('YYYY-MM-DD'),
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
    },
  })

  React.useEffect(() => {
    if (gamesView === 'all') {
      getAllGames()
    } else {
      getTodayGames()
    }
  }, [gamesView])

  const data = gamesView === 'all' ? dataGamesAll : dataGamesToday

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

    searchGames.addDocuments(preparedData)
    return preparedData
  }, [data])

  const [searchText, setSearchText] = React.useState('')
  const [searchData, setSearchData] = React.useState([])
  const debouncedSearch = useDebounce(searchText, 500)

  const requestSearch = React.useCallback(searchValue => {
    setSearchText(searchValue)
  }, [])

  React.useEffect(() => {
    const filteredRows = searchGames.search(debouncedSearch)
    setSearchData(debouncedSearch === '' ? gameData : filteredRows)
  }, [debouncedSearch, gameData])

  React.useEffect(() => {
    gameData && setSearchData(gameData)
  }, [gameData])

  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                <Title sx={{ display: 'inline-flex', marginRight: '0.4rem' }}>
                  {'Games'}
                </Title>
                <ButtonGroup variant="outlined">
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
          {(loadingGamesAll || loadingGamesToday) && <Loader />}
          {(errorGamesAll || errorGamesToday) && (
            <Error
              message={errorGamesAll?.message || errorGamesToday?.message}
            />
          )}
          {data && (
            <div
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                density="compact"
                columns={getColumns(organizationSlug)}
                rows={searchData}
                loading={loadingGamesAll || loadingGamesToday}
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
