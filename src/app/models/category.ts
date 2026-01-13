import { CategoryEntity } from '../entities/category';
import { Mapper } from './mapper';

export interface Category extends Omit<
  CategoryEntity,
  'parent_id' | 'is_default' | 'user_id' | 'updated_at' | 'sync_status' | 'is_deleted'
> {
  isDefault: boolean;
  parentId?: string;
}

export const CategoryMapper: Mapper<CategoryEntity, Category> = {
  toModel(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      color: `var(--color-${entity.color}-500)`,
      isDefault: !!entity.is_default,
      parentId: entity.parent_id || undefined,
    };
  },
};
