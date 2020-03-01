import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  displayToast(message: string, durationMs: number = 2000) {
    const toast = this.toastCtrl.create({
      message,
      duration: durationMs,
      position: 'top'
    });
    toast.then(toastr => toastr.present());
  }
}
