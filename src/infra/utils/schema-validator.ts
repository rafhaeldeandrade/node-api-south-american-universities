import { z } from 'zod'
import { SchemaValidator } from '@/infra/contracts'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { MissingParamError } from '@/app/errors/missing-param'

export class ZodSchemaValidator implements SchemaValidator {
  constructor(private readonly schema: z.ZodTypeAny) {}

  async validate(input: any): Promise<Error | null> {
    const result = await this.schema.safeParseAsync(input)
    if (!result.success) {
      const issueCode = result.error.issues[0].code
      const issueMessage = result.error.issues[0].message
      const invalidParam = result.error.issues[0].path[0].toString()
      const invalidParams = [
        'invalid_type',
        'invalid_string',
        'invalid_date',
        'too_small',
        'too_big',
      ]
      if (invalidParams.includes(issueCode)) {
        if (issueMessage === 'Required') {
          return new MissingParamError(invalidParam)
        }
        return new InvalidParamError(invalidParam)
      }
    }
    return null
  }
}
