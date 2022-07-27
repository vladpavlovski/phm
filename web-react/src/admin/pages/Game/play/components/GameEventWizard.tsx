import {
  GoalLocationType,
  LocationType,
} from 'admin/pages/Game/play/components/eventTypeForms/components/Location'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import React from 'react'
import { createCtx } from 'utils'
import {
  Game,
  GameEventSimple,
  GamePlayersRelationship,
  GoalSubType,
  GoalType,
  InjuryType,
  PenaltySubType,
  PenaltyType,
  RulePack,
  ShotSubType,
  ShotType,
  Team,
} from 'utils/types'
import { gql, useMutation } from '@apollo/client'
import AddTaskIcon from '@mui/icons-material/AddTask'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Zoom from '@mui/material/Zoom'
import { prepareGameResultUpdate } from '../handlers'
import { GET_GAME_PLAY, TQueryTypeData, TQueryTypeVars } from '../index'
import { EventTypeForm } from './eventTypeForms'
import { getEventSettings, TEventType } from './gameEvents'
import { GameEventTypes } from './GameEventTypes'

const CREATE_GES = gql`
  mutation createGameEventSimples(
    $input: [GameEventSimpleCreateInput!]!
    $gameResultWhere: GameResultWhere
    $gameResultUpdateInput: GameResultUpdateInput
  ) {
    createGameEventSimples(input: $input) {
      gameEventSimples {
        gameEventSimpleId
        timestamp
        period
        remainingTime
        gameTime
        eventType
        eventTypeCode
        goalType
        goalSubType
        shotType
        shotSubType
        penaltyType
        penaltySubType
        duration
        injuryType
        eventLocation
        goalLocation
        team {
          teamId
          nick
          logo
        }
        nextGameEvent {
          gameEventSimpleId
          timestamp
        }
        scoredBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        allowedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        firstAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        secondAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        lostBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        wonBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        penalized {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        executedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        facedAgainst {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        suffered {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        savedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
      }
    }
    updateGameResults(where: $gameResultWhere, update: $gameResultUpdateInput) {
      gameResults {
        gameResultId
        periodActive
        gameStartedAt
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostPenaltyShots
        guestPenaltyShots
        hostInjuries
        guestInjuries
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
        periodStatistics {
          periodStatisticId
          period
          hostGoals
          guestGoals
          hostPenalties
          guestPenalties
          hostPenaltyShots
          guestPenaltyShots
          hostInjuries
          guestInjuries
          hostSaves
          guestSaves
          hostFaceOffs
          guestFaceOffs
        }
      }
    }
  }
`

export const UPDATE_GES = gql`
  mutation updateGameEventSimples(
    $where: GameEventSimpleWhere
    $update: GameEventSimpleUpdateInput
    $gameResultWhere: GameResultWhere
    $gameResultUpdateInput: GameResultUpdateInput
  ) {
    updateGameEventSimples(where: $where, update: $update) {
      gameEventSimples {
        gameEventSimpleId
        timestamp
        period
        remainingTime
        gameTime
        eventType
        eventTypeCode
        goalType
        goalSubType
        shotType
        shotSubType
        penaltyType
        penaltySubType
        duration
        injuryType
        team {
          teamId
          nick
          logo
        }
        nextGameEvent {
          gameEventSimpleId
          timestamp
        }
        scoredBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        allowedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        firstAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        secondAssist {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        lostBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        wonBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        penalized {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        executedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        facedAgainst {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        suffered {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
        savedBy {
          metaPlayerId
          player {
            playerId
            name
            firstName
            lastName
          }
        }
      }
    }
    updateGameResults(where: $gameResultWhere, update: $gameResultUpdateInput) {
      gameResults {
        gameResultId
        periodActive
        gameStartedAt
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostPenaltyShots
        guestPenaltyShots
        hostInjuries
        guestInjuries
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
        periodStatistics {
          periodStatisticId
          period
          hostGoals
          guestGoals
          hostPenalties
          guestPenalties
          hostPenaltyShots
          guestPenaltyShots
          hostInjuries
          guestInjuries
          hostSaves
          guestSaves
          hostFaceOffs
          guestFaceOffs
        }
      }
    }
  }
`

