import { LinkButton } from 'components/LinkButton'
import React, { useCallback, useState } from 'react'
import { GamePlayersRelationship } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

type TSetLineupJersey = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
}

export const SetLineupJersey: React.FC<TSetLineupJersey> = props => {
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
}

type TJerseyDialog = {
  player: GamePlayersRelationship
  gameId: string
  updateGame: MutationFunction
  lineupJerseyDialogOpen: boolean
  setLineupJerseyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const JerseyDialog: React.FC<TJerseyDialog> = props => {
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
}
