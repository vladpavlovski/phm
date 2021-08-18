import React, { useCallback, useState, useMemo } from 'react'
import PropTypes from 'prop-types'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import AddIcon from '@material-ui/icons/Add'

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

import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const Positions = props => {
  const { playerId, player, updatePlayer } = props

  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
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
        field: 'teamName',
        headerName: 'Team',
        width: 150,
        valueGetter: params => params.row?.team?.name,
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
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      positions: {
                        disconnect: {
                          where: {
                            node: {
                              positionId: params.row.positionId,
                            },
                          },
                        },
                      },
                    },
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
        field: 'teamName',
        headerName: 'Team',
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
              updatePlayer={updatePlayer}
            />
          )
        },
      },
    ],
    [player]
  )

  return (
    <Accordion>
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
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Add ${player?.name} to new position`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <XGrid
              columns={allPositionsColumns}
              rows={setIdFromEntityId(
                composePositions(player?.teams),
                'positionId'
              )}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </DialogContent>

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
  teams.reduce((acc, team) => {
    const teamPositions = team.positions.map(p => ({
      ...p,
      teamName: team?.name,
    }))
    return [...acc, ...teamPositions]
  }, [])

const ToggleNewPosition = props => {
  const { playerId, positionId, player, updatePlayer } = props
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
              ? updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      positions: {
                        disconnect: {
                          where: {
                            node: {
                              positionId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      positions: {
                        connect: {
                          where: {
                            positionId,
                          },
                        },
                      },
                    },
                  },
                })
            setIsMember(!isMember)
          }}
          name="positionMember"
          color="primary"
        />
      }
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
