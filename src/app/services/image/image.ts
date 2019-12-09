export class Image {

    images: any;
    part: number;
  
    constructor(part: number, image: any) {
      this.part = part;
      this.images = image;
    }

    public setImages(images: any) {
      this.images = images;
    }
  
    public getImages(): any {
      return this.images;
    }

    public setPart(part: number) {
      this.part = part;
    }
  
    public getPart(): number {
      return this.part;
    }
}