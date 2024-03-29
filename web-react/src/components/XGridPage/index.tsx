import { Error, QuickSearchToolbar } from 'components'
import LayoutContext from 'context/layout'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useXGridSearch } from 'utils/hooks'
import { ApolloError } from '@apollo/client'
import { Stack } from '@mui/material'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { DataGridPro, GridColumns, GridPinnedColumns, GridRowsProp } from '@mui/x-data-grid-pro'

type Props = {
  title: string
  loading: boolean
  error?: ApolloError
  columns: GridColumns
  rows: GridRowsProp[]
  searchIndexes: (string | string[])[]
  pinnedColumns?: GridPinnedColumns
  children?: React.ReactNode
}

const XGridPage = ({
  children,
  title,
  loading,
  error,
  columns,
  pinnedColumns,
  rows,
  searchIndexes,
}: Props) => {
  const { setBarTitle } = React.useContext(LayoutContext)

  React.useEffect(() => {
    setBarTitle(title)
    return () => {
      setBarTitle('')
    }
  }, [title])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: rows,
  })

  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Grid item xs={12}>
        <Container maxWidth={false}>
          <Grid container spacing={2}>
            {children && (
              <Grid item xs={12} md={12} lg={12}>
                <Paper>
                  <Toolbar
                    sx={{
                      py: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    {children}
                  </Toolbar>
                </Paper>
                <Error message={error?.message} />
              </Grid>
            )}
            <Grid item xs={12} md={12} lg={12}>
              <Stack sx={{ height: 'calc(100vh - 230px)' }}>
                <DataGridPro
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
                      ): void => requestSearch(event.target.value),
                      clearSearch: () => requestSearch(''),
                      csvOptions: { allColumns: true },
                    },
                  }}
                  initialState={{
                    pinnedColumns,
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Grid>
    </Grid>
  )
}

export { XGridPage }
