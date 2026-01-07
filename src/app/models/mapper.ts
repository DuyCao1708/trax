export interface Mapper<T, R> {
  toEntity(data: any): R;
  toModel(data: any): T;
}
