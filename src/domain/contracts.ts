export interface UseCase<Input, Output> {
  execute(data: Input): Promise<Output>
}
