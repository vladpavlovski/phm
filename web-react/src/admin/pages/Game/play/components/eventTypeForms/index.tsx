import React from 'react'
import { TEventType } from '../gameEvents'
import { GoalForm } from './GoalForm'
import { FaceOffForm } from './FaceOffForm'
import { PenaltyForm } from './PenaltyForm'
import { PenaltyShotForm } from './PenaltyShotForm'
import { InjuryForm } from './InjuryForm'
import { SaveForm } from './SaveForm'
import { Team, GamePlayersRelationship, RulePack } from 'utils/types'

export type TEventTypeForm = {
  gameEventSettings: TEventType
  activeStep: number
  team: Team
  teamRival: Team
  players: GamePlayersRelationship[]
  playersRival: GamePlayersRelationship[]
  gameSettings: RulePack
  handleNextStep: () => void
}

export const EventTypeForm: React.FC<TEventTypeForm> = React.memo(props => {
  return (
    <>
      {(() => {
        switch (props?.gameEventSettings?.type) {
          case 'goal':
            return <GoalForm {...props} />
          case 'faceOff':
            return <FaceOffForm {...props} />
          case 'penalty':
            return <PenaltyForm {...props} />
          case 'penaltyShot':
            return <PenaltyShotForm {...props} />
          case 'injury':
            return <InjuryForm {...props} />
          case 'save':
            return <SaveForm {...props} />
          default:
            return null
        }
      })()}
    </>
  )
})
