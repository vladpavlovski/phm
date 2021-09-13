import React from 'react'
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
import { getAdminOrgAwardRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_AWARDS = gql`
  query getAwards {
    awards {
      awardId
      name
      description
    }
  }
`

const Awards = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddAward, setOpenAddAward] = React.useState(false)

  const handleCloseAddAward = React.useCallback(() => {
    setOpenAddAward(false)
  }, [])

  const [
    getAllAwards,
    {
      loading: queryAllAwardsLoading,
      error: queryAllAwardsError,
      data: queryAllAwardsData,
    },
  ] = useLazyQuery(GET_ALL_AWARDS)

  const handleOpenAddAward = React.useCallback(() => {
    if (!queryAllAwardsData) {
      getAllAwards()
    }
    setOpenAddAward(true)
  }, [])

  const sponsorAwardsColumns = React.useMemo(
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
              to={getAdminOrgAwardRoute(organizationSlug, params.value)}
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach award from the sponsor?'
              }
              dialogDescription={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep award'}
              dialogPositiveText={'Yes, detach award'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      awards: {
                        disconnect: {
                          where: {
                            node: {
                              awardId: params.row.awardId,
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

  const allAwardsColumns = React.useMemo(
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
              updateSponsor={updateSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="awards-content"
        id="awards-header"
      >
        <Typography className={classes.accordionFormTitle}>Awards</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
            rows={setIdFromEntityId(sponsor?.awards, 'awardId')}
            loading={queryAllAwardsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
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
                  rows={setIdFromEntityId(
                    queryAllAwardsData?.awards,
                    'awardId'
                  )}
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
  const { awardId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.awards.find(p => p.awardId === awardId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      awards: {
                        disconnect: {
                          where: {
                            node: {
                              awardId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      awards: {
                        connect: {
                          where: {
                            node: { awardId },
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
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewAward.propTypes = {
  awardId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  updateSponsor: PropTypes.func,
}

Awards.propTypes = {
  sponsorId: PropTypes.string,
  updateSponsor: PropTypes.func,
  sponsor: PropTypes.object,
}

export { Awards }
