import React, { useCallback, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

import { TextField, Autocomplete, Grid } from '@material-ui/core'

const GET_ORGANIZATIONS = gql`
  query getCompetitionOrganizations($where: CompetitionWhere) {
    competition: competitions(where: $where) {
      competitionId
      name
      organization {
        organizationId
        name
      }
    }
    organizations {
      organizationId
      name
    }
  }
`

const UPDATE_COMPETITION = gql`
  mutation updateCompetition(
    $where: CompetitionWhere
    $update: CompetitionUpdateInput
  ) {
    updateCompetitions(where: $where, update: $update) {
      competitions {
        competitionId
        name
        organization {
          organizationId
          name
        }
      }
    }
  }
`

const Organization = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [selectedOrganization, setSelectedOrganization] = useState(null)

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ORGANIZATIONS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      setSelectedOrganization(data?.competition?.[0]?.organization)
    },
  })

  const competition = queryData?.competition?.[0]

  const [updateCompetition] = useMutation(UPDATE_COMPETITION, {
    onCompleted: data => {
      enqueueSnackbar('Competition updated!', { variant: 'success' })
      enqueueSnackbar(
        `${competition.name} owned by ${data?.updateCompetitions?.competitions?.[0]?.name}!`,
        {
          variant: 'success',
        }
      )
      setSelectedOrganization(
        data?.updateCompetitions?.competitions?.[0]?.organization
      )
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
    }
  }, [])

  const handleOrganizationChange = useCallback(
    data => {
      updateCompetition({
        variables: {
          where: {
            competitionId,
          },
          update: {
            organization: {
              connect: {
                where: {
                  organizationId: data?.organizationId,
                },
              },
              disconnect: {
                where: {
                  node: {
                    organizationId:
                      selectedOrganization?.organizationId || null,
                  },
                },
              },
            },
          },
        },
      })
    },
    [competitionId, selectedOrganization]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="organizations-content"
        id="organizations-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Organization
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Autocomplete
                  id="organization-select"
                  name="organization"
                  value={selectedOrganization}
                  getOptionLabel={option => option.name}
                  // isOptionEqualToValue={(option, value) =>
                  //   option.organizationId === value.organizationId
                  // }
                  getOptionSelected={(option, value) =>
                    option.organizationId === value.organizationId
                  }
                  options={queryData.organizations}
                  onChange={(_, data) => {
                    handleOrganizationChange(data)
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.organizationId}>
                      {option.name}
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

Organization.propTypes = {
  competitionId: PropTypes.string,
}
export { Organization }
