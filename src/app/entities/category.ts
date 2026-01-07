export interface CategoryEntity {
  id: string;
  name: string;
  is_default: boolean;
  parent_id?: number;
}
