import React from 'react'
import { GoalForm } from './GoalForm'
import { FaceOffForm } from './FaceOffForm'
import { PenaltyForm } from './PenaltyForm'

export const EventTypeForm = props => {
  const { gameEventSettings } = props
  switch (gameEventSettings?.type) {
    case 'goal':
      return <GoalForm {...props} />
    case 'faceOff':
      return <FaceOffForm {...props} />
    case 'penalty':
      return <PenaltyForm {...props} />
    default:
      return null
  }
}
