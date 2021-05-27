import { useState, useEffect } from 'react'

const initBeforeUnLoad = showExitPrompt => {
  window.onbeforeunload = event => {
    if (showExitPrompt) {
      const e = event || window.event
      e.preventDefault()
      if (e) {
        e.returnValue = ''
      }
      return ''
    }
  }
}

// Hook
export function useExitPrompt(bool, cb) {
  const [showExitPrompt, setShowExitPrompt] = useState(bool)

  window.onload = function () {
    initBeforeUnLoad(showExitPrompt)
  }

  useEffect(() => {
    if (cb) cb()
    initBeforeUnLoad(showExitPrompt)
  }, [showExitPrompt])

  return [showExitPrompt, setShowExitPrompt]
}
