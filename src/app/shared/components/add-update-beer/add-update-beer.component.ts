import { Component, inject, OnInit, Input } from '@angular/core';
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
import { SupabaseService } from 'src/app/services/supabase.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { Beers } from 'src/app/models/beers.model';
import { Haptics, ImpactStyle } from '@capacitor/haptics'; 

@Component({
  selector: 'app-add-update-beer',
  templateUrl: './add-update-beer.component.html',
  styleUrls: ['./add-update-beer.component.scss'],
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
export class AddUpdatebeerComponent implements OnInit {
  supabaseService = inject(SupabaseService);
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  haptics = Haptics; 
  user = {} as User;

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    volume: new FormControl('', [Validators.required, Validators.min(20)]),
    grades: new FormControl('', [Validators.required, Validators.min(5)]),
  });

  @Input() beer: Partial<Beers> | null = null;

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
    if (this.beer) {
      this.form.patchValue(this.beer);
    }
  }

  async takeImage() {
    const dataUrl = (
      await this.utilsService.takePicture('Imagen de la cerveza')
    ).dataUrl;
    if (dataUrl) {
      this.form.controls.image.setValue(dataUrl);
    }
  }

  async addBeer() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      const path: string = `users/${this.user.uid}/beers`;
      const imageDataUrl = this.form.value.image;
      if (!imageDataUrl) {
        throw new Error('Image data URL is required');
      }
      const imagePath = `${this.user.uid}/${Date.now()}`;
      const imageUrl = await this.supabaseService.uploadImageSupabase(
        imagePath,
        imageDataUrl,
        'image/jpeg' 
      );
      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id;
      this.firebaseService
        .addDocument(path, this.form.value)
        .then(async (res) => {
          this.utilsService.dismissModal({ success: true });
          this.utilsService.presentToast({
            message: 'Cerveza añadida exitosamente',
            duration: 1500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });

          this.haptics.impact({ style: ImpactStyle.Medium }); 
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

  async updateBeer() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();
  
      const path: string = `users/${this.user.uid}/beers`;
      let imageUrl = this.beer?.image || ''; 
  
    
      if (this.form.value.image !== this.beer?.image) {
        const imageDataUrl = this.form.value.image;
        
        if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
          const imagePath = `${this.user.uid}/${Date.now()}`;
          try {
            imageUrl = await this.supabaseService.uploadImageSupabase(
              imagePath,
              imageDataUrl,
              'image/jpeg' 
            );
            if (this.beer?.image) {
              const oldFilePath = this.supabaseService.getFilePath(this.beer.image);
              if (oldFilePath) {
                await this.supabaseService.deleteFile(oldFilePath);
              }
            }
          } catch (error: any) {
            this.utilsService.presentToast({
              message: error.message || 'Error subiendo imagen',
              duration: 2500,
              color: 'danger',
              position: 'middle',
              icon: 'alert-circle-outline',
            });
          }
        }
      }
  
      this.form.controls.image.setValue(imageUrl); 
  
      if (this.beer && this.beer.id) {
        const updatePath = `${path}/${this.beer.id}`;
        this.firebaseService
          .updateDocument(updatePath, this.form.value)
          .then(async () => {
            this.utilsService.dismissModal({ success: true });
            this.utilsService.presentToast({
              message: 'Cerveza editada exitosamente',
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
}
