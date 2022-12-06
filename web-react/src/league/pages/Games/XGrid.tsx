import { getColumns } from 'admin/pages/Game/view'
import { Error } from 'components/Error'
import { Loader } from 'components/Loader'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import React from 'react'
import { useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import { setIdFromEntityId } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Game, ParamsProps, Season } from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import { Button, ButtonGroup, Container, Grid, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DataGridPro, GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'

const GET_GAMES = gql`
  query getGames(
    $whereGames: GameWhere
    $whereGameEvents: GameEventSimpleWhere
    $whereSeasons: SeasonWhere
  ) {
    games(where: $whereGames) {
      gameId
      name
      type
      foreignId
      startDate
      startTime
      timekeeper
      referee
      price
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
          host
          goalkeeper
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
      }
      org {
        urlGameLinks
        bankAccountNumber
        bankAccountCurrency
        bankCode
      }
    }
    seasons(where: $whereSeasons) {
      seasonId
      name
      status
      startDate
      endDate
    }
  }
`

type TData = {
  games: Game[]
  seasons: Season[]
}

const useLeagueStore = createPersistedState('HMS-store-games')
type TLeagueStore = {
  [key: string]: {
    season: Season | null
  }
}

const XGridTable: React.FC = () => {
  const { organizationSlug } = useParams<ParamsProps>()
  const [leagueStore, setLeagueStore] = useLeagueStore<TLeagueStore>({})
  const selectedSeason = leagueStore?.[organizationSlug]?.season

  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  const { error, loading, data } = useQuery<TData>(GET_GAMES, {
    variables: {
      whereGames: {
        startDate_GTE: selectedSeason?.startDate || null,
        startDate_LTE: selectedSeason?.endDate || null,
        org: {
          urlSlug: organizationSlug,
        },
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
      options: {
        sort: {
          startDate: 'ASC',
        },
      },
      whereSeasons: {
        org: {
          urlSlug: organizationSlug,
        },
      },
    },
  })

  const columns = React.useMemo(() => {
    const cols = getColumns(organizationSlug)
    const stopList = [
      'gameId',
      'paymentHost',
      'paymentGuest',
      'paymentTimekeeper',
      'paymentReferee',
      'headline',
      'perex',
      'body',
      'flickrAlbum',
      'hostGoals',
      'guestGoals',
      'hostPenalties',
      'guestPenalties',
      'hostSaves',
      'guestSaves',
      'hostFaceOffs',
      'guestFaceOffs',
      'description',
      'info',
      'gameStatus',
      'name',
      'hostTeamName',
      'guestTeamName',
      'hostStarName',
      'guestStarName',
      'goalieHostName',
      'goalieGuestName',
    ]
    // TODO: remade after web-react/src/admin/pages/Game/view/XGrid.js will changed to Typescript
    return cols.filter(c => !stopList.find(sl => sl === c.field)) as GridColumns
  }, [organizationSlug])

  const gameData = React.useMemo((): GridRowsProp[] => {
    const preparedData = setIdFromEntityId(data?.games || [], 'gameId').map(
      (g: Game) => {
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

  return (
    <Container maxWidth={false} disableGutters={!upSm}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading && <Loader />}
          <Error message={error?.message} />
          {data && (
            <>
              <Stack>
                <ButtonGroup
                  size={upSm ? 'medium' : 'small'}
                  aria-label="outlined button group"
                  variant="outlined"
                >
                  {data?.seasons?.map(season => {
                    return (
                      <Button
                        key={season.seasonId}
                        type="button"
                        color="primary"
                        variant={
                          selectedSeason?.seasonId === season?.seasonId
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => {
                          setLeagueStore(state => ({
                            ...state,
                            [organizationSlug]: {
                              ...state[organizationSlug],
                              season:
                                state[organizationSlug]?.season?.seasonId ===
                                season?.seasonId
                                  ? null
                                  : season,
                            },
                          }))
                        }}
                      >
                        {season?.name}
                      </Button>
                    )
                  }) || (
                    <Button type="button" color="primary">
                      Loading...
                    </Button>
                  )}
                </ButtonGroup>
              </Stack>
              {selectedSeason ? (
                <div
                  style={{
                    height: 800,
                  }}
                  // className={classes.xGridWrapper}
                >
                  <DataGridPro
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
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>
                        ): void => {
                          requestSearch(event.target.value)
                        },
                        clearSearch: () => requestSearch(''),
                        hideButtons: true,
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
              ) : (
                <Typography variant="h6">Select season first</Typography>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
