import React, { useMemo, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Container, Grid } from '@mui/material'
import * as JsSearch from 'js-search'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../admin/pages/commonComponents/styled'
import { Error } from '../../../components/Error'
import { useWindowSize, useDebounce } from '../../../utils/hooks'
import { Loader } from '../../../components/Loader'
import { QuickSearchToolbar } from '../../../components/QuickSearchToolbar'
import { setIdFromEntityId, getXGridHeight } from '../../../utils'

import { GET_GAMES, getColumns } from '../../../admin/pages/Game/view/XGrid'

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

  const windowSize = useWindowSize()
  const toolbarRef = useRef()
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

    return cols.filter(c => c.field !== 'gameId')
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

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          {loading && !error && <Loader />}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
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
