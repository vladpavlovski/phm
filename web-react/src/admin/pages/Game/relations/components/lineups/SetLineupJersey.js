import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import Tooltip from '@material-ui/core/Tooltip'
import { LinkButton } from '../../../../../../components/LinkButton'
import ButtonBase from '@material-ui/core/ButtonBase'

export const SetLineupJersey = props => {
  const { player, gameId, updateGame } = props
  const [lineupJerseyDialogOpen, setLineupJerseyDialogOpen] = useState(false)

  const [jerseyValue, setJerseyValue] = useState(player?.jersey || '')

  const handleCloseDialog = useCallback(() => {
    setLineupJerseyDialogOpen(false)
  }, [])

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
                          playerId: player?.playerId,
                        },
                        properties: {
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
    </>
  )
}

SetLineupJersey.propTypes = {
  player: PropTypes.object,
}
