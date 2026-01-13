import { CategoryEntity } from '../entities/category';

export interface Category extends Omit<
  CategoryEntity,
  'parent_id' | 'is_default' | 'user_id' | 'updated_at' | 'sync_status'
> {
  isDefault: boolean;
  parentId?: string;
}

// export const CategoryMapper: Mapper<Category, CategoryEntity> = {
//   toEntity(model: Category): CategoryEntity {
//     return {
//       id: model.id,
//       name: model.name,
//       icon: model.icon || 'help-outline',
//       color: model.color || '#64748b',
//       is_default: !!model.isDefault,
//       parent_id: model.parentId || undefined,
//     };
//   },

//   toModel(entity: CategoryEntity): Category {
//     return {
//       id: entity.id,
//       name: entity.name,
//       icon: entity.icon || 'help-outline',
//       color: entity.color || '#64748b',
//       isDefault: !!entity.is_default,
//       parentId: entity.parent_id || undefined,
//     };
//   },
// };
