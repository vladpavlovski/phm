import React from 'react'

import { useStyles } from '../../commonComponents/styled'
import { RulePack } from './components/RulePack'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <RulePack {...props} />
    </div>
  )
}

export { Relations }
