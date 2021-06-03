import React, { useCallback, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'

import { useSnackbar } from 'notistack'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Img from 'react-cool-img'
// import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Toolbar from '@material-ui/core/Toolbar'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { Title } from '../../../../../components/Title'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { setIdFromEntityId } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

import { GET_GAME } from '../../index'

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams: Team {
      teamId
      name
      logo
    }
  }
`

export const MERGE_GAME_TEAM = gql`
  mutation mergeGameTeam($gameId: ID!, $teamId: ID!, $host: Boolean) {
    gameTeam: MergeTeamGames(
      game: { gameId: $gameId }
      team: { teamId: $teamId }
      data: { host: $host }
    ) {
      game {
        gameId
        name
      }
      team {
        teamId
        name
        logo
      }
      host
    }
  }
`

export const REMOVE_GAME_TEAM = gql`
  mutation removeGameTeam($gameId: ID!, $teamId: ID!) {
    gameTeam: RemoveTeamGames(
      game: { gameId: $gameId }
      team: { teamId: $teamId }
    ) {
      game {
        gameId
        name
      }
      team {
        teamId
        name
      }
    }
  }
`

const Teams = props => {
  const { gameId, teams } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [teamDialog, setTeamDialog] = useState(false)
  const isHost = useRef(true)

  const teamHost = useMemo(() => teams.find(t => t.host)?.team || null, [teams])
  const teamGuest = useMemo(() => teams.find(t => !t.host)?.team || null, [
    teams,
  ])

  const [
    getAllTeams,
    {
      loading: queryAllTeamsLoading,
      error: queryAllTeamsError,
      data: queryAllTeamsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const [mergeGameTeam, { loading: loadingMergeGameTeam }] = useMutation(
    MERGE_GAME_TEAM,
    {
      update(cache, { data: { gameTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              gameId,
            },
          })
          const { host, team } = gameTeam
          const updatedData = [...queryResult.game?.[0].teams, { host, team }]

          const updatedResult = {
            game: [
              {
                ...queryResult.game?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              gameId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data?.gameTeam?.team?.name} add to game ${data?.gameTeam?.game?.name}!`,
          {
            variant: 'success',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const openTeamDialog = useCallback(({ asHost }) => {
    if (!queryAllTeamsData) {
      getAllTeams()
    }
    isHost.current = asHost
    setTeamDialog(true)
  }, [])

  const handleCloseTeamDialog = useCallback(() => {
    setTeamDialog(false)
  }, [])

  const allTeamsColumns = useMemo(
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
                mergeGameTeam({
                  variables: {
                    gameId,
                    teamId: params.value,
                    host: isHost.current,
                  },
                })
                handleCloseTeamDialog()
              }}
            >
              {loadingMergeGameTeam
                ? 'Adding...'
                : `Add ${isHost.current ? 'Host' : 'Guest'} Team`}
            </Button>
          )
        },
      },
    ],
    [gameId]
  )

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            host
            team={teamHost}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            team={teamGuest}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
          />
        </Grid>
      </Grid>
      <Dialog
        fullWidth
        maxWidth="md"
        open={teamDialog}
        onClose={handleCloseTeamDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllTeamsLoading && !queryAllTeamsError && <Loader />}
        {queryAllTeamsError && !queryAllTeamsLoading && (
          <Error message={queryAllTeamsError.message} />
        )}
        {queryAllTeamsData && !queryAllTeamsLoading && !queryAllTeamsError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add team to game`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={allTeamsColumns}
                  rows={setIdFromEntityId(queryAllTeamsData.teams, 'teamId')}
                  disableSelectionOnClick
                  loading={queryAllTeamsLoading}
                  components={{
                    Toolbar: GridToolbar,
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
    </>
  )
}

const TeamCard = props => {
  const { team, host = false, openTeamDialog, gameId } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [removeGameTeam, { loading: loadingRemoveGameTeam }] = useMutation(
    REMOVE_GAME_TEAM,
    {
      update(cache, { data: { gameTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              gameId,
            },
          })
          const { team } = gameTeam
          const updatedData = queryResult.game?.[0].teams.filter(
            t => t.team.teamId !== team.teamId
          )

          const updatedResult = {
            game: [
              {
                ...queryResult.game?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              gameId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data?.gameTeam?.team?.name} team removed from game ${data?.gameTeam?.game?.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  return (
    <Paper
      className={classes.paper}
      style={{ height: '35rem', marginBottom: '2rem' }}
    >
      <Toolbar disableGutters className={classes.toolbarForm}>
        <div>
          <Title>{`Team ${host ? 'Host' : 'Guest'}${
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
              loading={loadingRemoveGameTeam}
              size="small"
              startIcon={<RemoveIcon />}
              dialogTitle={'Do you really want to remove team from game?'}
              dialogDescription={
                'Team will be removed from this game. Team slot will be empty.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, remove team'}
              onDialogClosePositive={() =>
                removeGameTeam({
                  variables: {
                    gameId,
                    teamId: team.teamId,
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
}

Teams.propTypes = {
  gameId: PropTypes.string,
  teams: PropTypes.array,
}

export { Teams }
