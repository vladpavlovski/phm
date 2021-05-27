import React from 'react'

const initialContextState = {
  organizationData: {
    organizationId: null,
    urlSlug: null,
    name: '',
    nick: '',
  },
}
const OrganizationContext = React.createContext(initialContextState)
export { initialContextState, OrganizationContext as default }
