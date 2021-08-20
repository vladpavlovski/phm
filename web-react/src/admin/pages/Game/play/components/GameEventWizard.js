import React from 'react'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { gql, useMutation } from '@apollo/client'

import Button from '@material-ui/core/Button'
import AddTaskIcon from '@material-ui/icons/AddTask'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Box from '@material-ui/core/Box'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Typography from '@material-ui/core/Typography'
import { v4 as uuidv4 } from 'uuid'

import { GameEventTypes } from './GameEventTypes'
import { getEventData } from './gameEvents'
import { EventTypeForm } from './eventTypeForms'

import GameEventFormContext from '../context'

const MERGE_GAME_EVENT_SIMPLE = gql`
  mutation mergeGameEventSimple(
    $teamId: ID!
    $gameId: ID!
    $gameEventSimpleId: ID!
    $previousGameEventSimpleId: ID
    $metaPlayerScoredById: ID
    $metaPlayerAllowedById: ID
    $metaPlayerFirstAssistId: ID
    $metaPlayerSecondAssistId: ID
    $metaPlayerSavedById: ID
    $metaPlayerLostById: ID
    $metaPlayerWonById: ID
    $eventType: String
    $eventTypeCode: String
    $timestamp: String
    $period: String
    $remainingTime: String
    $goalType: String
    $goalSubType: String
    $shotType: String
    $shotSubType: String
    $penaltyType: String
    $penaltySubType: String
    $duration: String
    $metaPlayerPenalizedId: ID
    $metaPlayerExecutedById: ID
    $metaPlayerFacedAgainstId: ID
    $description: String
    $injuryType: String
    $metaPlayerSufferedId: ID
  ) {
    gameEventSimple: CreateGameEventSimple(
      teamId: $teamId
      gameId: $gameId
      gameEventSimpleId: $gameEventSimpleId
      previousGameEventSimpleId: $previousGameEventSimpleId
      metaPlayerScoredById: $metaPlayerScoredById
      metaPlayerAllowedById: $metaPlayerAllowedById
      metaPlayerFirstAssistId: $metaPlayerFirstAssistId
      metaPlayerSecondAssistId: $metaPlayerSecondAssistId
      metaPlayerSavedById: $metaPlayerSavedById
      metaPlayerLostById: $metaPlayerLostById
      metaPlayerWonById: $metaPlayerWonById
      eventType: $eventType
      eventTypeCode: $eventTypeCode
      timestamp: $timestamp
      period: $period
      remainingTime: $remainingTime
      goalType: $goalType
      goalSubType: $goalSubType
      shotType: $shotType
      shotSubType: $shotSubType
      penaltyType: $penaltyType
      penaltySubType: $penaltySubType
      duration: $duration
      metaPlayerPenalizedId: $metaPlayerPenalizedId
      metaPlayerExecutedById: $metaPlayerExecutedById
      metaPlayerFacedAgainstId: $metaPlayerFacedAgainstId
      description: $description
      injuryType: $injuryType
      metaPlayerSufferedId: $metaPlayerSufferedId
    ) {
      gameEventSimpleId
      eventType
      game {
        gameId
        name
      }
    }
  }
`

