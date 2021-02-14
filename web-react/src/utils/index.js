import * as R from 'ramda'
import { v4 as uuidv4 } from 'uuid'

export const capitalize = R.converge(R.concat, [
  R.compose(R.toUpper, R.head),
  R.tail,
])

export const toTitleCase = R.compose(
  R.join(' '),
  R.map(capitalize),
  R.split(' ')
)

export const dateExist = date => date !== '0000-01-01'

export const checkId = id => (id === 'new' ? uuidv4() : id)
