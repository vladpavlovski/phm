import React from 'react'
import WidgetsIcon from '@mui/icons-material/Widgets'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'

export const FastEventsMenu = () => {
  const containerRef = React.useRef(null)
  const [openMenu, setOpenMenu] = React.useState(false)
  return (
    <>
      <Box ref={containerRef}>
        <Slide direction="up" in={openMenu} container={containerRef.current}>
          <Box
            sx={{
              width: '100%',
              height: '30rem',
              position: 'fixed',
              bottom: 0,
            }}
          >
            <Paper></Paper>
          </Box>
        </Slide>
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation showLabels>
            <BottomNavigationAction
              label="Fast Menu"
              sx={{ maxWidth: '100%' }}
              icon={<WidgetsIcon />}
              onClick={() => {
                setOpenMenu(prev => !prev)
              }}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </>
  )
}
