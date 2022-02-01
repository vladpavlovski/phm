import React from 'react'
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { LinkButton, XGridPage } from 'components'
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

type TParams = {
  organizationSlug: string
}

const View: React.FC = () => {
  const { organizationSlug } = useParams<TParams>()
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
    { loading: queryLoading, error: queryError, data: data2 },
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

  const columns = React.useMemo<GridColumns>(
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

  const queryData = React.useMemo(
    (): GridRowsProp[] =>
      setIdFromEntityId(
        playersView === 'assignedPlayers'
          ? data?.players || []
          : data2?.players || [],
        'playerId'
      ),

    [data]
  )

  const searchIndexes = React.useMemo(() => ['firstName', 'lastName'], [])

  return (
    <XGridPage
      title="Players"
      loading={loading || queryLoading}
      error={error || queryError}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={
              playersView === 'assignedPlayers' ? 'contained' : 'outlined'
            }
            onClick={() => {
              setPlayersView('assignedPlayers')
            }}
          >
            Assigned
          </Button>
          <Button
            variant={
              playersView === 'unassignedPlayers' ? 'contained' : 'outlined'
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
    </XGridPage>
  )
}

export { View as default }
