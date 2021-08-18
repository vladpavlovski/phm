import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import { useParams } from 'react-router-dom'

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
import { getAdminOrgSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_SPONSORS = gql`
  query getSponsors {
    sponsors {
      sponsorId
      name
    }
  }
`

const Sponsors = props => {
  const { playerId, player, updatePlayer } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const [
    getAllSponsors,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllSponsors()
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
              to={getAdminOrgSponsorRoute(organizationSlug, params.value)}
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach sponsor from player?'}
              dialogDescription={
                'Sponsor will remain in the database. You can add him to any player later.'
              }
              dialogNegativeText={'No, keep sponsor'}
              dialogPositiveText={'Yes, detach sponsor'}
              onDialogClosePositive={() => {
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      sponsors: {
                        disconnect: {
                          where: {
                            node: {
                              sponsorId: params.row.sponsorId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
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
              updatePlayer={updatePlayer}
            />
          )
        },
      },
    ],
    [player]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="sponsors-content"
        id="sponsors-header"
      >
        <Typography className={classes.accordionFormTitle}>Sponsors</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
  const { playerId, sponsorId, player, updatePlayer } = props
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
              ? updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      sponsors: {
                        disconnect: {
                          where: {
                            node: {
                              sponsorId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      sponsors: {
                        connect: {
                          where: {
                            sponsorId,
                          },
                        },
                      },
                    },
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
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
