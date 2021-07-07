import React from 'react'
import { GoalForm } from './GoalForm'
import { FaceOffForm } from './FaceOffForm'
import { PenaltyForm } from './PenaltyForm'
import { PenaltyShotForm } from './PenaltyShotForm'
import { InjuryForm } from './InjuryForm'
import { SaveForm } from './SaveForm'

export const EventTypeForm = props => {
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
}
