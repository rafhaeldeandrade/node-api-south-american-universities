import { UUIDGenerator } from '@/app/contracts/uuid-generator'
import { randomUUID } from 'crypto'

export class CryptoUUIDGeneratorAdapter implements UUIDGenerator {
  generateUUID() {
    return randomUUID()
  }
}
