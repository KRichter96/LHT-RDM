export class Chip {

  FilterObj: string;
  FilterTerm: string;

  constructor(filterObj: string, filterTerm: string) {
    this.FilterObj = filterObj;
    this.FilterTerm = filterTerm;
  }

  equals(c1 : Chip, c2 : Chip) : boolean
  {
      return c1.FilterObj === c2.FilterObj && c1.FilterTerm === c2.FilterTerm;
  }
}
