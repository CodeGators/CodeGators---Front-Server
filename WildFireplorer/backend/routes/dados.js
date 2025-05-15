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

  // filtra por estado_id
  params.push(estado);
  where.push(`fc.estado_id = $${params.length}`);

  // filtra mês
  if (mes) {
    params.push(mes);
    where.push(`to_char(fc.data_hora_gmt::date,'YYYY-MM') = $${params.length}`);
  }

  // filtra satélite exato
  if (satelite) {
    params.push(satelite);
    where.push(`fc.satelite = $${params.length}`);
  }

  const sql = `
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features', jsonb_agg(ST_AsGeoJSON(fc.*)::jsonb)
    ) AS geojson
    FROM focos_calor fc
    WHERE ${where.join(' AND ')};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    return res.json(rows[0]?.geojson || { type:'FeatureCollection', features:[] });
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
      'features', jsonb_agg(ST_AsGeoJSON(fc.*)::jsonb)
    ) AS geojson
    FROM focos_calor fc
    WHERE ${where.join(' AND ')};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    return res.json(rows[0]?.geojson || { type:'FeatureCollection', features:[] });
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

module.exports = router;
