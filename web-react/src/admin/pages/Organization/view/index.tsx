import React from 'react'
import { gql, useQuery } from '@apollo/client'
import Tooltip from '@mui/material/Tooltip'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrganizationRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId } from 'utils'

const GET_ORGANIZATIONS = gql`
  query getOrganizations {
    organizations {
      organizationId
      name
      nick
      urlSlug
    }
  }
`

const View: React.FC = () => {
  const { error, loading, data } = useQuery(GET_ORGANIZATIONS)

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 350,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },
      {
        field: 'organizationId',
        headerName: 'Actions',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              icon
              to={getAdminOrganizationRoute(params.row?.urlSlug)}
            >
              <Tooltip arrow title="Edit" placement="top">
                <EditIcon />
              </Tooltip>
            </LinkButton>
          )
        },
      },
    ],
    []
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] =>
      setIdFromEntityId(data?.organizations || [], 'organizationId'),

    [data]
  )

  const searchIndexes = React.useMemo(() => ['name', 'nick'], [])

  return (
    <XGridPage
      title="Organizations"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Organizations'}</Title>
      </div>
      <div>
        <LinkButton
          startIcon={<AddIcon />}
          to={getAdminOrganizationRoute('new')}
        >
          Create
        </LinkButton>
      </div>
    </XGridPage>
  )
}

export { View as default }
