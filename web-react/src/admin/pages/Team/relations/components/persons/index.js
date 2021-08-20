import React from 'react'

import PropTypes from 'prop-types'

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

const Persons = props => {
  const { teamId, team, updateTeam } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()

  const teamPersonsColumns = React.useMemo(
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to remove person from the team?'}
              dialogDescription={'The person will remain in the database.'}
              dialogNegativeText={'No, keep the person'}
              dialogPositiveText={'Yes, remove person'}
              onDialogClosePositive={() => {
                updateTeam({
                  variables: {
                    where: {
                      teamId,
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
    [team, teamId, organizationSlug]
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
                    updateTeam={updateTeam}
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
