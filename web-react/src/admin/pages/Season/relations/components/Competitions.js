import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import { useParams } from 'react-router-dom'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions {
      competitionId
      name
    }
  }
`

const Competitions = props => {
  const { seasonId, season, updateSeason } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddSeason, setOpenAddSeason] = React.useState(false)

  const handleCloseAddSeason = React.useCallback(() => {
    setOpenAddSeason(false)
  }, [])

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_COMPETITIONS)

  const handleOpenAddSeason = React.useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonCompetitionsColumns = React.useMemo(
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
                'Do you really want to detach competition from season?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                updateSeason({
                  variables: {
                    where: {
                      seasonId,
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
    []
  )

  const allCompetitionsColumns = React.useMemo(
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
          return (
            <ToggleNewCompetition
              competitionId={params.value}
              seasonId={seasonId}
              season={season}
              updateSeason={updateSeason}
            />
          )
        },
      },
    ],
    [season]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              onClick={handleOpenAddSeason}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add Competition
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <XGrid
            columns={seasonCompetitionsColumns}
            rows={setIdFromEntityId(season.competitions, 'competitionId')}
            loading={queryAllSeasonsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSeason}
        onClose={handleCloseAddSeason}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSeasonsLoading && !queryAllSeasonsError && <Loader />}
        {queryAllSeasonsError && !queryAllSeasonsLoading && (
          <Error message={queryAllSeasonsError.message} />
        )}
        {queryAllSeasonsData &&
          !queryAllSeasonsLoading &&
          !queryAllSeasonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new competition`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.competitions,
                      'competitionId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSeasonsLoading}
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
              handleCloseAddSeason()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewCompetition = props => {
  const { seasonId, competitionId, season, updateSeason } = props
  const [isMember, setIsMember] = React.useState(
    !!season.competitions.find(p => p.competitionId === competitionId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            updateSeason({
              variables: {
                where: {
                  seasonId,
                },
                update: {
                  competitions: {
                    ...(isMember
                      ? {
                          disconnect: {
                            where: {
                              node: {
                                competitionId,
                              },
                            },
                          },
                        }
                      : {
                          connect: {
                            where: {
                              node: { competitionId },
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
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewCompetition.propTypes = {
  seasonId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  updateSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Competitions.propTypes = {
  seasonId: PropTypes.string,
  updateSeason: PropTypes.func,
  season: PropTypes.object,
}

export { Competitions }
