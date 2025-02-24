import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonInput, IonItem, IonIcon, IonButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonItem, CommonModule, ReactiveFormsModule]
})
export class CustomInputComponent  implements OnInit {

  @Input() control! :FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete! :string;
  @Input() icon? :string;

  isPassword! :boolean;
  hide :boolean = true;

  constructor() { addIcons({eyeOutline, eyeOffOutline}); }

  ngOnInit() {
    this.isPassword = this.type=="password";
  }

  showOrHidePassword() {
    this.hide = !this.hide;
    if (this.hide) {
      this.type= "password";
    } else {
      this.type ="text";
    }
  }

}