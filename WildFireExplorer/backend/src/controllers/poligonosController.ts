// src/controllers/poligonos/poligonosController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// Se você centralizou os tipos em src/types/geojson.ts, importe-os aqui:
// import { PoligonoQueryParams, PoligonoFeatureCollection, PoligonoGeoJSONFeature, PoligonoFeatureProperties } from '../../types/geojson';
// Se não, mantenha-os definidos aqui:
interface PoligonoQueryParams {
  estado?: string;
  bioma?: string;
}
interface PoligonoFeatureProperties { // Mantenha se não importado de types/geojson.ts
  uf?: string;
  nome?: string;
  gid?: number;
  bioma?: string;
}
interface PoligonoGeoJSONFeature { // Mantenha se não importado de types/geojson.ts
  type: 'Feature';
  geometry: any;
  properties: PoligonoFeatureProperties;
}
interface PoligonoFeatureCollection { // Mantenha se não importado de types/geojson.ts
  type: 'FeatureCollection';
  features: PoligonoGeoJSONFeature[];
}



export const getPoligonoEstado = async (req: Request<{}, {}, {}, PoligonoQueryParams>, res: Response): Promise<void> => {
  const { estado } = req.query;

  if (!estado) {
    res.status(400).json({ error: 'Parâmetro "estado" é obrigatório' });
    return;
  }

  try {
    const sql = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'uf', cd_uf,
              'nome', nm_uf
            )
          )
        )
      ) AS geojson
      FROM estados
      WHERE cd_uf = $1;
    `;

    const { rows } = await pool.query(sql, [estado]);
    const geojsonResult: PoligonoFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (err: any) {
    console.error('ERRO /poligono-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};

export const getPoligonoBioma = async (req: Request<{}, {}, {}, PoligonoQueryParams>, res: Response): Promise<void> => {
  const { bioma } = req.query;
  if (!bioma) {
    res.status(400).json({ error: 'Parâmetro "bioma" é obrigatório' });
    return;
  }

  try {
    const sql = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(b.geom)::jsonb,
            'properties', jsonb_build_object(
              'gid', b.gid,
              'bioma', b.bioma
            )
          )
        ), '[]'::jsonb)
      ) AS geojson
      FROM biomas b
      WHERE b.gid = $1;
    `;
    const { rows } = await pool.query(sql, [bioma]);
    const geojsonResult: PoligonoFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (err: any) {
    console.error('ERRO /poligono-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};