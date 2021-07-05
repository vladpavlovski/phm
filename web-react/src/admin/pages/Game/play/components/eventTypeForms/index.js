import React from 'react'
import { GoalForm } from './GoalForm'
import { FaceOffForm } from './FaceOffForm'
import { PenaltyForm } from './PenaltyForm'
import { PenaltyShotForm } from './PenaltyShotForm'

export const EventTypeForm = props => {
  const { gameEventSettings } = props
  switch (gameEventSettings?.type) {
    case 'goal':
      return <GoalForm {...props} />
    case 'faceOff':
      return <FaceOffForm {...props} />
    case 'penalty':
      return <PenaltyForm {...props} />
    case 'penaltyShot':
      return <PenaltyShotForm {...props} />
    default:
      return null
  }
}
