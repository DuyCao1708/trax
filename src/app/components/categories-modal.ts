import { Component, inject, Signal, signal, viewChild } from '@angular/core';
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
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category';
import { AuthService } from '../services/auth.service';
import { Categories } from './categories';

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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="handleBack()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-buttons slot="end">
          @if (!isSearching()) {
            <ion-button (click)="isSearching.set(!isSearching())">
              <ion-icon slot="icon-only" name="search-sharp"></ion-icon>
            </ion-button>
          }

          <ion-button routerLink="/categories-settings" (click)="dismiss()">
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
      <ion-nav></ion-nav>

      @if (isSearching()) {
      } @else {}
    </ion-content>
  `,
  styles: ``,
})
export class CategoriesModal {
  private _categoryService = inject(CategoryService);
  private _authService = inject(AuthService);
  private _modalCtrl = inject(ModalController);
  private _nav = viewChild.required(IonNav);

  protected isSearching = signal<boolean>(false);

  protected categories: Signal<Category[]> = this._categoryService.categories;

  ngAfterViewInit() {
    this._nav().setRoot(Categories, {
      onCategorySelected: (category: Category) => this._modalCtrl.dismiss(category),
    });
  }

  async handleBack() {
    if (this.isSearching()) {
      this.isSearching.set(false);
      return;
    }

    const nav = this._nav();

    const canGoBack = await nav.canGoBack();
    if (canGoBack) {
      nav.pop();
      return;
    }

    this.dismiss();
  }

  async dismiss() {
    await this._modalCtrl.dismiss();
  }
}
