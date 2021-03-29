import React from 'react'
import PropTypes from 'prop-types'
import { Bugfender } from '@bugfender/sdk'
import config from '../../config'
export class ErrorBoundary extends React.Component {
  static getDerivedStateFromError() {
    return {
      error: true,
    }
  }
  constructor() {
    super()
    this.state = {
      error: false,
    }
  }

  componentDidCatch(error, info) {
    console.error('Error boundary error', error, info)
    !config.dev &&
      Bugfender.sendIssue(`[UI error] ${error}`, `${info.componentStack}`)
  }

  render() {
    return this.state.error ? (
      <h2>
        We are sorry! There was an error which we were not able to recover from.
        Please refresh the page
      </h2>
    ) : (
      this.props.children
    )
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.any.isRequired,
}
