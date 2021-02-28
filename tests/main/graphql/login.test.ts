import { Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { createTestClient } from 'apollo-server-integration-testing'
import { ApolloServer, gql } from 'apollo-server-express'

import { MongoHelper } from '@/infra/db'
import { makeApolloServer } from './helpers'

let accountCollection: Collection

let apolloServer: ApolloServer

describe('Login Graphql', () => {
  beforeAll(async () => {
    apolloServer = makeApolloServer()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Login Query', () => {
    const loginQuery = gql`
      query login ($email: String!, $password: String!) {
        login (email: $email, password: $password) {
          name
          accessToken
        }
      }
    `
    test('Should return an Account on valid credentials', async () => {
      const password = await hash('12345', 12)
      await accountCollection.insertOne({
        name: 'Ianka',
        email: 'ianka@mail.com',
        password
      })

      const { query } = createTestClient({ apolloServer })

      const res: any = await query(loginQuery, { variables: { email: 'ianka@mail.com', password: '12345' } })

      expect(res.data.login.accessToken).toBeTruthy()
      expect(res.data.login.name).toBe('Ianka')
    })
  })
})
