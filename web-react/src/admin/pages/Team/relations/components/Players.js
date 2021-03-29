import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminPlayerRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../../utils'

const GET_PLAYERS = gql`
  query getTeam($teamId: ID) {
    team: Team(teamId: $teamId) {
      _id
      teamId
      name
      players {
        playerId
        firstName
        lastName
        positions {
          positionId
          name
        }
        jerseys {
          jerseyId
          name
          number
        }
      }
    }
  }
`

const REMOVE_TEAM_PLAYER = gql`
  mutation removeTeamPlayer($teamId: ID!, $playerId: ID!) {
    teamPlayer: RemoveTeamPlayers(
      from: { playerId: $playerId }
      to: { teamId: $teamId }
    ) {
      from {
        playerId
        firstName
        lastName
      }
    }
  }
`

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players: Player {
      playerId
      name
      teams {
        name
      }
      positions {
        name
      }
    }
  }
`

const MERGE_TEAM_PLAYER = gql`
  mutation mergeTeamPlayer($teamId: ID!, $playerId: ID!) {
    teamPlayer: MergeTeamPlayers(
      from: { playerId: $playerId }
      to: { teamId: $teamId }
    ) {
      from {
        playerId
        firstName
        lastName
        positions {
          positionId
          name
        }
        jerseys {
          jerseyId
          name
          number
        }
      }
    }
  }
`

const Players = props => {
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PLAYERS, {
    fetchPolicy: 'cache-and-network',
  })

  const team = queryData && queryData.team && queryData.team[0]

  const [
    getAllPlayers,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_PLAYERS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeTeamPlayer, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_TEAM_PLAYER,
    {
      update(cache, { data: { teamPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PLAYERS,
            variables: {
              teamId,
            },
          })
          const updatedPlayers = queryResult.team[0].players.filter(
            p => p.playerId !== teamPlayer.from.playerId
          )

          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                players: updatedPlayers,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PLAYERS,
            data: updatedResult,
            variables: {
              teamId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.teamPlayer.from.name} removed from ${team.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [mergeTeamPlayer] = useMutation(MERGE_TEAM_PLAYER, {
    update(cache, { data: { teamPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            teamId,
          },
        })
        const existingPlayers = queryResult.team[0].players
        const newPlayer = teamPlayer.from
        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              players: [newPlayer, ...existingPlayers],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PLAYERS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(`${data.teamPlayer.from.name} added to ${team.name}!`, {
        variant: 'success',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const teamPlayersColumns = useMemo(
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
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },
      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminPlayerRoute(params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Remove'}
              textLoading={'Removing...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to remove player from the team?'}
              dialogDescription={
                'The player will remain in the database. You can add him to any team later.'
              }
              dialogNegativeText={'No, keep the player'}
              dialogPositiveText={'Yes, remove player'}
              onDialogClosePositive={() => {
                removeTeamPlayer({
                  variables: {
                    teamId,
                    playerId: params.row.playerId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
  )

  const allPlayersColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },

      {
        field: 'playerId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPlayer
              playerId={params.value}
              teamId={teamId}
              team={team}
              merge={mergeTeamPlayer}
              remove={removeTeamPlayer}
            />
          )
        },
      },
    ],
    [team]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="players-content"
        id="players-header"
      >
        <Typography className={classes.accordionFormTitle}>Players</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenAddPlayer}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Player
                </Button>
                {/* TODO: MAKE Modal */}

                <LinkButton
                  startIcon={<CreateIcon />}
                  to={getAdminPlayerRoute('new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamPlayersColumns}
                rows={setIdFromEntityId(team.players, 'playerId')}
                loading={queryAllPlayersLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPlayersLoading && !queryAllPlayersError && <Loader />}
        {queryAllPlayersError && !queryAllPlayersLoading && (
          <Error message={queryAllPlayersError.message} />
        )}
        {queryAllPlayersData &&
          !queryAllPlayersLoading &&
          !queryAllPlayersError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new player to ${
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allPlayersColumns}
                    rows={setIdFromEntityId(
                      queryAllPlayersData.players,
                      'playerId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPlayersLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPlayer()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewPlayer = props => {
  const { playerId, teamId, team, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!team.players.find(p => p.playerId === playerId)
  )

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    teamId,
                    playerId,
                  },
                })
              : merge({
                  variables: {
                    teamId,
                    playerId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewPlayer.propTypes = {
  playerId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamPlayer: PropTypes.func,
  mergeTeamPlayer: PropTypes.func,
}

Players.propTypes = {
  teamId: PropTypes.string,
}

export { Players }
