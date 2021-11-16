import React, { useMemo, useRef } from 'react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Container, Grid } from '@mui/material'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from 'admin/pages/commonComponents/styled'
import { Error } from 'components/Error'
import { useWindowSize, useXGridSearch } from 'utils/hooks'
import { Loader } from 'components/Loader'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import { setIdFromEntityId, getXGridHeight } from 'utils'
import useMediaQuery from '@mui/material/useMediaQuery'
import { getColumns } from 'admin/pages/Game/view/XGrid'
import { useTheme } from '@mui/material/styles'

const GET_GAMES = gql`
  query getGames($where: GameWhere, $whereGameEvents: GameEventSimpleWhere) {
    games(where: $where) {
      gameId
      name
      type
      foreignId
      startDate
      startTime
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
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()

  const windowSize = useWindowSize()
  const toolbarRef = useRef()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  const { error, loading, data } = useQuery(GET_GAMES, {
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

  const columns = useMemo(() => {
    const cols = getColumns(organizationSlug)
    let stopList = [
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
    return cols.filter(c => !stopList.find(sl => sl === c.field))
  }, [organizationSlug])

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

  const searchIndexes = useMemo(
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
        <Grid item xs={12} md={12} lg={12}>
          {loading && !error && <Loader />}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{
                height: getXGridHeight(toolbarRef.current, windowSize),
              }}
              className={classes.xGridWrapper}
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
                    onChange: event => requestSearch(event.target.value),
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
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
