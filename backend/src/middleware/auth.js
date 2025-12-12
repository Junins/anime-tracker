const jwt = require('jsonwebtoken');
const { get } = require('../database/db');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await get('SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = ?', [decoded.id]);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Por favor, autentique-se.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };