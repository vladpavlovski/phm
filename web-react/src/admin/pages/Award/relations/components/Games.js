import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { getAdminOrgGameRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_GAME = gql`
  mutation removeAwardGame($awardId: ID!, $gameId: ID!) {
    awardGame: RemoveAwardGames(
      from: { gameId: $gameId }
      to: { awardId: $awardId }
    ) {
      from {
        gameId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_GAMES = gql`
  query getGames {
    games: Game {
      gameId
      name
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_GAME = gql`
  mutation mergeAwardGame($awardId: ID!, $gameId: ID!) {
    awardGame: MergeAwardGames(
      from: { gameId: $gameId }
      to: { awardId: $awardId }
    ) {
      from {
        gameId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Games = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_GAMES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardGamesColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleAward
              gameId={params.row.gameId}
              awardId={awardId}
              game={params.row}
            />
          )
        },
      },

      {
        field: 'gameId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgGameRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
    ],
    [organizationSlug]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="games-content"
        id="games-header"
      >
        <Typography className={classes.accordionFormTitle}>Games</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardGamesColumns}
                rows={setIdFromEntityId(queryData?.games, 'gameId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const ToggleAward = props => {
  const { gameId, awardId, game } = props
  const [isMember, setIsMember] = useState(
    !!game?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardGame] = useMutation(MERGE_AWARD_GAME, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardGame.to.name} add to ${data.awardGame.from.name} game!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [removeAwardGame] = useMutation(REMOVE_AWARD_GAME, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardGame.to.name} remove from ${data.awardGame.from.name} game`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? removeAwardGame({
              variables: {
                awardId,
                gameId,
              },
            })
          : mergeAwardGame({
              variables: {
                awardId,
                gameId,
              },
            })
        setIsMember(!isMember)
      }}
      name="gameMember"
      color="primary"
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  playerId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Games.propTypes = {
  awardId: PropTypes.string,
}

export { Games }
