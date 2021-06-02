import React from 'react'
import { GoalForm } from './GoalForm'

export const EventTypeForm = props => {
  const { gameEventSettings } = props
  switch (gameEventSettings?.type) {
    case 'goal':
      return <GoalForm {...props} />
    default:
      return null
  }
}
