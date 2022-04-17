import { Error, Loader, QuickSearchToolbar, Title } from 'components'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Img from 'react-cool-img'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

export const GET_ALL_TEAMS_BY_ORG = gql`
  query getTeamsByOrg($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      logo
      status
    }
  }
`

type TTeams = {
  gameId: string
  teams: {
    host: boolean
    node: Team
  }[]
  updateGame: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Teams: React.FC<TTeams> = props => {
  const { gameId, teams, updateGame } = props
  const { organizationSlug } = useParams<TParams>()
  const classes = useStyles()
  const [teamDialog, setTeamDialog] = useState(false)
  const isHost = useRef(true)

  const teamHost = useMemo(() => teams.find(t => t.host)?.node || null, [teams])
  const teamGuest = useMemo(
    () => teams.find(t => !t.host)?.node || null,
    [teams]
  )

  const [
    getAllTeams,
    {
      loading: queryAllTeamsLoading,
      error: queryAllTeamsError,
      data: queryAllTeamsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS_BY_ORG, {
    variables: {
      orgs: {
        urlSlug: organizationSlug,
      },
    },
  })

  const openTeamDialog = useCallback(({ asHost }) => {
    if (!queryAllTeamsData) {
      getAllTeams()
    }
    isHost.current = asHost
    setTeamDialog(true)
  }, [])

  const handleCloseTeamDialog = useCallback(() => {
    setTeamDialog(false)
    requestSearch('')
  }, [])

  const allTeamsColumns = useMemo<GridColumns>(
    () => [
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
        width: 300,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        sortable: true,
        disableColumnMenu: true,
      },

      {
        field: 'teamId',
        headerName: 'Member',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
              type="button"
              onClick={() => {
                updateGame({
                  variables: {
                    where: {
                      gameId,
                    },
                    update: {
                      teams: {
                        connect: {
                          where: {
                            node: { teamId: params.value },
                          },
                          edge: {
                            host: isHost.current,
                          },
                        },
                      },
                    },
                  },
                })
                handleCloseTeamDialog()
              }}
            >
              {`Add ${isHost.current ? 'Host' : 'Guest'} Team`}
            </Button>
          )
        },
      },
    ],
    [gameId]
  )

  const teamsData = useMemo(
    () =>
      queryAllTeamsData
        ? setIdFromEntityId(queryAllTeamsData?.teams || [], 'teamId')
        : [],
    [queryAllTeamsData]
  )

  const searchIndexes = React.useMemo(() => ['name', 'status'], [])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: teamsData,
  })

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            host
            team={teamHost}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
            updateGame={updateGame}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            host={false}
            team={teamGuest}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
            updateGame={updateGame}
          />
        </Grid>
      </Grid>
      {teamDialog && (
        <Dialog
          fullWidth
          maxWidth="md"
          open={teamDialog}
          onClose={handleCloseTeamDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {queryAllTeamsLoading && <Loader />}

          <Error message={queryAllTeamsError?.message} />

          {queryAllTeamsData && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add team to game`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allTeamsColumns}
                    rows={sortByStatus(searchData, 'status')}
                    disableSelectionOnClick
                    loading={queryAllTeamsLoading}
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
              </DialogContent>
            </>
          )}
          <DialogActions>
            <Button type="button" onClick={handleCloseTeamDialog}>
              {'Done'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

type TTeamCard = {
  team: Team | null
  host: boolean
  openTeamDialog: ({ asHost }: { asHost: boolean }) => void
  gameId: string
  updateGame: MutationFunction
}

const TeamCard: React.FC<TTeamCard> = React.memo(props => {
  const { team, host = false, openTeamDialog, gameId, updateGame } = props
  const classes = useStyles()

  return (
    <Paper
      className={classes.paper}
      style={{ height: '35rem', marginBottom: '2rem' }}
    >
      <Toolbar disableGutters className={classes.toolbarForm}>
        <div>
          <Title>{`${host ? 'Host' : 'Guest'}${
            team ? `: ${team?.name}` : ''
          }`}</Title>
        </div>
        <div>
          {!team && (
            <Button
              variant={'outlined'}
              size="small"
              className={classes.submit}
              type="button"
              startIcon={<AddIcon />}
              onClick={() => openTeamDialog({ asHost: host })}
            >
              {'Set Host Team'}
            </Button>
          )}
          {team && (
            <ButtonDialog
              color="secondary"
              text={'Remove Team'}
              textLoading={'Removing...'}
              type="button"
              size="small"
              startIcon={<RemoveIcon />}
              dialogTitle={'Do you really want to remove team from game?'}
              dialogDescription={
                'Team will be removed from this game. Team slot will be empty.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, remove team'}
              onDialogClosePositive={() =>
                updateGame({
                  variables: {
                    where: {
                      gameId,
                    },
                    update: {
                      teams: {
                        disconnect: {
                          where: {
                            node: {
                              teamId: team.teamId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }
            />
          )}
        </div>
      </Toolbar>

      {team && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className={classes.gameTeamLogoWrapper}>
              <Img
                src={team.logo}
                className={classes.gameTeamLogo}
                alt={team.name}
              />
            </div>
          </Grid>
        </Grid>
      )}
    </Paper>
  )
})

export { Teams }
