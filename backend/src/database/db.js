const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        tipo_usuario VARCHAR(20) DEFAULT 'usuario',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS obras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT,
        tipo VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        episodios_capitulos INTEGER,
        data_lancamento DATE,
        nota_media DECIMAL(3,2) DEFAULT 0.0,
        criado_por INTEGER,
        FOREIGN KEY (criado_por) REFERENCES usuarios(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS listas_usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        obra_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        episodios_assistidos INTEGER DEFAULT 0,
        nota INTEGER CHECK (nota >= 1 AND nota <= 10),
        review TEXT,
        data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
        UNIQUE(usuario_id, obra_id)
      )`);

      db.get("SELECT COUNT(*) as count FROM usuarios WHERE tipo_usuario = 'admin'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          const adminHash = bcrypt.hashSync('admin123', 10);
          db.run(
            "INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)",
            ['Administrador', 'admin@animetracker.com', adminHash, 'admin']
          );
          console.log('Usuário admin criado');
        }
        
        resolve();
      });
    });
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = {
  db,
  initDatabase,
  query,
  run,
  get
};