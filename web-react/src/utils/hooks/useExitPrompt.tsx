import { useState, useEffect } from 'react'

const initBeforeUnLoad = <T,>(showExitPrompt: T) => {
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
const useExitPrompt = <T,>(
  bool: T,
  cb?: () => void
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [showExitPrompt, setShowExitPrompt] = useState<T>(bool)

  window.onload = function () {
    initBeforeUnLoad(showExitPrompt)
  }

  useEffect(() => {
    if (cb) cb()
    initBeforeUnLoad(showExitPrompt)
  }, [showExitPrompt])

  return [showExitPrompt, setShowExitPrompt]
}

export { useExitPrompt }
