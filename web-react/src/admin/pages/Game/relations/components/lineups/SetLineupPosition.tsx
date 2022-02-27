import React, { useCallback, useState } from 'react'
import { MutationFunction } from '@apollo/client'

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
import { GamePlayersRelationship } from 'utils/types'

type TSetLineupPosition = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
}

export const SetLineupPosition: React.FC<TSetLineupPosition> = React.memo(
  props => {
    const [lineupPositionDialogOpen, setLineupPositionDialogOpen] =
      useState(false)

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
        {lineupPositionDialogOpen && (
          <PositionDialog
            {...props}
            lineupPositionDialogOpen={lineupPositionDialogOpen}
            setLineupPositionDialogOpen={setLineupPositionDialogOpen}
          />
        )}
      </>
    )
  }
)

type TPositionDialog = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
  lineupPositionDialogOpen: boolean
  setLineupPositionDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PositionDialog: React.FC<TPositionDialog> = React.memo(props => {
  const {
    player,
    gameId,
    updateGame,
    lineupPositionDialogOpen,
    setLineupPositionDialogOpen,
  } = props

  const [positionValue, setPositionValue] = useState(player?.position || '')

  const handleCloseDialog = useCallback(() => {
    setLineupPositionDialogOpen(false)
  }, [])

  return (
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
  )
})
