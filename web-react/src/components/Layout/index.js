import React, { useContext } from 'react'
import clsx from 'clsx'
import { useAuth0 } from '@auth0/auth0-react'
import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Box,
} from '@material-ui/core'
import createPersistedState from 'use-persisted-state'

// import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import LayoutContext from '../../context/layout'
import { Copyright } from '../../components/Copyright'
import { useStyles } from './styled'
import { MainListItems } from './listItems'

const useLayoutSidebarState = createPersistedState('layoutSidebar')

const Layout = props => {
  const { children } = props
  const classes = useStyles()
  const [open, setOpen] = useLayoutSidebarState(true)
  const { barTitle } = useContext(LayoutContext)
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0()

  return (
    <div className={classes.root}>
      <AppBar
        position="absolute"
        color="primary"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => {
              setOpen(true)
            }}
            className={clsx(
              classes.menuButton
              // !open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton> */}
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
          {!isAuthenticated && (
            <button onClick={() => loginWithRedirect()}>Log In</button>
          )}
          {isAuthenticated && (
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Log Out
            </button>
          )}
          {/* {isAuthenticated && console.log('user:', user)} */}
          {isAuthenticated && user.name}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <Typography variant="h4" component="h1">
            PHM CUP
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
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <>
          {children}
          <Box pt={0}>
            <Copyright />
          </Box>
        </>
      </main>
    </div>
  )
}

export { Layout as default }
