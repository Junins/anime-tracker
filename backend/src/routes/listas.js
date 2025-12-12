const express = require('express');
const { query, run, get } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const listas = await query(`
      SELECT l.*, o.titulo, o.tipo, o.episodios_capitulos, o.status as obra_status
      FROM listas_usuarios l
      JOIN obras o ON l.obra_id = o.id
      WHERE l.usuario_id = ?
      ORDER BY l.data_adicionado DESC
    `, [req.user.id]);
    
    res.json({ listas });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { obra_id, status, episodios_assistidos, nota, review } = req.body;
    
    if (!obra_id || !status) {
      return res.status(400).json({ error: 'Obra e status são obrigatórios.' });
    }
    
    const obra = await get('SELECT * FROM obras WHERE id = ?', [obra_id]);
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada.' });
    }
    
    const existing = await get(
      'SELECT id FROM listas_usuarios WHERE usuario_id = ? AND obra_id = ?',
      [req.user.id, obra_id]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Obra já está na sua lista.' });
    }
    
    const result = await run(
      `INSERT INTO listas_usuarios (
        usuario_id, obra_id, status, episodios_assistidos, nota, review
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, obra_id, status, episodios_assistidos || 0, nota, review]
    );
    
    const listaItem = await get(
      'SELECT l.*, o.titulo, o.tipo FROM listas_usuarios l JOIN obras o ON l.obra_id = o.id WHERE l.id = ?',
      [result.id]
    );
    
    res.status(201).json({ item: listaItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, episodios_assistidos, nota, review } = req.body;
    
    const listaItem = await get(
      'SELECT * FROM listas_usuarios WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!listaItem) {
      return res.status(404).json({ error: 'Item não encontrado ou não pertence ao usuário.' });
    }
    
    await run(
      `UPDATE listas_usuarios SET 
        status = COALESCE(?, status),
        episodios_assistidos = COALESCE(?, episodios_assistidos),
        nota = COALESCE(?, nota),
        review = COALESCE(?, review)
      WHERE id = ? AND usuario_id = ?`,
      [status, episodios_assistidos, nota, review, req.params.id, req.user.id]
    );
    
    const updatedItem = await get(
      'SELECT l.*, o.titulo, o.tipo FROM listas_usuarios l JOIN obras o ON l.obra_id = o.id WHERE l.id = ?',
      [req.params.id]
    );
    
    res.json({ item: updatedItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const listaItem = await get(
      'SELECT * FROM listas_usuarios WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!listaItem) {
      return res.status(404).json({ error: 'Item não encontrado ou não pertence ao usuário.' });
    }
    
    await run('DELETE FROM listas_usuarios WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removido da lista.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;