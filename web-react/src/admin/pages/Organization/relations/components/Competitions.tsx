import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { getAdminOrgCompetitionRoute } from '../../../../../router/routes'
import { setIdFromEntityId } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions {
      competitionId
      name
    }
  }
`

type TCompetitions = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Competitions: React.FC<TCompetitions> = props => {
  const { organizationId, organization, updateOrganization } = props
  const { organizationSlug } = useParams<TParams>()
  const [openAddOrganization, setOpenAddOrganization] = useState(false)
  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])

  const [
    getAllOrganizations,
    {
      loading: queryAllOrganizationsLoading,
      error: queryAllOrganizationsError,
      data: queryAllOrganizationsData,
    },
  ] = useLazyQuery(GET_ALL_COMPETITIONS)

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationCompetitionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'competitionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
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
                'Do you really want to detach competition from organization?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any organization later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId: params.row.competitionId,
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
    [updateOrganization]
  )

  const allCompetitionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return <ToggleNew competitionId={params.value} {...props} />
        },
      },
    ],
    [organization]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography>Competitions</Typography>
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
              Add Competition
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={organizationCompetitionsColumns}
            rows={setIdFromEntityId(organization.competitions, 'competitionId')}
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
              <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new competition`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllOrganizationsData.competitions,
                      'competitionId'
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

type TToggleNew = {
  organization: Organization
  organizationId: string
  competitionId: string
  updateOrganization: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = props => {
  const { organizationId, competitionId, organization, updateOrganization } =
    props
  const [isMember, setIsMember] = useState(
    !!organization.competitions.find(p => p.competitionId === competitionId)
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
              competitions: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            competitionId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            competitionId,
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
      name="competitionMember"
      color="primary"
    />
  )
}

export { Competitions }
