import { Injectable } from '@angular/core';
import { Chip } from 'src/app/pages/parts/Chip';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  chips: Array<Chip> = [];

  constructor() {

    console.log("filterService init");
   }

  public setChips(chips: Array<Chip>) {
    console.log("set chips");
    this.chips = chips;
  }

  public getChips(): Array<Chip> {
    console.log("get chips");
    console.log(this.chips);
    return this.chips;
  }
}
