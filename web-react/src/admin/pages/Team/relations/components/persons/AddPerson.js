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
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'

import { GET_TEAM } from '../../../index'

export const GET_ALL_PERSONS = gql`
  query getPersons {
    persons: Person {
      personId
      name
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

const MERGE_TEAM_PERSON = gql`
  mutation mergeTeamPerson($teamId: ID!, $personId: ID!) {
    teamPerson: MergeTeamPersons(
      from: { teamId: $teamId }
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
  const { teamId, team, removeTeamPerson } = props

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

  const [mergeTeamPerson] = useMutation(MERGE_TEAM_PERSON, {
    update(cache, { data: { teamPerson } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAM,
          variables: {
            teamId,
          },
        })
        const existingPersons = queryResult?.team[0].persons
        const newPerson = teamPerson.to
        const updatedResult = {
          team: [
            {
              ...queryResult?.team[0],
              persons: [newPerson, ...existingPersons],
            },
          ],
        }
        cache.writeQuery({
          query: GET_TEAM,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(`${data.teamPerson.to.name} added to ${team.name}!`, {
        variant: 'success',
      })
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
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
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
              teamId={teamId}
              team={team}
              merge={mergeTeamPerson}
              remove={removeTeamPerson}
            />
          )
        },
      },
    ],
    [team]
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
                team && team.name
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
  const { personId, teamId, team, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!team.persons.find(p => p.personId === personId)
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
                    teamId,
                    personId,
                  },
                })
              : merge({
                  variables: {
                    teamId,
                    personId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewPerson.propTypes = {
  personId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamPerson: PropTypes.func,
  mergeTeamPerson: PropTypes.func,
}

AddPerson.propTypes = {
  teamId: PropTypes.string,
}

export { AddPerson }
