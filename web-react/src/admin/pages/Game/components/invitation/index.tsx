import dayjs from 'dayjs'
import React from 'react'
import Img from 'react-cool-img'
import { EmailIcon, EmailShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share'
import { getTeamByHost } from 'utils'
import { Game, Team } from 'utils/types'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

type TGameInvitation = {
  gameData: Game
}

const GameInvitation: React.FC<TGameInvitation> = props => {
  const { gameData } = props
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
      {openDialog && (
        <FormDialog
          gameData={gameData}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </Stack>
  )
}

type TFormDialog = {
  openDialog: boolean
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
  gameData: Game
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { openDialog, setOpenDialog, gameData } = props

  const teamHost = getTeamByHost(true, gameData?.teamsConnection?.edges)
  const teamGuest = getTeamByHost(false, gameData?.teamsConnection?.edges)

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
              <Paper sx={{ p: '16px' }}>
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
                <Toolbar
                  disableGutters
                  sx={{
                    p: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
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
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamHost?.logo}
                        // className={classes.gamePlayTeamLogo}
                        alt={teamHost?.name}
                      />
                      <AccountBoxIcon
                        sx={{
                          color: teamHost.connection.color,
                          fontSize: '6em',
                        }}
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
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Img
                        src={teamGuest?.logo}
                        // className={classes.gamePlayTeamLogo}
                        alt={teamGuest?.name}
                      />
                      <AccountBoxIcon
                        sx={{
                          color: teamGuest.connection.color,
                          fontSize: '6em',
                        }}
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: '16px' }}>
                <ShareGameInvite
                  gameData={gameData}
                  teamHost={teamHost}
                  teamGuest={teamGuest}
                />
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

type Props = {
  gameData: Game
  teamGuest: Team
  teamHost: Team
}

const ShareGameInvite = ({ gameData, teamHost, teamGuest }: Props) => {
  console.log(gameData)
  const gameInviteSubject = `Game Invitation: ${gameData?.name} - ${gameData?.startDate} - ${gameData?.startTime}`
  const gameInviteBody = `
Game Event: ${gameData?.name} - ${dayjs(gameData?.startDate).format(
    'LL'
  )} ${dayjs(gameData?.startTime, 'HH:mm:ss').format('HH:mm')}
Teams: ${teamHost?.name} vs ${teamGuest?.name}
${gameData?.venue?.name ? 'Venue: ' : ''}${gameData?.venue?.name || ''}
${gameData?.phase?.competition?.name ? 'Competition: ' : ''}${
    gameData?.phase?.competition?.name || ''
  }
${gameData?.phase?.name ? 'Phase: ' : ''}${gameData?.phase?.name || ''}
${gameData?.group?.name ? 'Group: ' : ''}${gameData?.group?.name || ''}
${gameData?.foreignId ? 'Game ID: ' : ''}${gameData?.foreignId || ''}
${gameData?.referee ? 'Referee: ' : ''}${gameData?.referee || ''}
${gameData?.timekeeper ? 'Timekeeper: ' : ''}${gameData?.timekeeper || ''}
`

  const gameInviteUrl = ' '

  const gameInviteBodyClean = gameInviteBody
    .split('\n')
    .filter(row => row.trim() !== '')
    .join('\n')

  return (
    <>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ textAlign: 'center' }}
        component="div"
      >
        Share invitation
      </Typography>
      <Divider />
      <Stack
        spacing={2}
        direction="row"
        justifyContent="center"
        alignContent="center"
      >
        <EmailShareButton
          url={gameInviteUrl}
          subject={gameInviteSubject}
          body={gameInviteBodyClean}
        >
          <EmailIcon size={32} round />
        </EmailShareButton>
        <WhatsappShareButton url={gameInviteUrl} title={gameInviteBodyClean}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </Stack>
    </>
  )
}

export { GameInvitation }
