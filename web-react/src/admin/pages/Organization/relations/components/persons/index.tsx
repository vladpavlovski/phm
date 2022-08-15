import { LinkButton } from 'components'
import placeholderPerson from 'img/placeholderPerson.jpg'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPersonRoute } from 'router/routes'
import { createCtx, getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { Organization, Person } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import CreateIcon from '@mui/icons-material/Create'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { AddPerson } from './AddPerson'
import { PersonOccupationDialog, SetPersonOccupation } from './SetPersonOccupation'

type TOrganizationPersons = {
  personOccupationDialogOpen: boolean
  personData: Person | null
}

const [ctx, OrganizationPersonsProvider] = createCtx<TOrganizationPersons>({
  personOccupationDialogOpen: false,
  personData: null as unknown as Person,
})
export const OrganizationPersonsContext = ctx

type TParams = {
  organizationSlug: string
}

type TRelations = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

const Persons: React.FC<TRelations> = props => {
  const { organizationId, organization, updateOrganization } = props

  const { organizationSlug } = useParams<TParams>()

  const organizationPersonsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'personId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPersonRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'occupations',
        headerName: 'Occupations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.occupations, 'name')
        },
      },
      {
        field: 'setPersonOccupation',
        headerName: 'Set Occupation',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return <SetPersonOccupation person={params.row} />
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
              dialogTitle={
                'Do you really want to remove person from the organization?'
              }
              dialogDescription={'The person will remain in the database.'}
              dialogNegativeText={'No, keep the person'}
              dialogPositiveText={'Yes, remove person'}
              onDialogClosePositive={() => {
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
                    },
                    update: {
                      persons: {
                        disconnect: {
                          where: {
                            node: {
                              personId: params.row.personId,
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
    [organization, organizationId]
  )

  return (
    <>
      <OrganizationPersonsProvider>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="persons-content"
            id="persons-header"
          >
            <Typography>Persons</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <>
              <Toolbar
                disableGutters
                sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
              >
                <div />
                <div>
                  <AddPerson {...props} />

                  <LinkButton
                    startIcon={<CreateIcon />}
                    to={getAdminOrgPersonRoute(organizationSlug, 'new')}
                    target="_blank"
                  >
                    Create
                  </LinkButton>
                </div>
              </Toolbar>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={organizationPersonsColumns}
                  rows={setIdFromEntityId(organization?.persons, 'personId')}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </>
          </AccordionDetails>
        </Accordion>
        <PersonOccupationDialog organization={organization} />
      </OrganizationPersonsProvider>
    </>
  )
}

export { Persons }
