import React from 'react'
import PropTypes from 'prop-types'
import { LinkButton } from 'components/LinkButton'
import { getLeagueOrgGameReportRoute } from 'router/routes'
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner'

const GameReport = props => {
  const { gameId } = props

  return (
    <LinkButton
      to={getLeagueOrgGameReportRoute(gameId)}
      fullWidth
      size="medium"
      target="_blank"
      variant={'outlined'}
      startIcon={<DocumentScannerIcon />}
    >
      Game Report
    </LinkButton>
  )
}

GameReport.propTypes = {
  gameId: PropTypes.string,
}

export { GameReport }
