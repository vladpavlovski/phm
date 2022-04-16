import React from 'react'
import { default as LoaderLib, LoaderProps } from 'react-loader-spinner'
import { LoaderContainer, LoaderWrapper } from './styled'

type TLoader = Omit<LoaderProps, 'type'> & {
  noText?: boolean
}

const Loader: React.FC<TLoader> = props => (
  <LoaderContainer>
    <LoaderWrapper>
      <LoaderLib {...props} type="Rings" />
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
  color: '#323C46',
  height: 100,
  width: 100,
  noText: true,
}

export { Loader }
