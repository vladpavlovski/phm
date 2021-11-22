import React from 'react'

import createPersistedState from 'use-persisted-state'
type ProviderPropsTypes = {
  children: React.ReactChild
}

type ContextTypes = {
  organizationData: {
    organizationId: string
    urlSlug: string
    name: string
    nick: string
  }

  setOrganizationData: React.Dispatch<
    React.SetStateAction<{
      organizationId: string
      urlSlug: string
      name: string
      nick: string
    }>
  >
}

const initialContextState = {
  organizationData: {
    organizationId: '',
    urlSlug: '',
    name: '',
    nick: '',
  },
  setOrganizationData: () => {},
}
const OrganizationContext =
  React.createContext<ContextTypes>(initialContextState)
const useHMSOrganizationDataState = createPersistedState('HMS-OrganizationData')

const OrganizationProvider = (props: ProviderPropsTypes) => {
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

export { OrganizationProvider, OrganizationContext as default }
