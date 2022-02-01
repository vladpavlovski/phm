import React from 'react'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Helmet } from 'react-helmet-async'
import { DataGridPro, GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import Toolbar from '@mui/material/Toolbar'
import { ApolloError } from '@apollo/client'
import { Loader, Error, QuickSearchToolbar } from 'components'
import LayoutContext from 'context/layout'
import { useXGridSearch } from 'utils/hooks'
import { useStyles } from './styled'

type TXGridPage = {
  title: string
  loading: boolean
  error?: ApolloError
  columns: GridColumns
  rows: GridRowsProp[]
  searchIndexes: (string | string[])[]
}

const XGridPage: React.FC<TXGridPage> = props => {
  const { children, title, loading, error, columns, rows, searchIndexes } =
    props
  const { setBarTitle } = React.useContext(LayoutContext)
  const classes = useStyles()

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
            <Grid item xs={12} md={12} lg={12}>
              <Paper>
                <Toolbar className={classes.toolbarForm}>{children}</Toolbar>
              </Paper>
              {loading && <Loader />}
              <Error message={error?.message} />

              <div
                style={{ height: 'calc(100vh - 230px)' }}
                className={classes.xGridWrapper}
              >
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
                    },
                  }}
                />
              </div>
            </Grid>
          </Grid>
        </Container>
      </Grid>
    </Grid>
  )
}

export { XGridPage }
