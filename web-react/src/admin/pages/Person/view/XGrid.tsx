import React, { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgPersonRoute } from 'router/routes'
import { LinkButton, Title, Error } from 'components/'
import { setIdFromEntityId } from 'utils'

export const GET_PERSONS = gql`
  query getPersons($where: PersonWhere) {
    people(where: $where) {
      personId
      firstName
      lastName
    }
  }
`

type TParams = {
  organizationSlug: string
}

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TParams>()
  const { error, loading, data } = useQuery(GET_PERSONS, {
    variables: {
      where: {
        orgs: {
          urlSlug: organizationSlug,
        },
      },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  })

  const columns = useMemo<GridColumns>(
    () => [
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
        field: 'personId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgPersonRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
    ],
    [organizationSlug]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
              <div>
                <Title>{'Persons'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgPersonRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
          </Paper>
          {/* {loading && !error && <Loader />} */}
          <Error message={error?.message} />
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data?.people, 'personId')}
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
