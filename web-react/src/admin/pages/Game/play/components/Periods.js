import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { Timer } from './Timer'
const Periods = props => {
  const { gameSettings } = props

  const [activePeriod, setActivePeriod] = useState()

  const handleButtonClick = useCallback(period => {
    setActivePeriod(period)
  }, [])

  const getButtonVariant = useCallback(
    value => {
      return activePeriod === value ? 'contained' : 'outlined'
    },
    [activePeriod]
  )

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
          ?.map(period => {
            return (
              <Button
                key={period?.periodId}
                onClick={() => {
                  handleButtonClick(period?.name)
                }}
                variant={getButtonVariant(period?.name)}
              >
                {period?.name}
              </Button>
            )
          })}
      </ButtonGroup>
      <Timer
        timeInMinutes={
          gameSettings?.periods?.find(p => p.name === activePeriod)?.duration ||
          0 * 60
        }
      />
    </>
  )
}

Periods.propTypes = {
  gameSettings: PropTypes.object,
}

export { Periods }
