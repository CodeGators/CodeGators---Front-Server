export class FocosMensal {
    id: string;              
    lat: number;             
    lon: number;             
    data_hora_gmt: Date;     
  
    constructor(
      id: string,
      lat: number,
      lon: number,
      data_hora_gmt: Date,
    ) {
      this.id = id;
      this.lat = lat;
      this.lon = lon;
      this.data_hora_gmt = data_hora_gmt;
    }
  }