require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión con MySQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar con MySQL:', error.message);
    process.exit(1);
  }
}

startServer();