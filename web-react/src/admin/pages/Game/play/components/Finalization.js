import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import { gql, useMutation } from '@apollo/client'

const UPDATE_GAME_RESULT = gql`
  mutation updateGameResult(
    $where: GameResultWhere
    $update: GameResultUpdateInput
  ) {
    updateGameResults(where: $where, update: $update) {
      gameResults {
        gameResultId
        hostWin
        guestWin
        draw
        gameStatus
      }
    }
  }
`

const Finalization = props => {
  const { gameData } = props
  const { enqueueSnackbar } = useSnackbar()
  //, error: mutationErrorUpdate
  const [updateGameResult, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_GAME_RESULT,
    {
      onCompleted: () => {
        enqueueSnackbar('Game Result updated!', { variant: 'success' })
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    }
  )

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
        },
      },
    })
  }, [gameData])

  return (
    <Button
      fullWidth
      loading={mutationLoadingUpdate}
      onClick={prepareGameFinalization}
      variant="contained"
    >
      End Game
    </Button>
  )
}

Finalization.propTypes = {
  gameSettings: PropTypes.object,
}

export default Finalization
