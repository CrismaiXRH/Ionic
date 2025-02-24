import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  mailOutline,
  personAddOutline,
  personOutline,
  alertCircleOutline,
  imageOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { IonButton, IonAvatar } from '@ionic/angular/standalone';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-miniature',
  templateUrl: './add-update-miniature.component.html',
  styleUrls: ['./add-update-miniature.component.scss'],
  imports: [
    IonIcon,
    HeaderComponent,
    IonContent,
    CommonModule,
    FormsModule,
    CustomInputComponent,
    ReactiveFormsModule,
    IonButton,
    IonAvatar,
  ],
})
export class AddUpdateMiniatureComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  user = {} as User;

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    units: new FormControl('', [Validators.required, Validators.min(1)]),
    strength: new FormControl('', [Validators.required, Validators.min(0)]),
  });

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      personAddOutline,
      personOutline,
      alertCircleOutline,
      imageOutline,
      checkmarkCircleOutline,
    });
  }
  ngOnInit() {
    this.user = this.utilsService.getFromLocalStorage('user');
  }

  async takeImage() {
    const dataUrl = (
      await this.utilsService.takePicture('Imagen de la miniatura')
    ).dataUrl;
    if (dataUrl) {
      this.form.controls.image.setValue(dataUrl);
    }
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      const path: string = `users/${this.user.uid}/miniatures`;
      const imageDataUrl = this.form.value.image;
      const imagePath = `${this.user.uid}/${Date.now()}`;
      const imageUrl = await this.firebaseService.uploadImage(
        imagePath,
        imageDataUrl!
      );
      this.form.controls.image.setValue(imageUrl);
      delete this.form.value.id;

      this.firebaseService
        .addDocument(path, this.form.value)
        .then(async (res) => {
          this.utilsService.dismissModal({ success: true });
          this.utilsService.presentToast({
            message: 'Mininatura añadida exitosamente',
            duration: 1500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
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
}