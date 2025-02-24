import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  mailOutline,
  personAddOutline,
  logInOutline,
  alertCircleOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { IonButton } from '@ionic/angular/standalone';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { RouterLink } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    HeaderComponent,
    IonContent,
    CommonModule,
    FormsModule,
    CustomInputComponent,
    ReactiveFormsModule,
    IonButton,
    LogoComponent,
    RouterLink,
  ],
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      personAddOutline,
      logInOutline,
      alertCircleOutline,
      personCircleOutline,
    });
  }

  ngOnInit() {}

  async submit() {
    const loading = await this.utilsService.loading();
    await loading.present();
    this.firebaseService
      .signIn(this.form.value as User)
      .then((res) => {
        this.getUserInfo(res.user.uid);
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async getUserInfo(uid: string) {
    const loading = await this.utilsService.loading();
    await loading.present();

    let path = `users/${uid}`;

    this.firebaseService
      .getDocument(path)
      .then((userData: any) => {
        const user: User = userData;
        this.utilsService.saveInLocalStorage('user', user);
        this.utilsService.presentToast({
          message: `Sesión iniciada como ${user.name}`,
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'person-circle-outline',
        });
        this.form.reset();
        this.utilsService.routerLink('/home');
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }
}