import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_SPONSORS = gql`
  query getPlayerSponsors($playerId: ID) {
    player: Player(playerId: $playerId) {
      playerId
      name
      sponsors {
        sponsorId
        name
      }
    }
  }
`

const REMOVE_SPONSOR_PLAYER = gql`
  mutation removeSponsorPlayer($playerId: ID!, $sponsorId: ID!) {
    sponsorPlayer: RemoveSponsorPlayers(
      from: { playerId: $playerId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        playerId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

export const GET_ALL_SPONSORS = gql`
  query getSponsors {
    sponsors: Sponsor {
      sponsorId
      name
    }
  }
`

const MERGE_SPONSOR_PLAYER = gql`
  mutation mergeSponsorPlayer($playerId: ID!, $sponsorId: ID!) {
    sponsorPlayer: MergeSponsorPlayers(
      from: { playerId: $playerId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        playerId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

const Sponsors = props => {
  const { playerId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const player = queryData?.player?.[0]

  const [
    getAllPlayers,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeSponsorPlayer, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_PLAYER,
    {
      update(cache, { data: { sponsorPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SPONSORS,
            variables: {
              playerId,
            },
          })
          const updatedData = queryResult?.player?.[0]?.sponsors.filter(
            p => p.sponsorId !== sponsorPlayer.to.sponsorId
          )

          const updatedResult = {
            player: [
              {
                ...queryResult?.player?.[0],
                sponsors: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_SPONSORS,
            data: updatedResult,
            variables: {
              playerId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorPlayer.to.name} not sponsor for ${player.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [mergeSponsorPlayer] = useMutation(MERGE_SPONSOR_PLAYER, {
    update(cache, { data: { sponsorPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            playerId,
          },
        })
        const existingData = queryResult?.player?.[0]?.sponsors
        const newItem = sponsorPlayer.to
        const updatedResult = {
          player: [
            {
              ...queryResult?.player?.[0],
              sponsors: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            playerId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorPlayer.to.name} sponsor for ${player.name}!`,
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

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { playerId } })
    }
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const playerSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'sponsorId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminSponsorRoute(params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Remove'}
              textLoading={'Removing...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach sponsor from player?'}
              dialogDescription={
                'Sponsor will remain in the database. You can add him to any player later.'
              }
              dialogNegativeText={'No, keep sponsor'}
              dialogPositiveText={'Yes, detach sponsor'}
              onDialogClosePositive={() => {
                removeSponsorPlayer({
                  variables: {
                    playerId,
                    sponsorId: params.row.sponsorId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
  )

  const allSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'sponsorId',
        headerName: 'Sponsorship',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSponsor
              sponsorId={params.value}
              playerId={playerId}
              player={player}
              merge={mergeSponsorPlayer}
              remove={removeSponsorPlayer}
            />
          )
        },
      },
    ],
    [player]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="sponsors-content"
        id="sponsors-header"
      >
        <Typography className={classes.accordionFormTitle}>Sponsors</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenAddPlayer}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Sponsor
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={playerSponsorsColumns}
                rows={setIdFromEntityId(player.sponsors, 'sponsorId')}
                loading={queryAllPlayersLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPlayersLoading && !queryAllPlayersError && <Loader />}
        {queryAllPlayersError && !queryAllPlayersLoading && (
          <Error message={queryAllPlayersError.message} />
        )}
        {queryAllPlayersData &&
          !queryAllPlayersLoading &&
          !queryAllPlayersError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${player?.name} to new sponsor`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allSponsorsColumns}
                    rows={setIdFromEntityId(
                      queryAllPlayersData.sponsors,
                      'sponsorId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPlayersLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPlayer()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewSponsor = props => {
  const { playerId, sponsorId, player, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!player.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    playerId,
                    sponsorId,
                  },
                })
              : merge({
                  variables: {
                    playerId,
                    sponsorId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsor' : 'Not sponsor'}
    />
  )
}

ToggleNewSponsor.propTypes = {
  playerId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorPlayer: PropTypes.func,
  mergeSponsorPlayer: PropTypes.func,
}

Sponsors.propTypes = {
  playerId: PropTypes.string,
}

export { Sponsors }
