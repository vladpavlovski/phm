import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { getAdminOrgPlayerRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../../utils'

const REMOVE_AWARD_PLAYER = gql`
  mutation removeAwardPlayer($awardId: ID!, $playerId: ID!) {
    awardPlayer: RemoveAwardPlayers(
      from: { playerId: $playerId }
      to: { awardId: $awardId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players: Player {
      playerId
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_PLAYER = gql`
  mutation mergeAwardPlayer($awardId: ID!, $playerId: ID!) {
    awardPlayer: MergeAwardPlayers(
      from: { playerId: $playerId }
      to: { awardId: $awardId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Players = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PLAYERS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardPlayersColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamName',
        headerName: 'Team Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.teams, 'name')
        },
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleAward
              playerId={params.row.playerId}
              awardId={awardId}
              player={params.row}
            />
          )
        },
      },

      {
        field: 'playerId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
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
        aria-controls="players-content"
        id="players-header"
      >
        <Typography className={classes.accordionFormTitle}>Players</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardPlayersColumns}
                rows={setIdFromEntityId(queryData?.players, 'playerId')}
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
  const { playerId, awardId, player } = props
  const [isMember, setIsMember] = useState(
    !!player?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardPlayer] = useMutation(MERGE_AWARD_PLAYER, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPlayer.to.name} add to ${data.awardPlayer.from.name} player!`,
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

  const [removeAwardPlayer] = useMutation(REMOVE_AWARD_PLAYER, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPlayer.to.name} remove from ${data.awardPlayer.from.name} player`,
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
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? removeAwardPlayer({
                  variables: {
                    awardId,
                    playerId,
                  },
                })
              : mergeAwardPlayer({
                  variables: {
                    awardId,
                    playerId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="playerMember"
          color="primary"
        />
      }
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

Players.propTypes = {
  awardId: PropTypes.string,
}

export { Players }
