import { object, string, number, date, boolean } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  internalId: number()
    .typeError('Player Id must be a number')
    .integer('Player Id must be an integer')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : parseInt(value)
    ),
  birthday: date().nullable(),
  startLeagueDate: date().nullable(),
  isActive: boolean().nullable(),
  country: string(),
  city: string(),
  position: string(),
  stick: string(),
  height: string(),
  weight: string(),
  gender: string(),
  jersey: number()
    .typeError('Jersey must be a number')
    .integer('Jersey must be an integer')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : parseInt(value)
    ),
})
