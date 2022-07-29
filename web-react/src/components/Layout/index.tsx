import React from 'react'
import { useLocation } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, Divider, IconButton, Toolbar, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Copyright } from '../Copyright'
import { MainListItems } from './listItems'
import { AppBar, Drawer, DrawerHeader } from './styled'
import { UserMenu } from './UserMenu'

export const useLayoutSidebarState =
  createPersistedState<boolean>('HMS-LayoutSidebar')

const Layout = (props: { children: React.ReactElement }) => {
  const { children } = props
  const theme = useTheme()
  const [open, setOpen] = useLayoutSidebarState(true)

  const location = useLocation()
  const isAdminPage = location.pathname.includes('web/league') ? false : true

  return (
    <Box sx={{ display: 'flex' }}>
      {isAdminPage && (
        <>
          <AppBar position="fixed" open={open}>
            <Toolbar
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {!open ? (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => {
                    setOpen(true)
                  }}
                  edge="start"
                  sx={{
                    marginRight: '36px',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <div />
              )}

              <UserMenu />
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <DrawerHeader>
              <Typography variant="h4" component="h1" sx={{ flex: 'auto' }}>
                HMS
              </Typography>
              <IconButton
                onClick={() => {
                  setOpen(false)
                }}
              >
                {theme.direction === 'rtl' ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <MainListItems open={open} />
          </Drawer>
        </>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: '3 0' }}>
        {isAdminPage && <DrawerHeader sx={{ marginBottom: 3 }} />}
        {children}
        {isAdminPage && (
          <Box pt={1}>
            <Copyright />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export { Layout as default }
