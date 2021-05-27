import React from 'react'
import PropTypes from 'prop-types'
import createPersistedState from 'use-persisted-state'
import OrganizationContext, { initialContextState } from './index'

const useHMSOrganizationDataState = createPersistedState('HMS-OrganizationData')

const OrganizationProvider = props => {
  const [organizationData, setOrganizationData] = useHMSOrganizationDataState(
    initialContextState.organizationData
  )
  return (
    <OrganizationContext.Provider
      value={{
        organizationData,
        setOrganizationData,
      }}
    >
      {props.children}
    </OrganizationContext.Provider>
  )
}

OrganizationProvider.propTypes = {
  children: PropTypes.node,
}

export { OrganizationProvider }
