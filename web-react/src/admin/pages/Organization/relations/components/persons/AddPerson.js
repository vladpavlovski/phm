import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import AddIcon from '@material-ui/icons/Add'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'

import { GET_ORGANIZATION } from '../../../index'

export const GET_ALL_PERSONS = gql`
  query getPersons {
    persons: Person {
      personId
      name
      firstName
      lastName
      name
      organizations {
        organizationId
        name
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

const MERGE_ORGANIZATION_PERSON = gql`
  mutation mergeOrganizationPerson($organizationId: ID!, $personId: ID!) {
    organizationPerson: MergeOrganizationPersons(
      from: { organizationId: $organizationId }
      to: { personId: $personId }
    ) {
      to {
        personId
        name
        firstName
        lastName
        occupations {
          occupationId
          name
        }
      }
    }
  }
`

const AddPerson = props => {
  const { organizationId, organization, removeOrganizationPerson } = props

  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [openAddPerson, setOpenAddPerson] = useState(false)

  const handleCloseAddPerson = useCallback(() => {
    setOpenAddPerson(false)
  }, [])

  const [
    getAllPersons,
    {
      loading: queryAllPersonsLoading,
      error: queryAllPersonsError,
      data: queryAllPersonsData,
    },
  ] = useLazyQuery(GET_ALL_PERSONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [mergeOrganizationPerson] = useMutation(MERGE_ORGANIZATION_PERSON, {
    update(cache, { data: { organizationPerson } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_ORGANIZATION,
          variables: {
            organizationId,
          },
        })
        const existingPersons = queryResult?.organization[0].persons
        const newPerson = organizationPerson.to
        const updatedResult = {
          organization: [
            {
              ...queryResult?.organization[0],
              persons: [newPerson, ...existingPersons],
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
        `${data.organizationPerson.to.name} added to ${organization.name}!`,
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

  const handleOpenAddPerson = useCallback(() => {
    if (!queryAllPersonsData) {
      getAllPersons()
    }
    setOpenAddPerson(true)
  }, [])

  const allPersonsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'organizations',
        headerName: 'Organizations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.organizations, 'name')
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
        field: 'personId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPerson
              personId={params.value}
              organizationId={organizationId}
              organization={organization}
              merge={mergeOrganizationPerson}
              remove={removeOrganizationPerson}
            />
          )
        },
      },
    ],
    [organization]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPerson}
        variant={'outlined'}
        size="small"
        className={classes.submit}
        startIcon={<AddIcon />}
      >
        Add Person
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPerson}
        onClose={handleCloseAddPerson}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPersonsLoading && !queryAllPersonsError && <Loader />}
        {queryAllPersonsError && !queryAllPersonsLoading && (
          <Error message={queryAllPersonsError.message} />
        )}
        {queryAllPersonsData &&
          !queryAllPersonsLoading &&
          !queryAllPersonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new person to ${
                organization && organization.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allPersonsColumns}
                    rows={setIdFromEntityId(
                      queryAllPersonsData.persons,
                      'personId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPersonsLoading}
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
              handleCloseAddPerson()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const ToggleNewPerson = props => {
  const { personId, organizationId, organization, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!organization.persons.find(p => p.personId === personId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    organizationId,
                    personId,
                  },
                })
              : merge({
                  variables: {
                    organizationId,
                    personId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="organizationMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewPerson.propTypes = {
  personId: PropTypes.string,
  organizationId: PropTypes.string,
  organization: PropTypes.object,
  removeOrganizationPerson: PropTypes.func,
  mergeOrganizationPerson: PropTypes.func,
}

AddPerson.propTypes = {
  organizationId: PropTypes.string,
}

export { AddPerson }
