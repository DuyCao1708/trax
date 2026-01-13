import { SyncableEntity } from '.';

export interface CategoryEntity extends SyncableEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id?: string;
}
