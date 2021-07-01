import React from 'react'
import { GoalForm } from './GoalForm'
import { FaceOffForm } from './FaceOffForm'

export const EventTypeForm = props => {
  const { gameEventSettings } = props
  switch (gameEventSettings?.type) {
    case 'goal':
      return <GoalForm {...props} />
    case 'faceOff':
      return <FaceOffForm {...props} />
    default:
      return null
  }
}
