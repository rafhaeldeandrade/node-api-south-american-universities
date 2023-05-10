import { Hasher } from '@/app/contracts/hasher'
import argon2 from 'argon2'

export class Argon2HasherAdapter implements Hasher {
  constructor(
    private readonly argon2Options?: argon2.Options & { raw?: false }
  ) {}

  async hash(value: string): Promise<string> {
    return await argon2.hash(value, this.argon2Options)
  }
}
