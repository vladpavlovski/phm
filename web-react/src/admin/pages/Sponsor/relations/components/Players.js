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
  query getSponsor($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      _id
      sponsorId
      name
      players {
        playerId
        name
        teams {
          teamId
          name
        }
        positions {
          name
        }
      }
    }
  }
`

const REMOVE_SPONSOR_PLAYER = gql`
  mutation removeSponsorPlayer($sponsorId: ID!, $playerId: ID!) {
    sponsorPlayer: RemoveSponsorPlayers(
      from: { playerId: $playerId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        playerId
        name
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

const MERGE_SPONSOR_PLAYER = gql`
  mutation mergeSponsorPlayer($sponsorId: ID!, $playerId: ID!) {
    sponsorPlayer: MergeSponsorPlayers(
      from: { playerId: $playerId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        playerId
        name
        positions {
          positionId
          name
        }
        teams {
          teamId
          name
        }
      }
    }
  }
`

const Players = props => {
  const { sponsorId } = props
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

  const sponsor = queryData && queryData.sponsor && queryData.sponsor[0]

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

  const [removeSponsorPlayer, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_PLAYER,
    {
      update(cache, { data: { sponsorPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PLAYERS,
            variables: {
              sponsorId,
            },
          })
          const updatedPlayers = queryResult.sponsor[0].players.filter(
            p => p.playerId !== sponsorPlayer.from.playerId
          )

          const updatedResult = {
            sponsor: [
              {
                ...queryResult.sponsor[0],
                players: updatedPlayers,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PLAYERS,
            data: updatedResult,
            variables: {
              sponsorId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorPlayer.from.name} not sponsored by ${sponsor.name}!`,
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

  const [mergeSponsorPlayer] = useMutation(MERGE_SPONSOR_PLAYER, {
    update(cache, { data: { sponsorPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            sponsorId,
          },
        })
        const existingPlayers = queryResult.sponsor[0].players
        const newPlayer = sponsorPlayer.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              players: [newPlayer, ...existingPlayers],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PLAYERS,
          data: updatedResult,
          variables: {
            sponsorId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorPlayer.from.name} sponsored by ${sponsor.name}!`,
        {
          variant: 'success',
        }
      )
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
      getData({ variables: { sponsorId } })
    }
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const sponsorPlayersColumns = useMemo(
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
              text={'Detach'}
              textLoading={'Detaching...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach player from the sponsor?'
              }
              dialogDescription={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep player'}
              dialogPositiveText={'Yes, detach player'}
              onDialogClosePositive={() => {
                removeSponsorPlayer({
                  variables: {
                    sponsorId,
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
              sponsorId={sponsorId}
              sponsor={sponsor}
              merge={mergeSponsorPlayer}
              remove={removeSponsorPlayer}
            />
          )
        },
      },
    ],
    [sponsor]
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
                columns={sponsorPlayersColumns}
                rows={setIdFromEntityId(sponsor.players, 'playerId')}
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
              <DialogTitle id="alert-dialog-title">{`Add player to ${
                sponsor && sponsor.name
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
  const { playerId, sponsorId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.players.find(p => p.playerId === playerId)
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
                    sponsorId,
                    playerId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    playerId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewPlayer.propTypes = {
  playerId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorPlayer: PropTypes.func,
  mergeSponsorPlayer: PropTypes.func,
}

Players.propTypes = {
  sponsorId: PropTypes.string,
}

export { Players }
