import { Component, OnInit } from '@angular/core';
import { IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [IonText]
})
export class LogoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}