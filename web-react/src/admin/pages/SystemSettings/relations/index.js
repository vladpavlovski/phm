import React from 'react'
import PropTypes from 'prop-types'

import { useStyles } from '../../commonComponents/styled'
import { RulePack } from './components/RulePack'

const Relations = props => {
  const { systemSettingsId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <RulePack systemSettingsId={systemSettingsId} />
    </div>
  )
}

Relations.propTypes = { systemSettingsId: PropTypes.string }

export { Relations }
