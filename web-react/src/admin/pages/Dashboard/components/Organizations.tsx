import React, { useMemo, useContext } from 'react'
import { gql, useQuery } from '@apollo/client'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import {
  DataGridPro,
  GridColumns,
  GridRenderCellParams,
} from '@mui/x-data-grid-pro'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Tooltip from '@mui/material/Tooltip'

import OrganizationContext from '../../../../context/organization'
import { useStyles } from '../../commonComponents/styled'
import {
  getAdminOrganizationRoute,
  getAdminOrganizationDashboardRoute,
} from 'router/routes'
import { LinkButton } from 'components/LinkButton'
import { Title } from 'components/Title'
import { Error } from 'components/Error'

import { Loader } from 'components/Loader'
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

const Organizations: React.FC = () => {
  const classes = useStyles()
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
    <Grid container spacing={2}>
      <Grid item xs={12} md={12} lg={12}>
        <Toolbar className={classes.toolbarForm}>
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
        {loading && !error && <Loader />}
        {error && !loading && <Error message={error.message} />}
        {data && (
          <div style={{ height: 440 }} className={classes.xGridWrapper}>
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
  )
}

export { Organizations }
