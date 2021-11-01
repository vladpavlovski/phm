import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'

const FinalizationComponent = props => {
  const { gameData, updateGameResult } = props

  const prepareGameFinalization = React.useCallback(() => {
    // console.log('gameSettings:', gameSettings)
    // console.log('gameData:', gameData)
    // get current gameResult
    const gameResult = gameData?.gameResult
    let hostWin = false
    let guestWin = false
    let draw = false
    // get points rulePack
    // const points = gameSettings?.resultPoints

    // define winner and looser
    if (gameResult?.hostGoals > gameResult?.guestGoals) {
      // host win
      // guest lost
      hostWin = true
    }
    if (gameResult?.hostGoals < gameResult?.guestGoals) {
      // host lost
      // guest win
      guestWin = true
    }
    if (gameResult?.hostGoals === gameResult?.guestGoals) {
      // draw
      draw = true
    }

    // count WLR
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

  return (
    gameData?.gameResult?.periodActive && (
      <Button
        fullWidth
        onClick={prepareGameFinalization}
        variant="contained"
        disabled={!gameData?.gameResult?.periodActive}
      >
        End Game
      </Button>
    )
  )
}

FinalizationComponent.propTypes = {
  gameSettings: PropTypes.object,
}

const Finalization = React.memo(FinalizationComponent)

export { Finalization }
