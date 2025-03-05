import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonFab,
  IonIcon,
  IonFabButton,
  IonButton,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonItem,
  IonAvatar,
  IonList,
  IonChip, IonSkeletonText, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, bodyOutline } from 'ionicons/icons';
import { Beers } from 'src/app/models/beers.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatebeerComponent } from 'src/app/shared/components/add-update-beer/add-update-beer.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonRefresher, IonSkeletonText, 
    IonChip,
    IonList,
    IonAvatar,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonFabButton,
    IonIcon,
    IonFab,
    HeaderComponent,
    IonContent,
    CommonModule,
  ],
})
export class HomePage implements OnInit {
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  beers: Beers[] = [];
  loading: boolean = false;
  supabaseService = inject(SupabaseService);
  constructor() {
    addIcons({createOutline,trashOutline,bodyOutline,add});
  }

  ngOnInit() {}

  getBeers() {
    const user: User = this.utilsService.getLocalStoredUser()!;
    const path: string = `users/${user.uid}/beers`;
    this.loading = true;

    const queryOptions = {
      orderBy: [{ field: "grades", direction: "asc" as "asc" }],
    };

    let sub = this.firebaseService.getCollectionData(path, queryOptions).subscribe({
      next: (res: any) => {
        sub.unsubscribe();

        this.beers = res;
        this.loading = false;
      },
    });
  }

  async addUpdateBeer(beer?: Beers) {
    let success = await this.utilsService.presentModal({
      component: AddUpdatebeerComponent,
      cssClass: 'add-update-modal',
      componentProps: { beer }
    });
    if (success) {
      this.getBeers();
    }
  }

  ionViewWillEnter() {
    this.getBeers();
  }

  async deleteBeer(beer: Beers) {
    const loading = await this.utilsService.loading();
    await loading.present();
    const user: User = this.utilsService.getLocalStoredUser()!;
    const path: string = `users/${user.uid}/beers/${beer!.id}`;

    try {
      if (beer.image) {
        const filePath = this.supabaseService.getFilePath(beer.image);
        if (filePath) {
          await this.supabaseService.deleteFile(filePath);
        } else {
          console.warn("No se pudo extraer el path del archivo de Supabase.");
        }
      }

      await this.firebaseService.deleteDocument(path);
      this.beers = this.beers.filter(listedBeer => listedBeer.id !== beer.id);

      this.utilsService.presentToast({
        message: 'Cerveza borrada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      });
    } catch (error: any) {
      this.utilsService.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.getBeers();
      event.target.complete();
    }, 2000);
  }

  async confirmDeleteBeer(beer: Beers) {
    const alert = await this.utilsService.presentAlert({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas borrar esta cerveza?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Borrar',
          handler: () => {
            this.deleteBeer(beer);
          },
        },
      ],
    });
  }
}