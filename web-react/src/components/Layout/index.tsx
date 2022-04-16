import React from 'react'
import { useLocation } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, Divider, IconButton, Toolbar, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
// import LayoutContext from '../../context/layout'
import { Copyright } from '../Copyright'
import { MainListItems } from './listItems'
import { AppBar, Drawer, DrawerHeader } from './styled'
import { UserMenu } from './UserMenu'

const useLayoutSidebarState = createPersistedState<boolean>('HMS-LayoutSidebar')

const Layout: React.FC = props => {
  const { children } = props
  const theme = useTheme()
  const [open, setOpen] = useLayoutSidebarState(true)
  // const { barTitle } = React.useContext(LayoutContext)

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
              {/* <Typography component="div" variant="h6" color="inherit" noWrap>
                {barTitle}
              </Typography> */}

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
