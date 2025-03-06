import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { inject } from '@angular/core';
import { SensorService } from 'src/app/services/sensor.service';
import { Position } from '@capacitor/geolocation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.page.html',
  styleUrls: ['./sensors.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class SensorsPage implements OnInit, OnDestroy {
  sensorService = inject(SensorService);

  private accelerometerDataSubscription: Subscription | null = null;
  private orientationDataSubscription: Subscription | null = null;
  private coordinatesSubscription: Subscription | null = null;

  accelerometerData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  orientationData: { alpha: number; beta: number; gamma: number } = {
    alpha: 0,
    beta: 0,
    gamma: 0,
  };
  position: Position | null = null;

  constructor() {}

  ngOnInit() {
    this.sensorService.startWatchingGPS();
    this.sensorService.startListeningToMotion();
    // Suscribirse a los datos del acelerómetro
    this.accelerometerDataSubscription = this.sensorService
      .getAccelerometerData()
      .subscribe((data) => {
        this.accelerometerData = data;
      });

    // Suscribirse a los datos de orientación
    this.orientationDataSubscription = this.sensorService
      .getOrientationData()
      .subscribe((data) => {
        this.orientationData = data;
      });

    // Suscribirse a las coordenadas actuales
    this.coordinatesSubscription = this.sensorService
      .getCurrentCoordinates()
      .subscribe((data) => {
        this.position = data;
      });
  }

  ngOnDestroy() {
    // Desuscribirse de todos los observables
    if (this.accelerometerDataSubscription) {
      this.accelerometerDataSubscription.unsubscribe();
    }
    if (this.orientationDataSubscription) {
      this.orientationDataSubscription.unsubscribe();
    }
    if (this.coordinatesSubscription) {
      this.coordinatesSubscription.unsubscribe();
    }

    // También podemos parar de escuchar eventos de motion si lo hemos iniciado
    this.sensorService.stopListeningToMotion();
    this.sensorService.stopWatchingGPS();
  }
}