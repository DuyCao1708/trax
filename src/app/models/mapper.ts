export interface Mapper<T, R> {
  toModel(data: T, ...args: any[]): R;
}
