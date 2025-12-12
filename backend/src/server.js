const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const obraRoutes = require('./routes/obras');
const listaRoutes = require('./routes/listas');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/minha-lista', listaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando' });
});

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao iniciar banco de dados:', err);
});