import { randomUUID } from 'crypto'

import { UUIDGenerator } from '@/app/contracts/uuid-generator'

export class CryptoUUIDGeneratorAdapter implements UUIDGenerator {
  generateUUID() {
    return randomUUID()
  }
}
