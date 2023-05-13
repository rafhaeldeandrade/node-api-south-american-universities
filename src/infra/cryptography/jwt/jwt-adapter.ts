import jwt from 'jsonwebtoken'

import { Encrypter } from '@/app/contracts/encrypter'

export class JwtAdapter implements Encrypter {
  constructor(private readonly jwtSecret: string) {}

  encrypt(value: string): string {
    return jwt.sign(value, this.jwtSecret)
  }
}
