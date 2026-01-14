import { Component, inject, viewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  IonContent,
} from '@ionic/angular/standalone';
import { Categories } from '../components/categories';
import { Category } from '../models/category';
import { Router } from '@angular/router';

@Component({
  selector: 'categories-settings',
  imports: [IonHeader, IonToolbar, IonButtons, IonTitle, IonBackButton, IonContent, Categories],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>

        <ion-title>Edit category</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <categories></categories>
    </ion-content>
  `,
})
export class CategoriesSettings {
  private _categoriesComponent = viewChild.required(Categories);
  private _router = inject(Router);

  ngAfterViewInit() {
    this._categoriesComponent().onCategorySelected = (category: Category) => {
      this._router.navigate(['category-form', category.id]);
    };
  }
}
