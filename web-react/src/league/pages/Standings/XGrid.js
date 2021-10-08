import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'

import { useTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from 'admin/pages/commonComponents/styled'
import { Error } from 'components/Error'
import { useWindowSize, useXGridSearch } from 'utils/hooks'
import { Loader } from 'components/Loader'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import {
  setIdFromEntityId,
  getXGridHeight,
  getXGridValueFromArray,
} from 'utils'
import useMediaQuery from '@mui/material/useMediaQuery'
import dayjs from 'dayjs'

/**
 * TODO:
 * request for all gameResults before today date
 *
 *
 */

// const GET_GROUPS = gql`
//   query getGroups($whereGroups: GroupWhere) {
//     groups(where: $whereGroups) {
//       groups(where: $whereGroups) {
//         groupId
//         name
//       }
//     }
//   }
// `

const GET_GAMES = gql`
  query getGames($whereGames: GameWhere) {
    games(where: $whereGames) {
      gameId
      name
      type
      teams {
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
      gameResult {
        gameResultId
        hostWin
        guestWin
        draw
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
      }
    }
  }
`

// const GET_PLAYERS = gql`
//   query getPlayers(
//     $wherePlayers: PlayerWhere
//     $whereGroups: GroupWhere
//     $whereTeams: TeamWhere
//     $whereSeasons: SeasonWhere
//   ) {
//     players(where: $wherePlayers) {
//       playerId
//       name
//       firstName
//       lastName
//       stick
//       avatar
//       activityStatus
//       positions {
//         positionId
//         name
//       }
//       jerseys {
//         jerseyId
//         name
//         number
//       }
//       teams {
//         teamId
//         name
//         logo
//         groups {
//           groupId
//         }
//       }
//     }
//     groups(where: $whereGroups) {
//       groupId
//       name
//     }
//     teams(where: $whereTeams) {
//       teamId
//       name
//       logo
//     }
//     seasons(where: $whereSeasons) {
//       seasonId
//       name
//     }
//   }
// `

const useLeagueGroupState = createPersistedState('HMS-LeagueStandingsGroup')

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()

  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()
  const [selectedGroup, setSelectedGroup] = useLeagueGroupState()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  // whereGroups: {
  //   season: {
  //     name: '2021-2022',
  //     org: {
  //       urlSlug: organizationSlug,
  //     },
  //   },
  // },
  const { error, loading, data } = useQuery(GET_GAMES, {
    variables: {
      whereGames: {
        startDate_LT: dayjs().format('YYYY-MM-DD'),
        org: {
          urlSlug: organizationSlug,
        },
        group: {
          groupId:
            selectedGroup?.groupId || '632e570f-4a3e-48ee-b092-74982aa1a2fb',
        },
      },
    },
  })

  console.log('data:', data)

  const columns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        renderCell: params => {
          return (
            <Chip
              size="small"
              avatar={
                <Avatar alt={params?.row?.name} src={params?.row?.avatar} />
              }
              label={params?.value}
              color="info"
            />
          )
        },
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 150,
        // hide: !upSm,
      },
      {
        field: 'activityStatus',
        headerName: 'Activity Status',
        width: 150,
        hide: !upSm,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        renderCell: params => {
          return (
            <Stack spacing={1} direction="row">
              {params.row?.teams?.map(team => {
                return (
                  <Chip
                    size="small"
                    key={team?.teamId}
                    avatar={<Avatar alt={team?.name} src={team?.logo} />}
                    label={team?.name}
                    color="info"
                  />
                )
              })}
            </Stack>
          )
        },
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },
      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.jerseys, 'name')
        },
      },
    ],
    [upSm]
  )

  const playersData = React.useMemo(() => {
    const preparedData = setIdFromEntityId(data?.players || [], 'playerId')
      .filter(p => {
        let teamsGroups = []
        p?.teams?.forEach(t => {
          teamsGroups = [...teamsGroups, ...t?.groups]
        })
        return selectedGroup
          ? !!teamsGroups?.find(tg => tg.groupId === selectedGroup?.groupId)
          : true
      })
      .map(p => {
        const teamsInfo = getXGridValueFromArray(p?.teams || [], 'name')
        const jerseysInfo = getXGridValueFromArray(p?.jerseys || [], 'name')
        const positionsInfo = getXGridValueFromArray(p?.positions || [], 'name')

        return { ...p, teamsInfo, jerseysInfo, positionsInfo }
      })

    return preparedData
  }, [data, selectedGroup])

  const searchIndexes = React.useMemo(
    () => [
      'name',
      'stick',
      'activityStatus',
      'teamsInfo',
      'jerseysInfo',
      'positionsInfo',
    ],
    []
  )

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: playersData,
  })

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          {loading && !error && <Loader />}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <>
              <Stack>
                <ButtonGroup
                  size={upSm ? 'medium' : 'small'}
                  aria-label="outlined button group"
                  variant="outlined"
                >
                  {data?.groups?.map(g => {
                    return (
                      <Button
                        key={g.groupId}
                        type="button"
                        color="primary"
                        variant={
                          selectedGroup?.groupId === g?.groupId
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => {
                          setSelectedGroup(
                            g?.groupId === selectedGroup?.groupId ? null : g
                          )
                        }}
                      >
                        {g?.name}
                      </Button>
                    )
                  })}
                </ButtonGroup>
              </Stack>

              <div
                style={{
                  height: getXGridHeight(toolbarRef.current, windowSize),
                }}
                className={classes.xGridWrapper}
              >
                <DataGridPro
                  disableSelectionOnClick
                  disableMultipleSelection
                  density="compact"
                  columns={columns}
                  rows={searchData}
                  loading={loading}
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
                />
              </div>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
