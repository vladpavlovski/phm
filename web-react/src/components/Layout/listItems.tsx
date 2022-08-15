import React from 'react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import { getInitials } from 'utils'
import ApartmentIcon from '@mui/icons-material/Apartment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DateRangeIcon from '@mui/icons-material/DateRange'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import EventIcon from '@mui/icons-material/Event'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import GavelIcon from '@mui/icons-material/Gavel'
import GroupIcon from '@mui/icons-material/Group'
import GroupsIcon from '@mui/icons-material/Groups'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import MoodIcon from '@mui/icons-material/Mood'
import PeopleAlt from '@mui/icons-material/PeopleAlt'
import SettingsIcon from '@mui/icons-material/Settings'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import SportsHockey from '@mui/icons-material/SportsHockey'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon, { ListItemIconProps } from '@mui/material/ListItemIcon'
import ListItemText, { ListItemTextProps } from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Tooltip from '@mui/material/Tooltip'
import Zoom from '@mui/material/Zoom'
import OrganizationContext from '../../context/organization'
import * as ROUTES from '../../router/routes'
import { SubList } from './styled'

const useGeneralMenuState = createPersistedState('HMS-GeneralMenu')

type TListItemLink = ListItemIconProps &
  ListItemTextProps &
  LinkProps & {
    icon: React.ReactElement
    title: string
    open: boolean
  }

const ListItemLink: React.FC<TListItemLink> = props => {
  const { icon, primary, to, sx, title, open } = props

  return (
    <ListItem
      button
      sx={sx}
      component={React.forwardRef<HTMLAnchorElement>((itemProps, ref) => (
        <Tooltip
          arrow
          title={title}
          placement="right"
          disableHoverListener={open}
          TransitionComponent={Zoom}
        >
          <RouterLink to={to} ref={ref} {...itemProps} />
        </Tooltip>
      ))}
    >
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  )
}

const systemListMenu = [
  {
    title: 'Dashboard',
    to: ROUTES.ADMIN_DASHBOARD,
    icon: <DashboardIcon />,
  },
  {
    title: 'Organizations',
    to: ROUTES.ADMIN_ORGANIZATIONS,
    icon: <GroupWorkIcon />,
  },
  {
    title: 'System Settings',
    to: ROUTES.ADMIN_SYSTEM_SETTINGS,
    icon: <SettingsIcon />,
  },
  {
    title: 'Users',
    to: ROUTES.ADMIN_USERS,
    icon: <PeopleAlt />,
  },
]

const generalListMenu = [
  {
    title: 'Competitions',
    to: ROUTES.getAdminOrgCompetitionsRoute,
    icon: <SportsHockey />,
  },
  {
    title: 'Sponsors',
    to: ROUTES.getAdminOrgSponsorsRoute,
    icon: <MonetizationOnIcon />,
  },
  {
    title: 'Seasons',
    to: ROUTES.getAdminOrgSeasonsRoute,
    icon: <DateRangeIcon />,
  },
  {
    title: 'Venues',
    to: ROUTES.getAdminOrgVenuesRoute,
    icon: <ApartmentIcon />,
  },
  {
    title: 'Awards',
    to: ROUTES.getAdminOrgAwardsRoute,
    icon: <EmojiEventsIcon />,
  },
]

const organizationListMenu = [
  {
    title: 'Teams',
    to: ROUTES.getAdminOrgTeamsRoute,
    icon: <GroupIcon />,
  },
  {
    title: 'Players',
    to: ROUTES.getAdminOrgPlayersRoute,
    icon: <MoodIcon />,
  },
  {
    title: 'Persons',
    to: ROUTES.getAdminOrgPersonsRoute,
    icon: <GroupsIcon />,
  },
  {
    title: 'Rule Packs',
    to: ROUTES.getAdminOrgRulePacksRoute,
    icon: <GavelIcon />,
  },
  {
    title: 'Events',
    to: ROUTES.getAdminOrgEventsRoute,
    icon: <EventIcon />,
  },
  {
    title: 'Games',
    to: ROUTES.getAdminOrgGamesRoute,
    icon: <SportsEsportsIcon />,
  },
]

type TMainListItems = {
  open: boolean
}

const MainListItems: React.FC<TMainListItems> = props => {
  const { open } = props
  const { organizationData } = React.useContext(OrganizationContext)
  const [generalOpen, setGeneralOpen] = useGeneralMenuState(false)

  return (
    <>
      <List>
        <ListSubheader>System</ListSubheader>
        {systemListMenu.map(listItem => (
          <ListItemLink
            open={open}
            title={listItem.title}
            key={listItem.title}
            icon={listItem.icon}
            primary={listItem.title}
            to={listItem.to}
          />
        ))}
      </List>
      {organizationData?.organizationId && (
        <>
          <Divider />
          <List>
            <ListSubheader>
              {open
                ? `${organizationData?.name || ''}`
                : getInitials(organizationData?.name)}
            </ListSubheader>
            <ListItem
              button
              onClick={() => {
                setGeneralOpen(!generalOpen)
              }}
            >
              <Tooltip
                arrow
                title="General"
                placement="right"
                disableHoverListener={open}
                TransitionComponent={Zoom}
              >
                <ListItemIcon>
                  <SportsHockey />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="General" />
              {generalOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={generalOpen} timeout="auto" unmountOnExit>
              <SubList disablePadding open={open}>
                {generalListMenu.map(listItem => (
                  <ListItemLink
                    open={open}
                    title={listItem.title}
                    key={listItem.title}
                    sx={{ padding: '2px 16px' }}
                    icon={listItem.icon}
                    primary={listItem.title}
                    to={listItem.to(organizationData?.urlSlug)}
                  />
                ))}
              </SubList>
            </Collapse>
            {}
            {organizationListMenu.map(listItem => (
              <ListItemLink
                open={open}
                title={listItem.title}
                key={listItem.title}
                icon={listItem.icon}
                primary={listItem.title}
                to={listItem.to(organizationData?.urlSlug)}
              />
            ))}
          </List>
        </>
      )}
    </>
  )
}

export { MainListItems }
