import React from 'react'
import { MutationFunction } from '@apollo/client'
import Button from '@mui/material/Button'
import { Game } from 'utils/types'

type TFinalization = {
  gameData: Game
  updateGameResult: MutationFunction
}

const Finalization: React.FC<TFinalization> = React.memo(props => {
  const { gameData, updateGameResult } = props

  const prepareGameFinalization = React.useCallback(() => {
    // get current gameResult
    const gameResult = gameData?.gameResult
    let hostWin = false
    let guestWin = false
    let draw = false
    // define winner and looser
    if (gameResult?.hostGoals > gameResult?.guestGoals) {
      hostWin = true
    }
    if (gameResult?.hostGoals < gameResult?.guestGoals) {
      guestWin = true
    }
    if (gameResult?.hostGoals === gameResult?.guestGoals) {
      draw = true
    }

    // update final gameResult

    updateGameResult({
      variables: {
        where: {
          gameResultId: gameData?.gameResult?.gameResultId,
        },
        update: {
          hostWin,
          guestWin,
          draw,
          gameStatus: 'Finished',
          periodActive: null,
        },
      },
    })
  }, [gameData])

  return gameData?.gameResult?.periodActive ? (
    <Button
      fullWidth
      onClick={prepareGameFinalization}
      variant="contained"
      disabled={!gameData?.gameResult?.periodActive}
    >
      End Game
    </Button>
  ) : null
})

export { Finalization }
