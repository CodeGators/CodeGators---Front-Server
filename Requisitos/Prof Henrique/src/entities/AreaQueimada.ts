class AreaQueimada {
    idareas_queimdadas: number;
    data_2: Date;
    area_ha: number;
    geometry: any;

    constructor(
        idareas_queimdadas: number,
        data_2: Date,
        area_ha: number,
        geometry: any
    ) {
        this.idareas_queimdadas = idareas_queimdadas;
        this.data_2 = data_2;
        this.area_ha = area_ha;
        this.geometry = geometry;
    }
}