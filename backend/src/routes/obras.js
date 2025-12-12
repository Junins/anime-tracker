const express = require('express');
const { query, run, get } = require('../database/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { tipo, status, search } = req.query;
    let sql = `
      SELECT o.*, u.nome as criador_nome 
      FROM obras o 
      LEFT JOIN usuarios u ON o.criado_por = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (tipo) {
      sql += ' AND o.tipo = ?';
      params.push(tipo);
    }
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    if (search) {
      sql += ' AND o.titulo LIKE ?';
      params.push(`%${search}%`);
    }
    
    sql += ' ORDER BY o.titulo';
    
    const obras = await query(sql, params);
    res.json({ obras });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const obra = await get(`
      SELECT o.*, u.nome as criador_nome 
      FROM obras o 
      LEFT JOIN usuarios u ON o.criado_por = u.id 
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada.' });
    }
    
    res.json({ obra });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, tipo, status, episodios_capitulos, data_lancamento } = req.body;
    
    if (!titulo || !tipo || !status) {
      return res.status(400).json({ error: 'Título, tipo e status são obrigatórios.' });
    }
    
    const result = await run(
      `INSERT INTO obras (
        titulo, descricao, tipo, status, 
        episodios_capitulos, data_lancamento, criado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, tipo, status, episodios_capitulos, data_lancamento, req.user.id]
    );
    
    const obra = await get('SELECT * FROM obras WHERE id = ?', [result.id]);
    res.status(201).json({ obra });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, tipo, status, episodios_capitulos, data_lancamento } = req.body;
    
    const obra = await get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada.' });
    }
    
    await run(
      `UPDATE obras SET 
        titulo = COALESCE(?, titulo),
        descricao = COALESCE(?, descricao),
        tipo = COALESCE(?, tipo),
        status = COALESCE(?, status),
        episodios_capitulos = COALESCE(?, episodios_capitulos),
        data_lancamento = COALESCE(?, data_lancamento)
      WHERE id = ?`,
      [titulo, descricao, tipo, status, episodios_capitulos, data_lancamento, req.params.id]
    );
    
    const updatedObra = await get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
    res.json({ obra: updatedObra });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const obra = await get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada.' });
    }
    
    await run('DELETE FROM obras WHERE id = ?', [req.params.id]);
    res.json({ message: 'Obra deletada com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;