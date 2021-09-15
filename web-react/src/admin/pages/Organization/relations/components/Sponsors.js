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
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_SPONSORS = gql`
  query getOrganizationSponsors($organizationId: ID) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
      name
      sponsors {
        sponsorId
        name
      }
    }
  }
`

const REMOVE_ORGANIZATION_SPONSOR = gql`
  mutation removeOrganizationSponsor($organizationId: ID!, $sponsorId: ID!) {
    organizationSponsor: RemoveOrganizationSponsors(
      from: { organizationId: $organizationId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        organizationId
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

const MERGE_ORGANIZATION_SPONSOR = gql`
  mutation mergeOrganizationSponsors($organizationId: ID!, $sponsorId: ID!) {
    organizationSponsor: MergeOrganizationSponsors(
      from: { organizationId: $organizationId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        organizationId
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
  const { organizationId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddOrganization, setOpenAddOrganization] = useState(false)

  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const organization = queryData?.organization?.[0]

  const [
    getAllOrganizations,
    {
      loading: queryAllOrganizationsLoading,
      error: queryAllOrganizationsError,
      data: queryAllOrganizationsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeSponsorOrganization, { loading: mutationLoadingRemove }] =
    useMutation(REMOVE_ORGANIZATION_SPONSOR, {
      update(cache, { data: { organizationSponsor } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SPONSORS,
            variables: {
              organizationId,
            },
          })
          const updatedData = queryResult?.organization?.[0]?.sponsors.filter(
            p => p.sponsorId !== organizationSponsor.to.sponsorId
          )

          const updatedResult = {
            organization: [
              {
                ...queryResult?.organization?.[0],
                sponsors: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_SPONSORS,
            data: updatedResult,
            variables: {
              organizationId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.organizationSponsor.to.name} not sponsor for ${organization.name}!`,
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
    })

  const [mergeSponsorOrganization] = useMutation(MERGE_ORGANIZATION_SPONSOR, {
    update(cache, { data: { organizationSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            organizationId,
          },
        })
        const existingData = queryResult?.organization?.[0]?.sponsors
        const newItem = organizationSponsor.to
        const updatedResult = {
          organization: [
            {
              ...queryResult?.organization?.[0],
              sponsors: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            organizationId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.organizationSponsor.to.name} sponsor for ${organization.name}!`,
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
      getData({ variables: { organizationId } })
    }
  }, [])

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationSponsorsColumns = useMemo(
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
              loading={mutationLoadingRemove}
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
                removeSponsorOrganization({
                  variables: {
                    organizationId,
                    sponsorId: params.row.sponsorId,
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
              organizationId={organizationId}
              organization={organization}
              merge={mergeSponsorOrganization}
              remove={removeSponsorOrganization}
            />
          )
        },
      },
    ],
    [organization]
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
                  onClick={handleOpenAddOrganization}
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
              <DataGridPro
                columns={organizationSponsorsColumns}
                rows={setIdFromEntityId(organization.sponsors, 'sponsorId')}
                loading={queryAllOrganizationsLoading}
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
        open={openAddOrganization}
        onClose={handleCloseAddOrganization}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllOrganizationsLoading && !queryAllOrganizationsError && (
          <Loader />
        )}
        {queryAllOrganizationsError && !queryAllOrganizationsLoading && (
          <Error message={queryAllOrganizationsError.message} />
        )}
        {queryAllOrganizationsData &&
          !queryAllOrganizationsLoading &&
          !queryAllOrganizationsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new sponsor`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
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

const ToggleNewSponsor = props => {
  const { organizationId, sponsorId, organization, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!organization.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? remove({
              variables: {
                organizationId,
                sponsorId,
              },
            })
          : merge({
              variables: {
                organizationId,
                sponsorId,
              },
            })
        setIsMember(!isMember)
      }}
      name="sponsorMember"
      color="primary"
      label={isMember ? 'Sponsor' : 'Not sponsor'}
    />
  )
}

ToggleNewSponsor.propTypes = {
  organizationId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorOrganization: PropTypes.func,
  mergeSponsorOrganization: PropTypes.func,
}

Sponsors.propTypes = {
  organizationId: PropTypes.string,
}

export { Sponsors }
