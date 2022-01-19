import React from 'react'
import { useSnackbar } from 'notistack'
import { LinkButton } from 'components/LinkButton'
import { getLeagueOrgGameReportRoute } from 'router/routes'
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { copyToClipboard } from 'utils'

type TGameReport = {
  gameId: string
}

const generateIframeCode = (gameId: string, cb: () => void) => {
  const url = `${window.location.origin}${getLeagueOrgGameReportRoute(gameId)}`

  const code = `
  <iframe id="${gameId}_id" title="Game Report" width="960" height="1200" 
  src="${url}">
  </iframe>

  <script>
    function checkSize() {
      const Iframe = document.getElementById("${gameId}_id")
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

const GameReport: React.FC<TGameReport> = props => {
  const { gameId } = props
  const { enqueueSnackbar } = useSnackbar()

  return (
    <Stack direction="row" spacing={2}>
      <LinkButton
        to={getLeagueOrgGameReportRoute(gameId)}
        size="medium"
        target="_blank"
        variant="outlined"
        startIcon={<DocumentScannerIcon />}
      >
        Game Report
      </LinkButton>
      <Button
        type="button"
        variant="outlined"
        color="primary"
        onClick={() => {
          generateIframeCode(gameId, () => {
            enqueueSnackbar('Iframe code copied to clipboard 📋', {
              variant: 'info',
            })
          })
        }}
      >
        {`Iframe code`}
      </Button>
    </Stack>
  )
}

export { GameReport }
