export class InvalidParamError extends Error {
  constructor(paramName: string) {
    super(`${paramName} param is invalid.`)
    this.name = 'InvalidParamError'
  }
}
