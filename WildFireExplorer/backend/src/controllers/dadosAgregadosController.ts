// src/controllers/dadosAgregados/dadosAgregadosController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { buildQueryParams } from '../utils/queryBuilder';

// Se você centralizou os tipos em src/types/geojson.ts, importe-os aqui:
// import { DadosAgregadosQueryParams, FocoAgregadoResult } from '../../types/geojson';
// Se não, mantenha-os definidos aqui:
interface DadosAgregadosQueryParams {
  estado?: string;
  bioma?: string;
  mes?: string;
  satelite?: string;
}
interface FocoAgregadoResult {
  estado?: string;
  bioma?: string;
  month: string;
  total: number;
}


export const getFocosAgregadosPorEstado = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { estado, mes, satelite } = req.query;

  const columnMap = {
    estado: 'fc.estado_id',
    satelite: 'fc.satelite',
  };

  const { whereClause, params } = buildQueryParams(
    { estado, mes, satelite },
    columnMap,
    'fc.data_hora_gmt'
  );

  const sql = `
    SELECT
      e.nm_uf AS estado,
      to_char(fc.data_hora_gmt::date, 'YYYY-MM') AS month,
      COUNT(*) AS total
    FROM focos_calor fc
    JOIN estados e ON fc.estado_id = e.cd_uf
    ${whereClause}
    GROUP BY e.nm_uf, month
    ORDER BY e.nm_uf, month;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows as FocoAgregadoResult[]);
  } catch (err: any) {
    console.error('ERRO /dados/focos-por-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};

export const getFocosAgregadosPorBioma = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { bioma, mes, satelite } = req.query;

  const columnMap = {
    bioma: 'fc.bioma_id',
    satelite: 'fc.satelite',
  };

  const { whereClause, params } = buildQueryParams(
    { bioma, mes, satelite },
    columnMap,
    'fc.data_hora_gmt'
  );

  const sql = `
    SELECT
      b.bioma AS bioma,
      to_char(fc.data_hora_gmt::date, 'YYYY-MM') AS month,
      COUNT(*) AS total
    FROM focos_calor fc
    JOIN biomas b ON fc.bioma_id = b.gid
    ${whereClause}
    GROUP BY b.bioma, month
    ORDER BY b.bioma, month;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows as FocoAgregadoResult[]);
  } catch (err: any) {
    console.error('ERRO /dados/focos-por-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};