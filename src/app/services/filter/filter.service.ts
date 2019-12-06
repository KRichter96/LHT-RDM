import { Injectable } from '@angular/core';
import { Chip } from 'src/app/pages/parts/Chip';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  chips: Array<Chip> = [];

  constructor() { }

  public setChips(chips: Array<Chip>) {
    this.chips = chips;
  }

  public getChips(): Array<Chip> {
    return this.chips;
  }
}
