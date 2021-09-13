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
