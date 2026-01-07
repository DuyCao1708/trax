import { inject, Injectable } from '@angular/core';
import { CategoryEntity } from '../entities/category';
import { collection, getDocs, query } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Entities } from '../entities';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private _firebaseService = inject(FirebaseService);

  private get _database() {
    return this._firebaseService.database;
  }

  async getCategories(): Promise<CategoryEntity[]> {
    const collections = collection(this._database, Entities.Categories);

    const q = query(collections);

    try {
      const querySnapshot = await getDocs(q);

      const categories: CategoryEntity[] = [];

      querySnapshot.forEach((doc) => {
        categories.push(doc.data() as CategoryEntity);
      });

      return categories;
    } catch (error) {
      console.error('Error getting categories: ', error);
      throw error;
    }
  }
}
