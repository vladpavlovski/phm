import React from 'react'
import { useTheme } from '@mui/material/styles'

import { Toolbar, Typography, Divider, IconButton, Box } from '@mui/material'
import createPersistedState from 'use-persisted-state'
import { useLocation } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'

import LayoutContext from '../../context/layout'
import { Copyright } from '../Copyright'
import { Drawer, AppBar, DrawerHeader } from './styled'
import { MainListItems } from './listItems'
// import { UserMenu } from './UserMenu'

const useLayoutSidebarState = createPersistedState<boolean>('HMS-LayoutSidebar')

const Layout: React.FC = props => {
  const { children } = props
  const theme = useTheme()
  const [open, setOpen] = useLayoutSidebarState(true)
  const { barTitle } = React.useContext(LayoutContext)

  const location = useLocation()
  const isAdminPage = React.useMemo(() => {
    if (location.pathname.includes('web/league')) return false
    return true
  }, [location])

  return (
    <Box sx={{ display: 'flex' }}>
      {isAdminPage && (
        <>
          <AppBar position="fixed" open={open}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => {
                  setOpen(true)
                }}
                edge="start"
                sx={{
                  marginRight: '36px',
                  ...(open && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography component="div" variant="h6" color="inherit" noWrap>
                {barTitle}
              </Typography>

              {/* <UserMenu /> */}
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {isAdminPage && <DrawerHeader />}
        {children}
        {isAdminPage && (
          <Box pt={0}>
            <Copyright />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export { Layout as default }
