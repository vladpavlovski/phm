import React from 'react'
import { Game, RulePack } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { GameEventFormContext } from './GameEventWizard'
import { Timer } from './Timer'

type Props = {
  gameSettings: RulePack
  gameData: Game
  updateGameResult: MutationFunction
}

const Periods = (props: Props) => {
  const { gameSettings, gameData, updateGameResult } = props

  const { update } = React.useContext(GameEventFormContext)
  // TODO: add warning if change period during active timer
  return (
    <>
      <ButtonGroup
        fullWidth
        variant="outlined"
        aria-label="outlined primary button group"
      >
        {gameSettings?.periods
          ?.slice()
          ?.sort((a, b) => (a.priority > b.priority ? 1 : -1))
          ?.map(periodObject => {
            return (
              <Button
                key={periodObject?.periodId}
                disabled={
                  periodObject?.name === gameData?.gameResult?.periodActive
                }
                onClick={() => {
                  update(state => ({
                    ...state,
                    period: periodObject?.name,
                  }))

                  updateGameResult({
                    variables: {
                      where: {
                        gameResultId: gameData?.gameResult?.gameResultId,
                      },
                      update: {
                        periodActive: periodObject?.name,
                      },
                    },
                  })
                }}
                variant={
                  gameData?.gameResult?.periodActive === periodObject?.name
                    ? 'contained'
                    : 'outlined'
                }
              >
                {periodObject?.name}
              </Button>
            )
          })}
      </ButtonGroup>
      <Timer
        {...props}
        timeInMinutes={
          gameSettings?.periods?.find(
            p => p.name === gameData?.gameResult?.periodActive
          )?.duration || 20
        }
      />
    </>
  )
}

export { Periods }
