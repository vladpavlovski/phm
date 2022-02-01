import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrgTeamRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId, getXGridValueFromArray, sortByStatus } from 'utils'
import { useStyles } from '../../commonComponents/styled'

export const GET_TEAMS = gql`
  query getTeams($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      logo
      nick
      status
      competitions {
        competitionId
        name
      }
      phases {
        phaseId
        name
      }
      groups {
        groupId
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
  const classes = useStyles()
  const { error, loading, data } = useQuery(GET_TEAMS, {
    variables: {
      where: {
        orgs: {
          urlSlug: organizationSlug,
        },
      },
    },
  })

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'teamId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgTeamRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'logo',
        headerName: 'Logo',
        width: 70,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <img
              className={classes.teamLogoView}
              src={params.value}
              alt={params.row.name}
              loading="lazy"
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
      },
      {
        field: 'competitions',
        headerName: 'Competitions',
        width: 150,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.competitions, 'name')
        },
      },
      {
        field: 'phases',
        headerName: 'Phases',
        width: 150,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.phases, 'name')
        },
      },
      {
        field: 'groups',
        headerName: 'Groups',
        width: 150,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.groups, 'name')
        },
      },
    ],
    []
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] =>
      setIdFromEntityId(sortByStatus(data?.teams || [], 'status'), 'teamId'),

    [data]
  )

  const searchIndexes = React.useMemo(
    () => ['name', 'nick', 'status', 'competitions', 'phases', 'groups'],
    []
  )

  return (
    <XGridPage
      title="Teams"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Teams'}</Title>
      </div>
      <div>
        <LinkButton
          startIcon={<AddIcon />}
          to={getAdminOrgTeamRoute(organizationSlug, 'new')}
        >
          Create
        </LinkButton>
      </div>
    </XGridPage>
  )
}

export { View as default }
