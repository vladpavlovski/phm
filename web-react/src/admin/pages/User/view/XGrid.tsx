import React, { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminUserRoute } from 'router/routes'
import { LinkButton, Title, Error, Loader } from 'components'
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

const XGridTable: React.FC = () => {
  const classes = useStyles()

  const { error, loading, data } = useQuery(GET_USERS)

  const columns = useMemo<GridColumns>(
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

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
              <div>
                <Title>{'Users'}</Title>
              </div>
              <div></div>
            </Toolbar>
          </Paper>
          {loading && <Loader />}
          <Error message={error?.message} />
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.users, 'userId')}
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
