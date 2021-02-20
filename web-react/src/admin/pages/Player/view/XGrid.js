import React, { useCallback, useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Container, Grid, Paper } from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../commonComponents/styled'
import { getAdminPlayerRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
// import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../utils'

export const GET_PLAYERS = gql`
  query getPlayers {
    players: Player {
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

const XGridTable = () => {
  const classes = useStyles()

  const { error, loading, data } = useQuery(GET_PLAYERS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  })

  // console.log('data:', data)

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
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
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminPlayerRoute(params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
    ],
    []
  )

  const windowSize = useWindowSize()
  const toolbarRef = useRef()
  const getXGridHeight = useCallback(() => {
    const position = toolbarRef.current.getBoundingClientRect()
    const result = windowSize.height - position.bottom - 100
    return result
  }, [windowSize])

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                <Title>{'Players'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminPlayerRoute('new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
          </Paper>
          {/* {loading && !error && <Loader />} */}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: getXGridHeight() }}
              className={classes.xGridWrapper}
            >
              <XGrid
                columns={columns}
                rows={setIdFromEntityId(data.players, 'playerId')}
                loading={loading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }