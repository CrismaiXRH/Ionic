import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  ToastController,
  ToastOptions,
  ModalController,
  ModalOptions,
  AlertOptions,
  AlertController,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loadingController = inject(LoadingController);
  toastController = inject(ToastController);
  router = inject(Router);
  modalController = inject(ModalController);
  alertController = inject(AlertController);

  loading() {
    return this.loadingController.create({ spinner: 'crescent' });
  }

  async presentToast(toastOptions?: ToastOptions | undefined) {
    const toast = await this.toastController.create(toastOptions);
    toast.present();
  }

  urlTree(url: string) {
    return this.router.parseUrl(url);
  }

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : value;
  }

  async presentModal(modalOptions: ModalOptions) {
    const modal = await this.modalController.create(modalOptions);

    await modal.present();

    const { data } = await modal.onWillDismiss();

    return data ?? null;
  }

  dismissModal(data?: any) {
    return this.modalController.dismiss(data);
  }

  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Selecciona una imagen',
      promptLabelPicture: 'Saca una foto'
    });
  }

  getLocalStoredUser() : User | null {
    return this.getFromLocalStorage('user');
  }

  async presentAlert(alertOptions?: AlertOptions) {
    const alert = await this.alertController.create(alertOptions);

    await alert.present();
  }

  constructor() {}
}