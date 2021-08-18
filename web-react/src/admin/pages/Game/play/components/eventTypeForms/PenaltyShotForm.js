import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'

import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import { PlayerSelect } from './components'
import GameEventFormContext from '../../context'

const formInitialState = {
  remainingTime: '00:00',
  executedBy: null,
  facedAgainst: null,
}

const PenaltyShotForm = props => {
  const { gameEventSettings, activeStep, players, playersRival } = props

  const { setNextButtonDisabled, gameEventData, setGameEventData } =
    React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )

  React.useEffect(() => {
    if (!gameEventData)
      setGameEventData({ ...formInitialState, timestamp: dayjs().format() })
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
          <TextField
            placeholder="Remaining time"
            label="Remaining time"
            name="Remaining time"
            fullWidth
            autoFocus
            variant="standard"
            value={gameEventData?.remainingTime}
            onChange={e => {
              setGameEventData(state => ({
                ...state,
                remainingTime: e.target.value,
              }))
            }}
            required={!activeStepData.optional}
            error={!gameEventData?.remainingTime}
            helperText={
              !gameEventData?.remainingTime &&
              'Remaining time should be defined'
            }
            inputProps={{
              autoComplete: 'off',
            }}
          />
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={executedBy => {
              setGameEventData(state => ({ ...state, executedBy }))
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
