import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Avatar from '@material-ui/core/Avatar'
import Fade from '@material-ui/core/Fade'
import { useStyles } from './styled'
import { useAuth0 } from '@auth0/auth0-react'
import { getInitials } from '../../utils'
import { useUserSetup } from '../../utils/hooks'

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const classes = useStyles()
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0()
  useUserSetup({ user, isAuthenticated })
  return (
    <>
      {isAuthenticated ? (
        <Button
          aria-controls="user-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={classes.userMenuButton}
          sx={{ color: 'white' }}
        >
          {isAuthenticated && user.name}
          <Avatar
            mx="auto"
            sx={{ marginLeft: '1.5rem' }}
            alt={user?.name}
            src={user?.picture}
          >
            {isAuthenticated && getInitials(user?.name)}
          </Avatar>
        </Button>
      ) : (
        <Button
          aria-controls="user-menu"
          aria-haspopup="true"
          onClick={loginWithRedirect}
          sx={{ color: 'white' }}
        >
          {'Log In'}
        </Button>
      )}
      {/* {isAuthenticated && console.log('user:', user)} */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
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

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }
}

export { UserMenu }