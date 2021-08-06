import React, { useCallback, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'

import { useSnackbar } from 'notistack'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Img from 'react-cool-img'

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

import { XGrid } from '@material-ui/x-grid'
import { Title } from '../../../../../components/Title'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { QuickSearchToolbar } from '../../../../../components/QuickSearchToolbar'
import { setIdFromEntityId, escapeRegExp } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

import { GET_GAME, UPDATE_GAME } from '../../index'

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams {
      teamId
      name
      logo
    }
  }
`

const Teams = props => {
  const { gameId, teams } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [teamDialog, setTeamDialog] = useState(false)
  const isHost = useRef(true)

  const teamHost = useMemo(() => teams.find(t => t.host)?.node || null, [teams])
  const teamGuest = useMemo(() => teams.find(t => !t.host)?.node || null, [
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

  const [updateGame, { loading: loadingMergeGameTeam }] = useMutation(
    UPDATE_GAME,
    {
      update(cache, { data: { updateGame } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              where: { gameId },
            },
          })
          const updatedData = updateGame?.games?.[0]?.teamsConnection

          const updatedResult = {
            games: [
              {
                ...queryResult.games?.[0],
                teamsConnection: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              where: { gameId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Game updated`, {
          variant: 'success',
        })
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
                updateGame({
                  variables: {
                    where: {
                      gameId,
                    },
                    update: {
                      teams: {
                        connect: {
                          where: {
                            teamId: params.value,
                          },
                          properties: {
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

  const teamsData = useMemo(
    () =>
      queryAllTeamsData && setIdFromEntityId(queryAllTeamsData.teams, 'teamId'),
    [queryAllTeamsData]
  )

  const [searchText, setSearchText] = React.useState('')
  const [allTeams, setAllTeams] = React.useState([])

  const requestSearch = useCallback(
    searchValue => {
      setSearchText(searchValue)
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
      const filteredRows = teamsData.filter(row => {
        return Object.keys(row).some(field => {
          return searchRegex.test(row[field]?.toString())
        })
      })
      setAllTeams(filteredRows)
    },
    [teamsData]
  )

  React.useEffect(() => {
    teamsData && setAllTeams(teamsData)
  }, [teamsData])

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
            host={false}
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
                  rows={allTeams}
                  disableSelectionOnClick
                  loading={queryAllTeamsLoading}
                  components={{
                    Toolbar: QuickSearchToolbar,
                  }}
                  componentsProps={{
                    toolbar: {
                      value: searchText,
                      onChange: event => requestSearch(event.target.value),
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
    </>
  )
}

const TeamCard = props => {
  const { team, host = false, openTeamDialog, gameId } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [updateGame, { loading: loadingRemoveGameTeam }] = useMutation(
    UPDATE_GAME,
    {
      update(cache, { data: { updateGame } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              where: { gameId },
            },
          })
          const updatedData = updateGame?.games?.[0]?.teamsConnection

          const updatedResult = {
            games: [
              {
                ...queryResult.games?.[0],
                teamsConnection: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              where: { gameId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Game updated`, {
          variant: 'success',
        })
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
}

Teams.propTypes = {
  gameId: PropTypes.string,
  teams: PropTypes.array,
}

export { Teams }
