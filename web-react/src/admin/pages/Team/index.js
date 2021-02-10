import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
// useWatch

import 'react-imported-component/macro'
import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFColorpicker } from '../../../components/RHFColorpicker'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { dateExist } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_TEAMS, getAdminTeamRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

const READ_TEAM = gql`
  query getTeam($teamId: ID!) {
    team: Team(teamId: $teamId) {
      teamId
      name
      fullName
      nick
      short
      status
      externalId
      logoUrl
      primaryColor
      secondaryColor
      tertiaryColor
      foundDate {
        formatted
      }
      jerseys {
        jerseyNoId
        number
      }
      players {
        playerId
        name
      }
    }
  }
`

const MERGE_TEAM = gql`
  mutation mergeTeam(
    $teamId: ID!
    $name: String
    $fullName: String
    $nick: String
    $short: String
    $status: String
    $externalId: String
    $logoUrl: String
    $primaryColor: String
    $secondaryColor: String
    $tertiaryColor: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeTeam: MergeTeam(
      teamId: $teamId
      name: $name
      fullName: $fullName
      nick: $nick
      short: $short
      status: $status
      externalId: $externalId
      logoUrl: $logoUrl
      primaryColor: $primaryColor
      secondaryColor: $secondaryColor
      tertiaryColor: $tertiaryColor
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      teamId
    }
  }
`

const DELETE_TEAM = gql`
  mutation deleteTeam($teamId: ID!) {
    deleteTeam: DeleteTeam(teamId: $teamId) {
      teamId
    }
  }
`

const Team = () => {
  const history = useHistory()
  const classes = useStyles()
  const { teamId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_TEAM, {
    fetchPolicy: 'network-only',
    variables: { teamId },
    skip: teamId === 'new',
  })

  const [
    mergeTeam,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_TEAM, {
    onCompleted: data => {
      if (teamId === 'new') {
        const newId = data.mergeTeam.teamId
        history.replace(getAdminTeamRoute(newId))
      }
    },
  })

  const [
    deleteTeam,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_TEAM, {
    onCompleted: () => {
      history.push(ADMIN_TEAMS)
    },
  })

  const teamData = useMemo(() => (queryData && queryData.team[0]) || {}, [
    queryData,
  ])

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          teamId: teamId === 'new' ? uuidv4() : teamId,
          foundDateDay: dayjs(foundDate).date(),
          foundDateMonth: dayjs(foundDate).month() + 1,
          foundDateYear: dayjs(foundDate).year(),
        }

        mergeTeam({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [teamId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(teamData || teamId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationErrorMerge && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Team'}</Title>
                    </div>
                    <div>
                      <ButtonSave
                        loading={mutationLoadingMerge}
                        className={classes.submit}
                      />
                      {teamId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          className={classes.submit}
                          onClick={() => {
                            deleteTeam({ variables: { teamId } })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.name}
                        control={control}
                        name="name"
                        label="Name"
                        required
                        fullWidth
                        variant="standard"
                        error={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.fullName}
                        control={control}
                        name="fullName"
                        label="Full name"
                        fullWidth
                        variant="standard"
                        error={errors.fullName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.nick}
                        control={control}
                        name="nick"
                        label="Nick"
                        fullWidth
                        variant="standard"
                        error={errors.nick}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.short}
                        control={control}
                        name="short"
                        label="Short"
                        fullWidth
                        variant="standard"
                        error={errors.short}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.status}
                        control={control}
                        name="status"
                        label="Status"
                        fullWidth
                        variant="standard"
                        error={errors.status}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.externalId}
                        control={control}
                        name="externalId"
                        label="External Id"
                        fullWidth
                        variant="standard"
                        error={errors.externalId}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.logoUrl}
                        control={control}
                        name="logoUrl"
                        label="Logo URL"
                        fullWidth
                        variant="standard"
                        error={errors.logoUrl}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      logo
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFColorpicker
                        name="primaryColor"
                        label="Primary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.primaryColor}
                        error={errors.primaryColor}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFColorpicker
                        name="secondaryColor"
                        label="Secondary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.secondaryColor}
                        error={errors.secondaryColor}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFColorpicker
                        name="tertiaryColor"
                        label="Tertiary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.tertiaryColor}
                        error={errors.tertiaryColor}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFDatepicker
                        fullWidth
                        control={control}
                        variant="standard"
                        name="foundDate"
                        label="Found Date"
                        id="foundDate"
                        openTo="year"
                        disableFuture
                        inputFormat={'DD/MM/YYYY'}
                        views={['year', 'month', 'date']}
                        defaultValue={
                          teamData.foundDate &&
                          dateExist(teamData.foundDate.formatted)
                            ? teamData.foundDate.formatted
                            : null
                        }
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <div className={classes.accordionWrapper}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="manager-content"
                  id="manager-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Manager
                  </Typography>
                  <Typography className={classes.accordionFormDescription}>
                    Manager info
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Manager info</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="players-content"
                  id="players-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Players
                  </Typography>
                  <Typography className={classes.accordionFormDescription}>
                    Basic info about players
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Players Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="positions-content"
                  id="positions-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Positions
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>positions Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="coaches-content"
                  id="coaches-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Coaches
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>coaches Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="coachAssistants-content"
                  id="coachAssistants-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Coach Assistants
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>coachAssistants Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="medics-content"
                  id="medics-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Medics
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>medics Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="supporters-content"
                  id="supporters-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Supporters
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>supporters Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="lineups-content"
                  id="lineups-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Lineups
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>lineups Table</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="awards-content"
                  id="awards-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Awards
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>awards Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="sponsors-content"
                  id="sponsors-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Sponsors
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>sponsors Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="transfers-content"
                  id="transfers-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Transfers
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>transfers Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="associations-content"
                  id="associations-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Associations
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>associations Table</Typography>
                </AccordionDetails>
              </Accordion>
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
                  <Typography>competitions Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="weseasonsar-content"
                  id="seasons-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Seasons
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>seasons Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="phases-content"
                  id="phases-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Phases
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>phases Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="groups-content"
                  id="groups-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Groups
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>groups Table</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="jerseys-content"
                  id="jerseys-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Jerseys
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>jerseys Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="achievements-content"
                  id="achievements-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Achievements
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>achievements Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="wear-content"
                  id="wear-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Wear
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>wear Table</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="media-content"
                  id="media-header"
                >
                  <Typography className={classes.accordionFormTitle}>
                    Media
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>media Table</Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          </form>
        )}
    </Container>
  )
}

export { Team as default }
