import React from 'react'
import { getInitials } from 'utils'
// import { useUserSetup } from 'utils/hooks'
import { useAuth0 } from '@auth0/auth0-react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

const UserMenu: React.FC = React.memo(() => {
  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & Element) | null
  >(null)
  // loginWithRedirect,
  const { logout, user, isAuthenticated } = useAuth0()
  // useUserSetup({ user, isAuthenticated })
  console.log(user)
  return (
    <>
      {isAuthenticated ? (
        <Button
          aria-controls="user-menu"
          aria-haspopup="true"
          onClick={handleClick}
          sx={{ color: 'white' }}
        >
          {user?.name}
          <Avatar
            // mx="auto"
            sx={{ marginLeft: '1.5rem' }}
            alt={user?.name}
            src={user?.picture}
          >
            {getInitials(user?.name)}
          </Avatar>
        </Button>
      ) : (
        <></>
      )}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem
          onClick={() => {
            logout({ returnTo: window.location.origin })
            handleClose()
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  )

  function handleClick(event: React.SyntheticEvent) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }
})

export { UserMenu }
