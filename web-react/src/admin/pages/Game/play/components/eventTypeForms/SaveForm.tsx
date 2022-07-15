import React from 'react'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { getPlayerObject, PlayerSelect, TimeInfo, TitleDivider } from './components'
import { TEventTypeForm } from './index'

const SaveForm: React.FC<TEventTypeForm> = ({ players }) => {
  const {
    state: { gameEventData },
    update,
  } = React.useContext(GameEventFormContext)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimeInfo />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="Saved By"
          players={players}
          onClick={savedBy => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: savedBy,
                  playerTitle: 'savedBy',
                  playerToCheck: gameEventData?.savedBy,
                }),
              },
            }))
          }}
          selected={gameEventData?.savedBy}
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
                <TableCell align="right">Saved By</TableCell>
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
                  {gameEventData?.savedBy
                    ? `${gameEventData?.savedBy?.node?.name} (${gameEventData?.savedBy?.jersey})`
                    : ''}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export { SaveForm }
