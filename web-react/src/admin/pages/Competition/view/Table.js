import React, { useCallback, useState } from 'react'
import { gql, useQuery } from '@apollo/client'

import {
  Container,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  TableSortLabel,
  Paper,
  TextField,
} from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import debounce from 'lodash.debounce'
import { useStyles } from '../../commonComponents/styled'
import { getAdminCompetitionRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { Loader } from '../../../../components/Loader'

import { toTitleCase } from '../../../../utils'

export const READ_COMPETITIONS = gql`
  query getAssociations(
    $first: Int
    $offset: Int
    $orderBy: [_CompetitionOrdering]
    $filter: _CompetitionFilter
  ) {
    competitions: Competition(
      first: $first
      offset: $offset
      orderBy: $orderBy
      filter: $filter
    ) {
      competitionId
      name
      nick
    }
    competitionsCount
  }
`

const ViewTable = () => {
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [filterState, setFilterState] = useState({ name_contains: '' })
  const [filterStateForView, setFilterStateForView] = useState({
    name_contains: '',
  })
  const [page, setPage] = useState(0)

  const classes = useStyles()

  const setFilterStateDebounced = debounce(setFilterState, 1000)

  const getFilter = useCallback(() => {
    return filterState.name_contains.length > 0
      ? { name_contains: filterState.name_contains }
      : {}
  }, [filterState])

  const { loading, error, data, fetchMore } = useQuery(READ_COMPETITIONS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy:
      filterState.name_contains.length > 0 ? 'network-only' : 'cache-first',
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + '_' + order,
      filter: getFilter(),
    },
  })

  const handleSortRequest = useCallback(property => {
    const newOrderBy = property
    let newOrder = 'desc'

    if (orderBy === property && order === 'desc') {
      newOrder = 'asc'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }, [])

  const handleFilterChange = useCallback(
    filterName => event => {
      const val = event.target.value
      setFilterStateDebounced(oldFilterState => ({
        ...oldFilterState,
        [filterName]: toTitleCase(val),
      }))
      setFilterStateForView(oldFilterState => ({
        ...oldFilterState,
        [filterName]: toTitleCase(val),
      }))
    },
    []
  )

  // Should be without useCallback because of fetchMore bug:
  // https://github.com/apollographql/react-apollo/issues/3745
  const handleChangePage = (_, newPage) => {
    const currentLength = data.competitions.length
    if (currentLength <= (newPage + 1) * rowsPerPage) {
      fetchMore({
        variables: {
          first: rowsPerPage,
          offset: currentLength * newPage,
        },
      }).then(() => {
        setPage(newPage)
      })
    }
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    fetchMore({
      variables: {
        first: newRowsPerPage,
        offset: 0,
      },
    }).then(() => {
      setRowsPerPage(newRowsPerPage)
      setPage(0)
    })
  }
  // console.log('data: ', data)

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar className={classes.toolbarForm}>
              <div>
                <Title>{'Competitions'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminCompetitionRoute('new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <TextField
              id="search"
              label="Name"
              className={classes.textField}
              value={filterStateForView.name_contains}
              onChange={handleFilterChange('name_contains')}
              margin="normal"
              variant="outlined"
              type="text"
              InputProps={{
                className: classes.input,
                autoComplete: 'off',
              }}
            />
            {loading && !error && <Loader />}
            {error && !loading && <Error message={error.message} />}
            {data && !loading && !error && (
              <>
                <TableContainer>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          key="name"
                          sortDirection={orderBy === 'name' ? order : false}
                        >
                          <Tooltip
                            title="Sort"
                            placement="bottom-start"
                            enterDelay={300}
                          >
                            <TableSortLabel
                              active={orderBy === 'name'}
                              direction={order}
                              onClick={() => handleSortRequest('name')}
                            >
                              Name
                            </TableSortLabel>
                          </Tooltip>
                        </TableCell>

                        <TableCell key="nick">Nick</TableCell>
                        <TableCell key="editButton">Edit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data &&
                        data.competitions.map(n => {
                          return (
                            <TableRow key={n.competitionId}>
                              <TableCell>{n.name}</TableCell>
                              <TableCell>{n.nick}</TableCell>
                              <TableCell>
                                <LinkButton
                                  startIcon={<EditIcon />}
                                  to={getAdminCompetitionRoute(n.competitionId)}
                                >
                                  Edit
                                </LinkButton>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[50, 100, 250, 500, 1000]}
                    component="div"
                    count={
                      !Object.values(filterState).every(o => o === '')
                        ? data.competitions.length
                        : (data && data.competitionsCount) || 0
                    }
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export { ViewTable as default }
