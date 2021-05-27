import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

const Periods = props => {
  const { gameId } = props
  console.log(gameId)
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
    <ButtonGroup
      fullWidth
      variant="outlined"
      aria-label="outlined primary button group"
    >
      <Button
        onClick={() => {
          handleButtonClick(1)
        }}
        variant={getButtonVariant(1)}
      >
        First
      </Button>
      <Button
        onClick={() => {
          handleButtonClick(2)
        }}
        variant={getButtonVariant(2)}
      >
        Second
      </Button>
      <Button
        onClick={() => {
          handleButtonClick(3)
        }}
        variant={getButtonVariant(3)}
      >
        Third
      </Button>
      <Button
        onClick={() => {
          handleButtonClick(4)
        }}
        variant={getButtonVariant(4)}
      >
        OT
      </Button>
    </ButtonGroup>
  )
}

Periods.propTypes = {
  gameId: PropTypes.string,
}

export { Periods }
