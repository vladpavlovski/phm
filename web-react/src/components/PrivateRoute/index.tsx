import React from 'react'
import { Route, RouteProps } from 'react-router-dom'
import { withAuthenticationRequired } from '@auth0/auth0-react'

interface IPrivateRoute extends RouteProps {
  component: React.ComponentType
}

export const PrivateRoute: React.FC<IPrivateRoute> = ({
  component,
  ...args
}) => <Route component={withAuthenticationRequired(component)} {...args} />
