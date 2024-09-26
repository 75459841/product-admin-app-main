import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,UserProfile, updateProfile } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore,setDoc,doc, getDoc, addDoc, collection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UtilsService } from './utils.service';
import { getStorage, uploadString, ref, getDownloadURL} from 'firebase/storage';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc =inject(UtilsService);
 



  //=========================Auntecticacion==========================



//============Acceder=======================================

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password );
  }

  //============crear usuario=======================================

  signup(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password );
  }

  //===================Actualizar usuario================================
  updateUser(displayName){
    return updateProfile(getAuth().currentUser, {displayName})
  }

  //=====================Base de datos==================================

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(),path),data);
  }

  //======================agregar  un documento=========================

  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(),path),data);
  }

  //=======================Alamacenamiento=======================

 async uploadImage(path: string, data_url:string) {
     return uploadString(ref(getStorage(), path),data_url, 'data_url').then(() =>{
      return getDownloadURL(ref(getStorage(),path))
     })
  }

}
