import { Title } from 'components/Title'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
  getLeagueOrgGamesRoute,
  getLeagueOrgPlayersRoute,
  getLeagueOrgPlayersStatisticsByTeamRoute,
  getLeagueOrgPlayersStatisticsRoute,
  getLeagueOrgStandingsRoute,
} from 'router/routes'
import { copyToClipboard } from 'utils'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

const generateIframeCode = (path: string, cb?: () => void) => {
  const url = `${window.location.origin}${path}`

  const code = `
  <iframe id="${path}_id" title="Game Report" width="960" height="1200" 
  src="${url}">
  </iframe>

  <script>
    function checkSize() {
      const Iframe = document.getElementById("${path}_id")
      if (window.innerWidth < 960) {
        const widthForIframe = window.innerWidth < 320 ? 320 : window.innerWidth
        Iframe.width = widthForIframe
      }
      Iframe.parentElement.parentElement.style.padding = "0px"
    }

    checkSize()
      window.addEventListener('resize', checkSize)
      window.onunload = function() {
        window.removeEventListener('resize', checkSize)
    }
  </script>
  `

  copyToClipboard(code)
  if (cb) cb()
}

const getLinks = (
  organizationSlug: string
): { title: string; link: string }[] => [
  {
    title: 'Players',
    link: getLeagueOrgPlayersRoute(organizationSlug),
  },
  {
    title: 'Players Statistics',
    link: getLeagueOrgPlayersStatisticsRoute(organizationSlug),
  },
  {
    title: 'Players Statistics By Team',
    link: getLeagueOrgPlayersStatisticsByTeamRoute(organizationSlug),
  },
  {
    title: 'Standings',
    link: getLeagueOrgStandingsRoute(organizationSlug),
  },
  {
    title: 'Games',
    link: getLeagueOrgGamesRoute(organizationSlug),
  },
]

type TParams = {
  organizationSlug: string
}

const ExternalLinks = () => {
  const { organizationSlug } = useParams<TParams>()
  const { enqueueSnackbar } = useSnackbar()
  return (
    <Paper sx={{ padding: '16px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Title>{'External links'}</Title>

          {getLinks(organizationSlug).map(item => {
            return (
              <Stack
                key={item.title}
                justifyContent="space-between"
                direction="row"
              >
                <Link href={item.link} target="_blank" rel="noopener">
                  {item.title}
                </Link>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => {
                    generateIframeCode(item.link, () => {
                      enqueueSnackbar('Iframe code copied to clipboard 📋', {
                        variant: 'info',
                      })
                    })
                  }}
                >
                  {`iFrame`}
                </Button>
              </Stack>
            )
          })}
        </Grid>
      </Grid>
    </Paper>
  )
}

export { ExternalLinks }
