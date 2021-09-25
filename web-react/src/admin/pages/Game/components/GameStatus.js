import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import LoadingButton from '@mui/lab/LoadingButton'
import CompareIcon from '@mui/icons-material/Compare'

import { Title } from '../../../../components/Title'

import { getFieldName } from '../play/handlers'

const GameStatus = props => {
  const { gameData, updateGame } = props
  const loading = false

  const hostTeam = React.useMemo(
    () => gameData?.teamsConnection?.edges.find(e => e.host)?.node,
    []
  )
  const guestTeam = React.useMemo(
    () => gameData?.teamsConnection?.edges.find(e => !e.host)?.node,
    []
  )

  const recomputeGameResult = React.useCallback(() => {
    let gameResultNew = { ...gameData?.gameResult }

    // clear previous values
    const periodStatisticsToDelete =
      gameData?.gameResult?.periodStatistics?.map(ps => ({
        where: { node: { periodStatisticId: ps?.periodStatisticId } },
      }))
    gameResultNew.periodStatistics = []
    gameData?.gameEventsSimple?.forEach(ges => {
      const isHostEvent = ges?.team?.teamId === hostTeam?.teamId
      const eventFieldName = getFieldName({
        host: isHostEvent,
        type: ges?.eventTypeCode,
      })
      gameResultNew[eventFieldName] = 0
    })

    // count new values
    gameData?.gameEventsSimple?.forEach(ges => {
      const isHostEvent = ges?.team?.teamId === hostTeam?.teamId
      const eventFieldName = getFieldName({
        host: isHostEvent,
        type: ges?.eventTypeCode,
      })
      gameResultNew[eventFieldName] += 1
      if (ges?.period) {
        const periodStatistics = gameResultNew.periodStatistics?.find(
          ps => ps?.node?.period === ges.period
        )
        if (periodStatistics) {
          let field = periodStatistics.node[eventFieldName]
          periodStatistics.node[eventFieldName] = field ? field + 1 : 1
        } else {
          if (gameResultNew.periodStatistics) {
            gameResultNew.periodStatistics = [
              ...gameResultNew.periodStatistics,
              {
                node: { period: ges?.period, [eventFieldName]: 1 },
              },
            ]
          } else {
            gameResultNew.periodStatistics = [
              {
                node: { period: ges?.period, [eventFieldName]: 1 },
              },
            ]
          }
        }
      }
    })
    gameResultNew.gameStatus = dayjs().isAfter(dayjs(gameData?.startDate))
      ? 'Finished'
      : 'Not played'
    delete gameResultNew.__typename
    const { gameResultId, periodStatistics, ...rest } = gameResultNew
    const result = {
      where: {
        node: { gameResultId },
      },
      update: {
        node: {
          ...rest,
          periodStatistics: {
            delete: periodStatisticsToDelete,
            create: periodStatistics,
          },
        },
      },
    }

    updateGame({
      variables: {
        where: {
          gameId: gameData?.gameId,
        },
        update: {
          gameResult: {
            ...result,
          },
        },
      },
    })
  }, [gameData, hostTeam, guestTeam])

  return (
    <>
      <Toolbar
        disableGutters
        sx={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <Title>{`Status: ${gameData?.gameResult?.gameStatus}`}</Title>
        </div>
        <div>
          <LoadingButton
            size="small"
            type="button"
            variant="contained"
            color="primary"
            startIcon={<CompareIcon />}
            loading={loading}
            loadingPosition="start"
            onClick={() => {
              recomputeGameResult()
            }}
          >
            {loading ? 'Computing...' : 'Recompute'}
          </LoadingButton>
        </div>
      </Toolbar>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">{hostTeam?.nick}</TableCell>
            <TableCell align="right">{guestTeam?.nick}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              Goals
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostGoals}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestGoals}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Penalties
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostPenalties}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestPenalties}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              PenaltyShots
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostPenaltyShots}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestPenaltyShots}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Saves
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostSaves}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestSaves}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              FaceOffs
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostFaceOffs}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestFaceOffs}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Injuries
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostInjuries}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestInjuries}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

GameStatus.propTypes = {
  gameData: PropTypes.object.isRequired,
  updateGame: PropTypes.func.isRequired,
}

export { GameStatus }
