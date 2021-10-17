import React, { useContext } from 'react'
import clsx from 'clsx'
import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Box,
} from '@mui/material'
import createPersistedState from 'use-persisted-state'
import { useLocation } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import LayoutContext from '../../context/layout'
import { Copyright } from '../../components/Copyright'
import { useStyles } from './styled'
import { MainListItems } from './listItems'
import { UserMenu } from './UserMenu'

const useLayoutSidebarState = createPersistedState('HMS-LayoutSidebar')

const Layout = props => {
  const { children } = props
  const classes = useStyles()
  const [open, setOpen] = useLayoutSidebarState(true)
  const { barTitle } = useContext(LayoutContext)

  const location = useLocation()
  const isAdminPage = React.useMemo(() => {
    if (location.pathname.includes('web/league')) return false
    return true
  }, [location])

  return (
    <div className={classes.root}>
      {isAdminPage && (
        <>
          <AppBar
            position="absolute"
            color="primary"
            className={clsx(classes.appBar, open && classes.appBarShift)}
          >
            <Toolbar className={classes.toolbar}>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                className={classes.title}
              >
                {barTitle}
              </Typography>
              {/* <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
              <UserMenu />
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(
                classes.drawerPaper,
                !open && classes.drawerPaperClose
              ),
            }}
            open={open}
          >
            <div className={classes.toolbarIcon}>
              <Typography variant="h4" component="h1" sx={{ flex: 'auto' }}>
                HMS
              </Typography>
              <IconButton
                onClick={() => {
                  setOpen(state => !state)
                }}
              >
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </div>
            <Divider />
            <MainListItems open={open} />
            {/*
          <List>{secondaryListItems}</List> */}
          </Drawer>
        </>
      )}
      <main className={classes.content}>
        {isAdminPage && <div className={classes.appBarSpacer} />}
        <>
          {children}
          {isAdminPage && (
            <Box pt={0}>
              <Copyright />
            </Box>
          )}
        </>
      </main>
    </div>
  )
}

export { Layout as default }
