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
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_SPONSORS = gql`
  query getAssociationSponsors($associationId: ID) {
    association: Association(associationId: $associationId) {
      associationId
      name
      sponsors {
        sponsorId
        name
      }
    }
  }
`

const REMOVE_ASSOCIATION_SPONSOR = gql`
  mutation removeAssociationSponsor($associationId: ID!, $sponsorId: ID!) {
    associationSponsor: RemoveAssociationSponsors(
      from: { associationId: $associationId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        associationId
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

const MERGE_ASSOCIATION_SPONSOR = gql`
  mutation mergeAssociationSponsors($associationId: ID!, $sponsorId: ID!) {
    associationSponsor: MergeAssociationSponsors(
      from: { associationId: $associationId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        associationId
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
  const { associationId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddAssociation, setOpenAddAssociation] = useState(false)

  const handleCloseAddAssociation = useCallback(() => {
    setOpenAddAssociation(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const association = queryData?.association?.[0]

  const [
    getAllAssociations,
    {
      loading: queryAllAssociationsLoading,
      error: queryAllAssociationsError,
      data: queryAllAssociationsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeSponsorAssociation,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_ASSOCIATION_SPONSOR, {
    update(cache, { data: { associationSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            associationId,
          },
        })
        const updatedData = queryResult?.association?.[0]?.sponsors.filter(
          p => p.sponsorId !== associationSponsor.to.sponsorId
        )

        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              sponsors: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            associationId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.associationSponsor.to.name} not sponsor for ${association.name}!`,
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

  const [mergeSponsorAssociation] = useMutation(MERGE_ASSOCIATION_SPONSOR, {
    update(cache, { data: { associationSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            associationId,
          },
        })
        const existingData = queryResult?.association?.[0]?.sponsors
        const newItem = associationSponsor.to
        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              sponsors: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            associationId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.associationSponsor.to.name} sponsor for ${association.name}!`,
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
      getData({ variables: { associationId } })
    }
  }, [])

  const handleOpenAddAssociation = useCallback(() => {
    if (!queryAllAssociationsData) {
      getAllAssociations()
    }
    setOpenAddAssociation(true)
  }, [])

  const associationSponsorsColumns = useMemo(
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
              dialogTitle={
                'Do you really want to detach sponsor from association?'
              }
              dialogDescription={
                'Sponsor will remain in the database. You can add him to any association later.'
              }
              dialogNegativeText={'No, keep sponsor'}
              dialogPositiveText={'Yes, detach sponsor'}
              onDialogClosePositive={() => {
                removeSponsorAssociation({
                  variables: {
                    associationId,
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
              associationId={associationId}
              association={association}
              merge={mergeSponsorAssociation}
              remove={removeSponsorAssociation}
            />
          )
        },
      },
    ],
    [association]
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
                  onClick={handleOpenAddAssociation}
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
                columns={associationSponsorsColumns}
                rows={setIdFromEntityId(association.sponsors, 'sponsorId')}
                loading={queryAllAssociationsLoading}
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
        open={openAddAssociation}
        onClose={handleCloseAddAssociation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllAssociationsLoading && !queryAllAssociationsError && (
          <Loader />
        )}
        {queryAllAssociationsError && !queryAllAssociationsLoading && (
          <Error message={queryAllAssociationsError.message} />
        )}
        {queryAllAssociationsData &&
          !queryAllAssociationsLoading &&
          !queryAllAssociationsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${association?.name} to new sponsor`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allSponsorsColumns}
                    rows={setIdFromEntityId(
                      queryAllAssociationsData.sponsors,
                      'sponsorId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllAssociationsLoading}
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
              handleCloseAddAssociation()
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
  const { associationId, sponsorId, association, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!association.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    associationId,
                    sponsorId,
                  },
                })
              : merge({
                  variables: {
                    associationId,
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
  associationId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorAssociation: PropTypes.func,
  mergeSponsorAssociation: PropTypes.func,
}

Sponsors.propTypes = {
  associationId: PropTypes.string,
}

export { Sponsors }
