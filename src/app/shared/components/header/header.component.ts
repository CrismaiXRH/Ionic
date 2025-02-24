import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
})
export class HeaderComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input() backButtonURL: string | null = null;
  @Input() isModal: boolean = false;

  utilsService = inject(UtilsService);

  constructor() {
    addIcons({ closeCircleOutline });
  }

  ngOnInit() {}

  dismissModal() {
    this.utilsService.dismissModal();
  }
}