import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import AccountBox from '@mui/icons-material/AccountBox'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgSponsorRoute } from '../../../../../router/routes'
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
  const { teamId, team, updateTeam } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddSponsor, setOpenAddSponsor] = useState(false)

  const handleCloseAddSponsor = useCallback(() => {
    setOpenAddSponsor(false)
  }, [])

  const [
    getAllSponsors,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS)

  const handleOpenAddSponsor = useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllSponsors()
    }
    setOpenAddSponsor(true)
  }, [])

  const teamSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },

      {
        field: 'sponsorId',
        headerName: 'Profile',
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
              dialogTitle={
                'Do you really want to remove sponsor from the team?'
              }
              dialogDescription={
                'The sponsor will remain in the database. You can add him to any team later.'
              }
              dialogNegativeText={'No, keep the sponsor'}
              dialogPositiveText={'Yes, remove sponsor'}
              onDialogClosePositive={() => {
                updateTeam({
                  variables: {
                    where: {
                      teamId,
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
        width: 200,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },
      {
        field: 'sponsorId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSponsor
              sponsorId={params.value}
              teamId={teamId}
              team={team}
              updateTeam={updateTeam}
            />
          )
        },
      },
    ],
    [team]
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
              onClick={handleOpenAddSponsor}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add Sponsor
            </Button>

            <LinkButton
              startIcon={<CreateIcon />}
              to={getAdminOrgSponsorRoute(organizationSlug, 'new')}
            >
              Create
            </LinkButton>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={teamSponsorsColumns}
            rows={setIdFromEntityId(team?.sponsors, 'sponsorId')}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSponsor}
        onClose={handleCloseAddSponsor}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSponsorsLoading && !queryAllSponsorsError && <Loader />}
        {queryAllSponsorsError && !queryAllSponsorsLoading && (
          <Error message={queryAllSponsorsError.message} />
        )}
        {queryAllSponsorsData &&
          !queryAllSponsorsLoading &&
          !queryAllSponsorsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new sponsor to ${
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allSponsorsColumns}
                    rows={setIdFromEntityId(
                      queryAllSponsorsData.sponsors,
                      'sponsorId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSponsorsLoading}
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
              handleCloseAddSponsor()
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
  const { sponsorId, teamId, team, updateTeam } = props
  const [isMember, setIsMember] = useState(
    !!team.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateTeam({
              variables: {
                where: {
                  teamId,
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
          : updateTeam({
              variables: {
                where: {
                  teamId,
                },
                update: {
                  sponsors: {
                    connect: {
                      where: {
                        node: { sponsorId },
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
  )
}

ToggleNewSponsor.propTypes = {
  teamId: PropTypes.string,
  team: PropTypes.object,
}

Sponsors.propTypes = {
  teamId: PropTypes.string,
}

export { Sponsors }
