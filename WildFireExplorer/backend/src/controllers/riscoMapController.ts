// src/controllers/riscoMapController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

interface RiscoMapQueryParams {
  estado?: string;
  bioma?: string;
}

export const getRiscoPontosPorEstado = async (req: Request<{}, {}, {}, RiscoMapQueryParams>, res: Response): Promise<void> => {
  const { estado } = req.query;

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  const riskFilters = [
    `rfp.valor_risco_fogo IS NOT NULL`,
    `rfp.valor_risco_fogo::NUMERIC <> -999.00`,
    `rfp.valor_risco_fogo::NUMERIC >= 0.01`,
    `rfp.valor_risco_fogo::NUMERIC <= 1.00`
  ];

  let joinClause = '';
  // Se o estado for fornecido, filtramos por ele usando estado_id pré-calculado
  if (estado && !isNaN(Number(estado))) {
    joinClause = `JOIN estados e ON rfp.estado_id = e.cd_uf`; // <<< AGORA USANDO estado_id PRÉ-CALCULADO
    params.push(Number(estado));
    where.push(`rfp.estado_id = $${paramIndex}`); // Filtra pelo estado_id diretamente
    paramIndex++;
  }

  const combinedWhere = [...where, ...riskFilters].join(' AND ');

  const sql = `
    SELECT
      ST_AsGeoJSON(rfp.geom)::jsonb AS geometry,
      jsonb_build_object(
        'valor_risco_fogo', rfp.valor_risco_fogo,
        'longitude', rfp.longitude,
        'latitude', rfp.latitude
        ${estado ? `, 'estado_nome', e.nm_uf` : ''} -- Inclui nome do estado se houver join
      ) AS properties
    FROM risco_fogo_pontos rfp
    ${joinClause}
    ${combinedWhere.length > 0 ? 'WHERE ' + combinedWhere : ''};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: row.properties
      }))
    };
    res.json(featureCollection);
  } catch (err: any) {
    console.error('ERRO /risco-mapa-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};


export const getRiscoPontosPorBioma = async (req: Request<{}, {}, {}, RiscoMapQueryParams>, res: Response): Promise<void> => {
  const { bioma } = req.query;

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  if (bioma && !isNaN(Number(bioma))) {
    params.push(Number(bioma));
    where.push(`rfp.bioma_id = $${paramIndex}`); // Assumindo bioma_id pré-calculado
    paramIndex++;
  }

  const joinClause = bioma ? `JOIN biomas b ON rfp.bioma_id = b.gid` : '';
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  const filterByJoin = bioma ? `AND b.gid = $1` : ''; // Adiciona filtro de bioma ao JOIN

  const riskFilters = [
    `rfp.valor_risco_fogo IS NOT NULL`,
    `rfp.valor_risco_fogo::NUMERIC <> -999.00`,
    `rfp.valor_risco_fogo::NUMERIC >= 0.01`,
    `rfp.valor_risco_fogo::NUMERIC <= 1.00`
  ];
  const combinedWhere = [...where, ...riskFilters].join(' AND ');

  const sql = `
    SELECT
      ST_AsGeoJSON(rfp.geom)::jsonb AS geometry,
      jsonb_build_object(
        'valor_risco_fogo', rfp.valor_risco_fogo,
        'longitude', rfp.longitude,
        'latitude', rfp.latitude
      ) AS properties
    FROM risco_fogo_pontos rfp
    ${joinClause}
    ${combinedWhere.length > 0 ? 'WHERE ' + combinedWhere : ''};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: row.properties
      }))
    };
    res.json(featureCollection);
  } catch (err: any) {
    console.error('ERRO /risco-mapa-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};