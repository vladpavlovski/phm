import React, { useCallback, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Autocomplete from '@material-ui/core/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import LoadingButton from '@material-ui/lab/LoadingButton'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminPlayerRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { arrayToStringList } from '../../../../../utils'

const READ_PLAYERS = gql`
  query getTeam($teamId: ID) {
    team: Team(teamId: $teamId) {
      _id
      teamId
      name
      players {
        playerId
        name
        positions {
          positionId
          name
        }
        jerseys {
          jerseyNoId
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
      }
    }
  }
`

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players: Player {
      playerId
      name
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
        name
        positions {
          positionId
          name
        }
        jerseys {
          jerseyNoId
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
  const [addedPlayer, setAddedPlayer] = useState(null)
  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(READ_PLAYERS)

  const [
    getAllPlayers,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_PLAYERS)

  const [mergeTeamPlayer, { loading: mutationLoadingMerge }] = useMutation(
    MERGE_TEAM_PLAYER,
    {
      update(cache, { data: { teamPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: READ_PLAYERS,
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
            query: READ_PLAYERS,
            data: updatedResult,
            variables: {
              teamId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        handleCloseAddPlayer()
        setAddedPlayer(null)
        enqueueSnackbar('Player added to team!', { variant: 'success' })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )
  const team = queryData && queryData.team && queryData.team[0]

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

  const addPlayerToTeam = useCallback(() => {
    mergeTeamPlayer({
      variables: {
        teamId,
        playerId: addedPlayer.playerId,
      },
    })
  }, [addedPlayer])

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
            <TableContainer>
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
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Position</TableCell>
                    <TableCell align="right">Jersey</TableCell>
                    <TableCell align="right">Edit</TableCell>
                    <TableCell align="right">Unlink</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team &&
                    team.players.map(player => (
                      <PlayerRow
                        key={player.playerId}
                        player={player}
                        teamId={teamId}
                      />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </AccordionDetails>
      <Dialog
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
                <DialogContentText id="alert-dialog-description">
                  {`Select player from list:`}
                </DialogContentText>
                <Autocomplete
                  fullWidth
                  id="players"
                  value={addedPlayer}
                  onChange={(_, value) => {
                    setAddedPlayer(value)
                  }}
                  options={queryAllPlayersData.players || []}
                  getOptionLabel={option => option.name}
                  getOptionSelected={(option, value) =>
                    option.playerId === value.playerId
                  }
                  renderOption={(props, object) => {
                    return (
                      <li {...props} key={`${object.playerId}_${object.name}`}>
                        {object.name}
                      </li>
                    )
                  }}
                  name="players"
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Players"
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPlayer()
            }}
          >
            {'Cancel'}
          </Button>

          <LoadingButton
            type="button"
            variant="contained"
            onClick={() => {
              addPlayerToTeam()
            }}
            pending={mutationLoadingMerge}
          >
            {mutationLoadingMerge ? 'Adding...' : 'Add new player'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const PlayerRow = props => {
  const { player, teamId } = props

  const { enqueueSnackbar } = useSnackbar()

  const [removeTeamPlayer, { loading }] = useMutation(REMOVE_TEAM_PLAYER, {
    update(cache, { data: { teamPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: READ_PLAYERS,
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
          query: READ_PLAYERS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Player removed from team', {
        variant: 'info',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {player.name}
      </TableCell>
      <TableCell align="right">
        {arrayToStringList(player.positions, 'positionId', 'name')}
      </TableCell>
      <TableCell align="right">
        {arrayToStringList(player.jerseys, 'jerseyNoId', 'number')}
      </TableCell>
      <TableCell align="right">
        <LinkButton
          startIcon={<EditIcon />}
          variant={'outlined'}
          to={getAdminPlayerRoute(player.playerId)}
        >
          Edit
        </LinkButton>
      </TableCell>
      <TableCell align="right">
        <ButtonDialog
          text={'Unlink'}
          textLoading={'Unlinking...'}
          loading={loading}
          size="small"
          startIcon={<LinkOffIcon />}
          dialogTitle={'Do you really want to unlink player from the team?'}
          dialogDescription={
            'The player will remain in the database. You can add him to the team later.'
          }
          dialogNegativeText={'No, keep the player'}
          dialogPositiveText={'Yes, detach player'}
          onDialogClosePositive={() => {
            removeTeamPlayer({
              variables: {
                teamId,
                playerId: player.playerId,
              },
            })
          }}
        />
      </TableCell>
    </TableRow>
  )
}

Players.propTypes = {
  teamId: PropTypes.string,
}

export { Players }
