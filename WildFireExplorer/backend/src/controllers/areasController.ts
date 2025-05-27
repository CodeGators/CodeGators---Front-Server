// src/controllers/areas/areasController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { buildQueryParams } from '../utils/queryBuilder';

interface AreaQueryParams {
  estado?: string;
  bioma?: string;
  mes?: string;
}
interface AreaGeoJSONFeature { 
  type: 'Feature';
  geometry: any;
  properties: any;
}
interface AreaFeatureCollection { 
  type: 'FeatureCollection';
  features: AreaGeoJSONFeature[];
}


export const getAreaPorEstado = async (req: Request<{}, {}, {}, AreaQueryParams>, res: Response): Promise<void> => {
  const { estado, mes } = req.query;

  if (!estado) {
    res.status(400).json({ error: 'Parâmetro "estado" é obrigatório' });
    return;
  }

  const columnMap = {
    estado: 'e.cd_uf',
  };

  const { whereClause, params } = buildQueryParams(
    { estado, mes },
    columnMap,
    'a.data'
  );

  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features',jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
    ) AS geojson
    FROM area_queimada a
    JOIN estados e ON ST_Intersects(a.geom,e.geom)
    ${whereClause};
  `;
  try {
    const { rows } = await pool.query(sql, params);
    const geojsonResult: AreaFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (e: any) {
    console.error(e);
    res.status(500).send('Erro no servidor');
  }
};

export const getAreaPorBioma = async (req: Request<{}, {}, {}, AreaQueryParams>, res: Response): Promise<void> => {
  const { bioma, mes } = req.query;

  if (!bioma) {
    res.status(400).json({ error: 'Parâmetro "bioma" é obrigatório' });
    return;
  }

  const columnMap = {
    bioma: 'b.gid',
  };

  const { whereClause, params } = buildQueryParams(
    { bioma, mes },
    columnMap,
    'a.data'
  );

  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features',jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
    ) AS geojson
    FROM area_queimada a
    JOIN biomas b ON ST_Intersects(a.geom,b.geom)
    ${whereClause};
  `;
  try {
    const { rows } = await pool.query(sql, params);
    const geojsonResult: AreaFeatureCollection = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    res.json(geojsonResult);
  } catch (e: any) {
    console.error(e);
    res.status(500).send('Erro no servidor');
  }
};