import { Component, inject, OnInit } from '@angular/core';
import { IonButton, IonContent, IonFab, IonIcon, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateMiniatureComponent } from 'src/app/shared/components/add-update-miniature/add-update-miniature.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonFabButton, IonIcon, IonFab, IonButton, HeaderComponent, IonContent],
})
export class HomePage implements OnInit {
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  constructor() { addIcons({add});}

  ngOnInit() {}

  async signOut() {
    this.firebaseService.signOut().then(() => {
      this.utilsService.routerLink('/auth');
    });
  }

  addUpdateMiniature() {
    this.utilsService.presentModal({ component: AddUpdateMiniatureComponent, cssClass: "add-update-modal"})
  }
}