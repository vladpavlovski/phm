import React, { Fragment, useCallback, useState } from 'react'
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
import debounce from 'lodash.debounce'
import { useStyles } from '../styled'
import { getAdminPlayerRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { Loader } from '../../../../components/Loader'

import { toTitleCase } from '../../../../utils'

export const GET_PLAYERS = gql`
  query getPlayers(
    $first: Int
    $offset: Int
    $orderBy: [_PlayerOrdering]
    $filter: _PlayerFilter
  ) {
    Player(first: $first, offset: $offset, orderBy: $orderBy, filter: $filter) {
      playerId
      name
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
      }
    }
    playersCount
  }
`

const PlayersTable = () => {
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

  const { loading, error, data, fetchMore } = useQuery(GET_PLAYERS, {
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
    const currentLength = data.Player.length
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
            <Title>Players</Title>
            <TextField
              id="search"
              label="Name Contains"
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
                        <TableCell
                          key="team"
                          sortDirection={orderBy === 'team' ? order : false}
                        >
                          Team
                        </TableCell>
                        <TableCell key="position">Positions</TableCell>
                        <TableCell key="editButton">Edit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data &&
                        data.Player.map(n => {
                          return (
                            <TableRow key={n.playerId}>
                              <TableCell component="th" scope="row">
                                {n.name}
                              </TableCell>
                              <TableCell>
                                {n.teams && (
                                  <span>
                                    {n.teams.map((t, i) => (
                                      <Fragment key={t.teamId}>
                                        <span>{`${t.name}`}</span>
                                        {i !== n.teams.length - 1 && ', '}
                                      </Fragment>
                                    ))}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {n.positions && (
                                  <span>
                                    {n.positions.map((p, i) => (
                                      <Fragment key={p.positionId}>
                                        <span>{`${p.name}`}</span>
                                        {i !== n.positions.length - 1 && ', '}
                                      </Fragment>
                                    ))}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <LinkButton
                                  to={getAdminPlayerRoute(n.playerId)}
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
                        ? data.Player.length
                        : (data && data.playersCount) || 0
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

export { PlayersTable as default }
