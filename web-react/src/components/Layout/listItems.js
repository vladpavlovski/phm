import React, { useMemo, forwardRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import * as ROUTES from '../../routes'
import createPersistedState from 'use-persisted-state'

import Zoom from '@material-ui/core/Zoom'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Dashboard from '@material-ui/icons/Dashboard'
import Mood from '@material-ui/icons/Mood'
import Group from '@material-ui/icons/Group'
import Groups from '@material-ui/icons/Groups'
import SportsHockey from '@material-ui/icons/SportsHockey'
import GavelIcon from '@material-ui/icons/Gavel'
import SettingsIcon from '@material-ui/icons/Settings'
import PeopleAlt from '@material-ui/icons/PeopleAlt'
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import DateRangeIcon from '@material-ui/icons/DateRange'
import ApartmentIcon from '@material-ui/icons/Apartment'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import EventIcon from '@material-ui/icons/Event'

import { useStyles } from './styled'

const useGeneralMenuState = createPersistedState('generalMenu')

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

const MainListItems = props => {
  const { open } = props
  const classes = useStyles()
  const [generalOpen, setGeneralOpen] = useGeneralMenuState(false)

  return (
    <>
      <List>
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Dashboard"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <Dashboard />
            </Tooltip>
          }
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
            <Tooltip
              arrow
              title="General"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <SportsHockey />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary="General" />
          {generalOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={generalOpen} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            className={open ? classes.menuSubList : classes.menuSubListShift}
            // sx={{
            //   '& .MuiListItem-root': {
            //     paddingLeft: open ? 4 : 3,
            //   },
            // }}
          >
            {/* <ListItem button className={classes.nested}>
            <ListItemIcon>
              <SportsHockey />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem> */}
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Organizations"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <GroupWorkIcon />
                </Tooltip>
              }
              primary="Organizations"
              to={ROUTES.ADMIN_ORGANIZATIONS}
            />
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Competitions"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <SportsHockey />
                </Tooltip>
              }
              primary="Competitions"
              to={ROUTES.ADMIN_COMPETITIONS}
            />
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Sponsors"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <MonetizationOnIcon />
                </Tooltip>
              }
              primary="Sponsors"
              to={ROUTES.ADMIN_SPONSORS}
            />
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Seasons"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <DateRangeIcon />
                </Tooltip>
              }
              primary="Seasons"
              to={ROUTES.ADMIN_SEASONS}
            />
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Venues"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <ApartmentIcon />
                </Tooltip>
              }
              primary="Venues"
              to={ROUTES.ADMIN_VENUES}
            />
            <ListItemLink
              className={classes.menuSubListItem}
              icon={
                <Tooltip
                  arrow
                  title="Awards"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <EmojiEventsIcon />
                </Tooltip>
              }
              primary="Awards"
              to={ROUTES.ADMIN_AWARDS}
            />
          </List>
        </Collapse>
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Teams"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <Group />
            </Tooltip>
          }
          primary="Teams"
          to={ROUTES.ADMIN_TEAMS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Players"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <Mood />
            </Tooltip>
          }
          primary="Players"
          to={ROUTES.ADMIN_PLAYERS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Persons"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <Groups />
            </Tooltip>
          }
          primary="Persons"
          to={ROUTES.ADMIN_PERSONS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Rule Packs"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <GavelIcon />
            </Tooltip>
          }
          primary="Rule Packs"
          to={ROUTES.ADMIN_RULEPACKS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Users"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <PeopleAlt />
            </Tooltip>
          }
          primary="Users"
          to={ROUTES.ADMIN_USERS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="Events"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <EventIcon />
            </Tooltip>
          }
          primary="Events"
          to={ROUTES.ADMIN_EVENTS}
        />
        <ListItemLink
          icon={
            <Tooltip
              arrow
              title="System Settings"
              placement="right"
              disableHoverListener={open}
              TransitionComponent={Zoom}
            >
              <SettingsIcon />
            </Tooltip>
          }
          primary="System Settings"
          to={ROUTES.ADMIN_SYSTEM_SETTINGS}
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
