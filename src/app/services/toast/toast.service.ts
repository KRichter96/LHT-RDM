import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  displayToast(message: string, durationMs: number = 2000, position: any = 'top') {
    const toast = this.toastCtrl.create({
      message,
      duration: durationMs,
      position
    });
    toast.then(toastr => toastr.present());
  }
}
