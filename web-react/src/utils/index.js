import React from 'react'
import * as R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

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

export const arrayToStringList = (data, keyId, keyValue = 'name') =>
  data && (
    <span>
      {data.map((item, i) => (
        <React.Fragment key={item[keyId]}>
          <span>{`${item[keyValue]}`}</span>
          {i !== data.length - 1 && ', '}
        </React.Fragment>
      ))}
    </span>
  )

export const setIdFromEntityId = (array, idField) =>
  array.map(item => ({ ...item, id: item[idField] }))

export const getXGridValueFromArray = (array = [], fieldName) => {
  let value = ''
  array.forEach((item, i) => {
    value = `${item[fieldName]}${i !== array.length - 1 ? ', ' : ''}`
  })
  return value
}

export const getXGridHeight = (node, windowSize) => {
  const position = node && node.getBoundingClientRect()
  const result = windowSize.height - (position ? position.bottom : 0) - 100
  return result
}

export const showTimeAsMinutes = (minutes = 0) => {
  // Transform integer minutes into time format 00:00

  const time = dayjs().subtract(minutes, 'minute')
  const duration = dayjs.duration(dayjs().diff(time))

  return dayjs.utc(duration.asMilliseconds()).format('HH:mm')
}

export const decomposeDate = (date, fieldName) => ({
  [`${fieldName}Day`]: dayjs(date).date(),
  [`${fieldName}Month`]: dayjs(date).month() + 1,
  [`${fieldName}Year`]: dayjs(date).year(),
})

export const decomposeNumber = value =>
  !isNaN(parseInt(value)) && parseInt(value)

export const formatDate = date =>
  date === '0000-01-01' ? ' ' : dayjs(date).format('LL')

const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i

export const isValidUuid = uuid => uuidRegex.test(uuid)
