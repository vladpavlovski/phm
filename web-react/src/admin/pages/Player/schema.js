import { object, string, date } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  externalId: string(),
  birthday: date().nullable(),
  activityStatus: string(),
  country: string(),
  city: string(),
  stick: string(),
  height: string(),
  weight: string(),
  gender: string(),
})
