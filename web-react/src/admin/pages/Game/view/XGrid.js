import React, { useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Img from 'react-cool-img'
import { Container, Grid, Paper } from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgGameRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
import { Loader } from '../../../../components/Loader'
import {
  setIdFromEntityId,
  getXGridHeight,
  formatDate,
  formatTime,
} from '../../../../utils'

const GET_GAMES = gql`
  query getGames($where: GameWhere) {
    games: games(where: $where) {
      gameId
      name
      type
      foreignId
      startDate
      startTime
      venue {
        name
      }
      teamsConnection {
        edges {
          host
          node {
            name
            nick
            logo
          }
        }
      }
      phase {
        phaseId
        name
        competition {
          name
        }
      }
      group {
        groupId
        name
        competition {
          name
        }
      }
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_GAMES, {
    variables: {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  })
  const columns = useMemo(
    () => [
      {
        field: 'gameId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgGameRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'startDate',
        headerName: 'Date',
        width: 220,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.startDate,
        valueFormatter: params =>
          formatDate(params?.value, 'dddd, MMMM D, YYYY'),
      },
      {
        field: 'startTime',
        headerName: 'Time',
        width: 100,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.startTime,
        valueFormatter: params => {
          return typeof params?.value === 'string'
            ? formatTime(params?.value)
            : ''
        },
      },
      {
        field: 'venue',
        headerName: 'Venue',
        width: 200,
        valueGetter: params => params?.row?.venue?.name,
      },
      {
        field: 'hostTeam',
        headerName: 'Host team',
        width: 200,
        renderCell: params => {
          const team = params?.row?.teamsConnection?.edges?.find(
            t => t?.host
          )?.node

          return (
            <>
              <Img
                src={team?.logo}
                style={{ width: '4rem', height: '4rem', marginRight: '1rem' }}
                alt={team?.name}
              />
              <span>{team?.name}</span>
            </>
          )
        },
      },
      {
        field: 'guestTeam',
        headerName: 'Guest team',
        width: 200,
        renderCell: params => {
          const team = params?.row?.teamsConnection?.edges?.find(
            t => !t?.host
          )?.node

          return (
            <>
              <Img
                src={team?.logo}
                style={{ width: '4rem', height: '4rem', marginRight: '1rem' }}
                alt={team?.name}
              />
              <span>{team?.name}</span>
            </>
          )
        },
      },
      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => {
          const phaseCompetition = params?.row?.phase?.competition?.name
          const groupCompetition = params?.row?.group?.competition?.name
          return phaseCompetition || groupCompetition
        },
      },
      {
        field: 'phase',
        headerName: 'Phase',
        width: 120,
        valueGetter: params => params?.row?.phase?.name,
      },
      {
        field: 'group',
        headerName: 'Group',
        width: 120,
        valueGetter: params => params?.row?.group?.name,
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
        hide: true,
      },
      {
        field: 'foreignId',
        headerName: 'Foreign Id',
        width: 150,
        hide: true,
      },
    ],
    [organizationSlug]
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
                <Title>{'Games'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgGameRoute(organizationSlug, 'new')}
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
              <XGrid
                density="compact"
                columns={columns}
                rows={setIdFromEntityId(data.games, 'gameId')}
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
