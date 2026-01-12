import { Component, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';

@Component({
  selector: 'login',
  imports: [IonContent, IonButton, IonSpinner],
  template: `
    <ion-content>
      <div class="w-full h-full flex flex-col justify-around login-bg">
        <div class="mx-8">
          <svg
            class="text-(--ion-text-color)"
            height="72"
            viewBox="0 0 792 193"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M176 0C184.837 0 192 7.16344 192 16V112C192 114.085 191.6 116.076 190.875 117.902C190.169 120.507 188.794 122.968 186.749 125.013L125.152 186.609C123.265 188.496 121.024 189.812 118.643 190.56C116.619 191.484 114.37 192 112 192H16C7.16344 192 0 184.837 0 176V80C0 76.86 0.904137 73.9311 2.4668 71.46C3.22925 69.8651 4.27066 68.37 5.5918 67.0488L67.1885 5.45215C68.615 4.02563 70.2446 2.92556 71.9834 2.15039C74.3406 0.783043 77.0788 0 80 0H176Z"
              fill="#A695FF"
            />
            <path d="M160 58H146V96H110V58H96V26H160V58Z" fill="white" />
            <path
              d="M290.408 190V55.44H244.008V27.6H368.36V55.44H320.568V190H290.408ZM379.245 190V67.736H407.317L407.781 106.712L403.837 97.896C405.539 91.7093 408.477 86.1413 412.653 81.192C416.829 76.2427 421.624 72.376 427.037 69.592C432.605 66.6533 438.405 65.184 444.437 65.184C447.067 65.184 449.541 65.416 451.861 65.88C454.336 66.344 456.347 66.8853 457.893 67.504L450.237 98.824C448.536 97.896 446.448 97.1227 443.973 96.504C441.499 95.8853 439.024 95.576 436.549 95.576C432.683 95.576 428.971 96.3493 425.413 97.896C422.011 99.288 418.995 101.299 416.365 103.928C413.736 106.557 411.648 109.651 410.101 113.208C408.709 116.611 408.013 120.477 408.013 124.808V190H379.245ZM517.851 192.32C507.798 192.32 498.672 189.536 490.475 183.968C482.278 178.4 475.704 170.821 470.755 161.232C465.806 151.643 463.331 140.739 463.331 128.52C463.331 116.301 465.806 105.397 470.755 95.808C475.704 86.2187 482.432 78.7173 490.939 73.304C499.446 67.8907 509.035 65.184 519.707 65.184C525.894 65.184 531.539 66.112 536.643 67.968C541.747 69.6693 546.232 72.144 550.099 75.392C553.966 78.64 557.136 82.352 559.611 86.528C562.24 90.704 564.019 95.1893 564.947 99.984L558.683 98.36V67.736H587.451V190H558.451V160.768L565.179 159.608C564.096 163.784 562.086 167.883 559.147 171.904C556.363 175.771 552.806 179.251 548.475 182.344C544.299 185.283 539.582 187.68 534.323 189.536C529.219 191.392 523.728 192.32 517.851 192.32ZM525.739 167.032C532.39 167.032 538.267 165.408 543.371 162.16C548.475 158.912 552.419 154.427 555.203 148.704C558.142 142.827 559.611 136.099 559.611 128.52C559.611 121.096 558.142 114.523 555.203 108.8C552.419 103.077 548.475 98.592 543.371 95.344C538.267 92.096 532.39 90.472 525.739 90.472C519.088 90.472 513.211 92.096 508.107 95.344C503.158 98.592 499.291 103.077 496.507 108.8C493.723 114.523 492.331 121.096 492.331 128.52C492.331 136.099 493.723 142.827 496.507 148.704C499.291 154.427 503.158 158.912 508.107 162.16C513.211 165.408 519.088 167.032 525.739 167.032ZM699.647 190L664.847 142.904L658.351 134.088L608.007 67.736H643.271L677.143 113.672L684.335 123.416L734.215 190H699.647ZM607.775 190L656.263 125.04L672.503 144.528L641.415 190H607.775ZM684.335 132.928L668.791 113.672L696.863 67.736H730.503L684.335 132.928Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div class="flex flex-col items-center gap-2 mx-8">
          <p class="text-gray-500">
            Already have an account?
            <a class="font-medium">Sign in</a>
          </p>

          <!-- <ion-button expand="block" class="w-full" (click)="loginWithFacebook()">
            Sign up with Facebook

            <svg
              class="ms-2"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 18 18"
              fill="white"
            >
              <path
                d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"
              />
            </svg>
          </ion-button> -->

          <ion-button expand="block" class="w-full" (click)="loginWithGoogle()">
            @if (status() === 'loading') {
              <ion-spinner name="dots"></ion-spinner>
            } @else {
              Sign up with Google

              <div class="ms-2 bg-white rounded-full w-7 h-7 grid place-content-center">
                <svg
                  slot="end"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
            }
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .login-bg {
      position: relative;
      z-index: 0;
    }

    .login-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.3;
      z-index: -2;
      background-color: var(--color-purple-400, #1877f2);
      -webkit-mask-image: url('/outline-background.png');
      mask-image: url('/outline-background.png');
      -webkit-mask-size: cover;
      mask-size: cover;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
    }

    .login-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(200deg, transparent 0%, var(--ion-background-color, #fff) 50%);
      z-index: -1;
    }
  `,
})
export class Login {
  private _authService = inject(AuthService);

  protected status = signal<LoadingStatus>('idle');

  loginWithGoogle() {
    this.status.set('loading');
    this._authService.loginWithGoogle().finally(() => this.status.set('loaded'));
  }
}
