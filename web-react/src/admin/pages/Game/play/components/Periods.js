import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { Timer } from './Timer'
import GameEventFormContext from '../context'

const PeriodsComponent = props => {
  const { gameSettings, gameData, updateGameResult } = props

  const { setPeriod } = React.useContext(GameEventFormContext)

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
                onClick={() => {
                  if (
                    periodObject?.name !== gameData?.gameResult?.periodActive
                  ) {
                    setPeriod(periodObject?.name)
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
                  }
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

PeriodsComponent.propTypes = {
  gameSettings: PropTypes.object,
}

const Periods = React.memo(PeriodsComponent)

export { Periods }
