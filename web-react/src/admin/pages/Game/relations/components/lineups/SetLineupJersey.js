import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'
import { LinkButton } from 'components/LinkButton'
import ButtonBase from '@mui/material/ButtonBase'

export const SetLineupJersey = props => {
  const [lineupJerseyDialogOpen, setLineupJerseyDialogOpen] = useState(false)

  return (
    <>
      <LinkButton
        component={ButtonBase}
        variant="text"
        icon
        onClick={() => {
          setLineupJerseyDialogOpen(true)
        }}
      >
        <Tooltip arrow title="Change Jersey" placement="top">
          <EditIcon />
        </Tooltip>
      </LinkButton>
      <MemoizedJerseyDialog
        {...props}
        lineupJerseyDialogOpen={lineupJerseyDialogOpen}
        setLineupJerseyDialogOpen={setLineupJerseyDialogOpen}
      />
    </>
  )
}

const JerseyDialog = props => {
  const {
    player,
    gameId,
    updateGame,
    lineupJerseyDialogOpen,
    setLineupJerseyDialogOpen,
  } = props

  const [jerseyValue, setJerseyValue] = useState(player?.jersey || '')

  const handleCloseDialog = useCallback(() => {
    setLineupJerseyDialogOpen(false)
  }, [])
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={lineupJerseyDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {player && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${player?.name} jersey for game`}</DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Jersey"
              label="Jersey"
              name="Jersey"
              fullWidth
              variant="standard"
              value={jerseyValue}
              onChange={e => {
                setJerseyValue(e.target.value)
              }}
              required
              error={!jerseyValue}
              helperText={!jerseyValue && 'Jersey should be defined'}
              inputProps={{
                autoComplete: 'off',
              }}
            />
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button type="button" onClick={handleCloseDialog}>
          {'Cancel'}
        </Button>
        <Button
          type="button"
          disabled={!jerseyValue}
          onClick={() => {
            updateGame({
              variables: {
                where: {
                  gameId,
                },
                update: {
                  players: {
                    connect: {
                      where: {
                        node: { playerId: player?.playerId },
                      },
                      edge: {
                        jersey: parseInt(jerseyValue),
                      },
                    },
                  },
                },
              },
            })
            handleCloseDialog()
          }}
        >
          {'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const MemoizedJerseyDialog = React.memo(JerseyDialog)

SetLineupJersey.propTypes = {
  player: PropTypes.object,
}
