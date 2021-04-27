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
// import { getAdminJerseyRoute } from '../../../../../routes'
// import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_JERSEYS = gql`
  query getPlayerJerseys($playerId: ID) {
    player: Player(playerId: $playerId) {
      playerId
      name
      jerseys {
        jerseyId
        name
        number
      }
    }
  }
`

const REMOVE_JERSEY_PLAYER = gql`
  mutation removeJerseyPlayer($playerId: ID!, $jerseyId: ID!) {
    jerseyPlayer: RemoveJerseyPlayer(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        name
      }
      to {
        jerseyId
        name
        number
      }
    }
  }
`

export const GET_ALL_AVAILABLE_JERSEYS = gql`
  query getJerseys($playerId: ID!) {
    player: Player(playerId: $playerId) {
      playerId
      teams {
        teamId
        name
        jerseys {
          jerseyId
          name
          number
        }
      }
    }
  }
`

const MERGE_JERSEY_PLAYER = gql`
  mutation mergeJerseyPlayer($playerId: ID!, $jerseyId: ID!) {
    jerseyPlayer: MergeJerseyPlayer(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        name
      }
      to {
        jerseyId
        name
        number
      }
    }
  }
`

const Jerseys = props => {
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
  ] = useLazyQuery(GET_JERSEYS, {
    variables: { playerId },
    fetchPolicy: 'cache-and-network',
  })

  const player = queryData?.player?.[0]

  const [
    getAllPlayers,
    {
      loading: queryAllJerseysLoading,
      error: queryAllJerseysError,
      data: queryAllJerseysData,
    },
  ] = useLazyQuery(GET_ALL_AVAILABLE_JERSEYS, {
    variables: { playerId },
    fetchPolicy: 'cache-and-network',
  })

  const [removeJerseyPlayer, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_JERSEY_PLAYER,
    {
      update(cache, { data: { jerseyPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_JERSEYS,
            variables: {
              playerId,
            },
          })

          const updatedData = queryResult?.player?.[0]?.jerseys.filter(
            p => p.jerseyId !== jerseyPlayer.to.jerseyId
          )

          const updatedResult = {
            player: [
              {
                ...queryResult?.player?.[0],
                jerseys: updatedData,
              },
            ],
          }

          cache.writeQuery({
            query: GET_JERSEYS,
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
          `${data.jerseyPlayer.to.name} removed from ${player.name}!`,
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

  const [mergeJerseyPlayer] = useMutation(MERGE_JERSEY_PLAYER, {
    update(cache, { data: { jerseyPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_JERSEYS,
          variables: {
            playerId,
          },
        })

        const existingData = queryResult?.player?.[0]?.jerseys || []
        const newItem = jerseyPlayer?.to
        const updatedResult = {
          player: [
            {
              ...queryResult?.player?.[0],
              jerseys: [newItem, ...existingData],
            },
          ],
        }

        cache.writeQuery({
          query: GET_JERSEYS,
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
      enqueueSnackbar(`${data.jerseyPlayer.to.name} added to ${player.name}!`, {
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
      getData()
    }
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllJerseysData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const playerJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'number',
        headerName: 'Number',
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
                'Do you really want to remove jersey from the player?'
              }
              dialogDescription={
                'Jersey will remain in the database. You can use it anytime later.'
              }
              dialogNegativeText={'No, keep jersey'}
              dialogPositiveText={'Yes, remove jersey'}
              onDialogClosePositive={() => {
                removeJerseyPlayer({
                  variables: {
                    playerId,
                    jerseyId: params.row.jerseyId,
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

  const allJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'number',
        headerName: 'Number',
        width: 150,
      },
      {
        field: 'jerseyId',
        headerName: 'Assignment',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewJersey
              jerseyId={params.value}
              playerId={playerId}
              player={player}
              merge={mergeJerseyPlayer}
              remove={removeJerseyPlayer}
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
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography className={classes.accordionFormTitle}>Jerseys</Typography>
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
                  Assign Jersey
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={playerJerseysColumns}
                rows={setIdFromEntityId(player.jerseys, 'jerseyId')}
                loading={queryAllJerseysLoading}
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
        {queryAllJerseysLoading && !queryAllJerseysError && <Loader />}
        {queryAllJerseysError && !queryAllJerseysLoading && (
          <Error message={queryAllJerseysError.message} />
        )}
        {queryAllJerseysData &&
          !queryAllJerseysLoading &&
          !queryAllJerseysError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Assign new jersey to${player?.name}`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allJerseysColumns}
                    rows={setIdFromEntityId(
                      composeJerseys(queryAllJerseysData.player[0].teams),
                      'jerseyId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllJerseysLoading}
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

const composeJerseys = teams =>
  teams.reduce((acc, team) => [...acc, ...team.jerseys], [])

const ToggleNewJersey = props => {
  const { playerId, jerseyId, player, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!player.jerseys.find(p => p.jerseyId === jerseyId)
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
                    jerseyId,
                  },
                })
              : merge({
                  variables: {
                    playerId,
                    jerseyId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="jerseyMember"
          color="primary"
        />
      }
      label={isMember ? 'Assigned' : 'Not assigned'}
    />
  )
}

ToggleNewJersey.propTypes = {
  playerId: PropTypes.string,
  jerseyId: PropTypes.string,
  jersey: PropTypes.object,
  removeJerseyPlayer: PropTypes.func,
  mergeJerseyPlayer: PropTypes.func,
}

Jerseys.propTypes = {
  playerId: PropTypes.string,
}

export { Jerseys }
