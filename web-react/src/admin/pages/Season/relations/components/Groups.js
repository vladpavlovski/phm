import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
// import { getAdminGroupRoute } from '../../../../../routes'
// import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups {
      groupId
      name
      competition {
        name
      }
    }
  }
`

const Groups = props => {
  const { seasonId, season, updateSeason } = props
  const classes = useStyles()
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
  ] = useLazyQuery(GET_ALL_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddSeason = React.useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonGroupsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },
      // {
      //   field: 'groupId',
      //   headerName: 'Edit',
      //   width: 120,
      //   disableColumnMenu: true,
      //   renderCell: params => {
      //     return (
      //       <LinkButton
      //         startIcon={<AccountBox />}
      //         to={getAdminGroupRoute(params.value)}
      //       >
      //         Profile
      //       </LinkButton>
      //     )
      //   },
      // },
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
              dialogTitle={'Do you really want to detach group from season?'}
              dialogDescription={
                'Group will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                updateSeason({
                  variables: {
                    where: {
                      seasonId,
                    },
                    update: {
                      groups: {
                        disconnect: {
                          where: {
                            node: {
                              groupId: params.row?.groupId,
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

  const allGroupsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },

      {
        field: 'groupId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewGroup
              groupId={params.value}
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
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography className={classes.accordionFormTitle}>Groups</Typography>
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
              Add Group
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={seasonGroupsColumns}
            rows={setIdFromEntityId(season.groups, 'groupId')}
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
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new group`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allGroupsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.groups,
                      'groupId'
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

const ToggleNewGroup = props => {
  const { seasonId, groupId, season, updateSeason } = props
  const [isMember, setIsMember] = React.useState(
    !!season.groups.find(p => p.groupId === groupId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateSeason({
          variables: {
            where: {
              seasonId,
            },
            update: {
              groups: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            groupId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { groupId },
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
      name="groupMember"
      color="primary"
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewGroup.propTypes = {
  seasonId: PropTypes.string,
  groupId: PropTypes.string,
  group: PropTypes.object,
  updateSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Groups.propTypes = {
  seasonId: PropTypes.string,
  updateSeason: PropTypes.func,
  season: PropTypes.object,
}

export { Groups }
