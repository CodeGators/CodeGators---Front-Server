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

// --- NOVAS FUNÇÕES: ÁREAS QUEIMADAS AGREGADAS POR ESTADO ---
export const getAreasAgregadasPorEstado = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { mes, estado } = req.query;

  if (!mes) {
    res.status(400).send('Parâmetro "mes" é obrigatório.');
    return;
  }

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  params.push(mes);
  where.push(`to_char(aq.data::date, 'YYYY-MM') = $${paramIndex}`);
  paramIndex++;

  if (estado && !isNaN(Number(estado))) {
    params.push(Number(estado));
    where.push(`e.cd_uf = $${paramIndex}`);
    paramIndex++;
  }

  const sql = `
    SELECT
      e.nm_uf AS estado,
      -- CÁLCULO DA ÁREA TOTAL EM KM2 DIRETAMENTE DA GEOMETRIA
      SUM(ST_Area(aq.geom::geography) / 1000000.0) AS area_total_km2,
      COUNT(DISTINCT aq.gid) AS total_eventos
    FROM area_queimada aq
    JOIN estados e ON ST_Intersects(aq.geom, e.geom)
    WHERE ${where.join(' AND ')}
    GROUP BY e.nm_uf
    ORDER BY e.nm_uf;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error('ERRO /dados/area-por-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};

// --- NOVAS FUNÇÕES: ÁREAS QUEIMADAS AGREGADAS POR BIOMA ---
export const getAreasAgregadasPorBioma = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { mes, bioma } = req.query;

  if (!mes) {
    res.status(400).send('Parâmetro "mes" é obrigatório.');
    return;
  }

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  params.push(mes);
  where.push(`to_char(aq.data::date, 'YYYY-MM') = $${paramIndex}`);
  paramIndex++;

  if (bioma && !isNaN(Number(bioma))) {
    params.push(Number(bioma));
    where.push(`b.gid = $${paramIndex}`);
    paramIndex++;
  }

  const sql = `
    SELECT
      b.bioma AS bioma,
      -- CÁLCULO DA ÁREA TOTAL EM KM2 DIRETAMENTE DA GEOMETRIA
      SUM(ST_Area(aq.geom::geography) / 1000000.0) AS area_total_km2,
      COUNT(DISTINCT aq.gid) AS total_eventos
    FROM area_queimada aq
    JOIN biomas b ON ST_Intersects(aq.geom, b.geom)
    WHERE ${where.join(' AND ')}
    GROUP BY b.bioma
    ORDER BY b.bioma;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error('ERRO /dados/area-por-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};

// --- FUNÇÕES DE RISCO DE FOGO AGREGADO POR ESTADO (MODIFICADAS PARA risco_fogo_pontos) ---
export const getRiscoAgregadoPorEstado = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { estado } = req.query; // 'estado' não é usado para filtrar na query (top 10 estados)

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  where.push(`rfp.valor_risco_fogo IS NOT NULL`);
  where.push(`rfp.valor_risco_fogo::NUMERIC <> -999.00`);
  where.push(`rfp.valor_risco_fogo::NUMERIC >= 0.01`);
  where.push(`rfp.valor_risco_fogo::NUMERIC <= 1.00`);

  const sql = `
    SELECT
      e.nm_uf AS estado,
      AVG(rfp.valor_risco_fogo::NUMERIC) AS risco_medio
    FROM risco_fogo_pontos rfp
    JOIN estados e ON rfp.estado_id = e.cd_uf -- <<< AGORA USANDO estado_id PRÉ-CALCULADO
    WHERE ${where.join(' AND ')}
    GROUP BY e.nm_uf
    ORDER BY risco_medio DESC;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error('ERRO /dados/risco-por-estado:', err);
    res.status(500).send('Erro no servidor');
  }
};

// --- FUNÇÕES DE RISCO DE FOGO AGREGADO POR BIOMA (MODIFICADAS) ---
export const getRiscoAgregadoPorBioma = async (req: Request<{}, {}, {}, DadosAgregadosQueryParams>, res: Response): Promise<void> => {
  const { bioma } = req.query;

  const params: (string | number)[] = [];
  const where: string[] = [];
  let paramIndex = 1;

  if (bioma && !isNaN(Number(bioma))) {
    // Agora filtramos por bioma_id na tabela rfp, não pelo gid do bioma no JOIN
    params.push(Number(bioma));
    where.push(`rfp.bioma_id = $${paramIndex}`); // <<< AGORA FILTRA AQUI
    paramIndex++;
  }

  // >>> FILTROS ROBUSTOS PARA valor_risco_fogo, COM CASTING NA WHERE CLAUSE
  where.push(`rfp.valor_risco_fogo IS NOT NULL`);
  where.push(`rfp.valor_risco_fogo::NUMERIC <> -999.00`);
  where.push(`rfp.valor_risco_fogo::NUMERIC >= 0.01`);
  where.push(`rfp.valor_risco_fogo::NUMERIC <= 1.00`);

  const sql = `
    SELECT
      b.bioma AS bioma,
      AVG(rfp.valor_risco_fogo::NUMERIC) AS risco_medio
    FROM risco_fogo_pontos rfp
    JOIN biomas b ON rfp.bioma_id = b.gid -- <<< AGORA É UM JOIN POR ID SIMPLES
    ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY b.bioma
    ORDER BY b.bioma;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error('ERRO /dados/risco-por-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
};