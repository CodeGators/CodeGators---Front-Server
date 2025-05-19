class Estado {
    idestados: number;
    name: string;
    sigla: string;
    geocodigo: string;
    geometry: any;
    
    constructor(
        idestados: number,
        name: string,
        sigla: string,
        geocodigo: string,
        geometry: any
    ) {
        this.idestados = idestados;
        this.name = name;
        this.sigla = sigla;
        this.geocodigo = geocodigo;
        this.geometry = geometry;
    }
}