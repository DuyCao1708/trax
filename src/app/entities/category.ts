import { BooleanNumber, SynctableEntity } from '.';

export interface CategoryEntity extends SynctableEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id?: string;
  is_default: BooleanNumber;
}
