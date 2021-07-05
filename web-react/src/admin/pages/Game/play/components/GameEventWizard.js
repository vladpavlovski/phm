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
    $timestamp: String
    $period: String
    $remainingTime: String
    $goalType: String
    $goalSubType: String
    $shotType: String
    $shotSubType: String
    $penaltyType: String
    $penaltySubType: String
    $duration: Float
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
    onSave,
    team,
    teamRival,
    players,
    playersRival,
    gameSettings,
    gameData,
  } = props
  const [openDialog, setOpenDialog] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const {
    nextButtonDisabled,
    setNextButtonDisabled,
    period,
    setEventsTableUpdate,
  } = React.useContext(GameEventFormContext)

  const [gameEventSettings, setGameEventSettings] = React.useState()
  const [gameEventData, setGameEventData] = React.useState()

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
      gameEventSimpleId: uuidv4(),
      previousGameEventSimpleId: previousGameEventSimpleId.current || null,
      metaPlayerScoredById:
        gameEventData?.scoredBy?.player?.meta?.metaPlayerId || null,
      metaPlayerAllowedById:
        gameEventData?.allowedBy?.player?.meta?.metaPlayerId || null,
      metaPlayerFirstAssistId:
        gameEventData?.firstAssist?.player?.meta?.metaPlayerId || null,
      metaPlayerSecondAssistId:
        gameEventData?.secondAssist?.player?.meta?.metaPlayerId || null,
      metaPlayerSavedById:
        gameEventData?.savedBy?.player?.meta?.metaPlayerId || null,
      metaPlayerWonById:
        gameEventData?.wonBy?.player?.meta?.metaPlayerId || null,
      metaPlayerLostById:
        gameEventData?.lostBy?.player?.meta?.metaPlayerId || null,
      eventType: gameEventSettings?.name || null,
      timestamp: gameEventData?.timestamp || null,
      period: period || null,
      remainingTime: gameEventData?.remainingTime || null,
      goalType: gameEventData?.goalType?.name || null,
      goalSubType: gameEventData?.goalSubType?.name || null,
      shotType: gameEventData?.shotType?.name || null,
      shotSubType: gameEventData?.shotSubType?.name || null,
      penaltyType: gameEventData?.penaltyType?.name || null,
      penaltySubType: gameEventData?.penaltySubType?.name || null,
      duration: gameEventData?.duration
        ? parseFloat(gameEventData?.duration)
        : null,
      metaPlayerPenalizedId:
        gameEventData?.penalized?.player?.meta?.metaPlayerId || null,
      metaPlayerExecutedById:
        gameEventData?.executedBy?.player?.meta?.metaPlayerId || null,
      metaPlayerFacedAgainstId:
        gameEventData?.facedAgainst?.player?.meta?.metaPlayerId || null,
      description: gameEventData?.description || null,
      injuryType: gameEventData?.injuryType?.name || null,
      metaPlayerSufferedId:
        gameEventData?.suffered?.player?.meta?.metaPlayerId || null,
    },
    onCompleted: data => {
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
  }, [])

  const handleClose = React.useCallback(() => {
    setOpenDialog(false)
    handleReset()
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => {
          setOpenDialog(true)
        }}
        startIcon={<AddTaskIcon />}
      >
        {`New ${team?.nick} Event`}
      </Button>
      <Dialog
        fullWidth
        disableEscapeKeyDown
        maxWidth="lg"
        open={openDialog}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose(event, reason)
          }
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Create new game event for ${team?.name}`}
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
                gameEventData={gameEventData}
                setGameEventData={setGameEventData}
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
                  onSave && onSave()
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

GameEventWizard.defaultProps = {
  onSave: null,
  team: null,
}

GameEventWizard.propTypes = {
  onSave: PropTypes.func,
  team: PropTypes.object,
}
export { GameEventWizard }
