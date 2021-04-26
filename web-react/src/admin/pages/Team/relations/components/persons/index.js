import React, { useMemo } from 'react'
import { gql, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

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
import { getAdminPersonRoute } from '../../../../../../routes'
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
import { TeamPersonsProvider } from './context/Provider'
import placeholderPerson from '../../../../../../img/placeholderPerson.jpg'

import { GET_TEAM } from '../../../index'

const REMOVE_TEAM_PERSON = gql`
  mutation removeTeamPerson($teamId: ID!, $personId: ID!) {
    teamPerson: RemoveTeamPersons(
      from: { teamId: $teamId }
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
  const { teamId, team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [removeTeamPerson, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_TEAM_PERSON,
    {
      update(cache, { data: { teamPerson } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAM,
            variables: {
              teamId,
            },
          })
          const updatedPersons = queryResult.team[0].persons.filter(
            p => p.personId !== teamPerson.to.personId
          )

          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                persons: updatedPersons,
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
        enqueueSnackbar(
          `${data.teamPerson.to.name} removed from ${team.name}!`,
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

  const teamPersonsColumns = useMemo(
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
              to={getAdminPersonRoute(params.value)}
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
              dialogTitle={'Do you really want to remove person from the team?'}
              dialogDescription={'The person will remain in the database.'}
              dialogNegativeText={'No, keep the person'}
              dialogPositiveText={'Yes, remove person'}
              onDialogClosePositive={() => {
                removeTeamPerson({
                  variables: {
                    teamId,
                    personId: params.row.personId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [team, teamId]
  )

  return (
    <>
      <TeamPersonsProvider>
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
                    team={team}
                    teamId={teamId}
                    removeTeamPerson={removeTeamPerson}
                  />

                  <LinkButton
                    startIcon={<CreateIcon />}
                    to={getAdminPersonRoute('new')}
                    target="_blank"
                  >
                    Create
                  </LinkButton>
                </div>
              </Toolbar>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={teamPersonsColumns}
                  rows={setIdFromEntityId(team?.persons, 'personId')}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </>
          </AccordionDetails>
        </Accordion>
        <PersonOccupationDialog teamId={teamId} team={team} />
      </TeamPersonsProvider>
    </>
  )
}

Persons.propTypes = {
  teamId: PropTypes.string,
}

export { Persons }
