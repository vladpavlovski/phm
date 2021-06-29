import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { Timer } from './Timer'
import GameEventFormContext from '../context'

const Periods = props => {
  const { gameSettings } = props

  const { period, setPeriod } = React.useContext(GameEventFormContext)

  const getButtonVariant = React.useCallback(
    value => (period === value ? 'contained' : 'outlined'),
    [period]
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
                  setPeriod(period?.name)
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
          gameSettings?.periods?.find(p => p.name === period)?.duration ||
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
