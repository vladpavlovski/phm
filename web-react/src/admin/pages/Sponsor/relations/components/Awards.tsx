import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgAwardRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Sponsor } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_AWARDS = gql`
  query getAwards {
    awards {
      awardId
      name
      description
    }
  }
`

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Awards: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const { organizationSlug } = useParams<TParams>()
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

  const sponsorAwardsColumns = React.useMemo<GridColumns>(
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

  const allAwardsColumns = React.useMemo<GridColumns>(
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
        <Typography>Awards</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddAward}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Award
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
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
            <DialogTitle id="alert-dialog-title">{`Add award to ${sponsor?.name}`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
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

type TToggleNew = {
  awardId: string
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const ToggleNewAward: React.FC<TToggleNew> = React.memo(props => {
  const { awardId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.awards.find(p => p.awardId === awardId)
  )

  return (
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
  )
})

export { Awards }
