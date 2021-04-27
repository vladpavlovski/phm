import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import AddIcon from '@material-ui/icons/Add'
// import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
// import { getAdminPositionRoute } from '../../../../../routes'
// import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_POSITIONS = gql`
  query getPlayerPositions($playerId: ID) {
    player: Player(playerId: $playerId) {
      playerId
      name
      positions {
        positionId
        name
      }
    }
  }
`

const REMOVE_TEAM_PLAYER = gql`
  mutation removePositionPlayer($playerId: ID!, $positionId: ID!) {
    positionPlayer: RemovePositionPlayers(
      from: { playerId: $playerId }
      to: { positionId: $positionId }
    ) {
      from {
        playerId
        name
      }
      to {
        positionId
        name
      }
    }
  }
`

export const GET_ALL_AVAILABLE_POSITIONS = gql`
  query getPositions($playerId: ID!) {
    player: Player(playerId: $playerId) {
      playerId
      teams {
        teamId
        name
        positions {
          positionId
          name
        }
      }
    }
  }
`

const MERGE_TEAM_PLAYER = gql`
  mutation mergePositionPlayer($playerId: ID!, $positionId: ID!) {
    positionPlayer: MergePositionPlayers(
      from: { playerId: $playerId }
      to: { positionId: $positionId }
    ) {
      from {
        playerId
        name
      }
      to {
        positionId
        name
      }
    }
  }
`

const Positions = props => {
  const { playerId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_POSITIONS, {
    variables: { playerId },
    fetchPolicy: 'cache-and-network',
  })

  const player = queryData?.player?.[0]

  const [
    getAllPlayers,
    {
      loading: queryAllPositionsLoading,
      error: queryAllPositionsError,
      data: queryAllPositionsData,
    },
  ] = useLazyQuery(GET_ALL_AVAILABLE_POSITIONS, {
    variables: { playerId },
    fetchPolicy: 'cache-and-network',
  })

  const [
    removePositionPlayer,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_TEAM_PLAYER, {
    update(cache, { data: { positionPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_POSITIONS,
          variables: {
            playerId,
          },
        })
        const updatedData = queryResult.player[0].positions.filter(
          p => p.positionId !== positionPlayer.to.positionId
        )

        const updatedResult = {
          player: [
            {
              ...queryResult.player[0],
              positions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_POSITIONS,
          data: updatedResult,
          variables: {
            playerId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.positionPlayer.to.name} removed from ${player.name}!`,
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
  })

  const [mergePositionPlayer] = useMutation(MERGE_TEAM_PLAYER, {
    update(cache, { data: { positionPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_POSITIONS,
          variables: {
            playerId,
          },
        })
        const existingData = queryResult.player[0].positions
        const newItem = positionPlayer.to
        const updatedResult = {
          player: [
            {
              ...queryResult.player[0],
              positions: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_POSITIONS,
          data: updatedResult,
          variables: {
            playerId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.positionPlayer.to.name} added to ${player.name}!`,
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
      getData()
    }
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPositionsData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const playerPositionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
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
              dialogTitle={
                'Do you really want to remove position from the player?'
              }
              dialogDescription={
                'Position will remain in the database. You can use it anytime later.'
              }
              dialogNegativeText={'No, keep position'}
              dialogPositiveText={'Yes, remove position'}
              onDialogClosePositive={() => {
                removePositionPlayer({
                  variables: {
                    playerId,
                    positionId: params.row.positionId,
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

  const allPositionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'positionId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPosition
              positionId={params.value}
              playerId={playerId}
              player={player}
              merge={mergePositionPlayer}
              remove={removePositionPlayer}
            />
          )
        },
      },
    ],
    [player]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="positions-content"
        id="positions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Positions
        </Typography>
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
                  Add To Position
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={playerPositionsColumns}
                rows={setIdFromEntityId(player.positions, 'positionId')}
                loading={queryAllPositionsLoading}
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
        {queryAllPositionsLoading && !queryAllPositionsError && <Loader />}
        {queryAllPositionsError && !queryAllPositionsLoading && (
          <Error message={queryAllPositionsError.message} />
        )}
        {queryAllPositionsData &&
          !queryAllPositionsLoading &&
          !queryAllPositionsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${player?.name} to new position`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allPositionsColumns}
                    rows={setIdFromEntityId(
                      composePositions(queryAllPositionsData.player[0].teams),
                      'positionId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPositionsLoading}
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

const composePositions = teams =>
  teams.reduce((acc, team) => [...acc, ...team.positions], [])

const ToggleNewPosition = props => {
  const { playerId, positionId, player, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!player.positions.find(p => p.positionId === positionId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    playerId,
                    positionId,
                  },
                })
              : merge({
                  variables: {
                    playerId,
                    positionId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="positionMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewPosition.propTypes = {
  playerId: PropTypes.string,
  positionId: PropTypes.string,
  position: PropTypes.object,
  removePositionPlayer: PropTypes.func,
  mergePositionPlayer: PropTypes.func,
}

Positions.propTypes = {
  playerId: PropTypes.string,
}

export { Positions }
