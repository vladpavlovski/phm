import React from 'react'
import PropTypes from 'prop-types'

import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import dayjs from 'dayjs'
import Img from 'react-cool-img'

import { useStyles } from 'admin/pages/commonComponents/styled'

const GameInvitation = props => {
  const [openDialog, setOpenDialog] = React.useState(false)
  return (
    <Stack direction="row" spacing={2}>
      <Button
        type="button"
        variant="outlined"
        color="primary"
        onClick={() => {
          setOpenDialog(true)
        }}
      >
        {`Invitation`}
      </Button>
      <FormDialogMemo
        {...props}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </Stack>
  )
}

const FormDialog = props => {
  const { openDialog, setOpenDialog, gameData } = props
  const classes = useStyles()
  const teamHost = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => t.host)?.node,
    [gameData]
  )

  const teamGuest = React.useMemo(
    () => gameData?.teamsConnection?.edges?.find(t => !t.host)?.node,
    [gameData]
  )

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openDialog}
      onClose={() => {
        setOpenDialog(false)
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Game Invitation`}</DialogTitle>
      <DialogContent>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ textAlign: 'center' }}
                    component="div"
                  >
                    {`${dayjs(gameData?.startDate).format('LL')}, ${dayjs(
                      gameData?.startTime,
                      'HH:mm:ss'
                    ).format('HH:mm')} - ${gameData?.venue?.name || ''}
                     - ${gameData?.phase?.competition?.name || ''} - ${
                      gameData?.phase?.name || ''
                    } - ${gameData?.group?.name || ''}`}
                  </Typography>
                  <Typography
                    sx={{ textAlign: 'center' }}
                    variant="subtitle2"
                    gutterBottom
                    component="div"
                  >
                    {`${gameData?.foreignId}`}
                  </Typography>
                </>

                <Divider />
                <Toolbar disableGutters className={classes.toolbarForm}>
                  <Typography
                    sx={{ textAlign: 'left' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamHost?.name ?? 'Host team'}
                  </Typography>

                  <Typography
                    sx={{ textAlign: 'right' }}
                    variant="h6"
                    gutterBottom
                    component="div"
                  >
                    {teamGuest?.name ?? 'Guest team'}
                  </Typography>
                </Toolbar>
                <Grid container spacing={0}>
                  <Grid item xs={4}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamHost?.logo}
                        className={classes.gamePlayTeamLogo}
                        alt={teamHost?.name}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        marginTop: '1rem',
                        fontSize: '4em',
                      }}
                      component="div"
                    >
                      {`vs`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamGuest?.logo}
                        className={classes.gamePlayTeamLogo}
                        alt={teamGuest?.name}
                      />
                    </div>
                  </Grid>

                  <Grid item xs={6}>
                    <div>
                      <Divider sx={{ margin: '1rem 0' }} />
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        component="div"
                      >
                        {gameData?.referee && `Referee: ${gameData?.referee}`}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={6}>
                    <div style={{ textAlign: 'right' }}>
                      <Divider sx={{ margin: '1rem 0' }} />
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        component="div"
                      >
                        {gameData?.timekeeper &&
                          `Timekeeper: ${gameData?.timekeeper}`}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </DialogContent>

      <DialogActions>
        <Button
          type="button"
          onClick={() => {
            setOpenDialog(false)
          }}
        >
          {'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const FormDialogMemo = React.memo(FormDialog)

GameInvitation.propTypes = {
  gameData: PropTypes.object,
}

export { GameInvitation }
