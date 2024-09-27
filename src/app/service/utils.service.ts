import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
    
   loadingctrl = inject (LoadingController);
   toastctrl = inject (ToastController);
   modalctrl = inject(ModalController)
   router = inject(Router)

   //=====================loading==================

   loading() {
    return this.loadingctrl.create({ spinner:'crescent'})
   }



   //===================toast=============
   async presentToast(opts?: ToastOptions) {
    const toast = await this.toastctrl.create(opts);
    toast.present();
   }
  
  //================enruta a cualquier pagina disponible====================

  routerlink(url: string){
    return this.router.navigateByUrl(url);
  }
 
  //==========================Guarda un elementoen localstore==========

  saveInlocalstorage(key:string, value:any){
    return localStorage.setItem(key, JSON.stringify(value))
  }

  //============================== obtiene un elemento desde localstorage================

  getfromlocalstorage(key:string){
    return JSON.parse (localStorage.getItem(key))
  }

  //=========================modal========================

  async presentModal(opts: ModalOptions) {
    const modal = await this.modalctrl.create(opts);
   await modal.present();
   const { data } = await modal.onWillDismiss();
   if(data) return data;
  }

  dismissmodal(data?:any){
    return this.modalctrl.dismiss(data);
  }


}
