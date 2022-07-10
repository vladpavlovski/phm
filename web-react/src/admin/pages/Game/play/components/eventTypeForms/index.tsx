import React from 'react'
import { GamePlayersRelationship, RulePack, Team } from 'utils/types'
import { TEventType } from '../gameEvents'
import { FaceOffForm } from './FaceOffForm'
import { GoalForm } from './GoalForm'
import { InjuryForm } from './InjuryForm'
import { PenaltyForm } from './PenaltyForm'
import { PenaltyShotForm } from './PenaltyShotForm'
import { SaveForm } from './SaveForm'

export type TEventTypeForm = {
  gameEventSettings: TEventType
  team: Team
  teamRival: Team
  players: GamePlayersRelationship[]
  playersRival: GamePlayersRelationship[]
  gameSettings: RulePack
}

export const EventTypeForm: React.FC<TEventTypeForm> = props => {
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
}
