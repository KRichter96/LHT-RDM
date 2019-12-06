import { Injectable } from '@angular/core';
import { Image } from './image';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: Image[] = [];
  partId: number;

  constructor() { }

  public setImage(images: Array<Image>, partId: number) {
    this.images = images;
  }

  public getImage(partId: number): Array<Image> {
    return this.images;
  }
}
