const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper para cláusula de mês (‘YYYY-MM’)
function addMonthFilter(col, idx, mes) {
  return mes
    ? ` AND to_char(${col}::date,'YYYY-MM') = $${idx}`
    : '';
}

// ——— FOCOS POR ESTADO ———
router.get('/focos-estado', async (req, res) => {
  const { estado, mes, satelite } = req.query;

  console.log('REQ /focos-estado:', { estado, mes, satelite });

  const params = [];
  let where = [];

  params.push(estado);
  where.push(`fc.estado_id = $${params.length}`);

  if (mes) {
    params.push(mes);
    where.push(`to_char(fc.data_hora_gmt::date,'YYYY-MM') = $${params.length}`);
  }

  if (satelite) {
    params.push(satelite);
    where.push(`fc.satelite = $${params.length}`);
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
    WHERE ${where.join(' AND ')};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    return res.json(rows[0]?.geojson || { type: 'FeatureCollection', features: [] });
  } catch (err) {
    console.error('ERRO /focos-estado:', err);
    return res.status(500).send('Erro no servidor');
  }
});


// ——— FOCOS POR BIOMA ———
router.get('/focos-bioma', async (req, res) => {
  const { bioma, mes, satelite } = req.query;

  console.log('REQ /focos-bioma:', { bioma, mes, satelite });

  const params = [];
  let where = [];

  params.push(bioma);
  where.push(`fc.bioma_id = $${params.length}`);

  if (mes) {
    params.push(mes);
    where.push(`to_char(fc.data_hora_gmt::date,'YYYY-MM') = $${params.length}`);
  }

  if (satelite) {
    params.push(satelite);
    where.push(`fc.satelite = $${params.length}`);
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
    WHERE ${where.join(' AND ')};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    return res.json(rows[0]?.geojson || { type: 'FeatureCollection', features: [] });
  } catch (err) {
    console.error('ERRO /focos-bioma:', err);
    return res.status(500).send('Erro no servidor');
  }
});


// ÁREA POR ESTADO COM MÊS
router.get('/area-estado', async (req, res) => {
  const { estado, mes } = req.query;
  const params = [estado];
  let where = 'e.cd_uf = $1';
  if (mes) {
    params.push(mes);
    where += ` AND to_char(a.data::date,'YYYY-MM') = $${params.length}`;
  }
  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features',jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
    ) AS geojson
    FROM area_queimada a
    JOIN estados e ON ST_Intersects(a.geom,e.geom)
    WHERE ${where};
  `;
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows[0].geojson);
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro no servidor');
  }
});

// ÁREA POR BIOMA COM MÊS
router.get('/area-bioma', async (req, res) => {
  const { bioma, mes } = req.query;
  const params = [bioma];
  let where = 'b.gid = $1';
  if (mes) {
    params.push(mes);
    where += ` AND to_char(a.data::date,'YYYY-MM') = $${params.length}`;
  }
  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features',jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
    ) AS geojson
    FROM area_queimada a
    JOIN biomas b ON ST_Intersects(a.geom,b.geom)
    WHERE ${where};
  `;
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows[0].geojson);
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro no servidor');
  }
});


// ——— DADOS graficos: FOCOS POR ESTADO ———
router.get('/dados/focos-por-estado', async (req, res) => {
  const { estado, mes, satelite } = req.query;
  const params = [];
  const where = [];

  if (estado) {
    params.push(estado);
    where.push(`fc.estado_id = $${params.length}`);
  }
  if (mes) {
    params.push(mes);
    where.push(`to_char(fc.data_hora_gmt::date, 'YYYY-MM') = $${params.length}`);
  }
  if (satelite) {
    params.push(satelite);
    where.push(`fc.satelite = $${params.length}`);
  }

  const sql = `
    SELECT 
      e.nm_uf AS estado,
      to_char(fc.data_hora_gmt::date, 'YYYY-MM') AS month,
      COUNT(*) AS total
    FROM focos_calor fc
    JOIN estados e ON fc.estado_id = e.cd_uf
    ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY e.nm_uf, month
    ORDER BY e.nm_uf, month;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('ERRO /dados/focos-por-estado:', err);
    res.status(500).send('Erro no servidor');
  }
});

// ——— DADOS graficos: FOCOS POR BIOMA ———
router.get('/dados/focos-por-bioma', async (req, res) => {
  const { bioma, mes, satelite } = req.query;
  const params = [];
  const where = [];

  if (bioma) {
    params.push(bioma);
    where.push(`fc.bioma_id = $${params.length}`);
  }
  if (mes) {
    params.push(mes);
    where.push(`to_char(fc.data_hora_gmt::date, 'YYYY-MM') = $${params.length}`);
  }
  if (satelite) {
    params.push(satelite);
    where.push(`fc.satelite = $${params.length}`);
  }

  const sql = `
    SELECT 
      b.bioma AS bioma,
      to_char(fc.data_hora_gmt::date, 'YYYY-MM') AS month,
      COUNT(*) AS total
    FROM focos_calor fc
    JOIN biomas b ON fc.bioma_id = b.gid
    ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY b.bioma, month
    ORDER BY b.bioma, month;
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('ERRO /dados/focos-por-bioma:', err);
    res.status(500).send('Erro no servidor');
  }
});

// ——— POLÍGONO DO ESTADO ———
router.get('/poligono-estado', async (req, res) => {
  const { estado } = req.query;

  if (!estado) {
    return res.status(400).json({ error: 'Parâmetro "estado" é obrigatório' });
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
    return res.json(rows[0]?.geojson || { type: 'FeatureCollection', features: [] });
  } catch (err) {
    console.error('ERRO /poligono-estado:', err);
    return res.status(500).send('Erro no servidor');
  }
});

// ——— POLÍGONO DO BIOMA ———
router.get('/poligono-bioma', async (req, res) => {
  const { bioma } = req.query;
  if (!bioma) {
    return res.status(400).json({ error: 'Parâmetro "bioma" é obrigatório' });
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
    return res.json(rows[0].geojson);
  } catch (err) {
    console.error('ERRO /poligono-bioma:', err);
    return res.status(500).send('Erro no servidor');
  }
});


module.exports = router;