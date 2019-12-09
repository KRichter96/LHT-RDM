import { Injectable } from '@angular/core';
import { Image } from './image';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: Image[] = [];

  constructor() { }

  public setImage(images: Array<Image>, partId: number) {
    this.images = [...this.images, new Image(partId, images)];
    
  }

  public getImage(partId: number): Array<any> {
    var ret = [];
    for (let image of this.images) {
      if (image.part == partId)
      {
        ret.push(image.images);
      }
    }
    return ret;
  }

  public deleteImage(partId: number) {
    
  }
}
