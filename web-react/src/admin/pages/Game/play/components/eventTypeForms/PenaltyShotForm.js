import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { PlayerSelect, RemainingTime } from './components'
import GameEventFormContext from '../../context'

const formInitialState = {
  remainingTime: '00:00',
  executedBy: null,
  facedAgainst: null,
}

const PenaltyShotForm = props => {
  const {
    gameEventSettings,
    activeStep,
    players,
    playersRival,
    handleNextStep,
  } = props

  const {
    setNextButtonDisabled,
    gameEventData,
    setGameEventData,
    tempRemainingTime,
  } = React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )

  React.useEffect(() => {
    if (!gameEventData)
      setGameEventData({
        ...formInitialState,
        timestamp: dayjs().format(),
        remainingTime: tempRemainingTime.current,
      })
  }, [])

  React.useEffect(() => {
    switch (activeStep) {
      case 0:
        setNextButtonDisabled(gameEventData?.remainingTime === '')
        break
    }
  }, [gameEventData, activeStep])

  return gameEventData ? (
    <Grid container spacing={2}>
      {activeStep === 0 && (
        <Grid item xs={12}>
          <RemainingTime
            gameEventData={gameEventData}
            setGameEventData={setGameEventData}
            activeStepData={activeStepData}
          />
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={executedBy => {
              setGameEventData(state => ({ ...state, executedBy }))
              setNextButtonDisabled(false)
              handleNextStep()
            }}
            selected={gameEventData?.executedBy}
          />
        </Grid>
      )}
      {activeStep === 2 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={playersRival}
            onClick={facedAgainst => {
              setGameEventData(state => ({ ...state, facedAgainst }))
              setNextButtonDisabled(false)
              handleNextStep()
            }}
            selected={gameEventData?.facedAgainst}
          />
        </Grid>
      )}

      {activeStep === gameEventSettings?.steps.length && (
        <Grid item xs={12}>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - recapitulation
          </Typography>
          <TableContainer>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="event recapitulation table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell align="right">Remaining Time</TableCell>
                  <TableCell align="right">Executed By</TableCell>
                  <TableCell align="right">Faced Against</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {'Goal'}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.remainingTime}
                  </TableCell>
                  <TableCell align="right">
                    {`${gameEventData?.executedBy?.player?.name} (${gameEventData?.executedBy?.jersey})`}
                  </TableCell>
                  <TableCell align="right">
                    {`${gameEventData?.facedAgainst?.player?.name} (${gameEventData?.facedAgainst?.jersey})`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  ) : null
}

PenaltyShotForm.propTypes = {
  gameEventSettings: PropTypes.object,
  activeStep: PropTypes.number,
}

export { PenaltyShotForm }
