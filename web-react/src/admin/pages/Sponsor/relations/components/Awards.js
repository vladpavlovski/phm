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
import { getAdminAwardRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_AWARDS = gql`
  query getSponsor($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      _id
      sponsorId
      name
      awards {
        awardId
        name
        description
      }
    }
  }
`

const REMOVE_SPONSOR_AWARD = gql`
  mutation removeSponsorAward($sponsorId: ID!, $awardId: ID!) {
    sponsorAward: RemoveSponsorAwards(
      from: { awardId: $awardId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        awardId
        name
        description
      }
    }
  }
`

export const GET_ALL_AWARDS = gql`
  query getAwards {
    awards: Award {
      awardId
      name
      description
    }
  }
`

const MERGE_SPONSOR_AWARD = gql`
  mutation mergeSponsorAward($sponsorId: ID!, $awardId: ID!) {
    sponsorAward: MergeSponsorAwards(
      from: { awardId: $awardId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        awardId
        name
        positions {
          positionId
          name
        }
        teams {
          teamId
          name
        }
      }
    }
  }
`

const Awards = props => {
  const { sponsorId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddAward, setOpenAddAward] = useState(false)

  const handleCloseAddAward = useCallback(() => {
    setOpenAddAward(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_AWARDS, {
    fetchPolicy: 'cache-and-network',
  })

  const sponsor = queryData && queryData.sponsor && queryData.sponsor[0]

  const [
    getAllAwards,
    {
      loading: queryAllAwardsLoading,
      error: queryAllAwardsError,
      data: queryAllAwardsData,
    },
  ] = useLazyQuery(GET_ALL_AWARDS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeSponsorAward, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_AWARD,
    {
      update(cache, { data: { sponsorAward } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_AWARDS,
            variables: {
              sponsorId,
            },
          })
          const updatedAwards = queryResult.sponsor[0].awards.filter(
            p => p.awardId !== sponsorAward.from.awardId
          )

          const updatedResult = {
            sponsor: [
              {
                ...queryResult.sponsor[0],
                awards: updatedAwards,
              },
            ],
          }
          cache.writeQuery({
            query: GET_AWARDS,
            data: updatedResult,
            variables: {
              sponsorId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorAward.from.name} not sponsored by ${sponsor.name}!`,
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

  const [mergeSponsorAward] = useMutation(MERGE_SPONSOR_AWARD, {
    update(cache, { data: { sponsorAward } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_AWARDS,
          variables: {
            sponsorId,
          },
        })
        const existingAwards = queryResult.sponsor[0].awards
        const newAward = sponsorAward.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              awards: [newAward, ...existingAwards],
            },
          ],
        }
        cache.writeQuery({
          query: GET_AWARDS,
          data: updatedResult,
          variables: {
            sponsorId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorAward.from.name} sponsored by ${sponsor.name}!`,
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
      getData({ variables: { sponsorId } })
    }
  }, [])

  const handleOpenAddAward = useCallback(() => {
    if (!queryAllAwardsData) {
      getAllAwards()
    }
    setOpenAddAward(true)
  }, [])

  const sponsorAwardsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 300,
      },

      {
        field: 'awardId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminAwardRoute(params.value)}
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
              text={'Detach'}
              textLoading={'Detaching...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach award from the sponsor?'
              }
              dialogDescription={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep award'}
              dialogPositiveText={'Yes, detach award'}
              onDialogClosePositive={() => {
                removeSponsorAward({
                  variables: {
                    sponsorId,
                    awardId: params.row.awardId,
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

  const allAwardsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
      },

      {
        field: 'awardId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewAward
              awardId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              merge={mergeSponsorAward}
              remove={removeSponsorAward}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="awards-content"
        id="awards-header"
      >
        <Typography className={classes.accordionFormTitle}>Awards</Typography>
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
                  onClick={handleOpenAddAward}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Award
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={sponsorAwardsColumns}
                rows={setIdFromEntityId(sponsor.awards, 'awardId')}
                loading={queryAllAwardsLoading}
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
        open={openAddAward}
        onClose={handleCloseAddAward}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllAwardsLoading && !queryAllAwardsError && <Loader />}
        {queryAllAwardsError && !queryAllAwardsLoading && (
          <Error message={queryAllAwardsError.message} />
        )}
        {queryAllAwardsData && !queryAllAwardsLoading && !queryAllAwardsError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add award to ${
              sponsor && sponsor.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={allAwardsColumns}
                  rows={setIdFromEntityId(queryAllAwardsData.awards, 'awardId')}
                  disableSelectionOnClick
                  loading={queryAllAwardsLoading}
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
              handleCloseAddAward()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewAward = props => {
  const { awardId, sponsorId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.awards.find(p => p.awardId === awardId)
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
                    sponsorId,
                    awardId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    awardId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewAward.propTypes = {
  awardId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorAward: PropTypes.func,
  mergeSponsorAward: PropTypes.func,
}

Awards.propTypes = {
  sponsorId: PropTypes.string,
}

export { Awards }
