import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonAvatar, IonButton, IonIcon, IonLabel, IonItem, IonButtons, IonFooter, IonToolbar, IonTitle, IonHeader } from '@ionic/angular/standalone';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { User } from 'src/app/models/user.model';
import { addIcons } from 'ionicons';
import { cameraOutline, personOutline, searchOutline, addOutline, homeOutline, logOutOutline } from 'ionicons/icons';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons, IonItem, IonLabel, IonIcon, IonButton, IonAvatar, IonContent, CommonModule, FormsModule, HeaderComponent],
})
export class ProfilePage implements OnInit {
  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  supabaseService = inject(SupabaseService);
  router: Router; // Definir la variable del Router
  changeDetectorRef: ChangeDetectorRef; // Definir la variable del ChangeDetectorRef

  constructor(changeDetectorRef: ChangeDetectorRef, router: Router) {
    this.changeDetectorRef = changeDetectorRef; // Inyectar el ChangeDetectorRef
    this.router = router; // Inyectar el Router
    this.user = this.utilsService.getLocalStoredUser()!;
    addIcons({logOutOutline,cameraOutline,personOutline,homeOutline,searchOutline,addOutline});
  }

  user: User;

  ngOnInit() {}

  async takeImage() {
    let loading;
    try {
      const image = await this.utilsService.takePicture("Imagen de perfil");
      if (!image || !image.dataUrl) {
        console.log("No se pudo obtener la imagen.");
        return;
      }
  
      loading = await this.utilsService.loading();
      await loading.present();
  
      if (this.user.image) {
        const oldImagePath = await this.supabaseService.getFilePath(this.user.image);
        if (oldImagePath) {
          await this.supabaseService.deleteFile(oldImagePath);
        }
      }
  
      const imagePath = `users/${this.user.uid}/profile${Date.now()}`;
      const imageUrl = await this.supabaseService.uploadImageSupabase(imagePath, image.dataUrl, 'image/jpeg');
  
      if (!imageUrl) {
        console.log("No se pudo subir la imagen a Supabase.");
        return;
      }
  
      this.user.image = imageUrl;
      const path = `users/${this.user.uid}`;
      await this.firebaseService.updateDocument(path, { image: this.user.image });
  
      this.utilsService.saveInLocalStorage("user", this.user);
      
      // 🔄 Forzar actualización en la vista
      this.changeDetectorRef.detectChanges();
  
      await this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Foto de perfil actualizada exitosamente",
        position: "middle",
        icon: "checkmark-circle-outline",
      });
    } catch (error: any) {
      console.error("Error al actualizar la imagen de perfil:", error);
      await this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message: error.message,
        position: "middle",
        icon: "alert-circle-outline",
      });
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }
  

  editarPerfil() {
    console.log('Editando perfil...');

    this.utilsService.presentAlert({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.user.name,
          placeholder: 'Nuevo nombre'
        },
        {
          name: 'email',
          type: 'email',
          value: this.user.email,
          placeholder: 'Nuevo correo'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data: { name: string; email: string }) => {
            if (!data.name || !data.email) {
              this.utilsService.presentToast({
                message: 'Por favor completa todos los campos',
                duration: 2000,
                color: 'danger'
              });
              return;
            }

            const path = `users/${this.user.uid}`;
            const updatedData = { name: data.name, email: data.email };

            const loading = await this.utilsService.loading();
            await loading.present();

            this.firebaseService
              .updateDocument(path, updatedData)
              .then(() => {
                this.user.name = data.name;
                this.user.email = data.email;
                this.utilsService.saveInLocalStorage('user', this.user);
                this.changeDetectorRef.detectChanges(); 


                this.utilsService.presentToast({
                  message: 'Perfil actualizado correctamente',
                  duration: 2000,
                  color: 'success'
                });
              })
              .catch((error) => {
                this.utilsService.presentToast({
                  message: `Error: ${error.message}`,
                  duration: 2500,
                  color: 'danger'
                });
              })
              .finally(() => {
                loading.dismiss();
              });
          }
        }
      ]
    });
  }

  goToHome() {
    this.router.navigate(['/main/home']);
  }

  goToProfile() {
    this.router.navigate(['/main/profile']);
  }

  logout() {
    this.firebaseService.signOut().then(() => {
      this.router.navigate(['/auth']).then(() => {
        window.location.reload();
      });
    });
  }
}

