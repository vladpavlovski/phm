import { Error, LinkButton, Loader, Title } from 'components'
import OrganizationContext from 'context/organization'
import React, { useContext, useMemo } from 'react'
import { getAdminOrganizationDashboardRoute, getAdminOrganizationRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { gql, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { DataGridPro, GridColumns, GridRenderCellParams } from '@mui/x-data-grid-pro'

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

const Organizations: React.FC = () => {
  const { setOrganizationData } = useContext(OrganizationContext)
  const { error, loading, data } = useQuery(GET_ORGANIZATIONS)
  const columns = useMemo(
    (): GridColumns => [
      {
        field: 'name',
        headerName: 'Name',
        width: 350,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams): React.ReactNode => {
          const { urlSlug, organizationId, nick, name } = params.row
          return (
            <>
              <LinkButton
                icon
                onClick={() => {
                  setOrganizationData(state => ({
                    ...state,
                    urlSlug,
                    organizationId,
                    nick,
                    name,
                  }))
                }}
                to={getAdminOrganizationDashboardRoute(urlSlug)}
              >
                <Tooltip arrow title="Dashboard" placement="top">
                  <DashboardIcon />
                </Tooltip>
              </LinkButton>
              <LinkButton icon to={getAdminOrganizationRoute(urlSlug)}>
                <Tooltip arrow title="Edit" placement="top">
                  <EditIcon />
                </Tooltip>
              </LinkButton>
            </>
          )
        },
      },
    ],
    []
  )

  return (
    <Paper sx={{ p: '16px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Toolbar
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div>
              <Title>{'Organizations'}</Title>
            </div>
            <div>
              <LinkButton
                startIcon={<AddIcon />}
                to={getAdminOrganizationRoute('new')}
                target="_blank"
              >
                Create
              </LinkButton>
            </div>
          </Toolbar>
          {loading && <Loader />}
          <Error message={error?.message} />
          {data && (
            <div style={{ height: 440 }}>
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.organizations, 'organizationId')}
                loading={loading}
                disableSelectionOnClick
              />
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

export { Organizations }
