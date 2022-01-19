import React from 'react'

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
import { GameEventFormContext } from '../../components/GameEventWizard'
import { TEventTypeForm } from './index'

const FaceOffForm: React.FC<TEventTypeForm> = React.memo(props => {
  const {
    gameEventSettings,
    activeStep,
    players,
    playersRival,
    handleNextStep,
  } = props

  const {
    state: { gameEventData, tempRemainingTime },
    update,
  } = React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )

  React.useEffect(() => {
    if (!gameEventData)
      update(state => ({
        ...state,
        gameEventData: {
          timestamp: dayjs().format(),
          remainingTime: tempRemainingTime,
        },
      }))
  }, [])

  React.useEffect(() => {
    switch (activeStep) {
      case 0:
        update(state => ({
          ...state,
          nextButtonDisabled: gameEventData?.remainingTime === '',
        }))
        break
      case 1:
        update(state => ({
          ...state,
          nextButtonDisabled: !gameEventData?.wonBy,
        }))

        break
      case 2:
        update(state => ({
          ...state,
          nextButtonDisabled: !gameEventData?.lostBy,
        }))

        break
    }
  }, [gameEventData, activeStep])

  return gameEventData ? (
    <Grid container spacing={2}>
      {activeStep === 0 && (
        <Grid item xs={12}>
          <RemainingTime activeStepData={activeStepData} />
        </Grid>
      )}
      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={wonBy => {
              update(state => ({
                ...state,
                nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  wonBy,
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.wonBy || null}
          />
        </Grid>
      )}
      {activeStep === 2 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={playersRival}
            onClick={lostBy => {
              update(state => ({
                ...state,
                nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  lostBy,
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.lostBy || null}
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
                  <TableCell align="right">Won By</TableCell>
                  <TableCell align="right">Lost By</TableCell>
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
                    {gameEventData?.wonBy?.jersey}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.lostBy?.jersey}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  ) : null
})

export { FaceOffForm }
