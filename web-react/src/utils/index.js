import React from 'react'
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

// const setArrayToString = (array, arrayOfFields) => {
//   let newArray = [...array]
//   arrayOfFields.forEach(fieldName => {
//     newArray = newArray.map(item => {
//       const { [fieldName]: data, ...restItem } = item
//       let value = ''

//       data.forEach((item, i) => {
//         value = `${item.name}${i !== data.length - 1 ? ', ' : ''}`
//       })

//       return { ...restItem, [fieldName]: value }
//     })
//   })

//   return newArray
// }

// export const prepareArrayForXGrid = (
//   array,
//   params = { addId: '', arrayToString: [] }
// ) => {
//   /*
//     params description:
//     addId: add id prop based on entityId. default: ''
//     arrayToString: array of field names which should be looks like string. default: []
// */
//   let newArray = setIdFromEntityId(array, params.addId)
//   newArray = setArrayToString(newArray, params.arrayToString)

//   return newArray
// }

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
