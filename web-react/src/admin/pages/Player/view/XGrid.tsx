import React, { useMemo } from 'react'
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { LinkButton, Loader, Error } from 'components'
import { setIdFromEntityId, getXGridValueFromArray } from 'utils'

export const GET_ASSIGNED_PLAYERS = gql`
  query getPlayers($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
      }
    }
  }
`

export const GET_UNASSIGNED_PLAYERS = gql`
  query getPlayers($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
      }
    }
  }
`

type TXGridTableParams = {
  organizationSlug: string
}

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TXGridTableParams>()
  const { error, loading, data } = useQuery(GET_ASSIGNED_PLAYERS, {
    variables: {
      where: {
        teams: {
          orgs: {
            urlSlug: organizationSlug,
          },
        },
      },
    },
  })

  const [
    getUnassignedPlayer,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_UNASSIGNED_PLAYERS, {
    variables: {
      where: {
        teams: null,
      },
    },
  })

  const [playersView, setPlayersView] = React.useState('assignedPlayers')

  React.useEffect(() => {
    if (playersView === 'unassignedPlayers' && !queryData) {
      getUnassignedPlayer()
    }
  }, [playersView])

  const columns = useMemo<GridColumns>(
    () => [
      {
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'firstName',
        headerName: 'First Name',
        width: 150,
      },
      {
        field: 'lastName',
        headerName: 'Last name',
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
    ],
    []
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
              <div>
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    variant={
                      playersView === 'assignedPlayers'
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() => {
                      setPlayersView('assignedPlayers')
                    }}
                  >
                    Assigned
                  </Button>
                  <Button
                    variant={
                      playersView === 'unassignedPlayers'
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() => {
                      setPlayersView('unassignedPlayers')
                    }}
                  >
                    Unassigned
                  </Button>
                </ButtonGroup>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgPlayerRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
          </Paper>
          {loading && <Loader />}
          <Error message={error?.message || queryError?.message} />

          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(
                  playersView === 'assignedPlayers'
                    ? data.players
                    : queryData?.players || [],
                  'playerId'
                )}
                loading={loading || queryLoading}
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

const XGridTableMemo = React.memo(XGridTable)

export { XGridTableMemo as default }
