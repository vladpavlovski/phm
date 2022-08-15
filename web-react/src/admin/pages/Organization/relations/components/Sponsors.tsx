import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgSponsorRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Organization } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_SPONSORS = gql`
  query getSponsors {
    sponsors {
      sponsorId
      name
    }
  }
`

type TSponsors = {
  organizationId: string
  updateOrganization: MutationFunction
  organization: Organization
}

type TSponsorsParams = {
  organizationSlug: string
}

const Sponsors: React.FC<TSponsors> = props => {
  const { organizationId, organization, updateOrganization } = props

  const { organizationSlug } = useParams<TSponsorsParams>()
  const [openAddOrganization, setOpenAddOrganization] = useState(false)

  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])

  const [
    getAllSponsors,
    {
      loading: queryAllOrganizationsLoading,
      error: queryAllOrganizationsError,
      data: queryAllOrganizationsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllSponsors()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationSponsorsColumns = useMemo<GridColumns>(
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
              dialogTitle={
                'Do you really want to detach sponsor from organization?'
              }
              dialogDescription={
                'Sponsor will remain in the database. You can add him to any organization later.'
              }
              dialogNegativeText={'No, keep sponsor'}
              dialogPositiveText={'Yes, detach sponsor'}
              onDialogClosePositive={() => {
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
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

  const allSponsorsColumns = useMemo<GridColumns>(
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
              organizationId={organizationId}
              organization={organization}
              updateOrganization={updateOrganization}
            />
          )
        },
      },
    ],
    [organization]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="sponsors-content"
        id="sponsors-header"
      >
        <Typography>Sponsors</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddOrganization}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Sponsor
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={organizationSponsorsColumns}
            rows={setIdFromEntityId(organization.sponsors, 'sponsorId')}
            loading={queryAllOrganizationsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddOrganization}
        onClose={handleCloseAddOrganization}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllOrganizationsLoading && <Loader />}

        <Error message={queryAllOrganizationsError?.message} />

        {queryAllOrganizationsData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new sponsor`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allSponsorsColumns}
                  rows={setIdFromEntityId(
                    queryAllOrganizationsData.sponsors,
                    'sponsorId'
                  )}
                  disableSelectionOnClick
                  loading={queryAllOrganizationsLoading}
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
              handleCloseAddOrganization()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

type TToggleNewSponsor = {
  organization: Organization
  organizationId: string
  sponsorId: string
  updateOrganization: MutationFunction
}

const ToggleNewSponsor: React.FC<TToggleNewSponsor> = React.memo(props => {
  const { organizationId, sponsorId, organization, updateOrganization } = props
  const [isMember, setIsMember] = useState(
    !!organization.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateOrganization({
          variables: {
            where: {
              organizationId,
            },
            update: {
              sponsors: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            sponsorId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            sponsorId,
                          },
                        },
                      },
                    }),
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
})

export { Sponsors }
