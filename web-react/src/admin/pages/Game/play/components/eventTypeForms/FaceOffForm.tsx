import React from 'react'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { getPlayerObject, PlayerSelect, RemainingTime, TitleDivider } from './components'
import { TEventTypeForm } from './index'

const FaceOffForm: React.FC<TEventTypeForm> = ({ players, playersRival }) => {
  const {
    state: { gameEventData },
    update,
  } = React.useContext(GameEventFormContext)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <RemainingTime />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="Won by"
          players={players}
          onClick={wonBy => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: wonBy,
                  playerTitle: 'wonBy',
                  playerToCheck: gameEventData?.wonBy,
                }),
              },
            }))
          }}
          selected={gameEventData?.wonBy}
        />
      </Grid>
      <Grid item xs={12}>
        <PlayerSelect
          title="Lost by"
          players={playersRival}
          onClick={lostBy => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: lostBy,
                  playerTitle: 'lostBy',
                  playerToCheck: gameEventData?.lostBy,
                }),
              },
            }))
          }}
          selected={gameEventData?.lostBy}
        />
      </Grid>

      <Grid item xs={12}>
        <TitleDivider title="recapitulation" />
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="event recapitulation table">
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
    </Grid>
  )
}

export { FaceOffForm }
