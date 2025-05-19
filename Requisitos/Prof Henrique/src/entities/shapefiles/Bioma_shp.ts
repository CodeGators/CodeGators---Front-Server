export class Bioma {
    gid: number;
    bioma: string;
    cd_bioma: number;
  
    constructor(gid: number, bioma: string, cd_bioma: number) {
      this.gid = gid;
      this.bioma = bioma;
      this.cd_bioma = cd_bioma;
    }
  }