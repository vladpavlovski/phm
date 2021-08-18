import React, { useMemo } from 'react'
import { gql, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { getAdminOrgPersonRoute } from '../../../../../../routes'
import { LinkButton } from '../../../../../../components/LinkButton'
// import { Loader } from '../../../../../../components/Loader'
// import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'
import { AddPerson } from './AddPerson'
import {
  SetPersonOccupation,
  PersonOccupationDialog,
} from './SetPersonOccupation'
import { OrganizationPersonsProvider } from './context/Provider'
import placeholderPerson from '../../../../../../img/placeholderPerson.jpg'

import { GET_ORGANIZATION } from '../../../index'

const REMOVE_ORGANIZATION_PERSON = gql`
  mutation removeOrganizationPerson($organizationId: ID!, $personId: ID!) {
    organizationPerson: RemoveOrganizationPersons(
      from: { organizationId: $organizationId }
      to: { personId: $personId }
    ) {
      to {
        personId
        firstName
        lastName
        name
      }
    }
  }
`

const Persons = props => {
  const { organizationId, organization } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [removeOrganizationPerson, { loading: mutationLoadingRemove }] =
    useMutation(REMOVE_ORGANIZATION_PERSON, {
      update(cache, { data: { organizationPerson } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_ORGANIZATION,
            variables: {
              organizationId,
            },
          })
          const updatedPersons = queryResult.organization[0].persons.filter(
            p => p.personId !== organizationPerson.to.personId
          )

          const updatedResult = {
            organization: [
              {
                ...queryResult.organization[0],
                persons: updatedPersons,
              },
            ],
          }
          cache.writeQuery({
            query: GET_ORGANIZATION,
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
          `${data.organizationPerson.to.name} removed from ${organization.name}!`,
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

  const organizationPersonsColumns = useMemo(
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to remove person from the organization?'
              }
              dialogDescription={'The person will remain in the database.'}
              dialogNegativeText={'No, keep the person'}
              dialogPositiveText={'Yes, remove person'}
              onDialogClosePositive={() => {
                removeOrganizationPerson({
                  variables: {
                    organizationId,
                    personId: params.row.personId,
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
            <Typography className={classes.accordionFormTitle}>
              Persons
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div />
                <div>
                  <AddPerson
                    organization={organization}
                    organizationId={organizationId}
                    removeOrganizationPerson={removeOrganizationPerson}
                  />

                  <LinkButton
                    startIcon={<CreateIcon />}
                    to={getAdminOrgPersonRoute(organizationSlug, 'new')}
                    target="_blank"
                  >
                    Create
                  </LinkButton>
                </div>
              </Toolbar>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
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
        <PersonOccupationDialog
          organizationId={organizationId}
          organization={organization}
        />
      </OrganizationPersonsProvider>
    </>
  )
}

Persons.propTypes = {
  organizationId: PropTypes.string,
}

export { Persons }
