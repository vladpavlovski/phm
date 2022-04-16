import React from 'react'
import { Bugfender } from '@bugfender/sdk'
import config from '../../config'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
    !config.dev &&
      Bugfender.sendIssue(`[UI error] ${error}`, `${errorInfo.componentStack}`)
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <h2>
          We are sorry! There was an error which we were not able to recover
          from. Please refresh the page
        </h2>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
