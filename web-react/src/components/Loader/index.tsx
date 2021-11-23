import React from 'react'
import { default as LoaderLib, LoaderProps } from 'react-loader-spinner'
import { LoaderContainer, LoaderWrapper } from './styled'

interface ILoader extends LoaderProps {
  noText?: boolean
}

const Loader = (props: ILoader) => (
  <LoaderContainer>
    <LoaderWrapper>
      <LoaderLib {...props} />
      {!props.noText && (
        <>
          <p>Tahám výsledky z centrály...</p>
          <p>Prosím vydrž...</p>
        </>
      )}
    </LoaderWrapper>
  </LoaderContainer>
)

Loader.defaultProps = {
  type: 'Rings',
  color: '#323C46',
  height: 100,
  width: 100,
  noText: true,
}

export { Loader }
