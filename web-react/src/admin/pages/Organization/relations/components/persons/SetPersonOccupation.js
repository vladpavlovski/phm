import React, { useCallback, useState, useMemo, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
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
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../../utils'
import { GET_ORGANIZATION } from '../../../index'
import OrganizationPersonsContext from './context'

const MERGE_PERSON_OCCUPATION = gql`
  mutation mergePersonOccupation($personId: ID!, $occupationId: ID!) {
    mergePersonOccupation: MergePersonOccupations(
      from: { personId: $personId }
      to: { occupationId: $occupationId }
    ) {
      from {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
      to {
        occupationId
        name
      }
    }
  }
`

const REMOVE_PERSON_OCCUPATION = gql`
  mutation removePersonOccupation($personId: ID!, $occupationId: ID!) {
    removePersonOccupation: RemovePersonOccupations(
      from: { personId: $personId }
      to: { occupationId: $occupationId }
    ) {
      from {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
      to {
        occupationId
        name
      }
    }
  }
`

export const SetPersonOccupation = props => {
  const { person } = props
  const classes = useStyles()

  const { setPersonOccupationDialogOpen, setPersonData } = useContext(
    OrganizationPersonsContext
  )

  return (
    <Button
      type="button"
      onClick={() => {
        setPersonData(person)
        setPersonOccupationDialogOpen(true)
      }}
      variant={'outlined'}
      size="small"
      className={classes.submit}
      startIcon={<AddIcon />}
    >
      Set Occupation
    </Button>
  )
}

export const PersonOccupationDialog = props => {
  const { organizationId, organization } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    personOccupationDialogOpen,
    setPersonOccupationDialogOpen,
    personData: person,
    setPersonData,
  } = useContext(OrganizationPersonsContext)

  const handleCloseDialog = useCallback(() => {
    setPersonOccupationDialogOpen(false)
    setPersonData(null)
  }, [])

  const [mergePersonOccupation] = useMutation(MERGE_PERSON_OCCUPATION, {
    update(cache, { data: { mergePersonOccupation } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_ORGANIZATION,
          variables: {
            organizationId,
          },
        })

        const existingData = queryResult?.organization?.[0].persons
        const updatedPerson = mergePersonOccupation.from

        let updatedData = []
        if (existingData.find(ed => ed.personId === updatedPerson.personId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.personId === updatedPerson.personId ? updatedPerson : ed
          )
        }

        const updatedResult = {
          organization: [
            {
              ...queryResult.organization[0],
              persons: updatedData,
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
        `${data.mergePersonOccupation.from.name} now is ${data.mergePersonOccupation.to.name} for ${organization?.name}!`,
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

  const [removePersonOccupation] = useMutation(REMOVE_PERSON_OCCUPATION, {
    update(cache, { data: { removePersonOccupation } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_ORGANIZATION,
          variables: {
            organizationId,
          },
        })
        const existingData = queryResult?.organization?.[0].persons
        const updatedPerson = removePersonOccupation.from

        let updatedData = []
        if (existingData.find(ed => ed.personId === updatedPerson.personId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.personId === updatedPerson.personId ? updatedPerson : ed
          )
        }

        const updatedResult = {
          organization: [
            {
              ...queryResult.organization[0],
              persons: updatedData,
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
        `${data?.removePersonOccupation?.from?.name} not anymore ${data?.removePersonOccupation?.to?.name} for ${organization?.name}!`,
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

  const organizationOccupationsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'occupationId',
        headerName: 'Has Occupation',
        width: 250,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleOccupation
              occupationId={params.value}
              person={person}
              merge={mergePersonOccupation}
              remove={removePersonOccupation}
            />
          )
        },
      },
    ],
    [person]
  )
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={personOccupationDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {organization?.occupations && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${person?.name} occupations for ${organization?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={organizationOccupationsColumns}
                rows={setIdFromEntityId(
                  organization?.occupations,
                  'occupationId'
                )}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button onClick={handleCloseDialog}>{'Done'}</Button>
      </DialogActions>
    </Dialog>
  )
}

const ToggleOccupation = props => {
  const { occupationId, person, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!person?.occupations?.find(p => p.occupationId === occupationId)
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
                    occupationId,
                    personId: person.personId,
                  },
                })
              : merge({
                  variables: {
                    occupationId,
                    personId: person.personId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="organizationMember"
          color="primary"
        />
      }
      label={isMember ? 'In occupation' : 'No occupation'}
    />
  )
}
ToggleOccupation.propTypes = {
  personId: PropTypes.string,
  organizationId: PropTypes.string,
  organization: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

SetPersonOccupation.propTypes = {
  organizationId: PropTypes.string,
}