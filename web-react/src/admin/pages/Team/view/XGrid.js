import React, { useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgTeamRoute } from '../../../../router/routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
import { Loader } from '../../../../components/Loader'
import {
  setIdFromEntityId,
  getXGridHeight,
  getXGridValueFromArray,
} from '../../../../utils'

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

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_TEAMS, {
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

  const columns = useMemo(
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

  const windowSize = useWindowSize()
  const toolbarRef = useRef()

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
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
            </Toolbar>
          </Paper>
          {loading && !error && <Loader />}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.teams, 'teamId')}
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
