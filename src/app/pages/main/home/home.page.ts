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
  IonChip, IonSkeletonText, IonRefresher, IonRefresherContent, IonCard, IonCardContent, IonHeader, IonToolbar, IonTitle, IonCardHeader, IonCardTitle, IonFooter, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, bodyOutline, beerOutline, logOutOutline, searchOutline, addOutline, homeOutline, personOutline } from 'ionicons/icons';
import { Beers } from 'src/app/models/beers.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatebeerComponent } from 'src/app/shared/components/add-update-beer/add-update-beer.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonButtons, IonFooter, IonCardTitle, IonCardHeader, IonTitle, IonToolbar, IonHeader, IonCardContent, IonCard, IonRefresherContent, IonRefresher, IonSkeletonText, 
    IonChip,
    IonList,
    IonAvatar,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonButton,
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
  supabaseService = inject(SupabaseService);
  router = inject(Router);
  beers: Beers[] = [];
  loading: boolean = false;
  constructor() {
    addIcons({logOutOutline,beerOutline,searchOutline,addOutline,homeOutline,personOutline,createOutline,trashOutline,add,bodyOutline});
  }

  ngOnInit() {
    this.getBeers();
  }

  logout() {
    this.firebaseService.signOut().then(() => {
      this.router.navigate(['/auth']).then(() => {
        window.location.reload();
      });
    });
  }


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

  getTotalPower() {
    return this.beers.reduce((accumulator, beer) =>  
      accumulator + Number(beer.volume), 0);
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

  goToHome() {
    this.router.navigate(['/main/home']).then(() => {
      this.ngOnInit(); // Recarga los datos de las cervezas
    });
  }
  
  goToProfile() {
    this.router.navigate(['/main/profile']);
  }

  searchBeer() {
    // Implementa la lógica para buscar cervezas por nombre
    const searchTerm = prompt('Ingrese el nombre de la cerveza a buscar:');
    if (searchTerm) {
      this.beers = this.beers.filter(beer => beer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  }
}