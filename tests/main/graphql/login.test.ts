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

    test('Should return UnauthorizedError on invalid credentials', async () => {
      const { query } = createTestClient({ apolloServer })

      const res: any = await query(loginQuery, {
        variables: {
          email: 'ianka@mail.com',
          password: '12345'
        }
      })

      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Unauthorized')
    })
  })

  describe('Signup Mutation', () => {
    const signupMutation = gql`
      mutation signUp ($name: String!, $email: String!, $password: String!, $passwordConfirmation: String!) {
        signUp (name: $name, email: $email, password: $password, passwordConfirmation: $passwordConfirmation) {
          name
          accessToken
        }
      }
    `
    test('Should return an Account on valid data', async () => {
      const { mutate } = createTestClient({ apolloServer })

      const res: any = await mutate(signupMutation, {
        variables: {
          name: 'Ianka',
          email: 'ianka@mail.com',
          password: '12345',
          passwordConfirmation: '12345'
        }
      })

      expect(res.data.signUp.accessToken).toBeTruthy()
      expect(res.data.signUp.name).toBe('Ianka')
    })
  })
})
