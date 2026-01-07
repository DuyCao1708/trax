import { inject, Injectable } from '@angular/core';
import { collection, getDocs, query, QueryConstraint } from 'firebase/firestore';
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

  //#region Categories
  // async getCategories(): Promise<Category[]> {
  //   return this.get(Entities.Categories).then((entities) => entities.map(CategoryMapper.toModel));
  // }

  // async addCategory(data: Omit<Category, 'id'>): Promise<string> {
  //   const categoryCol = collection(this._database, Entities.Categories);

  //   try {
  //     const docRef = await addDoc(categoryCol, CategoryMapper.toModel(data));
  //     return docRef.id;
  //   } catch (error) {
  //     console.error('Error adding category: ', error);
  //     throw error;
  //   }
  // }
  //#endregion Categories

  //#region Private methods
  private async get<T>(entity: Entities, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
    const collections = collection(this._database, entity);

    const q = query(collections, ...queryConstraints);

    try {
      const querySnapshot = await getDocs(q);

      const data: T[] = [];

      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as T;
        data.push(item);
      });

      return data;
    } catch (error) {
      console.error('Error getting entities: ', error);
      throw error;
    }
  }
  //#endregion Private methods
}
