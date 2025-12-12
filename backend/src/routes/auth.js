const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    const existingUser = await get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }
    
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const result = await run(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );
    
    const user = await get(
      'SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = ?',
      [result.id]
    );
    
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const user = await get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, nome, email, tipo_usuario, data_criacao FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { nome, email } = req.body;
    
    if (email && email !== req.user.email) {
      const existingUser = await get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso.' });
      }
    }
    
    await run(
      'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email) WHERE id = ?',
      [nome, email, req.user.id]
    );
    
    const updatedUser = await get(
      'SELECT id, nome, email, tipo_usuario, data_criacao FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;