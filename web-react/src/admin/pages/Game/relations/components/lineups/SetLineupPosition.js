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
import { LinkButton } from '../../../../../../components/LinkButton'
import ButtonBase from '@mui/material/ButtonBase'

export const SetLineupPosition = props => {
  const { player, gameId, updateGame } = props
  const [lineupPositionDialogOpen, setLineupPositionDialogOpen] =
    useState(false)

  const [positionValue, setPositionValue] = useState(player?.position || '')

  const handleCloseDialog = useCallback(() => {
    setLineupPositionDialogOpen(false)
  }, [])

  return (
    <>
      <LinkButton
        component={ButtonBase}
        variant="text"
        icon
        onClick={() => {
          setLineupPositionDialogOpen(true)
        }}
      >
        <Tooltip arrow title="Change Position" placement="top">
          <EditIcon />
        </Tooltip>
      </LinkButton>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={lineupPositionDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {player && (
          <>
            <DialogTitle id="alert-dialog-title">{`Set ${player?.name} position for game`}</DialogTitle>
            <DialogContent>
              <TextField
                placeholder="Position"
                label="Position"
                name="Position"
                fullWidth
                variant="standard"
                value={positionValue}
                onChange={e => {
                  setPositionValue(e.target.value)
                }}
                required
                error={!positionValue}
                helperText={!positionValue && 'Position should be defined'}
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
            disabled={!positionValue}
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
                          position: positionValue,
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

SetLineupPosition.propTypes = {
  player: PropTypes.object,
}
