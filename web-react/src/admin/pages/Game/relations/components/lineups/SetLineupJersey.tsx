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

type TSetLineupJersey = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
}

export const SetLineupJersey: React.FC<TSetLineupJersey> = React.memo(props => {
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
      {lineupJerseyDialogOpen && (
        <JerseyDialog
          {...props}
          lineupJerseyDialogOpen={lineupJerseyDialogOpen}
          setLineupJerseyDialogOpen={setLineupJerseyDialogOpen}
        />
      )}
    </>
  )
})

type TJerseyDialog = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
  lineupJerseyDialogOpen: boolean
  setLineupJerseyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const JerseyDialog: React.FC<TJerseyDialog> = React.memo(props => {
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
                setJerseyValue(parseInt(e.target.value))
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
                        jersey: jerseyValue,
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
