import { SyncableEntity } from '.';

export interface CategoryEntity extends SyncableEntity {
  name: string;
  icon: string;
  color: string;
  parent_id?: string;
}
