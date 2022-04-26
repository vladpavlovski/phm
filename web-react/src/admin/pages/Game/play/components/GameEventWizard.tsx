import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import React from 'react'
import { createCtx } from 'utils'
import {
  Game,
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
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
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
  location?: string
  period?: string
  remainingTime?: string
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
}

type TGameEventForm = {
  nextButtonDisabled: boolean
  period: string
  time: string
  eventsTableUpdate: number
  openGameEventDialog: string
  gameEventSettings: TEventType | null
  gameEventData: TWizardGameEventSimple | null
  tempRemainingTime: string
}
const [ctx, GameEventFormProvider] = createCtx<TGameEventForm>({
  nextButtonDisabled: false,
  period: '',
  time: '00:00',
  eventsTableUpdate: 0,
  openGameEventDialog: '',
  gameEventSettings: null,
  gameEventData: null,
  tempRemainingTime: '00:00',
})

export const GameEventFormContext = ctx

type TGameEventWizard = {
  host: boolean
  team: Team
  teamRival: Team
  players: GamePlayersRelationship[]
  playersRival: GamePlayersRelationship[]
  gameSettings: RulePack
  gameData: Game
}

const GameEventWizard: React.FC<TGameEventWizard> = React.memo(props => {
  const {
    host,
    team,
    teamRival,
    players,
    playersRival,
    gameSettings,
    gameData,
  } = props
  const { enqueueSnackbar } = useSnackbar()

  const {
    state: {
      nextButtonDisabled,
      openGameEventDialog,
      gameEventSettings,
      gameEventData,
      tempRemainingTime,
    },
    update,
  } = React.useContext(GameEventFormContext)
  const previousGameEventSimpleId = React.useRef()

  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set())

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
        eventsTableUpdate: state.eventsTableUpdate + 1,
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
        eventsTableUpdate: state.eventsTableUpdate + 1,
      }))
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const handleSave = React.useCallback(() => {
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
  }, [team, host, gameEventData, gameData, gameEventSettings])

  const isStepOptional = React.useCallback(
    step => {
      return gameEventSettings?.steps?.[step]?.optional
    },
    [gameEventSettings]
  )

  const isStepSkipped = React.useCallback(step => {
    return skipped.has(step)
  }, [])

  const handleNext = React.useCallback(() => {
    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)
    setSkipped(newSkipped)
  }, [activeStep])

  const handleBack = React.useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }, [])

  const handleSkip = React.useCallback(() => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.")
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values())
      newSkipped.add(activeStep)
      return newSkipped
    })
  }, [activeStep])

  const handleReset = React.useCallback(() => {
    setActiveStep(0)

    update(state => ({
      ...state,
      gameEventData: null,
      gameEventSettings: null,
      nextButtonDisabled: false,
    }))
  }, [])

  const handleClose = React.useCallback(() => {
    setActiveStep(0)
    update(state => ({
      ...state,
      gameEventData: null,
      gameEventSettings: null,
      nextButtonDisabled: false,
      openGameEventDialog: '',
    }))
  }, [])
  return (
    <>
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
                setTimeout(() => {
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
                        remainingTime: tempRemainingTime,
                      },
                      gameResultWhere: where,
                      gameResultUpdateInput: update,
                    },
                  })
                  handleClose()
                }, 1000)
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
                setTimeout(() => {
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
                        remainingTime: tempRemainingTime,
                      },
                      gameResultWhere: where,
                      gameResultUpdateInput: update,
                    },
                  })

                  handleClose()
                }, 1000)
              }
            }}
          >
            {`FaceOff`}
          </Button>
        </ButtonGroup>
      </Tooltip>
      <Divider sx={{ margin: '1rem 0' }} />
      <Typography variant="subtitle2" gutterBottom component="div">
        {`Saves: ${gameData?.gameResult?.[host ? 'hostSaves' : 'guestSaves']}`}
        &nbsp;|&nbsp;
        {`FaceOffs: ${
          gameData?.gameResult?.[host ? 'hostFaceOffs' : 'guestFaceOffs']
        }`}
        &nbsp;|&nbsp;
        {`Penalties: ${
          gameData?.gameResult?.[host ? 'hostPenalties' : 'guestPenalties']
        }`}
      </Typography>
      {(host
        ? openGameEventDialog === 'host'
        : openGameEventDialog === 'guest') && (
        <Dialog
          fullWidth
          disableEscapeKeyDown={!!gameEventSettings?.steps}
          maxWidth="lg"
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
            {!gameEventSettings && (
              <GameEventTypes
                onClick={(type: string) => {
                  const data = getEventSettings(type)
                  update(state => ({
                    ...state,
                    gameEventSettings: data,
                  }))
                }}
              />
            )}
            {gameEventSettings && (
              <Box sx={{ width: '100%' }}>
                <Stepper activeStep={activeStep}>
                  {gameEventSettings?.steps.map(step => {
                    return (
                      <Step key={step.name} completed={!step.optional}>
                        <StepLabel
                          optional={
                            step.optional && (
                              <Typography variant="caption">
                                Optional
                              </Typography>
                            )
                          }
                        >
                          {step.name}
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
                <br />
                <EventTypeForm
                  gameEventSettings={gameEventSettings}
                  activeStep={activeStep}
                  team={team}
                  teamRival={teamRival}
                  players={players}
                  playersRival={playersRival}
                  gameSettings={gameSettings}
                  handleNextStep={handleNext}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              {gameEventSettings?.steps && (
                <>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {isStepOptional(activeStep) && (
                    <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                      Skip
                    </Button>
                  )}
                  {activeStep === gameEventSettings.steps.length ? (
                    <Button onClick={handleReset}>Reset</Button>
                  ) : (
                    <Button onClick={handleNext} disabled={nextButtonDisabled}>
                      {activeStep === gameEventSettings.steps.length - 1
                        ? 'Finish'
                        : 'Next'}
                    </Button>
                  )}
                  {activeStep === gameEventSettings.steps.length && (
                    <Button
                      onClick={() => {
                        handleSave()
                      }}
                    >
                      Save
                    </Button>
                  )}
                </>
              )}
              <Button color="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
})

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
    goalType: gameEventData?.goalType?.name || '',
    goalSubType: gameEventData?.goalSubType?.name || '',
    shotType: gameEventData?.shotType?.name || '',
    shotSubType: gameEventData?.shotSubType?.name || '',
    penaltyType: gameEventData?.penaltyType?.name || '',
    penaltySubType: gameEventData?.penaltySubType?.name || '',
    duration: gameEventData?.duration ? `${gameEventData?.duration}` : '',
    description: gameEventData?.description || '',
    injuryType: gameEventData?.injuryType?.name || '',
  }
}

export { GameEventWizard, GameEventFormProvider }
