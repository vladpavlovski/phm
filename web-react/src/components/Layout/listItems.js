import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import * as ROUTES from '../../router/routes'
import createPersistedState from 'use-persisted-state'

import Zoom from '@mui/material/Zoom'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import ListSubheader from '@mui/material/ListSubheader'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Dashboard from '@mui/icons-material/Dashboard'
import Mood from '@mui/icons-material/Mood'
import Group from '@mui/icons-material/Group'
import Groups from '@mui/icons-material/Groups'
import SportsHockey from '@mui/icons-material/SportsHockey'
import GavelIcon from '@mui/icons-material/Gavel'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleAlt from '@mui/icons-material/PeopleAlt'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import DateRangeIcon from '@mui/icons-material/DateRange'
import ApartmentIcon from '@mui/icons-material/Apartment'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import EventIcon from '@mui/icons-material/Event'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'

import { useStyles } from './styled'

import OrganizationContext from '../../context/organization'

const useGeneralMenuState = createPersistedState('HMS-GeneralMenu')

const ListItemLink = props => {
  const { icon, primary, to, className } = props

  return (
    <ListItem
      button
      component={React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      ))}
      className={className}
    >
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  )
}

const MainListItems = props => {
  const { open } = props
  const classes = useStyles()
  const { organizationData } = React.useContext(OrganizationContext)
  const [generalOpen, setGeneralOpen] = useGeneralMenuState(false)

  return (
    <div style={{ maxHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <List>
        <ListSubheader>System</ListSubheader>
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

        <ListItemLink
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
      </List>
      {organizationData?.organizationId && (
        <>
          <Divider />
          <List>
            <ListSubheader>{`${
              organizationData?.name || 'Organization'
            }`}</ListSubheader>
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
                className={
                  open ? classes.menuSubList : classes.menuSubListShift
                }
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
                      title="Competitions"
                      placement="right"
                      disableHoverListener={open}
                      TransitionComponent={Zoom}
                    >
                      <SportsHockey />
                    </Tooltip>
                  }
                  primary="Competitions"
                  to={ROUTES.getAdminOrgCompetitionsRoute(
                    organizationData?.urlSlug
                  )}
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
                  to={ROUTES.getAdminOrgSponsorsRoute(
                    organizationData?.urlSlug
                  )}
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
                  to={ROUTES.getAdminOrgSeasonsRoute(organizationData?.urlSlug)}
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
                  to={ROUTES.getAdminOrgVenuesRoute(organizationData?.urlSlug)}
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
                  to={ROUTES.getAdminOrgAwardsRoute(organizationData?.urlSlug)}
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
              to={ROUTES.getAdminOrgTeamsRoute(organizationData?.urlSlug)}
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
              to={ROUTES.getAdminOrgPlayersRoute(organizationData?.urlSlug)}
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
              to={ROUTES.getAdminOrgPersonsRoute(organizationData?.urlSlug)}
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
              to={ROUTES.getAdminOrgRulePacksRoute(organizationData?.urlSlug)}
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
              to={ROUTES.getAdminOrgEventsRoute(organizationData?.urlSlug)}
            />
            <ListItemLink
              icon={
                <Tooltip
                  arrow
                  title="Games"
                  placement="right"
                  disableHoverListener={open}
                  TransitionComponent={Zoom}
                >
                  <SportsEsportsIcon />
                </Tooltip>
              }
              primary="Games"
              to={ROUTES.getAdminOrgGamesRoute(organizationData?.urlSlug)}
            />
          </List>
        </>
      )}
    </div>
  )
}

export { MainListItems }
