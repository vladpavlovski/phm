import React, { useMemo, forwardRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import * as ROUTES from '../../routes'

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  // ListSubheader,
  Divider,
} from '@material-ui/core'
import {
  Dashboard,
  Mood,
  // , GridOn, Group, , DoneAll
} from '@material-ui/icons'

const ListItemLink = props => {
  const { icon, primary, to } = props

  const renderLink = useMemo(
    () =>
      forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  )

  return (
    <ListItem button component={renderLink}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  )
}

const MainListItems = () => (
  <>
    <List>
      <ListItemLink
        icon={<Dashboard />}
        primary="Dashboard"
        to={ROUTES.ADMIN_DASHBOARD}
      />
    </List>
    <Divider />
    <List>
      {/* <ListSubheader inset>PHM Tables</ListSubheader> */}
      <ListItemLink
        icon={<Mood />}
        primary="Players"
        to={ROUTES.ADMIN_PLAYERS}
      />
      {/* <ListItemLink icon={<GridOn />} primary="Link Map" to={ROUTES.LINK_MAP} />
      <ListItemLink icon={<Group />} primary="Teams" to={ROUTES.TEAMS} />
      
      <ListItemLink
        icon={<DoneAll />}
        primary="Player Merge"
        to={ROUTES.PLAYER_MERGE}
      /> */}
    </List>
  </>
)

export { MainListItems }
