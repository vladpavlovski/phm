import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrgVenueRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId } from 'utils'

export const GET_VENUES = gql`
  query getVenues {
    venues {
      venueId
      name
      nick
    }
  }
`

type TParams = {
  organizationSlug: string
}

const View: React.FC = () => {
  const { organizationSlug } = useParams<TParams>()
  const { error, loading, data } = useQuery(GET_VENUES)

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'venueId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgVenueRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 200,
      },
    ],
    [organizationSlug]
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] => setIdFromEntityId(data?.venues || [], 'venueId'),

    [data]
  )

  const searchIndexes = React.useMemo(() => ['name', 'nick'], [])

  return (
    <XGridPage
      title="Venues"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Venues'}</Title>
      </div>
      <div>
        <LinkButton
          startIcon={<AddIcon />}
          to={getAdminOrgVenueRoute(organizationSlug, 'new')}
        >
          Create
        </LinkButton>
      </div>
    </XGridPage>
  )
}

export { View as default }
