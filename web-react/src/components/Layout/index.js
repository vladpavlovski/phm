import React, { useState, useContext } from 'react'
import clsx from 'clsx'

import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Box,
} from '@material-ui/core'

import LayoutContext from '../../context/layout'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { MainListItems } from './listItems'

import { Copyright } from '../../components/Copyright'

import { useStyles } from './styled'

const Layout = props => {
  const { children } = props
  const classes = useStyles()
  const [open, setOpen] = useState(true)
  const { barTitle } = useContext(LayoutContext)
  return (
    <div className={classes.root}>
      <AppBar
        position="absolute"
        color="primary"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => {
              setOpen(true)
            }}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
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
              setOpen(false)
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <MainListItems />
        {/*
        <List>{secondaryListItems}</List> */}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <>
          {children}
          <Box pt={4}>
            <Copyright />
          </Box>
        </>
      </main>
    </div>
  )
}

export { Layout as default }
