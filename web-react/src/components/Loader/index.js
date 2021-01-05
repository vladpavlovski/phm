import React from 'react'
import { default as LoaderLib } from 'react-loader-spinner'
import { LoaderWrapper } from './styled'

const Loader = props => (
  <LoaderWrapper>
    <LoaderLib {...props} />
    {!props.noText && (
      <>
        <p>Tahám výsledky z centrály...</p>
        <p>Prosím vydrž...</p>
      </>
    )}
  </LoaderWrapper>
)

Loader.propTypes = {}

Loader.defaultProps = {
  type: 'Rings',
  color: '#323C46',
  height: 250,
  width: 250,
  noText: false,
}

export { Loader }
