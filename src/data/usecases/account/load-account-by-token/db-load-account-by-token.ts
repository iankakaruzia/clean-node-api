import { AccountModel, LoadAccountByToken, Decrypter, LoadAccountByTokenRepository } from './db-load-account-by-token-protocols'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor (
    private readonly decrypter: Decrypter,
    private readonly loadAccountByToken: LoadAccountByTokenRepository
  ) {}

  async load (accessToken: string, role?: string): Promise<AccountModel> {
    let token: string

    try {
      token = await this.decrypter.decrypt(accessToken)
    } catch (error) {
      return null
    }

    if (token) {
      const account = await this.loadAccountByToken.loadByToken(accessToken, role)
      if (account) {
        return account
      }
    }

    return null
  }
}