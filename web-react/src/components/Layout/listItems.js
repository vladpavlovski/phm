import React, { useState, useMemo, forwardRef } from 'react'
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

import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import {
  Dashboard,
  Mood,
  Group,
  SportsHockey,
  // , GridOn, , , DoneAll
} from '@material-ui/icons'
// import { useStyles } from './styled'

const ListItemLink = props => {
  const { icon, primary, to, className } = props

  const renderLink = useMemo(
    () =>
      forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  )

  return (
    <ListItem button component={renderLink} className={className}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  )
}

const MainListItems = () => {
  // const classes = useStyles()
  const [generalOpen, setGeneralOpen] = useState(false)

  return (
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
        <ListItem
          button
          onClick={() => {
            setGeneralOpen(!generalOpen)
          }}
        >
          <ListItemIcon>
            <SportsHockey />
          </ListItemIcon>
          <ListItemText primary="General" />
          {generalOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={generalOpen} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{
              '& .MuiListItem-root': {
                paddingLeft: 4,
              },
            }}
          >
            {/* <ListItem button className={classes.nested}>
            <ListItemIcon>
              <SportsHockey />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem> */}
            <ListItemLink
              icon={<SportsHockey />}
              primary="Associations"
              to={ROUTES.ADMIN_ASSOCIATIONS}
              // className={classes.nested}
            />
            <ListItemLink
              icon={<SportsHockey />}
              primary="Competitions"
              to={ROUTES.ADMIN_COMPETITIONS}
              // className={classes.nested}
            />
          </List>
        </Collapse>
        <ListItemLink
          icon={<Group />}
          primary="Teams"
          to={ROUTES.ADMIN_TEAMS}
        />
        <ListItemLink
          icon={<Mood />}
          primary="Players"
          to={ROUTES.ADMIN_PLAYERS}
        />

        {/* <ListItemLink icon={<GridOn />} primary="Link Map" to={ROUTES.LINK_MAP} />
      <ListItemLink
        icon={<DoneAll />}
        primary="Player Merge"
        to={ROUTES.PLAYER_MERGE}
      /> */}
      </List>
    </>
  )
}

export { MainListItems }
