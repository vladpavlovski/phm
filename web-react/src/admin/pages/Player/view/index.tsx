import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { LinkButton, XGridPage } from 'components'
import { PlayerWithAvatar } from 'components/XGridPage/components/PlayerWithAvatar'
import { TeamWithLogo } from 'components/XGridPage/components/TeamWithLogo'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPlayerRoute, getAdminOrgPlayersAllDataRoute } from 'router/routes'
import { getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { ParamsProps } from 'utils/types'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import DataArrayIcon from '@mui/icons-material/DataArray'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Stack from '@mui/system/Stack'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'

export const GET_PLAYERS = gql`
  query getPlayers($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      name
      avatar
      levelCode
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
        logo
      }
    }
  }
`

const View: React.FC = () => {
  const { organizationSlug } = useParams<ParamsProps>()
  const { error, loading, data } = useQuery(GET_PLAYERS, {
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
  ] = useLazyQuery(GET_PLAYERS, {
    variables: {
      where: {
        teams: null,
      },
    },
  })

  const [playersView, setPlayersView] = React.useState('assignedPlayers')

  const columns: GridColumns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: params => {
        return (
          <PlayerWithAvatar
            playerId={params.row.playerId}
            name={params.row.name}
            avatar={params.row.avatar}
          />
        )
      },
    },
    {
      field: 'levelCode',
      headerName: 'Level',
      width: 150,
      renderCell: params => {
        return <PlayerLevel code={params.value} />
      },
    },
    {
      field: 'teams',
      headerName: 'Teams',
      width: 300,
      disableColumnMenu: true,
      sortable: false,
      renderCell: params => {
        return <TeamWithLogo teams={params.row?.teams} />
      },
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
  ]

  const queryData: GridRowsProp[] = setIdFromEntityId(
    playersView === 'assignedPlayers'
      ? data?.players || []
      : data2?.players || [],
    'playerId'
  )

  const searchIndexes = ['name', 'levelCode']

  return (
    <XGridPage
      title="Players"
      loading={loading || queryLoading}
      error={error || queryError}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <Stack direction="row" gap={2}>
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<AssignmentTurnedInIcon />}
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
            startIcon={<AssignmentLateIcon />}
            variant={
              playersView === 'unassignedPlayers' ? 'contained' : 'outlined'
            }
            onClick={() => {
              setPlayersView('unassignedPlayers')
              if (!data2) getUnassignedPlayer()
            }}
          >
            Unassigned
          </Button>
        </ButtonGroup>
        <LinkButton
          startIcon={<DataArrayIcon />}
          size="small"
          variant={'contained'}
          to={getAdminOrgPlayersAllDataRoute(organizationSlug)}
        >
          All Data
        </LinkButton>
      </Stack>
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
