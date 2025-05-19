export class Estado {
  gid: number;
  cd_uf: string;
  nm_uf: string;
  sigla_uf: string;
  cd_regiao: string;
  nm_regiao: string;
  area_km2: number;

  constructor(
    gid: number,
    cd_uf: string,
    nm_uf: string,
    sigla_uf: string,
    cd_regiao: string,
    nm_regiao: string,
    area_km2: number
  ) {
    this.gid = gid;
    this.cd_uf = cd_uf;
    this.nm_uf = nm_uf;
    this.sigla_uf = sigla_uf;
    this.cd_regiao = cd_regiao;
    this.nm_regiao = nm_regiao;
    this.area_km2 = area_km2;
  }
}
