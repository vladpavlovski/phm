import React from 'react'

export const useKeyPress = (targetKey: string): boolean => {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState(false)
  // If pressed key is our target key then set to true
  function downHandler({ code }: { code: string }): void {
    if (code === targetKey) {
      setKeyPressed(true)
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ code }: { code: string }): void => {
    if (code === targetKey) {
      setKeyPressed(false)
    }
  }
  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, []) // Empty array ensures that effect is only run on mount and unmount
  return keyPressed
}
