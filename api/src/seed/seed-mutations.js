const fetch = require('node-fetch')
const parse = require('csv-parse/lib/sync')
const { gql } = require('@apollo/client')

export const getSeedMutations = async () => {
  const res = await fetch(
    'https://cdn.neo4jlabs.com/data/grandstack_businesses.csv'
  )
  const body = await res.text()
  const records = parse(body, { columns: true })
  const mutations = generateMutations(records)

  return mutations
}

const generateMutations = records => {
  return records.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'latitude' || k === 'longitude' || k === 'reviewStars') {
        rec[k] = parseFloat(rec[k])
      } else if (k === 'reviewDate') {
        const dateParts = rec[k].split('-')
        rec['year'] = parseInt(dateParts[0])
        rec['month'] = parseInt(dateParts[1])
        rec['day'] = parseInt(dateParts[2])
      } else if (k === 'categories') {
        rec[k] = rec[k].split(',')
      }
    })

    return {
      mutation: gql`
        mutation mergeReviews(
          $userId: ID!
          $userName: String
          $businessId: ID!
          $businessName: String
          $businessCity: String
          $businessState: String
          $businessAddress: String
          $latitude: Float
          $longitude: Float
          $reviewId: ID!
          $reviewText: String
          $year: Int
          $month: Int
          $day: Int
          $reviewStars: Float
          $categories: [String!]!
        ) {
          user: MergeUser(userId: $userId, name: $userName) {
            userId
          }
          business: MergeBusiness(
            businessId: $businessId
            name: $businessName
            address: $businessAddress
            city: $businessCity
            state: $businessState
            location: { latitude: $latitude, longitude: $longitude }
          ) {
            businessId
          }
          review: MergeReview(
            reviewId: $reviewId
            text: $reviewText
            date: { year: $year, month: $month, day: $day }
            stars: $reviewStars
          ) {
            reviewId
          }
          reviewUser: MergeReviewUser(
            from: { userId: $userId }
            to: { reviewId: $reviewId }
          ) {
            from {
              userId
            }
          }
          reviewBusiness: MergeReviewBusiness(
            from: { reviewId: $reviewId }
            to: { businessId: $businessId }
          ) {
            from {
              reviewId
            }
          }
          businessCategories: mergeBusinessCategory(
            categories: $categories
            businessId: $businessId
          ) {
            businessId
          }
        }
      `,
      variables: rec,
    }
  })
}

export const types = `
type User {
  userId: ID!
  name: String
  reviews: [Review] @relation(name: "WROTE", direction: "OUT")
  avgStars: Float
    @cypher(
      statement: "MATCH (this)-[:WROTE]->(r:Review) RETURN toFloat(avg(r.stars))"
    )
  numReviews: Int
    @cypher(statement: "MATCH (this)-[:WROTE]->(r:Review) RETURN COUNT(r)")
  recommendations(first: Int = 3): [Business]
    @cypher(
      statement: "MATCH (this)-[:WROTE]->(r:Review)-[:REVIEWS]->(:Business)<-[:REVIEWS]-(:Review)<-[:WROTE]-(:User)-[:WROTE]->(:Review)-[:REVIEWS]->(rec:Business) WHERE NOT EXISTS( (this)-[:WROTE]->(:Review)-[:REVIEWS]->(rec) ) WITH rec, COUNT(*) AS num ORDER BY num DESC LIMIT $first RETURN rec"
    )
}

type Business {
  businessId: ID!
  name: String!
  address: String
  city: String
  state: String
  location: Point
  avgStars: Float
    @cypher(
      statement: "MATCH (this)<-[:REVIEWS]-(r:Review) RETURN coalesce(avg(r.stars),0.0)"
    )
  reviews: [Review] @relation(name: "REVIEWS", direction: "IN")
  categories: [Category] @relation(name: "IN_CATEGORY", direction: "OUT")
}

type Review {
  reviewId: ID!
  stars: Float
  text: String
  date: Date
  business: Business @relation(name: "REVIEWS", direction: "OUT")
  user: User @relation(name: "WROTE", direction: "IN")
}

type Category {
  name: ID!
  businesses: [Business] @relation(name: "IN_CATEGORY", direction: "IN")
}

type RatingCount {
  stars: Float!
  count: Int!
}

type Mutation {
  mergeBusinessCategory(categories: [String!]!, businessId: ID!): Business
    @cypher(
      statement: "MATCH (b:Business {businessId: $businessId}) UNWIND $categories AS cat MERGE (c:Category {name: cat}) MERGE (b)-[:IN_CATEGORY]->(c) RETURN b"
    )
}

type Query {
  userCount: Int! @cypher(statement: "MATCH (u:User) RETURN COUNT(u)")
  ratingsCount: [RatingCount]
    @cypher(
      statement: "MATCH (r:Review) WITH r.stars AS stars, COUNT(*) AS count ORDER BY stars RETURN {stars: stars, count: count}"
    )
}

`
