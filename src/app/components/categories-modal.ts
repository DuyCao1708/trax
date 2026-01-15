import { Component, inject, signal, viewChild } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  ModalController,
  IonContent,
  IonInput,
  IonNav,
} from '@ionic/angular/standalone';
import { Category } from '../models/category';
import { Categories } from './categories';
import { CategoriesSearchResult } from './categories-search-result';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autofocus } from '../directives/autofocus';
import { SubCategories } from './sub-categories';
import { CategoryForm } from './category-form';
import { CategoriesSettings } from './categories-settings';

@Component({
  selector: 'categories-modal',
  imports: [
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonInput,
    IonNav,
    ReactiveFormsModule,
    Autofocus,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="handleBack()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        @if (isSearching()) {
          <ion-input
            [formControl]="searchControl"
            autofocus
            placeholder="Search for category..."
            [style.--highlight-color-focused]="'var(--ion-background-color-step-100)'"
            [style.--highlight-color-valid]="'transparent'"
          >
            <ion-button
              fill="clear"
              slot="end"
              [style.--color]="'var(--ion-text-color)'"
              (click)="handleBack()"
            >
              <ion-icon slot="icon-only" name="close-sharp"></ion-icon>
            </ion-button>
          </ion-input>
        } @else {
          <ion-title>Category</ion-title>
        }

        <ion-buttons slot="end">
          @if (!isSearching()) {
            <ion-button (click)="openSearchResult()">
              <ion-icon slot="icon-only" name="search-sharp"></ion-icon>
            </ion-button>
          }

          <ion-button (click)="openSettings()">
            <ion-icon slot="icon-only" name="settings-sharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-nav></ion-nav>
    </ion-content>
  `,
})
export class CategoriesModal {
  private _modalCtrl = inject(ModalController);
  private _nav = viewChild.required(IonNav);

  protected isSearching = signal<boolean>(false);

  searchControl = new FormControl<string>('', { nonNullable: true });

  ngAfterViewInit() {
    this._nav().setRoot(Categories, {
      showFrequentCategories: true,
      onCategorySelected: (category: Category) => this._modalCtrl.dismiss(category),
    });
  }

  openSearchResult() {
    this.isSearching.set(true);

    this._nav().push(CategoriesSearchResult, {
      searchControl: this.searchControl,
      onCategorySelected: (category: Category) => {
        this.isSearching.set(false);
        this._modalCtrl.dismiss(category);
      },
    });
  }

  async openSettings() {
    const activeView = await this._nav().getActive();
    let context = null;

    if (activeView?.component === SubCategories) {
      context = activeView.params?.['category'];
    }

    let options;
    if (context) {
      options = {
        component: CategoryForm,
        componentProps: { category: context },
      };
    } else {
      options = {
        component: CategoriesSettings,
      };
    }

    const modal = await this._modalCtrl.create(options);

    await modal.present();
  }

  async handleBack() {
    if (this.isSearching()) this.isSearching.set(false);

    const nav = this._nav();

    const canGoBack = await nav.canGoBack();
    if (canGoBack) {
      nav.pop();
      return;
    }

    this.dismiss();
  }

  dismiss() {
    this._modalCtrl.dismiss();
  }
}
