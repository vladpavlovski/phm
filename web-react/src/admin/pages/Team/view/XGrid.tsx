import React, { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgTeamRoute } from 'router/routes'
import {
  Loader,
  Error,
  Title,
  LinkButton,
  QuickSearchToolbar,
} from 'components'
import { setIdFromEntityId, getXGridValueFromArray, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'

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

type TXGridTableParams = {
  organizationSlug: string
}

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TXGridTableParams>()
  const { error, loading, data } = useQuery(GET_TEAMS, {
    variables: {
      where: {
        orgs: {
          urlSlug: organizationSlug,
        },
      },
    },
  })

  const columns = useMemo<GridColumns>(
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

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: queryData,
  })

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
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
          {loading && <Loader />}
          <Error message={error?.message} />
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={searchData}
                loading={loading}
                components={{
                  Toolbar: QuickSearchToolbar,
                }}
                componentsProps={{
                  toolbar: {
                    value: searchText,
                    onChange: (
                      event: React.ChangeEvent<HTMLInputElement>
                    ): void => requestSearch(event.target.value),
                    clearSearch: () => requestSearch(''),
                  },
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
