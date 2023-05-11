import argon2 from 'argon2'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { Hasher } from '@/app/contracts/hasher'

export class Argon2HasherAdapter implements Hasher, HashComparer {
  constructor(
    private readonly argon2Options?: argon2.Options & { raw?: false }
  ) {}

  async hash(value: string): Promise<string> {
    return await argon2.hash(value, this.argon2Options)
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, value, this.argon2Options)
  }
}