export type TWizardGameEventSimple = {
  gameEventSimpleId?: string
  timestamp?: string
  period?: string
  remainingTime?: string
  gameTime?: string
  eventType?: string
  eventTypeCode?: string
  team?: Team
  game?: Game
  scoredBy?: GamePlayersRelationship
  allowedBy?: GamePlayersRelationship
  firstAssist?: GamePlayersRelationship
  secondAssist?: GamePlayersRelationship
  goalType?: GoalType
  goalSubType?: GoalSubType
  shotType?: ShotType
  shotSubType?: ShotSubType
  lostBy?: GamePlayersRelationship
  wonBy?: GamePlayersRelationship
  penaltyType?: PenaltyType
  penaltySubType?: PenaltySubType
  duration?: number
  penalized?: GamePlayersRelationship
  facedAgainst?: GamePlayersRelationship
  executedBy?: GamePlayersRelationship
  description?: string
  injuryType?: InjuryType
  suffered?: GamePlayersRelationship
  savedBy?: GamePlayersRelationship
  eventLocation?: LocationType
  goalLocation?: GoalLocationType
}

type TGameEventForm = {
  period: string
  time: string
  openGameEventDialog: string
  gameEventSettings: TEventType | null
  gameEventData: TWizardGameEventSimple | null
}
const [GameEventFormContext, GameEventFormProvider] = createCtx<TGameEventForm>(
  {
    period: '',
    time: '00:00',
    openGameEventDialog: '',
    gameEventSettings: null,
    gameEventData: null,
  }
)

type TGameEventWizard = {
  host: boolean
  team: Team
  teamRival: Team
  players: GamePlayersRelationship[]
  playersRival: GamePlayersRelationship[]
  gameSettings: RulePack
  gameData: Game
}

const getCountOfEventTypes = (
  data: GameEventSimple[],
  eventType: string,
  teamId: string
): number =>
  data.filter(
    event => event.eventTypeCode === eventType && event.team.teamId === teamId
  )?.length

