import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonIcon, IonHeader } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  alertCircleOutline,
  mailUnreadOutline,
  sendOutline
} from 'ionicons/icons';
import { IonButton } from '@ionic/angular/standalone';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonHeader,  
    IonIcon,
    HeaderComponent,
    IonContent,
    CommonModule,
    FormsModule,
    CustomInputComponent,
    ReactiveFormsModule,
    IonButton,
    LogoComponent
    ],
})
export class ForgotPasswordPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  constructor() {
    addIcons({
      mailOutline,
      alertCircleOutline,
      mailUnreadOutline,
      sendOutline
    });
  }

  ngOnInit() {}

  async submit() {
    const loading = await this.utilsService.loading();
    await loading.present();
    this.firebaseService
      .sendRecoveryEmail(this.form.value.email!)
      .then((res) => {
        this.utilsService.presentToast({
          message: "Correo enviado en caso de existir la cuenta",
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'mail-unread-outline',
        });
        this.form.reset();
        this.utilsService.routerLink("/auth");
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