import React from 'react'
import { MutationFunction } from '@apollo/client'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { getAdminOrgPersonRoute } from 'router/routes'
import { LinkButton } from 'components/LinkButton'
import { useStyles } from '../../../../commonComponents/styled'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { setIdFromEntityId, getXGridValueFromArray, createCtx } from 'utils'
import { AddPerson } from './AddPerson'
import {
  SetPersonOccupation,
  PersonOccupationDialog,
} from './SetPersonOccupation'
import placeholderPerson from 'img/placeholderPerson.jpg'
import { Team, Person } from 'utils/types'

type TTeamPerson = {
  personOccupationDialogOpen: boolean
  personData: Person | null
}

const [ctx, TeamPersonsProvider] = createCtx<TTeamPerson>({
  personOccupationDialogOpen: false,
  personData: null as unknown as Person,
})

export const TeamPersonsContext = ctx

type TPersons = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

type TPersonsParams = {
  organizationSlug: string
}

const Persons: React.FC<TPersons> = props => {
  const { teamId, team, updateTeam } = props

  const classes = useStyles()
  const { organizationSlug } = useParams<TPersonsParams>()

  const teamPersonsColumns = React.useMemo<GridColumns>(
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
                <DataGridPro
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
        <PersonOccupationDialog team={team} />
      </TeamPersonsProvider>
    </>
  )
}

export { Persons }