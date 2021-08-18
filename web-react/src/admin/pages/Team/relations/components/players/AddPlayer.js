import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import AddIcon from '@material-ui/icons/Add'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'

// import { GET_PLAYERS } from './index'

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players {
      playerId
      name
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
      positions {
        positionId
        name
      }
    }
  }
`

// const MERGE_TEAM_PLAYER = gql`
//   mutation mergeTeamPlayer($teamId: ID!, $playerId: ID!) {
//     teamPlayer: MergeTeamPlayers(
//       from: { playerId: $playerId }
//       to: { teamId: $teamId }
//     ) {
//       from {
//         playerId
//         name
//         firstName
//         lastName
//         positions {
//           positionId
//           name
//         }
//         jerseys {
//           jerseyId
//           name
//           number
//         }
//       }
//     }
//   }
// `

const AddPlayer = props => {
  const { teamId, team, updateTeam } = props

  // const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [openAddPlayer, setOpenAddPlayer] = React.useState(false)

  const handleCloseAddPlayer = React.useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

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

  // const [mergeTeamPlayer] = useMutation(MERGE_TEAM_PLAYER, {
  //   update(cache, { data: { teamPlayer } }) {
  //     try {
  //       const queryResult = cache.readQuery({
  //         query: GET_PLAYERS,
  //         variables: {
  //           teamId,
  //         },
  //       })
  //       const existingPlayers = queryResult?.team[0].players
  //       const newPlayer = teamPlayer.from
  //       const updatedResult = {
  //         team: [
  //           {
  //             ...queryResult?.team[0],
  //             players: [newPlayer, ...existingPlayers],
  //           },
  //         ],
  //       }
  //       cache.writeQuery({
  //         query: GET_PLAYERS,
  //         data: updatedResult,
  //         variables: {
  //           teamId,
  //         },
  //       })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onCompleted: data => {
  //     enqueueSnackbar(`${data.teamPlayer.from.name} added to ${team.name}!`, {
  //       variant: 'success',
  //     })
  //   },
  //   onError: error => {
  //     enqueueSnackbar(`Error happened :( ${error}`, {
  //       variant: 'error',
  //     })
  //     console.error(error)
  //   },
  // })

  const handleOpenAddPlayer = React.useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const allPlayersColumns = React.useMemo(
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
              updateTeam={updateTeam}
              // merge={mergeTeamPlayer}
              // remove={removeTeamPlayer}
            />
          )
        },
      },
    ],
    [team]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPlayer}
        variant={'outlined'}
        size="small"
        className={classes.submit}
        startIcon={<AddIcon />}
      >
        Add Player
      </Button>
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
    </>
  )
}

const ToggleNewPlayer = props => {
  const { playerId, teamId, team, updateTeam } = props
  const [isMember, setIsMember] = React.useState(
    !!team.players.find(p => p.playerId === playerId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            updateTeam({
              variables: {
                where: {
                  teamId,
                },
                update: {
                  players: {
                    ...(!isMember
                      ? {
                          connect: {
                            where: {
                              node: {
                                playerId,
                              },
                            },
                          },
                        }
                      : {
                          disconnect: {
                            where: {
                              node: {
                                playerId,
                              },
                            },
                          },
                        }),
                  },
                },
              },
            })
            // isMember
            //   ? remove({
            //       variables: {
            //         teamId,
            //         playerId,
            //       },
            //     })
            //   : merge({
            //       variables: {
            //         teamId,
            //         playerId,
            //       },
            //     })
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

AddPlayer.propTypes = {
  teamId: PropTypes.string,
}

export { AddPlayer }
