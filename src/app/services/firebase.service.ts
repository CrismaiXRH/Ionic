import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  UserCredential,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import {
  Storage,
  uploadString,
  ref,
  getDownloadURL,
} from '@angular/fire/storage';
import { User } from '../models/user.model';
import {
  Firestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(Auth);
  firestore = inject(Firestore);
  storage = inject(Storage);

  signIn(user: User): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signUp(user: User): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  async updateUser(displayName: string) {
    const user = await this.auth.currentUser;
    if (user) {
      // Actualiza el perfil del usuario
      await updateProfile(user, { displayName: displayName });
    }
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async signOut() {
    await this.auth.signOut();
    localStorage.removeItem('user');
    window.location.reload();
  }

  async isAuthenticated() {
    const userExists: boolean = await new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    return userExists;
  }

  async getDocument(path: string) {
    const docSnap = await getDoc(doc(this.firestore, path));
    return docSnap.data();
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(this.firestore, path), data);
  }
  addDocument(path: string, data: any) {
    return addDoc(collection(this.firestore, path), data);
  }

  async uploadImage(path: string, imageUrl: string) {
    return uploadString(ref(this.storage, path), imageUrl, 'data_url').then(
      () => {
        return getDownloadURL(ref(this.storage, path));
      }
    );
  }
}