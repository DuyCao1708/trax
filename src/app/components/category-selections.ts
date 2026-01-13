import { Component, inject, signal } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonButton,
  IonIcon,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  ModalController,
  IonContent,
  IonSearchbar,
  IonInput,
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'category-selections',
  imports: [
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonButton,
    IonIcon,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonInput,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="isSearching() ? isSearching.set(false) : dismiss()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-buttons slot="end">
          @if (!isSearching()) {
            <ion-button (click)="isSearching.set(!isSearching())">
              <ion-icon slot="icon-only" name="search-sharp"></ion-icon>
            </ion-button>
          }

          <ion-button routerLink="/wallets-settings" (click)="dismiss()">
            <ion-icon slot="icon-only" name="settings-sharp"></ion-icon>
          </ion-button>
        </ion-buttons>

        @if (isSearching()) {
          <ion-input
            [autofocus]="true"
            placeholder="Search for category..."
            [style.--highlight-color-focused]="'var(--ion-background-color-step-100)'"
            [style.--highlight-color-valid]="'transparent'"
          >
            <ion-button fill="clear" slot="end" [style.--color]="'var(--ion-text-color)'">
              <ion-icon slot="icon-only" name="close-sharp"></ion-icon>
            </ion-button>
          </ion-input>
        } @else {
          <ion-title>Category</ion-title>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isSearching()) {
      } @else {
        <ion-list class="relative" lines="none">
          <ion-list-header>
            <ion-label class="ms-4 text-gray-500">Categories</ion-label>
          </ion-list-header>

          @if (!categories().length) {
            <div class="absolute inset-0 grid place-content-center">
              <ion-spinner name="dots"></ion-spinner>
            </div>
          }

          @for (category of categories(); track $index) {
            <ion-item>
              <ion-button shape="round" class="mr-2 w-8 h-8" [style.--background]="category.color">
                <ion-icon
                  slot="icon-only"
                  class="text-white text-lg"
                  [name]="category.icon"
                ></ion-icon>
              </ion-button>

              <ion-label>{{ category.name }}</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
  styles: ``,
})
export class CategorySelections {
  protected readonly categories = inject(CategoryService).categories;
  private _modalCtrl = inject(ModalController);

  protected isSearching = signal<boolean>(false);

  constructor() {}

  async dismiss() {
    await this._modalCtrl.dismiss();
  }
}