const GameEventWizard: React.FC<TGameEventWizard> = ({
  host,
  team,
  teamRival,
  players,
  playersRival,
  gameSettings,
  gameData,
}) => {
  const { enqueueSnackbar } = useSnackbar()

  const {
    state: { openGameEventDialog, gameEventSettings, gameEventData },
    update,
  } = React.useContext(GameEventFormContext)

  const previousGameEventSimpleId = React.useRef()

  const [createGameEventSimple] = useMutation(CREATE_GES, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_GAME_PLAY,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })

        const updatedResult = {
          games: [
            {
              ...queryResult?.games?.[0],
              gameResult: data?.updateGameResults?.gameResults?.[0],
              gameEventsSimple: [
                data?.createGameEventSimples?.gameEventSimples?.[0],
                ...(queryResult?.games?.[0]?.gameEventsSimple || []),
              ],
            },
          ],
          systemSettings: queryResult?.systemSettings,
        }
        cache.writeQuery({
          query: GET_GAME_PLAY,
          data: updatedResult,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      previousGameEventSimpleId.current =
        data?.createGameEventSimples?.gameEventSimples?.[0]?.gameEventSimpleId

      enqueueSnackbar(
        `${data?.createGameEventSimples?.gameEventSimples?.[0]?.eventType} event created 🏒`,
        {
          variant: 'success',
        }
      )

      update(state => ({
        ...state,
        gameEventData: null,
      }))
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [updateGameEventSimple] = useMutation(UPDATE_GES, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_GAME_PLAY,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })

        const updatedGES = data?.updateGameEventSimples?.gameEventSimples?.[0]

        const newGameEventsSimple =
          queryResult?.games?.[0]?.gameEventsSimple?.map(ges => {
            if (ges.gameEventSimpleId === updatedGES?.gameEventSimpleId) {
              return updatedGES
            } else {
              return ges
            }
          })

        const updatedResult = {
          games: [
            {
              ...queryResult?.games?.[0],
              gameResult: data?.updateGameResults?.gameResults?.[0],
              gameEventsSimple: newGameEventsSimple,
            },
          ],
          systemSettings: queryResult?.systemSettings,
        }
        cache.writeQuery({
          query: GET_GAME_PLAY,
          data: updatedResult,
          variables: {
            whereGame: { gameId: gameData?.gameId },
            whereSystemSettings: { systemSettingsId: 'system-settings' },
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      previousGameEventSimpleId.current =
        data?.updateGameEventSimples?.gameEventSimples?.[0]?.gameEventSimpleId

      enqueueSnackbar(
        `${data?.updateGameEventSimples?.gameEventSimples?.[0]?.eventType} event updated 🏒`,
        {
          variant: 'success',
        }
      )

      update(state => ({
        ...state,
        gameEventData: null,
      }))
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const handleSave = () => {
    if (gameEventSettings) {
      const { gameEventSimpleId, ...input } = getInputVarsForGES({
        gameEventData,
        team,
        gameData,
        gameEventSettings,
      })
      const { where, update } = prepareGameResultUpdate({
        gameData,
        gameEventSettings,
        host,
        changeUp: gameEventSimpleId ? null : true,
      })

      gameEventSimpleId
        ? updateGameEventSimple({
            variables: {
              where: {
                gameEventSimpleId,
              },
              update: input,
              gameResultWhere: where,
              gameResultUpdateInput: update,
            },
          })
        : createGameEventSimple({
            variables: {
              input,
              gameResultWhere: where,
              gameResultUpdateInput: update,
            },
          })
      handleClose()
    }
  }

  const handleClose = () => {
    update(state => ({
      ...state,
      gameEventData: null,
      gameEventSettings: null,
      openGameEventDialog: '',
    }))
  }
  return (
    <Stack>
      <Tooltip
        arrow
        title="Select period to unblock game events"
        placement="top"
        disableHoverListener={!!gameData?.gameResult?.periodActive}
        TransitionComponent={Zoom}
      >
        <ButtonGroup
          orientation="vertical"
          aria-label="vertical outlined button group"
          variant="contained"
          disabled={!gameData?.gameResult?.periodActive}
        >
          <Button
            type="button"
            color="primary"
            onClick={() => {
              update(state => ({
                ...state,
                openGameEventDialog: host ? 'host' : 'guest',
              }))
            }}
            startIcon={<AddTaskIcon />}
          >
            {`Game Event`}
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={() => {
              const data = getEventSettings('save')
              if (data) {
                const { where, update } = prepareGameResultUpdate({
                  gameData,
                  gameEventSettings: data,
                  host,
                })
                const input = getInputVarsForGES({
                  gameEventData,
                  team,
                  gameData,
                  gameEventSettings: data,
                })
                createGameEventSimple({
                  variables: {
                    input: {
                      ...input,
                      timestamp: dayjs().format(),
                      // remainingTime: tempRemainingTime,
                      // gameTime: tempGameTime,
                    },
                    gameResultWhere: where,
                    gameResultUpdateInput: update,
                  },
                })
                handleClose()
              }
            }}
          >
            {`Save`}
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={() => {
              const data = getEventSettings('faceOff')

              if (data) {
                const { where, update } = prepareGameResultUpdate({
                  gameData,
                  gameEventSettings: data,
                  host,
                })
                const input = getInputVarsForGES({
                  gameEventData,
                  team,
                  gameData,
                  gameEventSettings: data,
                })
                createGameEventSimple({
                  variables: {
                    input: {
                      ...input,
                      timestamp: dayjs().format(),
                      // remainingTime: tempRemainingTime,
                      // tempGameTime: tempGameTime,
                    },
                    gameResultWhere: where,
                    gameResultUpdateInput: update,
                  },
                })

                handleClose()
              }
            }}
          >
            {`FaceOff`}
          </Button>
        </ButtonGroup>
      </Tooltip>
      <Divider sx={{ margin: '1rem 0' }} />
      <Typography variant="subtitle2" gutterBottom component="div">
        {`Saves: ${getCountOfEventTypes(
          gameData?.gameEventsSimple,
          'save',
          team?.teamId
        )}`}
        &nbsp;|&nbsp;
        {`FaceOffs: ${getCountOfEventTypes(
          gameData?.gameEventsSimple,
          'faceOff',
          team?.teamId
        )}`}
        &nbsp;|&nbsp;
        {`Penalties: ${getCountOfEventTypes(
          gameData?.gameEventsSimple,
          'penalty',
          team?.teamId
        )}`}
      </Typography>
      {(host
        ? openGameEventDialog === 'host'
        : openGameEventDialog === 'guest') && (
        <Dialog
          fullWidth
          maxWidth={false}
          open={
            host
              ? openGameEventDialog === 'host'
              : openGameEventDialog === 'guest'
          }
          onClose={(_, reason) => {
            if (reason !== 'backdropClick') {
              handleClose()
            }
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {`Game event. ${team?.name}`}
          </DialogTitle>
          <DialogContent>
            {!gameEventSettings && <GameEventTypes />}
            {gameEventSettings && (
              <EventTypeForm
                gameEventSettings={gameEventSettings}
                team={team}
                teamRival={teamRival}
                players={players}
                playersRival={playersRival}
                gameSettings={gameSettings}
              />
            )}
          </DialogContent>

          <DialogActions>
            <Button
              sx={{ height: '10rem', width: '50%', fontSize: '4rem' }}
              variant="outlined"
              onClick={handleClose}
              color="error"
            >
              Cancel
            </Button>
            <Button
              sx={{ height: '10rem', width: '50%', fontSize: '4rem' }}
              variant="contained"
              color="success"
              onClick={() => {
                handleSave()
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  )
}

const getInputVarsForGES = ({
  gameEventData,
  team,
  gameData,
  gameEventSettings,
}: {
  gameEventData: TWizardGameEventSimple | null
  team: Team
  gameData: Game
  gameEventSettings: TEventType
}) => {
  const metaPlayerScoredById =
    gameEventData?.scoredBy?.node?.meta?.metaPlayerId || null
  const metaPlayerAllowedById =
    gameEventData?.allowedBy?.node?.meta?.metaPlayerId || null
  const metaPlayerFirstAssistId =
    gameEventData?.firstAssist?.node?.meta?.metaPlayerId || null
  const metaPlayerSecondAssistId =
    gameEventData?.secondAssist?.node?.meta?.metaPlayerId || null
  const metaPlayerSavedById =
    gameEventData?.savedBy?.node?.meta?.metaPlayerId || null
  const metaPlayerWonById =
    gameEventData?.wonBy?.node?.meta?.metaPlayerId || null
  const metaPlayerLostById =
    gameEventData?.lostBy?.node?.meta?.metaPlayerId || null
  const metaPlayerPenalizedId =
    gameEventData?.penalized?.node?.meta?.metaPlayerId || null
  const metaPlayerExecutedById =
    gameEventData?.executedBy?.node?.meta?.metaPlayerId || null
  const metaPlayerFacedAgainstId =
    gameEventData?.facedAgainst?.node?.meta?.metaPlayerId || null
  const metaPlayerSufferedId =
    gameEventData?.suffered?.node?.meta?.metaPlayerId || null
  const teamId = team?.teamId
  const gameId = gameData?.gameId
  const gameEventSimpleId = gameEventData?.gameEventSimpleId

  return {
    ...(gameEventSimpleId && { gameEventSimpleId }),
    ...(metaPlayerScoredById && {
      scoredBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerScoredById,
            },
          },
        },
      },
    }),
    ...(metaPlayerAllowedById && {
      allowedBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerAllowedById,
            },
          },
        },
      },
    }),
    ...(metaPlayerFirstAssistId && {
      firstAssist: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerFirstAssistId,
            },
          },
        },
      },
    }),
    ...(metaPlayerSecondAssistId && {
      secondAssist: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerSecondAssistId,
            },
          },
        },
      },
    }),
    ...(metaPlayerSavedById && {
      savedBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerSavedById,
            },
          },
        },
      },
    }),
    ...(metaPlayerWonById && {
      wonBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerWonById,
            },
          },
        },
      },
    }),
    ...(metaPlayerLostById && {
      lostBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerLostById,
            },
          },
        },
      },
    }),
    ...(metaPlayerPenalizedId && {
      penalized: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerPenalizedId,
            },
          },
        },
      },
    }),
    ...(metaPlayerExecutedById && {
      executedBy: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerExecutedById,
            },
          },
        },
      },
    }),
    ...(metaPlayerFacedAgainstId && {
      facedAgainst: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerFacedAgainstId,
            },
          },
        },
      },
    }),
    ...(metaPlayerSufferedId && {
      suffered: {
        ...(gameEventSimpleId && {
          disconnect: {
            where: {
              node: {},
            },
          },
        }),
        connect: {
          where: {
            node: {
              metaPlayerId: metaPlayerSufferedId,
            },
          },
        },
      },
    }),
    ...(teamId &&
      !gameEventSimpleId && {
        team: {
          connect: {
            where: {
              node: {
                teamId: teamId,
              },
            },
          },
        },
      }),
    ...(gameId &&
      !gameEventSimpleId && {
        game: {
          connect: {
            where: {
              node: {
                gameId: gameId,
              },
            },
          },
        },
      }),

    eventType: gameEventSettings?.name || '',
    eventTypeCode: gameEventSettings?.type || '',
    timestamp: gameEventData?.timestamp || '',
    period: gameData?.gameResult?.periodActive || '',
    remainingTime: gameEventData?.remainingTime || '',
    gameTime: gameEventData?.gameTime || '',
    goalType: gameEventData?.goalType?.name || '',
    goalSubType: gameEventData?.goalSubType?.name || '',
    shotType: gameEventData?.shotType?.name || '',
    shotSubType: gameEventData?.shotSubType?.name || '',
    penaltyType: gameEventData?.penaltyType?.name || '',
    penaltySubType: gameEventData?.penaltySubType?.name || '',
    duration: gameEventData?.duration ? `${gameEventData?.duration}` : '',
    description: gameEventData?.description || '',
    injuryType: gameEventData?.injuryType?.name || '',
    eventLocation: gameEventData?.eventLocation?.name || '',
    goalLocation: gameEventData?.goalLocation?.name || '',
  }
}

export { GameEventWizard, GameEventFormProvider, GameEventFormContext }
