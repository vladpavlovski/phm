import { date, object, string } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  type: string(),
  foreignId: string(),
  info: string(),
  description: string(),
  short: string(),
  startDate: date().nullable().required('Start date is required'),
  endDate: date().nullable().required('End date is required'),
  startTime: date().nullable(),
  endTime: date().nullable(),
  gameVenue: object()
    .shape({
      name: string(),
      venueId: string(),
      __typename: string(),
    })
    .nullable(),
  headline: string(),
  perex: string(),
  body: string(),
  flickrAlbum: string(),
  paymentHost: string(),
  paymentGuest: string(),
  paymentTimekeeper: string(),
  paymentReferee: string(),
  price: string().nullable(),
})
