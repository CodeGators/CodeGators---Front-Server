// src/controllers/focos/focosController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { buildQueryParams } from '../utils/queryBuilder';

// Se você centralizou os tipos em src/types/geojson.ts, importe-os aqui:
// import { FocoQueryParams, FocoFeatureCollection } from '../../types/geojson';
// Se não, mantenha-os definidos aqui:
interface FocoQueryParams {
  estado?: string;
  bioma?: string;
  mes?: string;
  satelite?: string;
}
interface GeoJSONFeatureProperties { // Mantenha se não importado de types/geojson.ts
  frp: number;
  satelite: string;
  risco_fogo: number;
  data_hora: string;
}
interface GeoJSONFeature { // Mantenha se não importado de types/geojson.ts
  type: 'Feature';
  geometry: any;
  properties: GeoJSONFeatureProperties;
}
interface FeatureCollection { // Mantenha se não importado de types/geojson.ts
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
type FocoFeatureCollection = FeatureCollection; // Ajuste se usar a versão modularizada

export const getFocosPorEstado = async (req: Request<{}, {}, {}, FocoQueryParams>, res: Response): Promise<void> => {
  const { estado, mes, satelite } = req.query;

  console.log('REQ /focos-estado:', { estado, mes, satelite });

  const columnMap = {
    estado: 'fc.estado_id',
    satelite: 'fc.satelite',
  };

  const { whereClause, params } = buildQueryParams(
    { estado, mes, satelite },
    columnMap,
    'fc.data_hora_gmt'
  );

  if (!estado) {
    res.status(400).send('Parâmetro "estado" é obrigatório.');
    return;
  }
  if (whereClause === '') {
    res.status(400).send('Pelo menos um critério de busca é obrigatório.');
    return;
  }

  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(fc.geom)::jsonb,
          'properties', jsonb_build_object(
            'frp', fc.frp,
            'satelite', fc.satelite,
            'risco_fogo', fc.risco_fogo,
            'data_hora', fc.data_hora_gmt
          )
        )
      )
    ) AS geojson
    FROM focos_calor fc
    ${whereClause};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    const geojsonResult: FocoFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (err: any) {
    console.error('ERRO /focos-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};

export const getFocosPorBioma = async (req: Request<{}, {}, {}, FocoQueryParams>, res: Response): Promise<void> => {
  const { bioma, mes, satelite } = req.query;

  console.log('REQ /focos-bioma:', { bioma, mes, satelite });

  const columnMap = {
    bioma: 'fc.bioma_id',
    satelite: 'fc.satelite',
  };

  const { whereClause, params } = buildQueryParams(
    { bioma, mes, satelite },
    columnMap,
    'fc.data_hora_gmt'
  );

  if (!bioma) {
    res.status(400).send('Parâmetro "bioma" é obrigatório.');
    return;
  }
  if (whereClause === '') {
    res.status(400).send('Pelo menos um critério de busca é obrigatório.');
    return;
  }

  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(fc.geom)::jsonb,
          'properties', jsonb_build_object(
            'frp', fc.frp,
            'satelite', fc.satelite,
            'risco_fogo', fc.risco_fogo,
            'data_hora', fc.data_hora_gmt
          )
        )
      )
    ) AS geojson
    FROM focos_calor fc
    ${whereClause};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    const geojsonResult: FocoFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (err: any) {
    console.error('ERRO /focos-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};