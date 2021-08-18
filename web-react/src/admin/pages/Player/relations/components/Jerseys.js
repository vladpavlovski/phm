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

const Jerseys = props => {
  const { playerId, player, updatePlayer } = props

  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
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
        field: 'teamName',
        headerName: 'Team',
        width: 250,
        valueGetter: params => params.row?.team?.name,
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
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      jerseys: {
                        disconnect: {
                          where: {
                            node: {
                              jerseyId: params.row.jerseyId,
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

  const allJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'teamName',
        headerName: 'Team',
        width: 150,
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
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography className={classes.accordionFormTitle}>Jerseys</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Assign new jersey to${player?.name}`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <XGrid
              columns={allJerseysColumns}
              rows={setIdFromEntityId(composeJerseys(player.teams), 'jerseyId')}
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

const composeJerseys = teams =>
  teams.reduce((acc, team) => {
    const teamJerseys = team.jerseys.map(p => ({
      ...p,
      teamName: team?.name,
    }))
    return [...acc, ...teamJerseys]
  }, [])

const ToggleNewJersey = props => {
  const { playerId, jerseyId, player, updatePlayer } = props
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
              ? updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      jerseys: {
                        disconnect: {
                          where: {
                            node: {
                              jerseyId,
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
                      jerseys: {
                        connect: {
                          where: {
                            jerseyId,
                          },
                        },
                      },
                    },
                  },
                })
            setIsMember(!isMember)
          }}
          name="jerseyMember"
          color="primary"
        />
      }
    />
  )
}

ToggleNewJersey.propTypes = {
  playerId: PropTypes.string,
  jerseyId: PropTypes.string,
  jersey: PropTypes.object,
}

Jerseys.propTypes = {
  playerId: PropTypes.string,
  player: PropTypes.object,
  updatePlayer: PropTypes.func,
}

export { Jerseys }
