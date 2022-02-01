import React from 'react'
import { gql, useQuery } from '@apollo/client'
import EditIcon from '@mui/icons-material/Edit'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminUserRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId } from 'utils'

export const GET_USERS = gql`
  query getUsers {
    users {
      userId
      firstName
      lastName
      email
      phone
    }
  }
`

const View: React.FC = () => {
  const { error, loading, data } = useQuery(GET_USERS)

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'userId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminUserRoute(params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
      },
      {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 300,
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 150,
      },
    ],
    []
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] => setIdFromEntityId(data?.users, 'userId'),

    [data]
  )

  const searchIndexes = React.useMemo(
    () => ['firstName', 'lastName', 'email', 'phone'],
    []
  )

  return (
    <XGridPage
      title="Users"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Users'}</Title>
      </div>
      <div></div>
    </XGridPage>
  )
}

export { View as default }