const GameEventWizard = props => {
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
    nextButtonDisabled,
    setNextButtonDisabled,
    period,
    setEventsTableUpdate,
    openGameEventDialog,
    setOpenGameEventDialog,
    gameEventSettings,
    setGameEventSettings,
    gameEventData,
    setGameEventData,
  } = React.useContext(GameEventFormContext)
  const previousGameEventSimpleId = React.useRef()

  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set())

  const [
    createGameEventSimple,
    // { loading: loadingGameEventSimple, error: errorGameEventSimple },
  ] = useMutation(MERGE_GAME_EVENT_SIMPLE, {
    variables: {
      teamId: team?.teamId,
      gameId: gameData?.gameId,
      gameEventSimpleId: gameEventData?.gameEventSimpleId || uuidv4(),
      previousGameEventSimpleId: previousGameEventSimpleId.current || null,
      metaPlayerScoredById:
        gameEventData?.scoredBy?.node?.meta?.metaPlayerId || null,
      metaPlayerAllowedById:
        gameEventData?.allowedBy?.node?.meta?.metaPlayerId || null,
      metaPlayerFirstAssistId:
        gameEventData?.firstAssist?.node?.meta?.metaPlayerId || null,
      metaPlayerSecondAssistId:
        gameEventData?.secondAssist?.node?.meta?.metaPlayerId || null,
      metaPlayerSavedById:
        gameEventData?.savedBy?.node?.meta?.metaPlayerId || null,
      metaPlayerWonById: gameEventData?.wonBy?.node?.meta?.metaPlayerId || null,
      metaPlayerLostById:
        gameEventData?.lostBy?.node?.meta?.metaPlayerId || null,
      eventType: gameEventSettings?.name || '',
      eventTypeCode: gameEventSettings?.type || '',
      timestamp: gameEventData?.timestamp || '',
      period: period || '',
      remainingTime: gameEventData?.remainingTime || '',
      goalType: gameEventData?.goalType?.name || '',
      goalSubType: gameEventData?.goalSubType?.name || '',
      shotType: gameEventData?.shotType?.name || '',
      shotSubType: gameEventData?.shotSubType?.name || '',
      penaltyType: gameEventData?.penaltyType?.name || '',
      penaltySubType: gameEventData?.penaltySubType?.name || '',
      duration: gameEventData?.duration || '',
      metaPlayerPenalizedId:
        gameEventData?.penalized?.node?.meta?.metaPlayerId || null,
      metaPlayerExecutedById:
        gameEventData?.executedBy?.node?.meta?.metaPlayerId || null,
      metaPlayerFacedAgainstId:
        gameEventData?.facedAgainst?.node?.meta?.metaPlayerId || null,
      description: gameEventData?.description || '',
      injuryType: gameEventData?.injuryType?.name || '',
      metaPlayerSufferedId:
        gameEventData?.suffered?.node?.meta?.metaPlayerId || null,
    },
    onCompleted: data => {
      console.log('on completes: ', data)
      previousGameEventSimpleId.current =
        data?.gameEventSimple?.gameEventSimpleId

      enqueueSnackbar(`${data?.gameEventSimple?.eventType} event created 🏒`, {
        variant: 'success',
      })
      setEventsTableUpdate(val => val + 1)
      setGameEventData(null)
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

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
    setGameEventSettings(null)
    setNextButtonDisabled(false)
    setGameEventData(null)
  }, [])

  const handleClose = React.useCallback(() => {
    setOpenGameEventDialog(false)
    handleReset()
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => {
          setOpenGameEventDialog(host ? 'host' : 'guest')
        }}
        startIcon={<AddTaskIcon />}
      >
        {`New ${team?.nick} Event`}
      </Button>
      <Dialog
        fullWidth
        disableEscapeKeyDown
        maxWidth="lg"
        open={
          host
            ? openGameEventDialog === 'host'
            : openGameEventDialog === 'guest'
        }
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose(event, reason)
          }
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Game event. ${team?.name}`}
        </DialogTitle>
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            Wizard
          </DialogContentText> */}
          {!gameEventSettings && (
            <GameEventTypes
              onClick={type => {
                const data = getEventData(type)
                setGameEventSettings(data)
              }}
            />
          )}
          {gameEventSettings && (
            <Box sx={{ width: '100%' }}>
              <Stepper activeStep={activeStep}>
                {gameEventSettings?.steps.map(step => {
                  const stepProps = {}
                  const labelProps = {}
                  if (step.optional) {
                    labelProps.optional = (
                      <Typography variant="caption">Optional</Typography>
                    )
                  }
                  if (step.optional) {
                    stepProps.completed = false
                  }
                  return (
                    <Step key={step.name} {...stepProps}>
                      <StepLabel {...labelProps}>{step.name}</StepLabel>
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
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
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
            {activeStep === gameEventSettings?.steps.length ? (
              <Button onClick={handleReset}>Reset</Button>
            ) : (
              <Button onClick={handleNext} disabled={nextButtonDisabled}>
                {activeStep === gameEventSettings?.steps.length - 1
                  ? 'Finish'
                  : 'Next'}
              </Button>
            )}
            {activeStep === gameEventSettings?.steps.length && (
              <Button
                onClick={() => {
                  handleClose()
                  createGameEventSimple()
                }}
              >
                Save
              </Button>
            )}
            <Button color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

GameEventWizard.propTypes = {
  team: PropTypes.object,
}
export { GameEventWizard }
